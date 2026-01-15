function timeoutFetch(url, opts = {}, ms = 8000) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), ms);
	return fetch(url, {...opts, signal: controller.signal}).finally(() => clearTimeout(id));
}

async function tryProviders() {
	const providers = [
		'https://ipwhois.app/json/',
		'https://ipapi.co/json/'
	];
	for (const url of providers) {
		try {
			const res = await timeoutFetch(url, {}, 7000);
			if (!res.ok) throw new Error('Network response not ok');
			const data = await res.json();
			if (data && (data.ip || data.city)) return data;
		} catch (e) {
			console.warn('Provider failed', url, e && e.message);
		}
	}
	return null;
}

async function fetchIPInfo() {
	const ipEl = document.getElementById('ip');
	const cityEl = document.getElementById('city');
	ipEl.textContent = '...';
	cityEl.textContent = '...';
	try {
		let data = await tryProviders();
		if (!data) {
			const ipRes = await timeoutFetch('https://api.ipify.org?format=json', {}, 5000);
			if (!ipRes.ok) throw new Error('Could not obtain IP');
			const ipJson = await ipRes.json();
			const ip = ipJson.ip;
			const geoRes = await timeoutFetch('https://ipwhois.app/json/' + ip, {}, 7000);
			if (!geoRes.ok) throw new Error('Could not obtain geo for IP');
			data = await geoRes.json();
		}
		ipEl.textContent = data.ip || 'Nu s-a găsit';
		cityEl.textContent = data.city || data.city_name || 'Nu s-a găsit';
	} catch (err) {
		ipEl.textContent = 'Eroare';
		cityEl.textContent = 'Eroare';
		console.error('Fetch error:', err);
		const note = document.querySelector('.note');
		if (note) note.textContent = 'Eroare la preluarea datelor. Dacă deschizi fișierul direct, pornește un server local (ex. `python -m http.server`).';
	}
}

document.addEventListener('DOMContentLoaded', () => {
	fetchIPInfo();
	document.getElementById('refresh').addEventListener('click', fetchIPInfo);
});


