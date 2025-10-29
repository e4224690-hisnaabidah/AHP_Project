document.addEventListener('DOMContentLoaded', function () {
  const steps = document.querySelectorAll('.step');
  function go(s) {
    steps.forEach((sec, idx) => sec.classList.toggle('active', (idx + 1) === s));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
  document.getElementById('toHistory').addEventListener('click', showHistory);
  document.getElementById('back4').addEventListener('click', () => go(4));

  function renderNames() {
    namesArea.innerHTML = '';
    const nC = parseInt(numCrit.value), nA = parseInt(numAlt.value);
    const critDiv = document.createElement('div');
    critDiv.innerHTML = '<h4>Kriteria</h4>';
    for (let i = 0; i < nC; i++) {
      const inp = document.createElement('input');
      inp.className = 'crit'; inp.placeholder = 'Kriteria ' + (i + 1);
      critDiv.appendChild(inp); critDiv.appendChild(document.createElement('br'));
    }
    const altDiv = document.createElement('div');
    altDiv.innerHTML = '<h4>Alternatif (Laptop)</h4>';
    for (let i = 0; i < nA; i++) {
      const inp = document.createElement('input');
      inp.className = 'alt'; inp.placeholder = 'Laptop ' + (i + 1);
      altDiv.appendChild(inp); altDiv.appendChild(document.createElement('br'));
    }
    namesArea.appendChild(critDiv);
    namesArea.appendChild(altDiv);
  }

  function fillSample() {
    numCrit.value = 5; numAlt.value = 5; renderNames();
    const crits = document.querySelectorAll('.crit'), alts = document.querySelectorAll('.alt');
    const cVals = ['Performa CPU & GPU', 'RAM & Penyimpanan', 'Daya Tahan Baterai', 'Portabilitas', 'Harga'];
    const aVals = ['Lenovo IdeaPad Slim 3', 'MSI Modern 14', 'Acer Aspire 5', 'ASUS VivoBook Go 14', 'Acer Nitro V 15'];
    crits.forEach((c, i) => c.value = cVals[i] || c.placeholder);
    alts.forEach((a, i) => a.value = aVals[i] || a.placeholder);
  }

  function goToCriteria() {
    const crits = Array.from(document.querySelectorAll('.crit')).map(i => i.value.trim() || i.placeholder);
    const alts = Array.from(document.querySelectorAll('.alt')).map(i => i.value.trim() || i.placeholder);
    if (crits.length < 1 || alts.length < 2) { alert('Isi minimal 1 kriteria dan 2 alternatif'); return; }
    localStorage.setItem('criteria', JSON.stringify(crits));
    localStorage.setItem('alternatives', JSON.stringify(alts));
    buildCritTable(crits);
    go(2);
  }

  function buildCritTable(crits) {
    const wrap = document.getElementById('critQ');
    let html = `<table><thead><tr><th>Nama Kriteria</th>`;
    crits.forEach(c => html += `<th>${c}</th>`);
    html += `</tr></thead><tbody>`;
    crits.forEach((row, i) => {
      html += `<tr><th>${row}</th>`;
      crits.forEach((col, j) => {
        if (i === j) html += `<td><input type="text" value="1" readonly></td>`;
        else if (i < j) html += `<td><input name="crit[${i}][${j}]" placeholder="1/3 atau 3"></td>`;
        else html += `<td><input name="crit[${i}][${j}]" readonly></td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }

  function buildAltTables() {
    const wrap = document.getElementById('altQ');
    const crits = JSON.parse(localStorage.getItem('criteria'));
    const alts = JSON.parse(localStorage.getItem('alternatives'));
    wrap.innerHTML = '';
    crits.forEach((c, ci) => {
      let html = `<h4>${c}</h4><table><tr><th>Nama Laptop</th>`;
      alts.forEach(a => html += `<th>${a}</th>`);
      html += `</tr>`;
      alts.forEach((a, i) => {
        html += `<tr><th>${a}</th>`;
        alts.forEach((b, j) => {
          if (i === j) html += `<td><input type="text" value="1" readonly></td>`;
          else if (i < j) html += `<td><input name="alt[${ci}][${i}][${j}]" placeholder="1/3 atau 3"></td>`;
          else html += `<td><input name="alt[${ci}][${i}][${j}]" readonly></td>`;
        });
        html += `</tr>`;
      });
      html += `</table>`;
      wrap.innerHTML += html;
    });
    go(3);
  }

  function computeAHP() {
    go(4);
  }

  function showHistory() {
    go(5);
  }
});
