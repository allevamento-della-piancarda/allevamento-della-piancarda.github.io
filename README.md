# Allevamento della Piancarda

Sito statico con pagine HTML vere, generate da un piccolo script Node. Niente dipendenze, cookie o servizi esterni.

## Struttura

- `contenuti.js`: **tutti i contenuti** (testi, contatti, cani, cucciolate). Per aggiornare il sito si tocca solo questo.
- `img/`: le foto.
- `build.js`: genera il sito in `docs/`.
- `src/`: CSS e il poco JavaScript lato browser (menu mobile, zoom foto).
- `docs/`: **sito generato, pubblicato da GitHub Pages**. Non modificarlo a mano: viene ricreato a ogni build.

Pagine generate: home, `/cani/`, `/cani/<id>/` per ogni cane, `/cucciolate/`, `404.html`, più `sitemap.xml`, `robots.txt` e `CNAME`.

## Aggiornare

1. Modifica `contenuti.js` e metti le foto in `img/<nome-cane>/` (.webp o .jpg, lato lungo sotto i 1600 px).
2. Lancia `node build.js`. Se c'è un errore nei dati, ad esempio un id duplicato, lo script si ferma e dice dove.
3. Fai commit e push, compresa la cartella `docs/`.

- **Nuovo cane**: copia un blocco dentro `cani` e cambia `id` (minuscole, numeri, trattini). La sua pagina sarà `/cani/<id>/`.
- **Nuova cucciolata**: aggiungila in cima a `cucciolate`. La prima della lista va in home. Se padre o madre hanno una scheda, metti il loro `id` e il nome diventa un link.

Anteprima in locale: `python3 -m http.server -d docs` oppure `npx serve docs`, poi apri http://localhost:8000.

## Dove è pubblicato

Repository `allevamento-della-piancarda/allevamento-della-piancarda.github.io`, pubblicata da GitHub Pages dal branch `main`, cartella `/docs`.

Indirizzo attuale: <https://allevamento-della-piancarda.github.io>

### Due interruttori in `contenuti.js`

- `inCostruzione: true` — mette `noindex` su tutte le pagine e blocca i motori di ricerca con `robots.txt`. Da mettere a `false` quando i contenuti veri sostituiscono i segnaposto.
- `dominioAttivo: false` — finché è `false` non viene scritto il file `CNAME`. Serve perché un `CNAME` verso un dominio non ancora registrato rende il sito irraggiungibile.

### Collegare il dominio definitivo

1. Registra `cucciolidobermanpiancarda.it` (solo registrazione: l'hosting lo fa GitHub).
2. Nel DNS del registrar crea:
   - 4 record A sul dominio nudo: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - un record CNAME `www` che punta a `allevamento-della-piancarda.github.io`
3. In `contenuti.js` rimetti `sitoUrl: "https://www.cucciolidobermanpiancarda.it"` e `dominioAttivo: true`, poi `node build.js`, commit e push.
4. Settings → Pages → Custom domain: inserisci `www.cucciolidobermanpiancarda.it`.
5. Quando GitHub ha verificato il dominio, attiva "Enforce HTTPS".

Il dominio nudo reindirizza automaticamente su www.

## Da ricordare

Il dominio va rinnovato ogni anno dal registrar: attiva il rinnovo automatico con la carta del titolare. L'hosting su GitHub Pages è gratuito.
