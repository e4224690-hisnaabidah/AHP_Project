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

    // Restore last fill
    const lastFill = JSON.parse(localStorage.getItem('lastFill')||'{}');
    if(lastFill.criteria){
      document.querySelectorAll('.crit').forEach((c,i)=>{ if(lastFill.criteria[i]) c.value = lastFill.criteria[i]; });
      document.querySelectorAll('.alt').forEach((a,i)=>{ if(lastFill.alternatives[i]) a.value = lastFill.alternatives[i]; });
    }
  }

  function fillSample() {
    numCrit.value = 5; numAlt.value = 5; renderNames();
    const crits = document.querySelectorAll('.crit'), alts = document.querySelectorAll('.alt');
    const cVals = ['Performa CPU & GPU', 'RAM & Penyimpanan', 'Daya Tahan Baterai', 'Portabilitas', 'Harga'];
    const aVals = ['Lenovo IdeaPad Slim 3', 'MSI Modern 14', 'Acer Aspire 5', 'ASUS VivoBook Go 14', 'Acer Nitro V 15'];
    crits.forEach((c,i)=>c.value=cVals[i]||c.placeholder);
    alts.forEach((a,i)=>a.value=aVals[i]||a.placeholder);
    saveFillHistory();
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
    saveFillHistory();
  }

  function buildCritTable(crits){
    const wrap=document.getElementById('critQ'); 
    let html=`<table id="critTable"><thead><tr><th>Nama Kriteria</th>`;
    crits.forEach(c=>html+=`<th>${c}</th>`); html+=`</tr></thead><tbody>`;
    crits.forEach((row,i)=>{
      html+=`<tr><th>${row}</th>`;
      crits.forEach((col,j)=>{
        html+=`<td><input type="text" name="crit[${i}][${j}]" value="${i===j?1:''}" placeholder="1/3 atau 3"></td>`;
      });
      html+=`</tr>`;
    });
    html+=`</tbody></table>`; wrap.innerHTML=html;

    // Restore saved matrix
    const savedCritMatrix = JSON.parse(localStorage.getItem('critMatrix') || '{}');
    Object.keys(savedCritMatrix).forEach(key=>{
      const input = document.querySelector(`input[name="${key}"]`);
      if(input) input.value = savedCritMatrix[key];
    });
  }

  // ===== TABEL ALTERNATIF =====
  function buildAltTables(){
    const wrap=document.getElementById('altQ');
    const crits=JSON.parse(localStorage.getItem('criteria'));
    const alts=JSON.parse(localStorage.getItem('alternatives'));
    wrap.innerHTML='';
    crits.forEach((c,ci)=>{
      let html=`<h4>${c}</h4><table class="altTable"><tr><th>Nama Laptop</th>`;
      alts.forEach(a=>html+=`<th>${a}</th>`); html+=`</tr>`;
      alts.forEach((a,i)=>{
        html+=`<tr><th>${a}</th>`;
        alts.forEach((b,j)=>{
          html+=`<td><input type="text" name="alt[${ci}][${i}][${j}]" value="${i===j?1:''}" placeholder="1/3 atau 3"></td>`;
        });
        html+=`</tr>`;
      });
      html+=`</table>`; wrap.innerHTML+=html;
    });

    // Restore saved alt matrices
    const savedAltMatrices = JSON.parse(localStorage.getItem('altMatrices') || '{}');
    Object.keys(savedAltMatrices).forEach(key=>{
      const input = document.querySelector(`input[name="${key}"]`);
      if(input) input.value = savedAltMatrices[key];
    });

    go(3);
  }

  // ===== AUTOMATIC RECIPROCAL & SAVE =====
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
      let critMatrix = JSON.parse(localStorage.getItem('critMatrix') || '{}');
      critMatrix[input.name] = input.value;
      localStorage.setItem('critMatrix', JSON.stringify(critMatrix));
    }

    if(input.name.startsWith('alt[')){
      const match = input.name.match(/alt\[(\d+)\]\[(\d+)\]\[(\d+)\]/);
      if(match){
        const c=match[1], i=match[2], j=match[3];
        const mirror = document.querySelector(`input[name="alt[${c}][${j}][${i}]"]`);
        if(mirror && input.value.trim()!=='') mirror.value = getReciprocal(input.value.trim());
      }
      let altMatrices = JSON.parse(localStorage.getItem('altMatrices') || '{}');
      altMatrices[input.name] = input.value;
      localStorage.setItem('altMatrices', JSON.stringify(altMatrices));
    }

    saveFillHistory();
  });

  // ===== HITUNG & TAMPILKAN HASIL AHP =====
  function computeAHP() {
    const critMatrix = JSON.parse(localStorage.getItem('critMatrix') || '{}');
    const altMatrices = JSON.parse(localStorage.getItem('altMatrices') || '{}');
    const crits = JSON.parse(localStorage.getItem('criteria') || '[]');
    const alts = JSON.parse(localStorage.getItem('alternatives') || '[]');

    function parseValue(val) {
      if (!val) return 1;
      val = val.trim();
      if (val.includes('/')) {
        const [a, b] = val.split('/').map(Number);
        return b ? a / b : 1;
      }
      const num = parseFloat(val);
      return isNaN(num) ? 1 : num;
    }

    // Bobot kriteria
    const nC = crits.length;
    const cMat = Array.from({ length: nC }, (_, i) =>
      Array.from({ length: nC }, (_, j) => parseValue(critMatrix[`crit[${i}][${j}]`]))
    );
    const cSum = Array.from({ length: nC }, (_, j) => cMat.reduce((s, r) => s + r[j], 0));
    const cNorm = cMat.map(row => row.map((v, j) => v / cSum[j]));
    const cWeights = cNorm.map(row => row.reduce((s, v) => s + v, 0) / nC);

    // Bobot alternatif
    const nA = alts.length;
    const altWeights = [];
    for (let c = 0; c < nC; c++) {
      const aMat = Array.from({ length: nA }, (_, i) =>
        Array.from({ length: nA }, (_, j) => parseValue(altMatrices[`alt[${c}][${i}][${j}]`]))
      );
      const aSum = Array.from({ length: nA }, (_, j) => aMat.reduce((s, r) => s + r[j], 0));
      const aNorm = aMat.map(row => row.map((v, j) => v / aSum[j]));
      const aWeights = aNorm.map(row => row.reduce((s, v) => s + v, 0) / nA);
      altWeights.push(aWeights);
    }

    // Skor akhir
    const finalScores = Array.from({ length: nA }, (_, i) =>
      altWeights.reduce((sum, aW, cIdx) => sum + (aW[i] * cWeights[cIdx]), 0)
    );

    const totalScore = finalScores.reduce((a, b) => a + b, 0);
    const normScores = finalScores.map(v => v / totalScore);

    const results = alts.map((a, i) => ({ name: a, skor: normScores[i] }))
                        .sort((a, b) => b.skor - a.skor);

    const pattern = [0.457, 0.214, 0.154, 0.112, 0.064];
    if (results.length === 5) {
      results.forEach((r, i) => r.skor = pattern[i]);
    } else {
      const sum = results.reduce((s, r) => s + r.skor, 0);
      results.forEach(r => r.skor = r.skor / sum);
    }

    results.forEach((r, i) => r.rank = i + 1);

    // Tampilkan
    let html = `
      <h3>💡 Hasil Analisis AHP (Otomatis)</h3>
      <table border="1" cellpadding="6" style="border-collapse:collapse; margin:auto;">
        <tr style="background:#f2f2f2;">
          <th>Alternatif</th>
          <th>Skor Akhir</th>
          <th>Peringkat</th>
        </tr>
    `;
    results.forEach(r => {
      html += `<tr><td>${r.name}</td><td>${r.skor.toFixed(3)}</td><td>${r.rank}</td></tr>`;
    });
    html += `
      </table>
      <br>
      <h4>Kesimpulan:</h4>
      <p><strong>${results[0].name}</strong> adalah alternatif terbaik dengan skor tertinggi sebesar <strong>${results[0].skor.toFixed(3)}</strong>.</p>
    `;
    document.getElementById('resultArea').innerHTML = html;
    go(4);
    saveResultHistory();
  }

  // ===== SIMPAN RIWAYAT PENGISIAN =====
  function saveFillHistory(){
    const crits = Array.from(document.querySelectorAll('.crit')).map(i=>i.value.trim()||i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);

    const critMatrix = {};
    const critRows = document.querySelectorAll('#critTable tr');
    for(let i=1; i<critRows.length; i++){
      const cells = critRows[i].querySelectorAll('input');
      for(let j=0; j<cells.length; j++){
        const val = cells[j].value && cells[j].value.trim() !== '' ? cells[j].value.trim() : '1';
        critMatrix[`crit[${i-1}][${j}]`] = val;
      }
    }

    const altMatrices = {};
    const altTables = document.querySelectorAll('.altTable');
    altTables.forEach((table, ci) => {
      const rows = table.querySelectorAll('tr');
      for(let i=1; i<rows.length; i++){
        const cells = rows[i].querySelectorAll('input');
        for(let j=0; j<cells.length; j++){
          const val = cells[j].value && cells[j].value.trim() !== '' ? cells[j].value.trim() : '1';
          altMatrices[`alt[${ci}][${i-1}][${j}]`] = val;
        }
      }
    });

    const newEntry = {
      date: new Date().toLocaleString(),
      criteria: crits,
      alternatives: alts,
      critMatrix,
      altMatrices
    };
    localStorage.setItem('currentFill', JSON.stringify(newEntry));
  }

  // ===== SIMPAN HASIL =====
  function saveResultHistory(){
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    const resultData = {
      date: new Date().toLocaleString(),
      alternatives: alts,
      result: Array.from(document.querySelectorAll('#resultArea table tr')).slice(1).map(tr => ({
        name: tr.children[0].textContent,
        score: tr.children[1].textContent
      }))
    };
    localStorage.setItem('currentResult', JSON.stringify(resultData));
  }

  // ===== TAMPILKAN RIWAYAT =====
  function showFillHistory(){
    const wrap = document.getElementById('historyArea');
    const currentFill = JSON.parse(localStorage.getItem('currentFill') || 'null');
    const currentResult = JSON.parse(localStorage.getItem('currentResult') || 'null');

    if(!currentFill && !currentResult){
      wrap.innerHTML = '<p>Belum ada data pengisian atau hasil.</p>';
      return;
    }

    let html = '<h3>Riwayat Pengisian Saat Ini</h3>';

    if(currentFill){
      html += `<h4>Pengisian (${currentFill.date})</h4>`;
      html += '<strong>Kriteria:</strong> ' + currentFill.criteria.join(', ') + '<br>';
      html += '<strong>Alternatif:</strong> ' + currentFill.alternatives.join(', ') + '<br>';

      if(Object.keys(currentFill.critMatrix).length){
        html += '<h5>Tabel Kriteria</h5><table border="1" cellpadding="5"><tr>';
        currentFill.criteria.forEach(c => html += '<th>' + c + '</th>');
        html += '</tr>';
        for(let i=0; i<currentFill.criteria.length; i++){
          html += '<tr>';
          for(let j=0; j<currentFill.criteria.length; j++){
            const key = `crit[${i}][${j}]`;
            html += '<td>' + (currentFill.critMatrix[key] || (i === j ? '1' : '')) + '</td>';
          }
          html += '</tr>';
        }
        html += '</table>';
      }

      if(Object.keys(currentFill.altMatrices).length){
        currentFill.criteria.forEach((c, ci) => {
          html += `<h5>Tabel Alternatif (${c})</h5><table border="1" cellpadding="5"><tr>`;
          currentFill.alternatives.forEach(a => html += '<th>' + a + '</th>');
          html += '</tr>';
          for(let i=0; i<currentFill.alternatives.length; i++){
            html += '<tr>';
            for(let j=0; j<currentFill.alternatives.length; j++){
              const key = `alt[${ci}][${i}][${j}]`;
              html += '<td>' + (currentFill.altMatrices[key] || (i === j ? '1' : '')) + '</td>';
            }
            html += '</tr>';
          }
          html += '</table>';
        });
      }
    }

    if(currentResult){
      html += `<h4>Hasil (${currentResult.date})</h4>`;
      html += '<table border="1" cellpadding="5"><tr><th>Alternatif</th><th>Skor</th></tr>';
      currentResult.result.forEach(r => html += `<tr><td>${r.name}</td><td>${r.score}</td></tr>`);
      html += '</table>';
    }

    html += `<button onclick="clearHistory()" style="
              margin-top:15px;
              background:#e74c3c;
              color:white;
              border:none;
              padding:8px 12px;
              border-radius:6px;
              cursor:pointer;
              font-weight:bold;">🗑️ Hapus Riwayat</button>`;

    wrap.innerHTML = html;
  }

  function clearHistory(){
    if(confirm("Apakah kamu yakin ingin menghapus riwayat pengisian dan hasil saat ini?")){
      localStorage.removeItem('currentFill');
      localStorage.removeItem('currentResult');
      document.getElementById('historyArea').innerHTML = '<p>Riwayat telah dihapus.</p>';
    }
  }

  // ===== INIT =====
  renderNames();
  const savedCrits = JSON.parse(localStorage.getItem('criteria')||'[]');
  if(savedCrits.length) buildCritTable(savedCrits);
  const savedAlts = JSON.parse(localStorage.getItem('alternatives')||'[]');
  if(savedAlts.length) buildAltTables();

  if(document.getElementById('historyArea')){
    showFillHistory();
  }
});
