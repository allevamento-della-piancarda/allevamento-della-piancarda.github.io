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

## Pubblicare su GitHub Pages

1. Carica questa cartella in una repository.
2. Settings → Pages → Deploy from a branch → `main`, cartella `/docs`.
3. Il dominio è già in `docs/CNAME` (`www.cucciolidobermanpiancarda.it`). Nel DNS del registrar crea:
   - 4 record A sul dominio nudo: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - un record CNAME `www` che punta a `<utente>.github.io`
4. Quando GitHub ha verificato il dominio, attiva "Enforce HTTPS".

Il dominio nudo reindirizza automaticamente su www.

## Da ricordare

Il dominio va rinnovato ogni anno dal registrar: attiva il rinnovo automatico con la carta del titolare. L'hosting su GitHub Pages è gratuito.
