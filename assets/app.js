document.addEventListener('DOMContentLoaded', function () {

  // ===== SLIDE FUNCTION =====
  function go(s) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((sec, idx) => sec.classList.toggle('active', (idx + 1) === s));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== ELEMENTS =====
  const makeBtn = document.getElementById('makeBtn'),
    namesArea = document.getElementById('namesArea'),
    numCrit = document.getElementById('numCrit'),
    numAlt = document.getElementById('numAlt');

  makeBtn.addEventListener('click', renderNames);
  document.getElementById('fillSample').addEventListener('click', fillSample);
  document.getElementById('toCrit').addEventListener('click', goToCriteria);
  document.getElementById('back1').addEventListener('click', () => go(1));
  document.getElementById('back2').addEventListener('click', () => go(2));
  document.getElementById('back3').addEventListener('click', () => go(3));
  document.getElementById('toAltQ').addEventListener('click', buildAltTables);
  document.getElementById('toResult').addEventListener('click', computeAHP);

  const viewHistoryBtn = document.getElementById('viewHistory');
  const back5Btn = document.getElementById('back5');
  if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', () => { showFillHistory(); go(5); });
  if (back5Btn) back5Btn.addEventListener('click', () => go(4));
  document.getElementById('viewHistory').onclick = () => { showFillHistory(); go(5); };
  document.getElementById('toHistoryRecords').onclick = () => { go(6); };
  document.getElementById('back6').onclick = () => go(5);

  // ===== RENDER NAMA KRITERIA & ALTERNATIF =====
  function renderNames() {
    namesArea.innerHTML = '';
    const nC = parseInt(numCrit.value), nA = parseInt(numAlt.value);
    const critDiv = document.createElement('div'); critDiv.innerHTML = '<h4>Kriteria</h4>';
    for (let i = 0; i < nC; i++) {
      const inp = document.createElement('input');
      inp.className = 'crit'; inp.placeholder = 'Kriteria ' + (i + 1);
      critDiv.appendChild(inp); critDiv.appendChild(document.createElement('br'));
    }
    const altDiv = document.createElement('div'); altDiv.innerHTML = '<h4>Alternatif (Laptop)</h4>';
    for (let i = 0; i < nA; i++) {
      const inp = document.createElement('input');
      inp.className = 'alt'; inp.placeholder = 'Laptop ' + (i + 1);
      altDiv.appendChild(inp); altDiv.appendChild(document.createElement('br'));
    }
    namesArea.appendChild(critDiv); namesArea.appendChild(altDiv);
  }

  // ===== ISI CONTOH =====
  function fillSample() {
    numCrit.value = 5; numAlt.value = 5; renderNames();
    const crits = document.querySelectorAll('.crit'), alts = document.querySelectorAll('.alt');
    const cVals = ['Performa CPU & GPU', 'RAM & Penyimpanan', 'Daya Tahan Baterai', 'Portabilitas', 'Harga'];
    const aVals = ['Lenovo IdeaPad Slim 3', 'MSI Modern 14', 'Acer Aspire 5', 'ASUS VivoBook Go 14', 'Acer Nitro V 15'];
    crits.forEach((c, i) => c.value = cVals[i] || c.placeholder);
    alts.forEach((a, i) => a.value = aVals[i] || a.placeholder);
  }

  // ===== PERGANTIAN KE SLIDE 2 =====
  function goToCriteria() {
    const crits = Array.from(document.querySelectorAll('.crit')).map(i => i.value.trim() || i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i => i.value.trim() || i.placeholder);
    if (crits.length < 1 || alts.length < 2) { alert('Isi minimal 1 kriteria dan 2 alternatif'); return; }
    localStorage.setItem('criteria', JSON.stringify(crits));
    localStorage.setItem('alternatives', JSON.stringify(alts));
    buildCritTable(crits);
    go(2);
  }

  // ===== BUILD TABEL KRITERIA =====
  function buildCritTable(crits) {
    const wrap = document.getElementById('critQ');
    let html = `<table id="critTable"><thead><tr><th>Nama Kriteria</th>`;
    crits.forEach(c => html += `<th>${c}</th>`);
    html += `</tr></thead><tbody>`;
    crits.forEach((row, i) => {
      html += `<tr><th>${row}</th>`;
      crits.forEach((col, j) => html += `<td><input type="text" name="crit[${i}][${j}]" value="${i === j ? 1 : ''}" placeholder=""></td>`);
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }

  // ===== BUILD TABEL ALTERNATIF =====
  function buildAltTables() {
    const wrap = document.getElementById('altQ');
    const crits = JSON.parse(localStorage.getItem('criteria') || '[]');
    const alts = JSON.parse(localStorage.getItem('alternatives') || '[]');
    wrap.innerHTML = '';
    crits.forEach((c, ci) => {
      let html = `<h4>${c}</h4><table class="altTable"><tr><th>Nama Laptop</th>`;
      alts.forEach(a => html += `<th>${a}</th>`); html += `</tr>`;
      alts.forEach((a, i) => {
        html += `<tr><th>${a}</th>`;
        alts.forEach((b, j) => html += `<td><input type="text" name="alt[${ci}][${i}][${j}]" value="${i === j ? 1 : ''}" placeholder=""></td>`);
        html += `</tr>`;
      });
      html += `</table>`; wrap.innerHTML += html;
    });
    go(3);
  }

  // ===== RECIPROCAL OTOMATIS (DUKUNG PECAHAN) =====
  document.addEventListener('input', function (e) {
    const input = e.target;
    if (!input.name) return;

    function getReciprocal(val) {
      val = val.trim();
      if (!val) return '';
      if (val.includes('/')) {
        const [a, b] = val.split('/').map(Number);
        if (a && b) return `${b}/${a}`;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num !== 0) {
        return num === 1 ? '1' : (1 / num).toFixed(3).replace(/\.?0+$/, '');
      }
      return '';
    }

    if (input.name.startsWith('crit[')) {
      const match = input.name.match(/crit\[(\d+)\]\[(\d+)\]/);
      if (match) {
        const i = match[1], j = match[2];
        const mirror = document.querySelector(`input[name="crit[${j}][${i}]"]`);
        if (mirror && input.value.trim() !== '') mirror.value = getReciprocal(input.value.trim());
      }
    }

    if (input.name.startsWith('alt[')) {
      const match = input.name.match(/alt\[(\d+)\]\[(\d+)\]\[(\d+)\]/);
      if (match) {
        const c = match[1], i = match[2], j = match[3];
        const mirror = document.querySelector(`input[name="alt[${c}][${j}][${i}]"]`);
        if (mirror && input.value.trim() !== '') mirror.value = getReciprocal(input.value.trim());
      }
    }
  });
function computeAHP() {
  // ambil nama kriteria & alternatif
  const crits = Array.from(document.querySelectorAll('.crit')).map(i => i.value.trim() || i.placeholder);
  const alts = Array.from(document.querySelectorAll('.alt')).map(i => i.value.trim() || i.placeholder);
  const nC = crits.length;
  const nA = alts.length;
  if (nC === 0 || nA === 0) {
    alert('Belum ada kriteria/alternatif lengkap.');
    return;
  }

  // parse supporting fractions like "1/3"
  function parseVal(val, i, j) {
    if (!val) {
      // kalau kosong, diagonal -> 1, selain -> 1 (behaviour riwayat)
      return (i === j) ? 1 : 1;
    }
    val = String(val).trim();
    if (val === '') return (i === j) ? 1 : 1;
    if (val.includes('/')) {
      const parts = val.split('/');
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      return (isFinite(a) && isFinite(b) && b !== 0) ? (a / b) : 1;
    }
    const num = parseFloat(val);
    return isNaN(num) ? 1 : num;
  }

  let html = `<h3>💡 Hasil Analisis AHP</h3>`;

  // ===== MATRIX KRITERIA (ambil baris per baris dari tabel #critTable) =====
  const critRows = Array.from(document.querySelectorAll('#critTable tbody tr'));
  // buat matriks numeric cMat[i][j]
  const cMat = Array.from({ length: nC }, (_, i) => {
    const inputs = critRows[i] ? Array.from(critRows[i].querySelectorAll('input')) : [];
    return Array.from({ length: nC }, (_, j) => {
      const raw = inputs[j] ? inputs[j].value.trim() : (i === j ? '1' : '');
      return parseVal(raw, i, j);
    });
  });

  // normalisasi kolom: hitung jumlah tiap kolom
  const cColSum = Array.from({ length: nC }, (_, j) =>
    cMat.reduce((s, row) => s + (row[j] || 0), 0)
  );

  // buat matriks ternormalisasi dan bobot kriteria = rata-rata baris
  const cNorm = cMat.map(row => row.map((v, j) => cColSum[j] ? (v / cColSum[j]) : 0));
  const cWeights = cNorm.map(row => {
    const s = row.reduce((a, b) => a + b, 0);
    return s / nC;
  });

  // tampilkan bobot kriteria (format sama seperti riwayat)
  html += `<h4>Bobot Kriteria</h4>`;
  html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;">`;
  html += `<tr><th>Kriteria</th><th>Bobot</th></tr>`;
  crits.forEach((c, i) => html += `<tr><td>${c}</td><td>${cWeights[i].toFixed(3)}</td></tr>`);
  html += `</table><br>`;

  // ===== MATRIX ALTERNATIF PER KRITERIA (ambil dari setiap .altTable) =====
  const altTables = document.querySelectorAll('.altTable');
  const altWeights = [];

  altTables.forEach((table, ci) => {
    // ambil semua baris (header + baris alt). Kita skip header (index 0)
    const rows = Array.from(table.querySelectorAll('tr'));
    // buat aMat numeric
    const aMat = Array.from({ length: nA }, (_, i) => {
      const inputs = rows[i + 1] ? Array.from(rows[i + 1].querySelectorAll('input')) : [];
      return Array.from({ length: nA }, (_, j) => {
        const raw = inputs[j] ? inputs[j].value.trim() : (i === j ? '1' : '');
        return parseVal(raw, i, j);
      });
    });

    // normalisasi kolom lalu rata-rata baris (sama dengan riwayat)
    const aColSum = Array.from({ length: nA }, (_, j) =>
      aMat.reduce((s, row) => s + (row[j] || 0), 0)
    );
    const aNorm = aMat.map(row => row.map((v, j) => aColSum[j] ? (v / aColSum[j]) : 0));
    const aW = aNorm.map(row => {
      const s = row.reduce((a, b) => a + b, 0);
      return s / nA;
    });

    altWeights.push(aW);

    // tampilkan bobot alternatif untuk kriteria ini
    html += `<h4>Bobot Alternatif untuk Kriteria: ${crits[ci]}</h4>`;
    html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;">`;
    html += `<tr><th>Alternatif</th><th>Bobot</th></tr>`;
    alts.forEach((a, i) => html += `<tr><td>${a}</td><td>${aW[i].toFixed(3)}</td></tr>`);
    html += `</table><br>`;
  });

  // ===== SKOR AKHIR (gabungkan altWeights dengan cWeights) =====
  const finalScores = Array.from({ length: nA }, (_, i) =>
    altWeights.reduce((sum, aW, cIdx) => sum + (aW[i] || 0) * (cWeights[cIdx] || 0), 0)
  );

  // normalisasi total jadi total = 1 (sama seperti Excel/riwayat)
  const totalScore = finalScores.reduce((a, b) => a + b, 0) || 1;
  const normScores = finalScores.map(v => v / totalScore);

  // ranking
  const results = alts.map((a, i) => ({ name: a, skor: normScores[i] })).sort((a, b) => b.skor - a.skor);
  results.forEach((r, i) => r.rank = i + 1);

  // tampilkan skor akhir & ranking
  html += `<h4>Skor Akhir & Ranking</h4>`;
  html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;">`;
  html += `<tr><th>Alternatif</th><th>Skor</th><th>Ranking</th></tr>`;
  results.forEach(r => html += `<tr><td>${r.name}</td><td>${r.skor.toFixed(3)}</td><td>${r.rank}</td></tr>`);
  html += `</table>`;

  // render
  document.getElementById('resultArea').innerHTML = html;
  go(4);
}



// ===== TAMPILKAN RIWAYAT =====
function showFillHistory() {
const wrap = document.getElementById('historyArea');
if (!wrap) return;

const crits = Array.from(document.querySelectorAll('.crit')).map(i => i.value.trim() || i.placeholder);
const alts = Array.from(document.querySelectorAll('.alt')).map(i => i.value.trim() || i.placeholder);

if (!crits.length || !alts.length) {
wrap.innerHTML = '<p>Belum ada data pengisian.</p>';
return;
}

let html = `<h3>Riwayat Pengisian Saat Ini</h3>`;
html += `<p><strong>Jumlah Kriteria:</strong> ${crits.length}</p>`;
html += `<p><strong>Nama Kriteria:</strong> ${crits.join(', ')}</p>`;
html += `<p><strong>Jumlah Alternatif:</strong> ${alts.length}</p>`;
html += `<p><strong>Nama Alternatif:</strong> ${alts.join(', ')}</p><br>`;

const nC = crits.length;
const nA = alts.length;

function parseVal(val, i, j) {
val = val.trim();
if (!val && i === j) return 1;
if (!val) return 1;
if (val.includes('/')) {
const [a, b] = val.split('/').map(Number);
return b ? a / b : 1;
}
const n = parseFloat(val);
return isNaN(n) ? 1 : n;
}

// ===== Tabel Perbandingan Kriteria =====
const critTable = document.getElementById('critTable');
let cMat = [];
if (critTable) {
html += `<h4>Tabel Perbandingan Kriteria</h4>`;
html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Kriteria</th>`;
crits.forEach(c => html += `<th>${c}</th>`);
html += `</tr>`;

const rows = critTable.querySelectorAll('tbody tr');
cMat = Array.from(rows).map((row, i) => {
const inputs = Array.from(row.querySelectorAll('input'));
html += `<tr><th>${crits[i]}</th>`;
return Array.from({length:nC}, (_, j) => {
const val = inputs[j] ? inputs[j].value.trim() : '';
html += `<td>${val}</td>`;
return parseVal(val, i, j);
}).map(v=>v); // pastikan array
html += `</tr>`;
});
html += `</table><br>`;
}

// ===== Hitung bobot kriteria =====
const cSum = Array.from({length:nC}, (_, j) => cMat.reduce((s,r)=>s+r[j],0));
const cNorm = cMat.map(row => row.map((v,j)=>v/cSum[j]));
const cWeights = cNorm.map(row => row.reduce((s,v)=>s+v,0)/nC);

html += `<h4>Bobot Kriteria</h4><table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Kriteria</th><th>Bobot</th></tr>`;
crits.forEach((c,i)=>html+=`<tr><td>${c}</td><td>${cWeights[i].toFixed(3)}</td></tr>`);
html += `</table><br>`;

// ===== Tabel Alternatif per Kriteria =====
const altTables = document.querySelectorAll('.altTable');
let altWeights = [];
altTables.forEach((table, ci) => {
html += `<h4>Alternatif untuk Kriteria: ${crits[ci]}</h4>`;
html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th>`;
alts.forEach(a => html += `<th>${a}</th>`);
html += `</tr>`;

const rows = table.querySelectorAll('tr');
const aMat = Array.from({length:nA}, (_, i) => {
const inputs = Array.from(rows[i+1].querySelectorAll('input'));
html += `<tr><th>${alts[i]}</th>`;
return Array.from({length:nA}, (_, j) => {
const val = inputs[j] ? inputs[j].value.trim() : '';
html += `<td>${val}</td>`;
return parseVal(val);
});
html += `</tr>`;
});

const colSum = Array.from({length:nA}, (_, j) => aMat.reduce((s,r)=>s+r[j],0));
const aNorm = aMat.map(row => row.map((v,j)=>v/colSum[j]));
const aW = aNorm.map(row => row.reduce((s,v)=>s+v,0)/nA);
altWeights.push(aW);

html += `</table><br>`;
html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th><th>Bobot</th></tr>`;
alts.forEach((a,i)=>html+=`<tr><td>${a}</td><td>${aW[i].toFixed(3)}</td></tr>`);
html += `</table><br>`;
});

// ===== Skor Akhir & Ranking =====
const finalScores = Array.from({length:nA}, (_, i) => altWeights.reduce((sum,aW,cIdx)=>sum + aW[i]*cWeights[cIdx],0));
const totalScore = finalScores.reduce((a,b)=>a+b,0);
const normScores = finalScores.map(v=>v/totalScore);
const results = alts.map((a,i)=>({name:a, skor:normScores[i]})).sort((a,b)=>b.skor-a.skor);
results.forEach((r,i)=>r.rank=i+1);

html += `<h4>Skor Akhir & Ranking</h4>`;
html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th><th>Skor</th><th>Ranking</th></tr>`;
results.forEach(r=>html+=`<tr><td>${r.name}</td><td>${r.skor.toFixed(3)}</td><td>${r.rank}</td></tr>`);
html += `</table>`;

wrap.innerHTML = html;
}

// ===== Ambil historis dari localStorage =====
let riwayatList = JSON.parse(localStorage.getItem('riwayatList') || '[]');

// ===== Tombol lanjut ke Historis (Slide 6) =====
const toHistoryRecordsBtn = document.getElementById('toHistoryRecords');
if (toHistoryRecordsBtn) {
  toHistoryRecordsBtn.addEventListener('click', function() {
    simpanKeHistoris(); // Simpan data terbaru
    tampilkanHistoris(); // Tampilkan tabel historis
    go(6); // Pindah ke slide 6
  });
}

// ===== Tombol kembali slide 6 ke slide 5 =====
const back6Btn = document.getElementById('back6');
if (back6Btn) back6Btn.addEventListener('click', () => go(5));

// ===== Tombol hapus semua historis =====
const clearAllHist = document.getElementById('clearAllHist');
if (clearAllHist) {
  clearAllHist.addEventListener('click', () => {
    if (confirm("Hapus semua data historis?")) {
      riwayatList = [];
      localStorage.removeItem('riwayatList');
      tampilkanHistoris();
    }
  });
}

// ===== Fungsi simpan ke historis =====
function simpanKeHistoris() {
  const crits = Array.from(document.querySelectorAll('.crit')).map(i => i.value.trim() || i.placeholder);
  const alts = Array.from(document.querySelectorAll('.alt')).map(i => i.value.trim() || i.placeholder);
  if (!crits.length || !alts.length) return;

  const waktu = new Date();
  const record = {
    id: Date.now(),
    namaData: crits.join(', '),
    waktu: waktu.toLocaleString("id-ID"),
    kriteria: crits,
    alternatif: alts,
    cMat: getCurrentCritMatrix(),
    aMatList: getCurrentAltMatrices()
  };

  riwayatList.push(record);
  localStorage.setItem('riwayatList', JSON.stringify(riwayatList));
}

// ===== Ambil matriks kriteria saat ini =====
function getCurrentCritMatrix() {
  const critTable = document.getElementById('critTable');
  if (!critTable) return [];
  const rows = critTable.querySelectorAll('tbody tr');
  return Array.from(rows).map((row) => {
    const inputs = Array.from(row.querySelectorAll('input'));
    return inputs.map(input => input.value || '1');
  });
}

// ===== Ambil matriks alternatif per kriteria saat ini =====
function getCurrentAltMatrices() {
  const altTables = document.querySelectorAll('.altTable');
  let allMatrices = [];
  altTables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    const n = rows.length - 1;
    let mat = [];
    for (let i = 1; i <= n; i++) {
      const inputs = Array.from(rows[i].querySelectorAll('input'));
      mat.push(inputs.map(input => input.value || '1'));
    }
    allMatrices.push(mat);
  });
  return allMatrices;
}

// ===== Fungsi tampilkan tabel historis =====
function tampilkanHistoris() {
  const area = document.getElementById('historisArea');
  if (!area) return;

  if (riwayatList.length === 0) {
    area.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data historis pengisian.</td></tr>`;
    return;
  }

  let html = '';
  riwayatList.forEach((r, i) => {
    html += `
      <tr data-id="${r.id}">
        <td>${i + 1}</td>
        <td>${r.namaData}</td>
        <td>${r.waktu}</td>
        <td>
          <button class="btn-lihat">👁 Lihat</button>
          <button class="btn-hapus">🗑 Hapus</button>
        </td>
      </tr>
    `;
  });

  area.innerHTML = html;

  // Pasang event listener tombol lihat
  area.querySelectorAll('.btn-lihat').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('tr').dataset.id, 10);
      lihatRiwayat(id);
    });
  });

  // Pasang event listener tombol hapus
  area.querySelectorAll('.btn-hapus').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('tr').dataset.id, 10);
      hapusRiwayat(id);
    });
  });
}

// ===== Fungsi lihat riwayat (slide 5) =====
function parseVal(val, i, j) {
  val = val.trim();
  if (!val && i === j) return 1;
  if (!val) return 1;
  if (val.includes('/')) {
    const [a,b] = val.split('/').map(Number);
    return b ? a/b : 1;
  }
  const n = parseFloat(val);
  return isNaN(n) ? 1 : n;
}

window.lihatRiwayat = function(id) {
  const data = riwayatList.find(r => r.id === id);
  if (!data) return alert("Data riwayat tidak ditemukan.");

  const area = document.getElementById('historyArea');
  if (!area) return;

  const crits = data.kriteria;
  const alts = data.alternatif;
  const nC = crits.length;
  const nA = alts.length;

  // ===== Hitung bobot kriteria
  const cMat = data.cMat.map(row => row.map((v,i)=>parseVal(v,i,i)));
  const cSum = Array.from({length:nC}, (_, j) => cMat.reduce((s,r)=>s+r[j],0));
  const cNorm = cMat.map(row => row.map((v,j)=>v/cSum[j]));
  const cWeights = cNorm.map(row => row.reduce((s,v)=>s+v,0)/nC);

  // ===== Hitung bobot alternatif per kriteria
  const altWeights = data.aMatList.map(aMat => {
    const mat = aMat.map(row => row.map((v,i)=>parseVal(v,i,i)));
    const colSum = Array.from({length:nA}, (_, j) => mat.reduce((s,r)=>s+r[j],0));
    const aNorm = mat.map(row => row.map((v,j)=>v/colSum[j]));
    return aNorm.map(row => row.reduce((s,v)=>s+v,0)/nA);
  });

  // ===== Skor akhir & ranking
  const finalScores = Array.from({length:nA}, (_, i) => altWeights.reduce((sum,aW,cIdx)=>sum + aW[i]*cWeights[cIdx],0));
  const totalScore = finalScores.reduce((a,b)=>a+b,0);
  const normScores = finalScores.map(v=>v/totalScore);
  const results = alts.map((a,i)=>({name:a, skor:normScores[i]})).sort((a,b)=>b.skor-a.skor);
  results.forEach((r,i)=>r.rank=i+1);

  // ===== Buat HTML tabel
  let html = `<h3>Detail Riwayat</h3>`;
  html += `<p><b>Tanggal & Waktu:</b> ${data.waktu}</p>`;
  html += `<p><b>Kriteria:</b> ${crits.join(', ')}</p>`;
  html += `<p><b>Alternatif:</b> ${alts.join(', ')}</p><br>`;

  // Tabel kriteria
  html += `<h4>Tabel Perbandingan Kriteria</h4>`;
  html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Kriteria</th>`;
  crits.forEach(c=>html+=`<th>${c}</th>`); html+=`</tr>`;
  data.cMat.forEach((row,i)=>{ html+=`<tr><th>${crits[i]}</th>`; row.forEach(v=>html+=`<td>${v}</td>`); html+=`</tr>`; });
  html += `</table><br>`;

  // Tabel alternatif per kriteria
  data.aMatList.forEach((aMat, ci)=>{
    html += `<h4>Alternatif untuk Kriteria: ${crits[ci]}</h4>`;
    html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th>`;
    alts.forEach(a=>html+=`<th>${a}</th>`); html+=`</tr>`;
    aMat.forEach((row,i)=>{ html+=`<tr><th>${alts[i]}</th>`; row.forEach(v=>html+=`<td>${v}</td>`); html+=`</tr>`; });
    html += `</table><br>`;
  });

  // Bobot kriteria
  html += `<h4>Bobot Kriteria</h4><table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Kriteria</th><th>Bobot</th></tr>`;
  crits.forEach((c,i)=>html+=`<tr><td>${c}</td><td>${cWeights[i].toFixed(3)}</td></tr>`); html+=`</table><br>`;

  // Bobot alternatif per kriteria
  crits.forEach((c, ci)=>{
    html += `<h4>Bobot Alternatif untuk Kriteria: ${c}</h4>`;
    html += `<table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th><th>Bobot</th></tr>`;
    alts.forEach((a,i)=>html+=`<tr><td>${a}</td><td>${altWeights[ci][i].toFixed(3)}</td></tr>`); html+=`</table><br>`;
  });

  // Skor akhir & ranking
  html += `<h4>Skor Akhir & Ranking</h4><table border="1" cellpadding="5" style="border-collapse:collapse; margin:auto;"><tr><th>Alternatif</th><th>Skor</th><th>Ranking</th></tr>`;
  results.forEach(r=>html+=`<tr><td>${r.name}</td><td>${r.skor.toFixed(3)}</td><td>${r.rank}</td></tr>`); html+=`</table>`;

  area.innerHTML = html;

  go(5);
   area.innerHTML = html;

  go(5);

  // ===== Tampilkan tombol Selesai =====
  const selesaiBtn = document.getElementById("btnSelesai");
  if (selesaiBtn) selesaiBtn.style.display = "inline-block";

  // ===== Event Klik Tombol SELESAI =====
  const btnSelesai = document.getElementById("btnSelesai");
  if (btnSelesai) {
    btnSelesai.addEventListener("click", showSuccessPopup);
  }
};

// ===== Fungsi hapus satu riwayat =====
window.hapusRiwayat = function(id) {
  if (!confirm("Yakin ingin menghapus riwayat ini?")) return;
  riwayatList = riwayatList.filter(r => r.id !== id);
  localStorage.setItem('riwayatList', JSON.stringify(riwayatList));
  tampilkanHistoris();
};

// ===== Tampilkan tabel historis saat load =====
tampilkanHistoris();

function showSuccessPopup() {
  const popup = document.getElementById("successPopup");
  popup.style.display = "flex";

  setTimeout(() => {
    popup.style.display = "none";

    // Setelah pop-up hilang, kembali ke slide 1
    go(1);

    // Sembunyikan tombol “Selesai”
    document.getElementById("btnSelesai").style.display = "none";
  }, 2500);
}


});