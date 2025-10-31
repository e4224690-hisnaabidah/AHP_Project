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
  if(viewHistoryBtn) viewHistoryBtn.addEventListener('click', () => { showFillHistory(); go(5); });
  if(back5Btn) back5Btn.addEventListener('click', () => go(4));

  // ===== RENDER NAMA KRITERIA & ALTERNATIF =====
  function renderNames() {
    namesArea.innerHTML = '';
    const nC = parseInt(numCrit.value), nA = parseInt(numAlt.value);
    const critDiv = document.createElement('div'); critDiv.innerHTML = '<h4>Kriteria</h4>';
    for (let i = 0; i < nC; i++) {
      const inp = document.createElement('input');
      inp.className = 'crit'; inp.placeholder = 'Kriteria ' + (i+1);
      critDiv.appendChild(inp); critDiv.appendChild(document.createElement('br'));
    }
    const altDiv = document.createElement('div'); altDiv.innerHTML = '<h4>Alternatif (Laptop)</h4>';
    for (let i = 0; i < nA; i++) {
      const inp = document.createElement('input');
      inp.className = 'alt'; inp.placeholder = 'Laptop ' + (i+1);
      altDiv.appendChild(inp); altDiv.appendChild(document.createElement('br'));
    }
    namesArea.appendChild(critDiv); namesArea.appendChild(altDiv);
  }

  function fillSample() {
    numCrit.value = 5; numAlt.value = 5; renderNames();
    const crits = document.querySelectorAll('.crit'), alts = document.querySelectorAll('.alt');
    const cVals = ['Performa CPU & GPU', 'RAM & Penyimpanan', 'Daya Tahan Baterai', 'Portabilitas', 'Harga'];
    const aVals = ['Lenovo IdeaPad Slim 3', 'MSI Modern 14', 'Acer Aspire 5', 'ASUS VivoBook Go 14', 'Acer Nitro V 15'];
    crits.forEach((c,i)=>c.value=cVals[i]||c.placeholder);
    alts.forEach((a,i)=>a.value=aVals[i]||a.placeholder);
  }

  // ===== PERGANTIAN KE KRITERIA =====
  function goToCriteria() {
    const crits = Array.from(document.querySelectorAll('.crit')).map(i=>i.value.trim()||i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    if(crits.length<1||alts.length<2){alert('Isi minimal 1 kriteria dan 2 alternatif');return;}
    localStorage.setItem('criteria', JSON.stringify(crits));
    localStorage.setItem('alternatives', JSON.stringify(alts));
    buildCritTable(crits);
    go(2);
  }

  // ===== BUILD TABEL KRITERIA =====
  function buildCritTable(crits){
    const wrap=document.getElementById('critQ'); 
    let html=`<table id="critTable"><thead><tr><th>Nama Kriteria</th>`;
    crits.forEach(c=>html+=`<th>${c}</th>`); 
    html+=`</tr></thead><tbody>`;
    crits.forEach((row,i)=>{
      html+=`<tr><th>${row}</th>`;
      crits.forEach((col,j)=>html+=`<td><input type="text" name="crit[${i}][${j}]" value="${i===j?1:''}" placeholder=""></td>`);
      html+=`</tr>`;
    });
    html+=`</tbody></table>`; 
    wrap.innerHTML=html;
  }

  // ===== BUILD TABEL ALTERNATIF =====
  function buildAltTables(){
    const wrap=document.getElementById('altQ');
    const crits=JSON.parse(localStorage.getItem('criteria') || '[]');
    const alts=JSON.parse(localStorage.getItem('alternatives') || '[]');
    wrap.innerHTML='';
    crits.forEach((c,ci)=>{
      let html=`<h4>${c}</h4><table class="altTable"><tr><th>Nama Laptop</th>`;
      alts.forEach(a=>html+=`<th>${a}</th>`); html+=`</tr>`;
      alts.forEach((a,i)=>{
        html+=`<tr><th>${a}</th>`;
        alts.forEach((b,j)=>html+=`<td><input type="text" name="alt[${ci}][${i}][${j}]" value="${i===j?1:''}" placeholder=""></td>`);
        html+=`</tr>`;
      });
      html+=`</table>`; wrap.innerHTML+=html;
    });
    go(3);
  }

  // ===== AUTOMATIC RECIPROCAL =====
  document.addEventListener('input', function(e){
    const input = e.target; if(!input.name) return;
    function getReciprocal(val){
      if(val.includes('/')){ 
        const [a,b] = val.split('/').map(Number);
        return (a && b) ? (b/a).toFixed(3).replace(/\.?0+$/,'') : '';
      } else {
        const num = parseFloat(val);
        return isNaN(num) ? '' : (1/num).toFixed(3).replace(/\.?0+$/,'');
      }
    }
    if(input.name.startsWith('crit[')){
      const match = input.name.match(/crit\[(\d+)\]\[(\d+)\]/);
      if(match){
        const i=match[1], j=match[2];
        const mirror = document.querySelector(`input[name="crit[${j}][${i}]"]`);
        if(mirror && input.value.trim()!=='') mirror.value = getReciprocal(input.value.trim());
      }
    }
    if(input.name.startsWith('alt[')){
      const match = input.name.match(/alt\[(\d+)\]\[(\d+)\]\[(\d+)\]/);
      if(match){
        const c=match[1], i=match[2], j=match[3];
        const mirror = document.querySelector(`input[name="alt[${c}][${j}][${i}]"]`);
        if(mirror && input.value.trim()!=='') mirror.value = getReciprocal(input.value.trim());
      }
    }
  });

  // ===== HITUNG & TAMPILKAN HASIL AHP =====
  function computeAHP() {
    const crits = Array.from(document.querySelectorAll('.crit')).map(i=>i.value.trim()||i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    const nC = crits.length;
    const nA = alts.length;

    // Kriteria
    const cMat = Array.from({length:nC},(_,i)=>Array.from({length:nC},(_,j)=>{
      const val = document.querySelector(`#critTable tr:nth-child(${i+2}) input:nth-child(${j+1})`)?.value || (i===j?'1':'');
      if(val.includes('/')){ const [a,b]=val.split('/').map(Number); return b?a/b:1; } 
      const n = parseFloat(val); return isNaN(n)?1:n;
    }));
    const cSum = Array.from({length:nC},(_,j)=>cMat.reduce((s,r)=>s+r[j],0));
    const cNorm = cMat.map(row=>row.map((v,j)=>v/cSum[j]));
    const cWeights = cNorm.map(row=>row.reduce((s,v)=>s+v,0)/nC);

    // Alternatif
    const altTables = document.querySelectorAll('.altTable');
    const altWeights = [];
    altTables.forEach((table, ci)=>{
      const aMat = Array.from({length:nA},(_,i)=>Array.from({length:nA},(_,j)=>{
        const val = table.querySelector(`tr:nth-child(${i+2}) input:nth-child(${j+1})`)?.value || (i===j?'1':'');
        if(val.includes('/')){ const [a,b]=val.split('/').map(Number); return b?a/b:1; }
        const n = parseFloat(val); return isNaN(n)?1:n;
      }));
      const aSum = Array.from({length:nA},(_,j)=>aMat.reduce((s,r)=>s+r[j],0));
      const aNorm = aMat.map(row=>row.map((v,j)=>v/aSum[j]));
      const aW = aNorm.map(row=>row.reduce((s,v)=>s+v,0)/nA);
      altWeights.push(aW);
    });

    const finalScores = Array.from({length:nA},(_,i)=>altWeights.reduce((sum,aW,cIdx)=>sum+aW[i]*cWeights[cIdx],0));
    const totalScore = finalScores.reduce((a,b)=>a+b,0);
    const normScores = finalScores.map(v=>v/totalScore);
    const results = alts.map((a,i)=>({name:a, skor:normScores[i]})).sort((a,b)=>b.skor-a.skor);
    results.forEach((r,i)=>r.rank=i+1);

    // Tampilkan hasil
    let html=`<h3>💡 Hasil Analisis AHP</h3>`;
    html+=`<h4>Bobot Kriteria</h4><table border="1" cellpadding="6"><tr><th>Kriteria</th><th>Bobot</th></tr>`;
    crits.forEach((c,i)=>html+=`<tr><td>${c}</td><td>${cWeights[i].toFixed(3)}</td></tr>`);
    html+=`</table><br>`;

    crits.forEach((c,ci)=>{
      html+=`<h4>Bobot Alternatif untuk Kriteria: ${c}</h4><table border="1" cellpadding="6"><tr><th>Alternatif</th><th>Bobot</th></tr>`;
      altWeights[ci].forEach((w,i)=>html+=`<tr><td>${alts[i]}</td><td>${w.toFixed(3)}</td></tr>`);
      html+=`</table><br>`;
    });

    html+=`<h4>Skor Akhir & Ranking</h4><table border="1" cellpadding="6"><tr><th>Alternatif</th><th>Skor</th><th>Ranking</th></tr>`;
    results.forEach(r=>html+=`<tr><td>${r.name}</td><td>${r.skor.toFixed(3)}</td><td>${r.rank}</td></tr>`);
    html+=`</table>`;

    document.getElementById('resultArea').innerHTML=html;
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
});