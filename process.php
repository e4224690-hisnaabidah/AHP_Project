<?php
// process.php
require_once 'db_config.php';

function geometric_mean_weights($matrix) {
    // $matrix is n x n array (1-indexed keys)
    $n = count($matrix);
    $gm = array_fill(1, $n, 0);
    foreach($matrix as $i => $row){
        $prod = 1.0;
        for($j=1;$j<=$n;$j++){
            $val = isset($row[$j]) ? floatval($row[$j]) : 1.0;
            $prod *= ($val > 0 ? $val : 1e-9);
        }
        $gm[$i] = pow($prod, 1/$n);
    }
    $sum = array_sum($gm);
    $w = [];
    for($i=1;$i<=$n;$i++){
        $w[$i] = ($sum != 0) ? $gm[$i]/$sum : 1/$n;
    }
    return $w;
}

function lambda_max($matrix, $w) {
    $n = count($matrix);
    $lambda_values = [];
    for($i=1;$i<=$n;$i++){
        $sum = 0;
        for($j=1;$j<=$n;$j++){
            $a = isset($matrix[$i][$j]) ? floatval($matrix[$i][$j]) : 1.0;
            $sum += $a * $w[$j];
        }
        $lambda_values[] = $sum / ($w[$i] > 0 ? $w[$i] : 1e-9);
    }
    return array_sum($lambda_values) / count($lambda_values);
}

function RI($n){
    // Random Index values for n=1..10
    $ri_table = [1=>0.00,2=>0.00,3=>0.58,4=>0.90,5=>1.12,6=>1.24,7=>1.32,8=>1.41,9=>1.45,10=>1.49];
    return isset($ri_table[$n]) ? $ri_table[$n] : 1.49;
}

// Ambil POST
$crit_input = isset($_POST['crit']) ? $_POST['crit'] : [];
$alt_input = isset($_POST['alt']) ? $_POST['alt'] : [];
$description = isset($_POST['description']) ? $_POST['description'] : '';

if(empty($crit_input) || empty($alt_input)){
    die("Data pairwise tidak lengkap. Kembalilah ke form dan isi matriks.");
}

// reconstruct matrices (assume 1-indexed keys)
$criteria_idx = array_keys($crit_input);
sort($criteria_idx);
$n_crit = count($criteria_idx);

// build full criteria matrix
$crit_matrix = [];
foreach($criteria_idx as $i){
    $crit_matrix[$i] = [];
    foreach($criteria_idx as $j){
        if($i == $j){
            $crit_matrix[$i][$j] = 1.0;
        } elseif(isset($crit_input[$i][$j]) && $crit_input[$i][$j] !== ''){
            $crit_matrix[$i][$j] = floatval($crit_input[$i][$j]);
        } elseif(isset($crit_input[$j][$i]) && $crit_input[$j][$i] !== ''){
            $crit_matrix[$i][$j] = 1.0 / floatval($crit_input[$j][$i]);
        } else {
            $crit_matrix[$i][$j] = 1.0; // default
        }
    }
}

// compute criteria weights
$crit_weights = geometric_mean_weights($crit_matrix);
$lambda_c = lambda_max($crit_matrix, $crit_weights);
$CI = ($lambda_c - $n_crit)/($n_crit - 1);
$RI = RI($n_crit);
$CR = ($RI != 0) ? ($CI / $RI) : 0;

// alternatives (assume same set for all criteria)
$alt_keys = array_keys($alt_input[pathinfo(array_keys($alt_input)[0], PATHINFO_FILENAME)] ?? (is_array($alt_input) ? reset(array_keys($alt_input)) : []));
// But simpler: derive alt count via first criterion in alt_input
reset($alt_input);
$firstCrit = key($alt_input);
$alt_row_keys = array_keys($alt_input[$firstCrit]);
$alt_n = count($alt_row_keys) + 1; // Because alt_input uses only i<j entries; but safer to gather unique alt indices:
$all_alts = [];
foreach($alt_input as $c => $m){
    foreach($m as $i => $rows){
        $all_alts[$i] = true;
        foreach($rows as $j => $v) $all_alts[$j] = true;
    }
}
$alt_indices = array_keys($all_alts);
sort($alt_indices);
$alt_indices = $alt_indices ? $alt_indices : range(1,5); // fallback

// For each criterion build full alt matrix and compute weights
$alt_weights_per_crit = []; // crit_idx => [alt_idx => weight]
foreach($crit_weights as $crit_idx => $cw){
    // build alt matrix using alt_input[crit_idx]
    $matrix = [];
    // determine alt indices from HTML generation in index.php (we used 1..N)
    // We'll detect max
    $max_alt = max($alt_indices);
    for($i=1;$i<=$max_alt;$i++){
        $matrix[$i] = [];
        for($j=1;$j<=$max_alt;$j++){
            if($i == $j) $matrix[$i][$j] = 1.0;
            else {
                if(isset($alt_input[$crit_idx][$i][$j]) && $alt_input[$crit_idx][$i][$j] !== ''){
                    $matrix[$i][$j] = floatval($alt_input[$crit_idx][$i][$j]);
                } elseif(isset($alt_input[$crit_idx][$j][$i]) && $alt_input[$crit_idx][$j][$i] !== ''){
                    $matrix[$i][$j] = 1.0 / floatval($alt_input[$crit_idx][$j][$i]);
                } else {
                    $matrix[$i][$j] = 1.0;
                }
            }
        }
    }
    $w = geometric_mean_weights($matrix);
    $alt_weights_per_crit[$crit_idx] = $w;
}

// final scores for each alternative: sum_k (crit_weight_k * alt_weight_k[alt])
$final_scores = [];
$max_alt = max($alt_indices);
for($a=1;$a<=$max_alt;$a++){
    $s = 0;
    foreach($crit_weights as $ck => $cw){
        $w_alt = isset($alt_weights_per_crit[$ck][$a]) ? $alt_weights_per_crit[$ck][$a] : (1/$max_alt);
        $s += $cw * $w_alt;
    }
    $final_scores[$a] = $s;
}

// Save run to DB
$stmt = $conn->prepare("INSERT INTO runs (description) VALUES (?)");
$stmt->bind_param("s", $description);
$stmt->execute();
$run_id = $stmt->insert_id;
$stmt->close();

// save criteria weights (with idx based on keys)
$insert = $conn->prepare("INSERT INTO criteria (run_id, idx, name, weight) VALUES (?, ?, ?, ?)");
foreach($crit_weights as $idx => $w){
    // need name — we can try fetch from seed (run_id=0)
    $nameRes = $conn->query("SELECT name FROM criteria WHERE run_id = 0 AND idx = ".intval($idx));
    $name = ($nameRes && $nameRes->num_rows>0) ? $nameRes->fetch_assoc()['name'] : "Kriteria ".$idx;
    $insert->bind_param("iisd", $run_id, $idx, $name, $w);
    $insert->execute();
}
$insert->close();

// save alternatives list & final scores
$insertAlt = $conn->prepare("INSERT INTO alternatives (run_id, idx, name, final_score) VALUES (?, ?, ?, ?)");
foreach($final_scores as $idx => $score){
    $nameRes = $conn->query("SELECT name FROM alternatives WHERE run_id = 0 AND idx = ".intval($idx));
    $name = ($nameRes && $nameRes->num_rows>0) ? $nameRes->fetch_assoc()['name'] : "Alternatif ".$idx;
    $insertAlt->bind_param("iisd", $run_id, $idx, $name, $score);
    $insertAlt->execute();
}
$insertAlt->close();

// save pairwise matrices (criteria)
$insCP = $conn->prepare("INSERT INTO crit_pairwise (run_id, i_idx, j_idx, value) VALUES (?, ?, ?, ?)");
foreach($crit_matrix as $i => $row){
    foreach($row as $j => $val){
        $insCP->bind_param("iiid", $run_id, $i, $j, $val);
        $insCP->execute();
    }
}
$insCP->close();

// save alt pairwise
$insAP = $conn->prepare("INSERT INTO alt_pairwise (run_id, crit_idx, i_idx, j_idx, value) VALUES (?, ?, ?, ?, ?)");
foreach($alt_weights_per_crit as $crit_idx => $warr){
    // we need original pairwise values; rebuild matrix from alt_input
    $matrix = [];
    $max_alt = max($alt_indices);
    for($i=1;$i<=$max_alt;$i++){
        for($j=1;$j<=$max_alt;$j++){
            if($i == $j) $val = 1.0;
            else {
                if(isset($alt_input[$crit_idx][$i][$j]) && $alt_input[$crit_idx][$i][$j] !== '') $val = floatval($alt_input[$crit_idx][$i][$j]);
                elseif(isset($alt_input[$crit_idx][$j][$i]) && $alt_input[$crit_idx][$j][$i] !== '') $val = 1.0/floatval($alt_input[$crit_idx][$j][$i]);
                else $val = 1.0;
            }
            $insAP->bind_param("iiiid", $run_id, $crit_idx, $i, $j, $val);
            $insAP->execute();
        }
    }
}
$insAP->close();

// save run_results (per alt)
$insRes = $conn->prepare("INSERT INTO run_results (run_id, alt_idx, alt_name, score) VALUES (?, ?, ?, ?)");
foreach($final_scores as $idx => $score){
    $nameRes = $conn->query("SELECT name FROM alternatives WHERE run_id = 0 AND idx = ".intval($idx));
    $name = ($nameRes && $nameRes->num_rows>0) ? $nameRes->fetch_assoc()['name'] : "Alt ".$idx;
    $insRes->bind_param("iisd", $run_id, $idx, $name, $score);
    $insRes->execute();
}
$insRes->close();

// Redirect to view_run
header("Location: view_run.php?run_id=".$run_id);
exit;
?>
