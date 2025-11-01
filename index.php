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
      <button id="back5" class="btn">⬅️ Kembali ke Hasil</button>
      <button id="toHistoryRecords" class="btn">📜 Lanjut ke Historis Pengisian</button>
    </div>

    <!-- ✅ Tombol SELESAI ditaruh di sini -->
    <div style="text-align:center; margin-top:20px;">
      <button id="btnSelesai" 
        style="background:#2ecc71; color:white; border:none; 
               padding:10px 25px; border-radius:10px; 
               font-size:18px; cursor:pointer; display:none;">
        ✅ Selesai
      </button>
    </div>
  </div>

  <!-- ================= SLIDE 6 ================= -->
  <div class="step" id="step6">
    <h2>🗂 Historis Pengisian</h2>
    <table border="1" cellpadding="6" style="border-collapse:collapse; margin:auto; width:90%;" id="historisTable">
      <thead style="background:#f7f7f7;">
        <tr>
          <th>No</th>
          <th>Nama Data</th>
          <th>Tanggal & Waktu</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody id="historisArea">
        <tr>
          <td colspan="4" style="text-align:center;">Belum ada data historis pengisian.</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align:center; margin-top:25px;">
      <button id="back6" class="btn">⬅️ Kembali ke Riwayat</button>
      <button id="clearAllHist" class="btn">🗑 Hapus Semua Historis</button>
    </div>
  </div>

  <footer>✨ Project by Hisna Abidah 💻</footer>

</div> <!-- Penutup .container -->

<!-- POPUP SUKSES -->
<div id="successPopup"
     style="display:none; position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.6); align-items:center; justify-content:center; z-index:9999;">
  <div style="background:white; padding:30px 50px; border-radius:15px;
              text-align:center; box-shadow:0 0 15px rgba(0,0,0,0.3);">
    <div style="font-size:50px;">✅</div>
    <h2>Data Berhasil Disimpan!</h2>
    <p>Terima kasih sudah menggunakan metode AHP 🙏</p>
  </div>
</div>

<script src="assets/app.js"></script>
</body>
</html>

    