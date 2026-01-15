// script.js — folosește exclusiv http://ip-api.com/json/ (sync XHR + async fallback)

const ipEl = document.getElementById('ip');
const countryEl = document.getElementById('country');
const cityEl = document.getElementById('city');
const latlonEl = document.getElementById('latlon');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');
const allDataRows = document.getElementById('allDataRows');
const rawDataEl = document.getElementById('rawData');

function setStatus(msg){ if(statusEl) statusEl.textContent = msg; }
function setLoading(isLoading){ if(refreshBtn) refreshBtn.disabled = !!isLoading; if(copyBtn) copyBtn.disabled = !!isLoading; }
function logAndShow(msg, err){ console.error(msg, err); setStatus(msg); }

// Synchronous fetch using XHR (deprecated but requested)
function fetchGeoSync(){
  const url = 'http://ip-api.com/json/';
  try{
    setLoading(true);
    setStatus('Se încarcă (sync)...');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // false => synchronous
    xhr.send(null);
    if(xhr.status >= 200 && xhr.status < 300){
      const data = JSON.parse(xhr.responseText || '{}');
      applyDataToDOM(data);
      setStatus('Actualizat (sync)');
      return true;
    }
    throw new Error('HTTP ' + xhr.status);
  }catch(err){
    logAndShow('Eroare (sync): ' + (err && err.message ? err.message : err), err);
    return false;
  }finally{ setLoading(false); }
}

// Async fallback using same endpoint
async function fetchGeoAsync(){
  const url = 'http://ip-api.com/json/';
  try{
    setLoading(true);
    setStatus('Se încarcă...');
    const res = await fetch(url);
    if(!res.ok) throw new Error('Răspuns nevalid: ' + res.status);
    const data = await res.json();
    applyDataToDOM(data);
    setStatus('Actualizat (async)');
  }catch(err){
    logAndShow('Eroare (async): ' + (err && err.message ? err.message : err), err);
  }finally{ setLoading(false); }
}

function applyDataToDOM(data){
  try{
    if(ipEl) ipEl.textContent = data.query || '—';
    if(countryEl) countryEl.textContent = data.country || '—';
    if(cityEl) cityEl.textContent = data.city || '—';
    const lat = (data.lat != null) ? data.lat : (data.latitude != null ? data.latitude : null);
    const lon = (data.lon != null) ? data.lon : (data.longitude != null ? data.longitude : null);
    if(latlonEl) latlonEl.textContent = (lat != null && lon != null) ? `${lat}, ${lon}` : '—';
    // afișăm toate câmpurile în tabelul din details
    if(allDataRows){
      allDataRows.innerHTML = '';
      Object.keys(data).forEach(key => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        const td = document.createElement('td');
        th.style.padding = '10px 12px';
        th.style.width = '34%';
        th.style.fontWeight = '600';
        td.style.padding = '10px 12px';
        th.textContent = key;
        try{ td.textContent = (data[key] === null || data[key] === undefined) ? '—' : String(data[key]); }
        catch{ td.textContent = '—'; }
        tr.appendChild(th);
        tr.appendChild(td);
        allDataRows.appendChild(tr);
      });
    }
    if(rawDataEl) rawDataEl.textContent = JSON.stringify(data, null, 2);
  }catch(err){ logAndShow('Eroare la actualizarea DOM: ' + (err && err.message ? err.message : err), err); }
}

// Init: try sync first, then fallback async. Bind buttons.
(function init(){
  try{
    const ok = fetchGeoSync();
    if(!ok) fetchGeoAsync();
  }catch(err){
    logAndShow('Init error: ' + (err && err.message ? err.message : err), err);
    fetchGeoAsync();
  }

  if(refreshBtn) refreshBtn.addEventListener('click', ()=>{ fetchGeoAsync(); });
  if(copyBtn) copyBtn.addEventListener('click', async ()=>{
    const ip = ipEl ? ipEl.textContent : '';
    if(!ip || ip === '—') return;
    try{ await navigator.clipboard.writeText(ip); setStatus('IP copiat'); }
    catch(err){ logAndShow('Nu s-a putut copia: ' + (err && err.message ? err.message : err), err); }
    setTimeout(()=>{ if(statusEl.textContent==='IP copiat') statusEl.textContent=''; },1500);
  });
})();

