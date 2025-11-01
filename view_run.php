<?php
// view_run.php — versi final dengan dukungan input pecahan
require_once 'db_config.php';

$run_id = isset($_GET['run_id']) ? intval($_GET['run_id']) : 0;
if (!$run_id) {
    echo "Run ID tidak diberikan. <a href='history.php'>Kembali ke riwayat</a>";
    exit;
}

/**
 * Konversi string pecahan seperti '1/3' jadi float 0.3333
 */
function parseFraction($val) {
    if (is_numeric($val)) return floatval($val);
    if (strpos($val, '/') !== false) {
        list($a, $b) = explode('/', $val);
        $a = floatval($a);
        $b = floatval($b);
        return ($b != 0) ? $a / $b : 0;
    }
    return 0;
}

/**
 * Ambil data bobot kriteria
 */
$crit = [];
$res = $conn->query("SELECT idx, name, weight FROM criteria WHERE run_id = $run_id ORDER BY idx");
while ($r = $res->fetch_assoc()) {
    $crit[$r['idx']] = [
        'name' => $r['name'],
        'weight' => floatval($r['weight'])
    ];
}

/**
 * Ambil skor akhir alternatif
 */
$alts = [];
$res2 = $conn->query("SELECT alt_idx, alt_name, score FROM run_results WHERE run_id = $run_id ORDER BY score DESC");
while ($r = $res2->fetch_assoc()) {
    $alts[] = $r;
}

/**
 * Ambil indeks kriteria
 */
$alt_weights_per_crit = [];
$q = $conn->query("SELECT DISTINCT crit_idx FROM alt_pairwise WHERE run_id = $run_id ORDER BY crit_idx");
$crit_idxs = [];
while ($r = $q->fetch_assoc()) $crit_idxs[] = intval($r['crit_idx']);

/**
 * Ambil matriks perbandingan alternatif untuk kriteria tertentu
 */
function fetch_matrix($conn, $run_id, $crit_idx) {
    $m = [];
    $res = $conn->query("SELECT i_idx, j_idx, value FROM alt_pairwise WHERE run_id = $run_id AND crit_idx = $crit_idx");
    foreach ($res as $row) {
        $i = intval($row['i_idx']);
        $j = intval($row['j_idx']);
        $val = parseFraction($row['value']); // ← ubah pecahan ke float
        if (!isset($m[$i])) $m[$i] = [];
        $m[$i][$j] = $val > 0 ? $val : 1.0; // fallback aman
    }
    return $m;
}

/**
 * Hitung bobot (geometric mean)
 */
function geom_weights_display($matrix) {
    $n = count($matrix);
    $gm = [];
    foreach ($matrix as $i => $row) {
        $prod = 1.0;
        for ($j = 1; $j <= $n; $j++) {
            $val = isset($row[$j]) ? parseFraction($row[$j]) : 1.0;
            $prod *= max($val, 1e-9);
        }
        $gm[$i] = pow($prod, 1 / $n);
    }
    $sum = array_sum($gm);
    foreach ($gm as $i => $v) $gm[$i] = $sum ? $v / $sum : 1 / $n;
    return $gm;
}

/**
 * Hitung bobot alternatif untuk tiap kriteria
 */
foreach ($crit_idxs as $ci) {
    $m = fetch_matrix($conn, $run_id, $ci);
    $alt_weights_per_crit[$ci] = geom_weights_display($m);
}
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<title>Hasil AHP — Run #<?php echo $run_id; ?></title>
<style>
body{font-family:Arial, sans-serif; max-width:1000px; margin:20px auto;}
table{border-collapse:collapse;width:100%; margin-bottom:16px;}
th,td{border:1px solid #ddd;padding:8px;text-align:center;}
h2{margin:0 0 8px 0;}
.rank{font-weight:bold;color:#2d89ef;}
</style>
</head>
<body>
  <h2>Hasil AHP — Run #<?php echo $run_id; ?></h2>

  <h3>Bobot Kriteria</h3>
  <table>
    <tr><th>Idx</th><th>Kriteria</th><th>Bobot</th></tr>
    <?php foreach ($crit as $idx => $c): ?>
      <tr>
        <td><?php echo $idx; ?></td>
        <td><?php echo htmlspecialchars($c['name']); ?></td>
        <td><?php echo round($c['weight'], 6); ?></td>
      </tr>
    <?php endforeach; ?>
  </table>

  <?php foreach ($alt_weights_per_crit as $ci => $aw): ?>
    <h4>Bobot Alternatif untuk Kriteria: <?php echo htmlspecialchars($crit[$ci]['name'] ?? ('Kriteria '.$ci)); ?></h4>
    <table>
      <tr><th>Alternatif (idx)</th><th>Bobot</th></tr>
      <?php for ($i = 1; $i <= count($aw); $i++): ?>
        <tr>
          <td>
            <?php
              $nres = $conn->query("SELECT name FROM alternatives WHERE run_id = 0 AND idx = ".$i);
              $n = ($nres && $nres->num_rows > 0) ? $nres->fetch_assoc()['name'] : 'Alt '.$i;
              echo htmlspecialchars($n." (".$i.")");
            ?>
          </td>
          <td><?php echo round($aw[$i], 6); ?></td>
        </tr>
      <?php endfor; ?>
    </table>
  <?php endforeach; ?>

  <h3>Skor Akhir (Urut Tertinggi → Terendah)</h3>
  <table>
    <tr><th>Peringkat</th><th>Alternatif</th><th>Skor</th></tr>
    <?php $r=1; foreach ($alts as $a): ?>
      <tr>
        <td class="rank"><?php echo $r++; ?></td>
        <td><?php echo htmlspecialchars($a['alt_name']); ?></td>
        <td><?php echo round($a['score'], 6); ?></td>
      </tr>
    <?php endforeach; ?>
  </table>

  <p><a href="history.php">Kembali ke Riwayat</a></p>
</body>
</html>
