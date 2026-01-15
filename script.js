// IP Geolocation client using async/await and try/catch

function timeoutFetch(url, opts = {}, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
}

function showAlert(message, type = 'error', autoHide = true) {
  const el = document.getElementById('alert');
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
  el.className = `alert ${type}`;
  console[type === 'error' ? 'error' : 'log']('ALERT:', message);
  if (autoHide) {
    clearTimeout(el._timer);
    el._timer = setTimeout(() => (el.hidden = true), 7000);
  }
}

function hideAlert() {
  const el = document.getElementById('alert');
  if (el) el.hidden = true;
}

function isValidIPv4(ip) {
  if (!ip) return false;
  return /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/.test(ip.trim());
}

async function getPublicIP() {
  try {
    console.log('Getting public IP from api.ipify.org');
    const res = await timeoutFetch('https://api.ipify.org?format=json', {}, 6000);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const j = await res.json();
    console.log('Public IP:', j.ip);
    return j.ip;
  } catch (err) {
    console.error('getPublicIP error:', err);
    throw err;
  }
}

async function geoLookup(ip) {
  const endpoints = [
    `https://ipwhois.app/json/${ip}`,
    `https://ipapi.co/${ip}/json/`
  ];
  for (const url of endpoints) {
    try {
      console.log('Requesting:', url);
      const res = await timeoutFetch(url, {}, 7000);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      console.log('Response from', url, data);
      return data;
    } catch (err) {
      console.error('Provider failed:', url, err);
    }
  }
  throw new Error('All geo providers failed');
}

function updateUI(data) {
  document.getElementById('ip').textContent = data.ip || data.ip_address || data.query || '—';
  document.getElementById('city').textContent = data.city || data.city_name || '—';
  document.getElementById('country').textContent = data.country || data.country_name || data.country_code || '—';
  const lat = data.latitude || data.lat || null;
  const lon = data.longitude || data.lon || null;
  document.getElementById('latlon').textContent = lat && lon ? `${lat}, ${lon}` : '—';
}

async function handleLookup(userIp = '') {
  hideAlert();
  const ipEl = document.getElementById('ip');
  const cityEl = document.getElementById('city');
  ipEl.textContent = '...';
  cityEl.textContent = '...';
  try {
    let ipToUse = userIp && userIp.trim() ? userIp.trim() : '';
    if (ipToUse && !isValidIPv4(ipToUse)) {
      showAlert('IP invalid. Introdu un IPv4 valid (ex: 8.8.8.8).', 'error');
      ipEl.textContent = 'Invalid';
      cityEl.textContent = 'Invalid';
      return;
    }

    // If no IP provided, try client-aware provider first
    if (!ipToUse) {
      try {
        const clientRes = await timeoutFetch('https://ipwhois.app/json/', {}, 7000);
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          if (clientData && (clientData.ip || clientData.city)) {
            updateUI(clientData);
            return;
          }
        }
      } catch (e) {
        console.warn('Client-aware provider failed:', e);
      }
      ipToUse = await getPublicIP();
    }

    const geo = await geoLookup(ipToUse);
    updateUI(geo);
  } catch (err) {
    console.error('handleLookup error:', err);
    showAlert('A apărut o eroare la preluarea geolocației. Vezi consola pentru detalii.', 'error');
    ipEl.textContent = 'Eroare';
    cityEl.textContent = 'Eroare';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const lookupBtn = document.getElementById('lookup');
  const detectBtn = document.getElementById('detect');
  const refreshBtn = document.getElementById('refresh');
  const ipInput = document.getElementById('ipInput');

  if (lookupBtn) lookupBtn.addEventListener('click', () => handleLookup(ipInput.value));
  if (detectBtn) detectBtn.addEventListener('click', () => handleLookup(''));
  if (refreshBtn) refreshBtn.addEventListener('click', () => handleLookup(''));

  // initial load
  handleLookup('');
});

