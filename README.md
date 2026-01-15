# Geolocatie IP

Scop
- Aplicație web simplă care afișează adresa IP a clientului și informații de geolocație (țară, oraș, latitudine/longitudine) într-un tabel stilizat.

API folosit
- `http://ip-api.com/json/` 

Fișiere principale
- `index.html` — interfața aplicației (tabel, butoane).
- `style.css` — stiluri (day/night, layout responsive).
- `script.js` — logica: preia datele de la API și le afișează în DOM, cu try/catch și mesaje de stare.

Utilizarea interfeței (pe scurt)
- La deschidere pagina încearcă automat să preia datele și afișează în tabel valorile principale:
  - **IP (query)**
  - **Țară**
  - **Oraș**
  - **Latitudine / Longitudine**
- Butoane:
  - **Refresh IP**: reîncarcă datele de la API.
  - **Copiază IP**: copiază IP-ul afișat în clipboard.
# Geolocatie-IP

