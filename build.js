#!/usr/bin/env node
/*
  Genera il sito statico nella cartella docs/ (quella pubblicata da GitHub Pages).
  Uso:  node build.js
  I contenuti si modificano in contenuti.js, non qui. Nessuna dipendenza da installare.
*/
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "docs");
const S = require("./contenuti.js");
const BASE = String(S.sitoUrl).replace(/\/+$/, "");
const VERSIONE = Date.now().toString(36); // forza il browser a ricaricare CSS e JS dopo ogni aggiornamento
const ANNO = new Date().getFullYear();

const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio",
  "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const ICONA_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3C6.9 3 3 6.6 3 11c0 2.4 1.1 4.5 3 6l-.9 4 4.4-2.2c.8.2 1.6.3 2.5.3 5.1 0 9-3.6 9-8.1S17.1 3 12 3z"/></svg>';

const ICONA_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg>';
const ICONA_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23211b16'/%3E%3Ccircle cx='11' cy='13' r='3' fill='%23e0a05e'/%3E%3Ccircle cx='21' cy='13' r='3' fill='%23e0a05e'/%3E%3C/svg%3E";

/* ---------- controlli sui contenuti ---------- */

const errori = [];
const ids = new Set();
S.cani.forEach((c, i) => {
  if (!/^[a-z0-9-]+$/.test(c.id || "")) {
    errori.push(`Cane n.${i + 1} (${c.nome}): id "${c.id}" non valido. Usa solo lettere minuscole, numeri e trattini.`);
  }
  if (ids.has(c.id)) errori.push(`L'id "${c.id}" è usato da due cani.`);
  ids.add(c.id);
});
S.cucciolate.forEach((l, i) => {
  ["padre", "madre"].forEach((k) => {
    const id = l[k] && l[k].id;
    if (id && !ids.has(id)) errori.push(`Cucciolata n.${i + 1}: il ${k} ha id "${id}", ma nessun cane ha quell'id.`);
  });
});
if (errori.length) {
  console.error("Sito non generato:\n- " + errori.join("\n- "));
  process.exit(1);
}

/* ---------- utilità ---------- */

const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function formatData(iso) {
  if (!iso) return "";
  const p = String(iso).split("-");
  if (p.length !== 3) return esc(iso);
  return `${parseInt(p[2], 10)} ${MESI[parseInt(p[1], 10) - 1]} ${p[0]}`;
}

function paragrafi(testo) {
  if (!testo) return "";
  return String(testo).split(/\n\s*\n/).map((t) => `<p>${esc(t.trim())}</p>`).join("");
}

function foto(src, alt, cls, rel, lazy = true) {
  if (src) {
    return `<img class="${cls}" src="${esc(rel + src)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  }
  return `<div class="${cls} ph" role="img" aria-label="${esc(alt)}, foto in arrivo"><span>${esc(alt)}</span></div>`;
}

function wa(testo) {
  const numero = String(S.contatti.whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${numero}${testo ? "?text=" + encodeURIComponent(testo) : ""}`;
}

const bottoneWa = (testo, etichetta) =>
  `<a class="btn" href="${esc(wa(testo))}" target="_blank" rel="noopener">${ICONA_CHAT}<span>${esc(etichetta)}</span></a>`;

const riga = (etichetta, valoreHtml) => `<div><dt>${etichetta}</dt><dd>${valoreHtml}</dd></div>`;
const nomeCompleto = (c) => c.nomeRegistrato || c.nome;
const trovaCane = (id) => S.cani.find((c) => c.id === id) || null;
const urlCane = (c, rel) => `${rel}cani/${c.id}/`;

function nomeConLink(genitore, rel) {
  if (!genitore) return "";
  const c = genitore.id ? trovaCane(genitore.id) : null;
  const nome = esc(genitore.nome || (c ? c.nome : ""));
  return c ? `<a href="${urlCane(c, rel)}">${nome}</a>` : nome;
}

/* ---------- blocchi ---------- */

function immagineSlide(v, alt, rel, opz) {
  if (!v.foto) {
    return `<div class="${opz.classeImg} ph" role="img" aria-label="${esc(alt)}, foto in arrivo"><span>${esc(alt)}</span></div>`;
  }
  const misure = [];
  if (v.fotoS) misure.push(`${esc(rel + v.fotoS)} 800w`);
  if (v.fotoM) misure.push(`${esc(rel + v.fotoM)} 1280w`);
  misure.push(`${esc(rel + v.foto)} 1920w`);
  const srcset = misure.length > 1 ? ` srcset="${misure.join(", ")}" sizes="${opz.sizes}"` : "";
  // solo la prima foto della home va scaricata subito: e' quella che decide
  // quando la pagina "sembra" pronta. Tutte le altre possono attendere.
  const priorita = opz.subito
    ? ' fetchpriority="high" decoding="async"'
    : ' loading="lazy" fetchpriority="low" decoding="async"';
  return `<img class="${opz.classeImg}" src="${esc(rel + v.foto)}"${srcset} alt="${esc(alt)}"${priorita}>`;
}

/* Carosello riutilizzabile: lo usano l'hero della home e ogni cucciolata.
   "auto" fa scorrere le foto da sole, e vale solo per la home: piu' caroselli
   che girano insieme nella stessa pagina sarebbero illeggibili.
   Non c'e' un pulsante di pausa; a fermare lo scorrimento basta usare una
   freccia o un pallino, che sono raggiungibili anche da tastiera.
   Con meno di due foto resta un'immagine ferma, senza comandi. */
function caroselloHtml(o) {
  const lista = (o.voci || [])
    .filter((v) => v != null)
    .map((v) => (typeof v === "string" ? { foto: v } : v));

  const comune = { classeImg: o.classeImg, sizes: o.sizes };

  if (lista.length < 2) {
    const sola = lista[0] || { foto: "" };
    const alt = sola.didascalia || o.alt(0);
    return `<div class="${o.classe} car-sola">` +
      '<div class="car-track"><div class="car-slide is-on">' +
        immagineSlide(sola, alt, o.rel, Object.assign({ subito: !!o.primaSubito }, comune)) +
        (sola.didascalia ? `<p class="car-cap">${esc(sola.didascalia)}</p>` : "") +
      "</div></div></div>";
  }

  const n = lista.length;
  const slide = lista.map((v, i) => {
    const alt = v.didascalia || o.alt(i);
    return `<li class="car-slide${i === 0 ? " is-on" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} di ${n}">` +
      immagineSlide(v, alt, o.rel, Object.assign({ subito: i === 0 && !!o.primaSubito }, comune)) +
      (v.didascalia ? `<p class="car-cap">${esc(v.didascalia)}</p>` : "") +
    "</li>";
  }).join("");

  const punti = lista.map((v, i) =>
    "<li>" +
      `<button type="button" class="car-dot" data-car-va="${i}" aria-label="Vai alla foto ${i + 1} di ${n}"${i === 0 ? ' aria-current="true"' : ""}></button>` +
    "</li>").join("");

  return `<div class="${o.classe}">` +
    `<section class="car" data-car${o.auto ? " data-car-auto" : ""} aria-roledescription="carosello" aria-label="${esc(o.etichetta)}">` +
      `<ul class="car-track" data-car-track>${slide}</ul>` +
      '<div class="car-bar">' +
        `<button type="button" class="car-arrow" data-car-prev aria-label="Foto precedente">${ICONA_PREV}</button>` +
        `<ul class="car-dots">${punti}</ul>` +
        `<button type="button" class="car-arrow" data-car-next aria-label="Foto successiva">${ICONA_NEXT}</button>` +
      "</div>" +
    "</section>" +
  "</div>";
}

function carosello(rel) {
  const voci = (S.caroselloHome || []).length ? S.caroselloHome : [{ foto: S.fotoHome }];
  return caroselloHtml({
    voci, rel,
    classe: "car-hero",
    classeImg: "hero-img",
    sizes: "100vw",
    etichetta: "Foto dell'allevamento",
    alt: (i) => `${S.razza} dell'${S.nome}, foto ${i + 1}`,
    auto: true,
    primaSubito: true,
  });
}

function caroselloCucciolata(l, nomePadre, nomeMadre, rel) {
  const coppia = `${nomePadre} e ${nomeMadre}`;
  const voci = (l.galleria || []).length ? l.galleria : [{ foto: l.foto || "" }];
  return caroselloHtml({
    voci, rel,
    classe: "car-box",
    classeImg: "litter-img",
    sizes: "(min-width: 760px) 48vw, 100vw",
    etichetta: `Foto della cucciolata ${coppia}`,
    alt: (i) => `Cucciolata ${coppia}, foto ${i + 1}`,
    auto: false,
    primaSubito: false,
  });
}

function grigliaCani(rel) {
  return `<ul class="dog-grid">${S.cani.map((c) =>
    `<li><a class="dog-card" href="${urlCane(c, rel)}">` +
      foto(c.foto, c.nome, "dog-card-img", rel) +
      `<span class="dog-card-name">${esc(c.nome)}</span>` +
      (c.breve ? `<span class="dog-card-text">${esc(c.breve)}</span>` : "") +
    "</a></li>").join("")}</ul>`;
}

function schedaCucciolata(l, inHome, rel) {
  const H = inHome ? "h3" : "h2";
  const nomePadre = (l.padre && l.padre.nome) || "";
  const nomeMadre = (l.madre && l.madre.nome) || "";
  let fatti = "";
  if (l.nascita) fatti += riga("Nascita", formatData(l.nascita));
  if (l.composizione) fatti += riga("Cuccioli", esc(l.composizione));
  if (l.stato) fatti += riga("Disponibilità", esc(l.stato));

  return '<article class="litter">' +
    `<div class="litter-photo">${caroselloCucciolata(l, nomePadre, nomeMadre, rel)}</div>` +
    '<div class="litter-body">' +
      `<${H} class="litter-title">${nomeConLink(l.padre, rel)} <span class="cross">×</span> ${nomeConLink(l.madre, rel)}</${H}>` +
      (fatti ? `<dl class="facts">${fatti}</dl>` : "") +
      paragrafi(l.note) +
      bottoneWa(`Ciao, vorrei informazioni sulla cucciolata ${nomePadre} × ${nomeMadre}.`, "Chiedi di questa cucciolata") +
    "</div>" +
  "</article>";
}

function sezioneContatti() {
  const c = S.contatti;
  let righe = "";
  if (c.telefono) righe += riga("Telefono", `<a href="tel:${esc(String(c.telefono).replace(/[^\d+]/g, ""))}">${esc(c.telefono)}</a>`);
  if (c.zona) righe += riga("Dove siamo", esc(c.zona));
  if (c.email) righe += riga("Email", `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
  if (c.facebook) righe += riga("Facebook", `<a href="${esc(c.facebook)}" target="_blank" rel="noopener">Pagina Facebook</a>`);
  if (c.instagram) righe += riga("Instagram", `<a href="${esc(c.instagram)}" target="_blank" rel="noopener">Profilo Instagram</a>`);

  return '<section class="section on-band contacts" id="contatti" aria-labelledby="t-contatti">' +
    '<div class="wrap contacts-inner">' +
      "<div>" +
        '<h2 id="t-contatti">Contatti</h2>' +
        `<p>${esc(S.testoContatti)}</p>` +
        bottoneWa(`Ciao, vorrei informazioni sui vostri ${S.razza}.`, "Scrivici su WhatsApp") +
      "</div>" +
      (righe ? `<dl class="contact-list">${righe}</dl>` : "") +
    "</div>" +
  "</section>";
}

/* ---------- corpo delle pagine ---------- */

function corpoHome(rel) {
  const ultima = S.cucciolate[0];
  const p = S.proprietario;
  return carosello(rel) +

    '<section class="hero on-band hero-sotto"><div class="wrap hero-inner">' +
      '<div class="hero-text">' +
        `<h1 class="hero-title">${esc(S.nome)}</h1>` +
        `<p class="hero-breed">${esc(S.razza)}</p>` +
        `<p class="hero-lead">${esc(S.presentazione)}</p>` +
        bottoneWa(`Ciao, vorrei informazioni sui vostri ${S.razza}.`, "Scrivici su WhatsApp") +
      "</div>" +
    "</div></section>" +

    '<section class="section" id="cani" aria-labelledby="t-cani"><div class="wrap">' +
      '<h2 id="t-cani">I nostri cani</h2>' + grigliaCani(rel) +
    "</div></section>" +

    '<section class="section section-alt" aria-labelledby="t-cucc"><div class="wrap">' +
      `<h2 id="t-cucc">${ultima ? "Ultima cucciolata" : "Cucciolate"}</h2>` +
      (ultima
        ? schedaCucciolata(ultima, true, rel) + `<p class="more"><a href="${rel}cucciolate/">Tutte le cucciolate</a></p>`
        : `<p>${esc(S.testiCucciolate.nessuna)}</p>`) +
    "</div></section>" +

    '<section class="section" id="chi-siamo" aria-labelledby="t-chi"><div class="wrap owner">' +
      `<div class="owner-photo">${foto(p.foto, p.nome, "owner-img", rel)}</div>` +
      '<div class="owner-text"><h2 id="t-chi">Chi siamo</h2>' + paragrafi(p.testo) +
        `<p class="owner-name">${esc(p.nome)}</p></div>` +
    "</div></section>" +

    sezioneContatti();
}

function corpoCani(rel) {
  return '<div class="wrap page">' +
    '<h1 class="page-title">I nostri cani</h1>' +
    grigliaCani(rel) +
  "</div>";
}

function corpoCane(c, rel) {
  const sottotitolo = [S.razza, c.sesso, c.colore].filter(Boolean).join(" ");

  let fatti = "";
  if (c.nascita) fatti += riga("Data di nascita", formatData(c.nascita));
  (c.salute || []).forEach((s) => { fatti += riga(esc(s.esame), esc(s.esito) || "—"); });

  const pa = (c.pedigree && c.pedigree.padre) || {};
  const ma = (c.pedigree && c.pedigree.madre) || {};
  const cella = (cls, ruolo, nome) =>
    `<div class="ped-cell ${cls}"><small>${ruolo}</small><strong>${esc(nome) || "—"}</strong></div>`;
  const pedigree = `<div class="ped" role="group" aria-label="Genealogia di ${esc(c.nome)}">` +
    `<div class="ped-cell ped-s"><strong>${esc(nomeCompleto(c))}</strong></div>` +
    cella("ped-p", "Padre", pa.nome) + cella("ped-m", "Madre", ma.nome) +
    cella("ped-g1", "Nonno paterno", pa.padre) + cella("ped-g2", "Nonna paterna", pa.madre) +
    cella("ped-g3", "Nonno materno", ma.padre) + cella("ped-g4", "Nonna materna", ma.madre) +
  "</div>";

  const risultati = (c.risultati || []).slice().sort((a, b) => String(b.data).localeCompare(String(a.data)));
  const risultatiHtml = [["esposizione", "In esposizione"], ["lavoro", "Nel lavoro"]].map(([tipo, titolo]) => {
    const voci = risultati.filter((r) => (r.tipo || "esposizione") === tipo);
    if (!voci.length) return "";
    return `<div class="res-group"><h3>${titolo}</h3><ul class="results">` + voci.map((r) =>
      "<li>" +
        `<time datetime="${esc(r.data)}">${formatData(r.data)}</time>` +
        `<div><p class="esito">${esc(r.esito)}</p><p class="evento">${esc([r.evento, r.luogo].filter(Boolean).join(", "))}</p></div>` +
      "</li>").join("") + "</ul></div>";
  }).join("");

  const galleria = (c.galleria || []).map((src, i) => {
    const alt = `${c.nome}, foto ${i + 1}`;
    if (!src) return `<li>${foto("", alt, "g", rel)}</li>`;
    return `<li><a class="g-btn" href="${esc(rel + src)}" data-alt="${esc(alt)}" aria-label="Ingrandisci ${esc(alt)}">${foto(src, alt, "g", rel)}</a></li>`;
  }).join("");

  const altri = S.cani.filter((x) => x.id !== c.id)
    .map((x) => `<li><a href="${urlCane(x, rel)}">${esc(x.nome)}</a></li>`).join("");

  return '<article class="dog"><div class="wrap">' +
    `<p class="back"><a href="${rel}cani/">Tutti i cani</a></p>` +
    '<header class="dog-head">' +
      `<div class="dog-photo">${foto(c.foto, c.nome, "dog-img", rel, false)}</div>` +
      '<div class="dog-info">' +
        `<h1 class="dog-name">${esc(nomeCompleto(c))}</h1>` +
        `<p class="dog-sub">${esc(sottotitolo)}</p>` +
        (c.breve ? `<p class="dog-lead">${esc(c.breve)}</p>` : "") +
        (fatti ? `<dl class="facts">${fatti}</dl>` : "") +
        bottoneWa(`Ciao, vorrei informazioni su ${c.nome}.`, `Chiedi di ${c.nome}`) +
      "</div>" +
    "</header>" +
    (c.descrizione ? `<section class="dog-section"><h2>Chi è ${esc(c.nome)}</h2>${paragrafi(c.descrizione)}</section>` : "") +
    `<section class="dog-section"><h2>Genealogia</h2>${pedigree}</section>` +
    (risultatiHtml ? `<section class="dog-section"><h2>Risultati</h2>${risultatiHtml}</section>` : "") +
    (galleria ? `<section class="dog-section"><h2>Foto</h2><ul class="gallery">${galleria}</ul></section>` : "") +
    (altri ? `<nav class="dog-section others" aria-label="Altri cani"><h2>Gli altri nostri cani</h2><ul>${altri}</ul></nav>` : "") +
  "</div></article>";
}

function corpoCucciolate(rel) {
  return '<div class="wrap page">' +
    '<h1 class="page-title">Cucciolate</h1>' +
    `<p class="page-lead">${esc(S.testiCucciolate.intro)}</p>` +
    '<div class="litters">' +
      (S.cucciolate.length
        ? S.cucciolate.map((l) => schedaCucciolata(l, false, rel)).join("")
        : `<p>${esc(S.testiCucciolate.nessuna)}</p>`) +
    "</div>" +
  "</div>";
}

function corpo404(rel) {
  return '<div class="wrap page">' +
    '<h1 class="page-title">Pagina non trovata</h1>' +
    `<p>Questo indirizzo non corrisponde a nessuna pagina del sito. <a href="${rel}">Torna alla home</a>.</p>` +
  "</div>";
}

/* ---------- scheletro della pagina ---------- */

function pagina({ percorso, titolo, descrizione, attivo = "", corpo, immagine = "" }) {
  const is404 = percorso === "/404.html";
  const noindex = is404 || S.inCostruzione; // sito in costruzione: tieni le pagine fuori da Google
  // link relativi: il sito funziona sia sul dominio sia in anteprima locale; la 404 usa link assoluti
  const rel = is404 ? "/" : "../".repeat(percorso.split("/").filter(Boolean).length);
  const home = rel || "./";
  const corrente = (voce) => (voce === attivo ? ' aria-current="page"' : "");
  const url = BASE + percorso;

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${esc(S.nome)}">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
${is404 ? "" : `<meta property="og:url" content="${esc(url)}">`}
${immagine ? `<meta property="og:image" content="${esc(BASE + "/" + immagine)}">` : ""}
<meta name="theme-color" content="#211b16">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="${rel}css/style.css?v=${VERSIONE}">
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<a class="skip" href="#main">Vai al contenuto</a>

<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${home}">${esc(S.nome)}</a>
    <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Menu principale">
      <a href="${rel}cani/"${corrente("cani")}>I cani</a>
      <a href="${rel}cucciolate/"${corrente("cucciolate")}>Cucciolate</a>
      <a href="${home}#contatti">Contatti</a>
    </nav>
  </div>
</header>

<main id="main" tabindex="-1">
${corpo(rel)}
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <p class="footer-brand">${esc(S.nome)}</p>
    ${S.contatti.zona ? `<p>${esc(S.contatti.zona)}</p>` : ""}
    <p class="footer-small">© ${ANNO} ${esc(S.nome)}</p>
  </div>
</footer>

<div class="wa-float">
  <a href="${esc(wa(`Ciao, vorrei informazioni sui vostri ${S.razza}.`))}" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">${ICONA_CHAT}</a>
</div>

<dialog class="lightbox" id="lightbox" aria-label="Foto ingrandita">
  <button class="lb-close" type="button" aria-label="Chiudi">Chiudi</button>
  <img id="lightbox-img" src="data:," alt="">
</dialog>

<script src="${rel}js/main.js?v=${VERSIONE}" defer></script>
</body>
</html>
`;
}

/* ---------- generazione ---------- */

const pagine = [
  {
    percorso: "/",
    titolo: `${S.nome} | ${S.razza}`,
    descrizione: `${S.nome}: i nostri ${S.razza} con genealogia, salute e risultati, e le cucciolate.`,
    corpo: corpoHome,
    immagine: S.fotoHome,
  },
  {
    percorso: "/cani/",
    titolo: `I nostri cani | ${S.nome}`,
    descrizione: `I ${S.razza} dell'${S.nome}.`,
    attivo: "cani",
    corpo: corpoCani,
  },
  ...S.cani.map((c) => ({
    percorso: `/cani/${c.id}/`,
    titolo: `${c.nome} | ${S.nome}`,
    descrizione: c.breve || `${S.razza} ${nomeCompleto(c)}: genealogia, salute e risultati.`,
    attivo: "cani",
    corpo: (rel) => corpoCane(c, rel),
    immagine: c.foto,
  })),
  {
    percorso: "/cucciolate/",
    titolo: `Cucciolate | ${S.nome}`,
    descrizione: `Le cucciolate di ${S.razza} dell'${S.nome}.`,
    attivo: "cucciolate",
    corpo: corpoCucciolate,
  },
  {
    percorso: "/404.html",
    titolo: `Pagina non trovata | ${S.nome}`,
    descrizione: "Pagina non trovata.",
    corpo: corpo404,
  },
];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const p of pagine) {
  const file = p.percorso.endsWith("/")
    ? path.join(OUT, p.percorso, "index.html")
    : path.join(OUT, p.percorso);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, pagina(p));
}

fs.cpSync(path.join(ROOT, "src"), OUT, { recursive: true });
if (fs.existsSync(path.join(ROOT, "img"))) {
  fs.cpSync(path.join(ROOT, "img"), path.join(OUT, "img"), {
    recursive: true,
    filter: (f) => path.basename(f) !== ".gitkeep",
  });
}

const indirizzi = pagine.filter((p) => p.percorso !== "/404.html").map((p) => BASE + p.percorso);
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  indirizzi.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n") + "\n</urlset>\n");
fs.writeFileSync(path.join(OUT, "robots.txt"), S.inCostruzione
  ? "User-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
// CNAME solo quando il dominio e' davvero attivo: un CNAME verso un dominio inesistente rende il sito irraggiungibile
if (S.dominioAttivo) fs.writeFileSync(path.join(OUT, "CNAME"), new URL(BASE).hostname + "\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

console.log(`Sito generato in docs/: ${pagine.length} pagine (${S.cani.length} cani, ${S.cucciolate.length} cucciolate).`);
if (S.inCostruzione) console.log("Modalita' in costruzione: pagine con noindex e robots.txt che blocca tutto.");
if (!S.dominioAttivo) console.log("Dominio non attivo: nessun CNAME scritto, il sito resta sull'indirizzo github.io.");
