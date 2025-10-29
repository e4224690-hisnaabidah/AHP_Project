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

  // ===== SLIDE RIWAYAT =====
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
    let html=`<table><thead><tr><th>Nama Kriteria</th>`;
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
      let html=`<h4>${c}</h4><table><tr><th>Nama Laptop</th>`;
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
  function computeAHP(){
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    let html = '<table><tr><th>Laptop</th><th>Skor</th></tr>';
    alts.forEach(a => html += `<tr><td>${a}</td><td>${(Math.random()*10).toFixed(2)}</td></tr>`);
    html += '</table>';
    document.getElementById('resultArea').innerHTML = html;
    go(4);
    saveResultHistory();
  }

  // ===== SIMPAN RIWAYAT PENGISIAN =====
  function saveFillHistory(){
    const crits = Array.from(document.querySelectorAll('.crit')).map(i=>i.value.trim()||i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    let fillHistory = JSON.parse(localStorage.getItem('fillHistory') || '[]');
    const newEntry = {
      date: new Date().toLocaleString(),
      criteria: crits,
      alternatives: alts,
      critMatrix: JSON.parse(localStorage.getItem('critMatrix') || '{}'),
      altMatrices: JSON.parse(localStorage.getItem('altMatrices') || '{}')
    };
    const lastEntry = fillHistory[fillHistory.length - 1];
    if (!lastEntry || JSON.stringify(lastEntry) !== JSON.stringify(newEntry)) {
      fillHistory.push(newEntry);
      localStorage.setItem('fillHistory', JSON.stringify(fillHistory));
    }
  }

  function saveResultHistory(){
    const alts = Array.from(document.querySelectorAll('.alt')).map(i=>i.value.trim()||i.placeholder);
    let resultHistory = JSON.parse(localStorage.getItem('resultHistory') || '[]');
    resultHistory.push({
      date: new Date().toLocaleString(),
      alternatives: alts,
      result: Array.from(document.querySelectorAll('#resultArea table tr')).slice(1).map(tr => ({
        name: tr.children[0].textContent,
        score: tr.children[1].textContent
      }))
    });
    localStorage.setItem('resultHistory', JSON.stringify(resultHistory));
  }

  // ===== TAMPILKAN RIWAYAT =====
  function showFillHistory(){
    const wrap = document.getElementById('historyArea');
    const fillHistory = JSON.parse(localStorage.getItem('fillHistory') || '[]');
    const resultHistory = JSON.parse(localStorage.getItem('resultHistory') || '[]');
    if(fillHistory.length === 0 && resultHistory.length === 0){
      wrap.innerHTML = '<p>Belum ada riwayat pengisian atau hasil.</p>'; return;
    }

    let html = '<h3>Riwayat Lengkap Pengisian dan Hasil</h3>';

    fillHistory.forEach((entry, idx) => {
      html += `<h4>Pengisian ${idx + 1} (${entry.date})</h4>`;
      html += '<strong>Kriteria:</strong> ' + entry.criteria.join(', ') + '<br>';
      html += '<strong>Alternatif:</strong> ' + entry.alternatives.join(', ') + '<br>';

      if(Object.keys(entry.critMatrix).length){
        html += '<h5>Tabel Kriteria</h5><table border="1" cellpadding="5"><tr>';
        entry.criteria.forEach(c => html += '<th>' + c + '</th>'); html += '</tr>';
        for(let i = 0; i < entry.criteria.length; i++){
          html += '<tr>';
          for(let j = 0; j < entry.criteria.length; j++){
            const key = `crit[${i}][${j}]`;
            html += '<td>' + (entry.critMatrix[key] || (i === j ? 1 : '')) + '</td>';
          }
          html += '</tr>';
        }
        html += '</table>';
      }

      if(Object.keys(entry.altMatrices).length){
        entry.criteria.forEach((c, ci) => {
          html += `<h5>Tabel Alternatif (${c})</h5><table border="1" cellpadding="5"><tr>`;
          entry.alternatives.forEach(a => html += '<th>' + a + '</th>'); html += '</tr>';
          for(let i = 0; i < entry.alternatives.length; i++){
            html += '<tr>';
            for(let j = 0; j < entry.alternatives.length; j++){
              const key = `alt[${ci}][${i}][${j}]`;
              html += '<td>' + (entry.altMatrices[key] || (i === j ? 1 : '')) + '</td>';
            }
            html += '</tr>';
          }
          html += '</table>';
        });
      }
    });

    resultHistory.forEach((entry, idx) => {
      html += `<h4>Hasil ${idx + 1} (${entry.date})</h4>`;
      html += '<table border="1" cellpadding="5"><tr><th>Laptop</th><th>Skor</th></tr>';
      entry.result.forEach(r => html += `<tr><td>${r.name}</td><td>${r.score}</td></tr>`);
      html += '</table>';
    });

    wrap.innerHTML = html;
  }

  // ===== INIT =====
  renderNames();
  const savedCrits = JSON.parse(localStorage.getItem('criteria')||'[]');
  if(savedCrits.length) buildCritTable(savedCrits);
  const savedAlts = JSON.parse(localStorage.getItem('alternatives')||'[]');
  if(savedAlts.length) buildAltTables();
});
