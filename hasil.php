<?php
require_once 'db_config.php';

// ======== Fungsi bantu ========
function parse_fraction($v) {
    if (!isset($v)) return null;
    $v = trim((string)$v);
    if ($v === '') return null;
    $v = str_replace(' ', '', $v);
    if (strpos($v, '/') !== false) {
        $parts = explode('/', $v);
        if (count($parts) == 2) {
            $num = floatval($parts[0]);
            $den = floatval($parts[1]);
            if ($den == 0) return null;
            return $num / $den;
        }
        return null;
    }
    if (is_numeric($v)) return floatval($v);
    return null;
}

function ahp_weights($matrix) {
    $n = count($matrix);
    if ($n == 0) return [];
    $sum_cols = array_fill(0, $n, 0.0);

    for ($j = 0; $j < $n; $j++) {
        for ($i = 0; $i < $n; $i++) {
            $sum_cols[$j] += isset($matrix[$i][$j]) ? floatval($matrix[$i][$j]) : 0.0;
        }
        if ($sum_cols[$j] == 0.0) $sum_cols[$j] = 1.0;
    }

    $weights = array_fill(0, $n, 0.0);
    for ($i = 0; $i < $n; $i++) {
        for ($j = 0; $j < $n; $j++) {
            $val = isset($matrix[$i][$j]) ? floatval($matrix[$i][$j]) : 0.0;
            $weights[$i] += $val / $sum_cols[$j];
        }
        $weights[$i] /= $n;
    }

    $sumw = array_sum($weights);
    if ($sumw > 0) {
        foreach ($weights as $k => $w) $weights[$k] = $w / $sumw;
    }
    return $weights;
}

// ======== Ambil data dari form ========
$criteria_input = $_POST['crit'] ?? [];
$alt_input = $_POST['alt'] ?? [];
$description = $_POST['description'] ?? '';

if (empty($_POST)) {
    echo "<p style='color:red;text-align:center;'>⚠️ Tidak ada data yang dikirim. Silakan isi form dan klik tombol Hitung.</p>";
    exit;
}

// ======== Ambil daftar dari database ========
$criteria = [];
$alternatives = [];

$res = $conn->query("SELECT idx, name FROM criteria WHERE run_id = 0 ORDER BY idx");
if ($res) while ($r = $res->fetch_assoc()) $criteria[(int)$r['idx']] = $r['name'];

$res2 = $conn->query("SELECT idx, name FROM alternatives WHERE run_id = 0 ORDER BY idx");
if ($res2) while ($r = $res2->fetch_assoc()) $alternatives[(int)$r['idx']] = $r['name'];

if (empty($criteria)) {
    $criteria = [1=>'Performa CPU & GPU',2=>'RAM & Penyimpanan',3=>'Daya tahan baterai',4=>'Portabilitas',5=>'Harga'];
}
if (empty($alternatives)) {
    $alternatives = [1=>'Lenovo IdeaPad Slim 3',2=>'MSI Modern 14 C12MO',3=>'Acer Aspire 5 Slim',4=>'ASUS VivoBook Go 14',5=>'Acer Nitro V 15'];
}

// ======== Hitung bobot kriteria ========
$nCrit = count($criteria);
$critMatrix = array_fill(0, $nCrit, array_fill(0, $nCrit, 1.0));

for ($i = 1; $i <= $nCrit; $i++) {
    for ($j = 1; $j <= $nCrit; $j++) {
        $ii = $i-1; $jj = $j-1;
        if ($i == $j) {
            $critMatrix[$ii][$jj] = 1.0;
        } elseif ($i < $j) {
            $raw = $criteria_input[$i][$j] ?? null;
            $v = parse_fraction($raw);
            $critMatrix[$ii][$jj] = ($v === null) ? 1.0 : $v;
        } else {
            $val = $critMatrix[$jj][$ii] ?? 1.0;
            $critMatrix[$ii][$jj] = ($val == 0) ? 1.0 : (1.0 / $val);
        }
    }
}
$critWeights = ahp_weights($critMatrix);

// ======== Hitung bobot alternatif ========
$nAlt = count($alternatives);
$altWeights = [];

foreach ($criteria as $ci => $cname) {
    $M = array_fill(0, $nAlt, array_fill(0, $nAlt, 1.0));
    for ($i = 1; $i <= $nAlt; $i++) {
        for ($j = 1; $j <= $nAlt; $j++) {
            $ii = $i-1; $jj = $j-1;
            if ($i == $j) {
                $M[$ii][$jj] = 1.0;
            } elseif ($i < $j) {
                $raw = $alt_input[$ci][$i][$j] ?? null;
                $v = parse_fraction($raw);
                $M[$ii][$jj] = ($v === null) ? 1.0 : $v;
            } else {
                $val = $M[$jj][$ii] ?? 1.0;
                $M[$ii][$jj] = ($val == 0) ? 1.0 : (1.0 / $val);
            }
        }
    }
    $altWeights[$ci] = ahp_weights($M);
}

// ======== Hitung skor total ========
$finalScores = array_fill(1, $nAlt, 0.0);
foreach ($criteria as $ci => $cname) {
    $wCrit = $critWeights[$ci-1] ?? (1.0/$nCrit);
    for ($a = 1; $a <= $nAlt; $a++) {
        $wAlt = $altWeights[$ci][$a-1] ?? (1.0/$nAlt);
        $finalScores[$a] += $wCrit * $wAlt;
    }
}
arsort($finalScores);

// Ambil pemenang
$bestAlt = array_key_first($finalScores);
$bestName = $alternatives[$bestAlt] ?? 'Tidak diketahui';
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pemilihan Laptop untuk Mahasiswa - AHP</title>
<link rel="stylesheet" href="assets/style.css">
<style>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glow {
  0%,100% { text-shadow: 0 0 5px #a29bfe, 0 0 10px #81ecec; }
  50% { text-shadow: 0 0 10px #fd79a8, 0 0 20px #74b9ff; }
}
body { overflow-x: hidden; }

h1 {
  text-align: center;
  font-size: 1.8em;
  margin-bottom: 8px;
  animation: fadeInUp 1s ease forwards, glow 2s ease-in-out infinite alternate;
}
.subheading {
  text-align: center;
  font-size: 1em;
  color: #555;
  margin-bottom: 25px;
  animation: fadeInUp 1.2s ease forwards;
}
h2 {
  text-align: center;
  color: #5f27cd;
  animation: fadeInUp 1.3s ease forwards;
  margin-bottom: 15px;
}
footer {
  text-align: center;
  margin-top: 40px;
  font-size: 0.95em;
  color: #666;
  background: linear-gradient(to right, #74b9ff, #a29bfe, #fd79a8, #55efc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  animation: fadeInUp 1.8s ease forwards;
}
.rank-icon { font-size: 1.4em; }
.rank-1 { color: gold; }
.rank-2 { color: silver; }
.rank-3 { color: #cd7f32; }
.best-text {
  text-align:center;
  font-size:1.1em;
  margin-top:20px;
  animation: fadeInUp 1.5s ease forwards;
}
</style>
</head>
<body>
<div class="container">
  <h1>🎓 Pemilihan Laptop untuk Mahasiswa Menggunakan Metode AHP</h1>
  <p class="subheading">Cocok untuk kebutuhan coding dengan CPU Intel i5 / Ryzen 5</p>

  <h2>💡 Hasil Analisis AHP</h2>
  <p class="note"><?= htmlspecialchars($description) ?></p>

  <div class="section-title">Bobot Kriteria</div>
<table>
    <tr><th>Kriteria</th><th>Bobot</th></tr>
    <?php $i = 0; foreach ($criteria as $cname): ?>
      <tr>
        <td><?= htmlspecialchars($cname) ?></td>
        <td><?= number_format($critWeights[$i++] ?? 0, 6) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>

  <<div class="section-title">Skor Akhir Alternatif</div>
  <table>
    <tr><th>Alternatif</th><th>Skor</th><th>Peringkat</th></tr>
    <?php 
      $rank = 1;
      foreach ($finalScores as $idx => $score): 
        $icon = '';
        if ($rank == 1) $icon = "<span class='rank-icon rank-1'>🏆</span>";
        elseif ($rank == 2) $icon = "<span class='rank-icon rank-2'>🥈</span>";
        elseif ($rank == 3) $icon = "<span class='rank-icon rank-3'>🥉</span>";
    ?>
      <tr>
        <td><?= htmlspecialchars($alternatives[$idx] ?? "Alt $idx") ?></td>
        <td><?= number_format($score, 6) ?></td>
        <td><?= $icon ?: $rank ?></td>
      </tr>
    <?php $rank++; endforeach; ?>
  </table>

  <div class="best-text">
    🏅 <strong><?= htmlspecialchars($bestName) ?></strong> adalah laptop terbaik berdasarkan analisis AHP.
  </div>

  <div style="text-align:center;margin-top:30px;">
    <a href="index.php" class="btn">🔁 Ulangi Analisis</a>
  </div>

  <footer>✨ Project by Hisna Abidah 💻</footer>
</div>
</body>
</html>
