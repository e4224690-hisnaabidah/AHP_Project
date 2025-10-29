<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Pemilihan Laptop Mahasiswa - AHP</title>
  <link rel="stylesheet" href="assets/style.css">
  <style>
    /* Subheading pas di tengah dan punya jarak ideal */
    .subheading {
      text-align: center;
      font-size: 1.1em;
      color: #666;
      margin-top: 10px;
      margin-bottom: 35px;
      font-weight: 500;
    }
    /* Style dasar slide */
    .step { display: none; }
    .step.active { display: block; }
    .btn { padding: 8px 16px; margin: 5px; cursor: pointer; }
    footer { text-align:center; margin-top:40px; font-size:0.9em; color:#888; }
    table { border-collapse: collapse; margin: 15px auto; }
    table, th, td { border: 1px solid #ccc; padding: 5px 10px; text-align: center; }
  </style>
</head>
<body>
<div class="container">

  <h1>Pemilihan Laptop untuk Mahasiswa Menggunakan Metode AHP</h1>
  <p class="subheading">Cocok untuk kebutuhan coding dengan CPU Intel i5 / Ryzen 5</p>

  <!-- ================= SLIDE 1 ================= -->
  <div class="step active" id="step1">
    <h2>🧩 Input Kriteria dan Alternatif</h2>
    <p class="note" style="text-align:center;">
      Masukkan jumlah dan nama kriteria serta alternatif laptop yang akan dibandingkan.
    </p>

    <div style="text-align:center; margin-top:20px;">
      <label>Jumlah Kriteria: </label>
      <input type="number" id="numCrit" min="1" max="10" value="5" style="margin-right:10px;">
      <label>Jumlah Alternatif: </label>
      <input type="number" id="numAlt" min="2" max="10" value="5">
    </div>

    <div style="text-align:center;margin-top:20px;">
      <button id="makeBtn" class="btn">🧮 Buat Form</button>
      <button id="fillSample" class="btn">✨ Gunakan Contoh Data</button>
    </div>

    <div id="namesArea" style="margin-top:25px;"></div>

    <div style="text-align:center;margin-top:30px;">
      <button id="toCrit" class="btn">➡️ Lanjut ke Perbandingan Kriteria</button>
    </div>
  </div>

  <!-- ================= SLIDE 2 ================= -->
  <div class="step" id="step2">
    <h2>💠 Perbandingan Kriteria</h2>
    <p class="note" style="text-align:center;">
      Masukkan nilai perbandingan antar kriteria (1–9 atau pecahan seperti 1/3).
    </p>
    <div id="critQ"></div>

    <div style="text-align:center;margin-top:25px;">
      <button id="back1" class="btn">⬅️ Kembali</button>
      <button id="toAltQ" class="btn">➡️ Lanjut ke Perbandingan Alternatif</button>
    </div>
  </div>

  <!-- ================= SLIDE 3 ================= -->
  <div class="step" id="step3">
    <h2>💻 Perbandingan Alternatif per Kriteria</h2>
    <p class="note" style="text-align:center;">
      Masukkan nilai perbandingan antar laptop untuk setiap kriteria.
    </p>
    <div id="altQ"></div>

    <div style="text-align:center;margin-top:25px;">
      <button id="back2" class="btn">⬅️ Kembali</button>
      <button id="toResult" class="btn">📊 Lihat Hasil Analisis</button>
    </div>
  </div>

  <!-- ================= SLIDE 4 ================= -->
  <div class="step" id="step4">
    <h2>📈 Hasil Analisis AHP</h2>
    <div id="resultArea" style="margin-top:25px;"></div>

    <div style="text-align:center;margin-top:25px;">
      <button id="back3" class="btn">⬅️ Kembali</button>
      <button id="viewHistory" class="btn">📜 Lihat Riwayat Pengisian</button>
    </div>
  </div>

  <!-- ================= SLIDE 5 ================= -->
  <div class="step" id="step5">
    <h2>📜 Riwayat Pengisian</h2>
    <div id="historyArea" style="margin-top:25px;"></div>

    <div style="text-align:center;margin-top:25px;">
      <button id="back4" class="btn">⬅️ Kembali ke Hasil</button>
    </div>
  </div>

  <footer>✨ Project by Hisna Abidah 💻</footer>

</div>
<script src="assets/app.js"></script>
</body>
</html>

