// script.js — curățat: funcție sincronă XHR către http://ip-api.com/json/, fallback async

const ipEl = document.getElementById('ip');
const countryEl = document.getElementById('country');
const cityEl = document.getElementById('city');
const latlonEl = document.getElementById('latlon');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');

function setStatus(msg){ if(statusEl) statusEl.textContent = msg; }
function setLoading(isLoading){ if(refreshBtn) refreshBtn.disabled = !!isLoading; if(copyBtn) copyBtn.disabled = !!isLoading; }

function logAndShow(msg, err){ console.error(msg, err); setStatus(msg); }

// Funcție sincronă (XHR sincron) — atenție: poate bloca UI în browsere moderne.
function fetchGeoSync(){
  try{
    setLoading(true);
    setStatus('Se încarcă (sync)...');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://ip-api.com/json/', false); // false => sincron
    xhr.send();
    if(xhr.status >= 200 && xhr.status < 300){
      const data = JSON.parse(xhr.responseText || '{}');
      ipEl.textContent = data.query || '—';
      countryEl.textContent = data.country || '—';
      cityEl.textContent = data.city || '—';
      latlonEl.textContent = (data.lat != null && data.lon != null) ? `${data.lat}, ${data.lon}` : '—';
      setStatus('Actualizat (sync)');
      return true;
    }
    throw new Error('HTTP ' + xhr.status);
  }catch(err){
    logAndShow('Eroare (sync): ' + (err && err.message ? err.message : err), err);
    return false;
  }finally{ setLoading(false); }
}

// Fallback async modern
async function fetchGeoAsync(){
  try{
    setLoading(true);
    setStatus('Se încarcă...');
    const res = await fetch('http://ip-api.com/json/');
    if(!res.ok) throw new Error('Răspuns nevalid: ' + res.status);
    const data = await res.json();
    ipEl.textContent = data.query || '—';
    countryEl.textContent = data.country || '—';
    cityEl.textContent = data.city || '—';
    latlonEl.textContent = (data.lat != null && data.lon != null) ? `${data.lat}, ${data.lon}` : '—';
    setStatus('Actualizat (async)');
  }catch(err){
    logAndShow('Eroare (async): ' + (err && err.message ? err.message : err), err);
  }finally{ setLoading(false); }
}

// Init: încercăm sincron, apoi fallback async
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
    const ip = ipEl.textContent || '';
    if(!ip || ip === '—') return;
    try{ await navigator.clipboard.writeText(ip); setStatus('IP copiat'); }
    catch(err){ logAndShow('Nu s-a putut copia: ' + (err && err.message ? err.message : err), err); }
    setTimeout(()=>{ if(statusEl.textContent==='IP copiat') statusEl.textContent=''; },1500);
  });
})();

