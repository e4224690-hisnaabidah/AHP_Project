<?php
require_once 'db_config.php';

session_start();
$criteria_input = $_POST['crit'] ?? $_SESSION['criteria_input'] ?? [];
$description = $_POST['description'] ?? $_SESSION['description'] ?? '';
$_SESSION['criteria_input'] = $criteria_input;
$_SESSION['description'] = $description;

// Ambil data (sesuai kode asli Anda)
$criteria = [];
$alternatives = [];
$res = $conn->query("SELECT idx, name FROM criteria WHERE run_id = 0 ORDER BY idx");
if ($res) while ($r = $res->fetch_assoc()) $criteria[$r['idx']] = $r['name'];
$res2 = $conn->query("SELECT idx, name FROM alternatives WHERE run_id = 0 ORDER BY idx");
if ($res2) while ($r = $res2->fetch_assoc()) $alternatives[$r['idx']] = $r['name'];

if (empty($criteria)) $criteria = [1=>'Performa CPU & GPU',2=>'RAM & Penyimpanan',3=>'Daya tahan baterai',4=>'Portabilitas',5=>'Harga'];
if (empty($alternatives)) $alternatives = [1=>'Lenovo IdeaPad Slim 3',2=>'MSI Modern 14 C12MO',3=>'Acer Aspire 5 Slim',4=>'ASUS VivoBook Go 14',5=>'Acer Nitro V 15'];
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pemilihan Laptop Mahasiswa - Alternatif</title>
<link rel="stylesheet" href="assets/style.css">
<style>
h1, h2 {
  text-align:center;
  animation: fadeInUp 1s ease forwards;
}
.note { text-align:center; margin-bottom:20px; }
h3 { color:#5f27cd; margin-top:30px; }
.matrix { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 5px; margin: 20px 0; }
.matrix > div { padding: 5px; text-align: center; }
select, input { width: 100%; }
.hidden { display: none; }
.step { display: none; }
.step.active { display: block; }
.step-btn { cursor: pointer; padding: 10px; margin: 5px; background: #a9c9ff; border: none; border-radius: 5px; }
.step-btn.active { background: #84fab0; }
</style>
</head>
<body>
<div class="container">
  <h1>🎓 Pemilihan Laptop untuk Mahasiswa Menggunakan Metode AHP</h1>
  <p class="subheading">Cocok untuk kebutuhan coding dengan CPU Intel i5 / Ryzen 5</p>

  <!-- Navigasi Langkah -->
  <div>
    <button class="step-btn" data-step="1">Langkah 1: Setup</button>
    <button class="step-btn" data-step="2">Langkah 2: Kriteria</button>
    <button class="step-btn active" data-step="3">Langkah 3: Alternatif</button>
  </div>

  <!-- Langkah 3: Perbandingan Alternatif -->
  <div class="step active" id="step3">
    <h2>💠 Perbandingan Alternatif per Kriteria</h2>
    <p class="note">Masukkan nilai perbandingan antar laptop untuk setiap kriteria (1–9 atau 1/3).</p>

    <form method="post" action="hasil.php">
      <div id="altQ"></div> <!-- Tabel otomatis dari setup -->
      <div style="text-align:center;margin-top:25px;">
        <button class="btn" type="submit">📊 Lihat Hasil Analisis</button>
      </div>
    </form>
    <button id="back2">Kembali</button>
  </div>

  <footer>✨ Project by Hisna Abidah 💻</footer>
</div>

<script src="app.js"></script>
</body>
</html>