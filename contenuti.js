/*
  CONTENUTI DEL SITO — Allevamento della Piancarda
  Per aggiornare il sito si modifica solo questo file (più le foto nella cartella img/),
  poi si lancia: node build.js

  Foto:  percorso relativo, es. "img/byron/principale.webp". Campo vuoto "" = riquadro segnaposto.
  Date:  formato AAAA-MM-GG, es. "2026-06-05".
  Testi: per andare a capo tra un paragrafo e l'altro usa \n\n dentro le virgolette.
  Nuovo cane: copia un blocco dentro "cani", cambia id e dati, poi rigenera il sito con: node build.js
*/
module.exports = {
  // Indirizzo pubblico del sito. Finche' il dominio non e' attivo si usa quello di GitHub Pages.
  // Sabato, a dominio registrato: rimettere "https://www.cucciolidobermanpiancarda.it" e dominioAttivo: true
  sitoUrl: "https://allevamento-della-piancarda.github.io",
  // true quando il dominio e' registrato e i DNS puntano a GitHub: solo allora viene scritto il file CNAME.
  dominioAttivo: false,
  // true finche' i contenuti sono segnaposto: mette noindex su tutte le pagine e blocca i motori di ricerca.
  inCostruzione: true,
  nome: "Allevamento della Piancarda",
  razza: "Dobermann",
  fotoHome: "",
  presentazione: "Qui va la presentazione dell'allevamento: due o tre frasi su chi siete e che Dobermann cercate di far nascere.",

  proprietario: {
    nome: "Nome e cognome del proprietario",
    foto: "",
    testo: "Qualche riga sul proprietario: come è nata la passione per i Dobermann, le esposizioni e le prove a cui partecipa, cosa si aspetta da chi prende un cucciolo.\n\nSecondo paragrafo facoltativo."
  },

  contatti: {
    whatsapp: "393392220227", // prefisso 39 + numero, solo cifre
    telefono: "+39 339 222 0227",
    zona: "Località, provincia",
    email: "",
    facebook: "", // link completo alla pagina
    instagram: "" // link completo al profilo
  },
  testoContatti: "Per informazioni sui cani o sulle cucciolate scrivici su WhatsApp.",

  testiCucciolate: {
    intro: "Qui va un breve testo sulle cucciolate: come scegliete gli accoppiamenti e quando si possono prenotare i cuccioli.",
    nessuna: "Al momento non ci sono cucciolate. Scrivici per sapere quando è prevista la prossima."
  },

  cani: [
    {
      id: "byron", // indirizzo della pagina: /cani/byron/ (solo minuscole, numeri e trattini)
      nome: "Byron",
      nomeRegistrato: "", // nome completo sul pedigree, se diverso
      sesso: "", // "maschio" o "femmina"
      colore: "", // es. "nero focato"
      nascita: "", // "AAAA-MM-GG"
      breve: "Una frase di presentazione di Byron.",
      descrizione: "",
      foto: "",
      salute: [
        { esame: "Displasia anche (HD)", esito: "da inserire" },
        { esame: "Von Willebrand (VWD)", esito: "da inserire" },
        { esame: "Cuore (eco e Holter)", esito: "da inserire" }
      ],
      pedigree: {
        padre: { nome: "", padre: "", madre: "" },
        madre: { nome: "", padre: "", madre: "" }
      },
      risultati: [
        // tipo: "esposizione" oppure "lavoro"
        { data: "2026-06-05", tipo: "esposizione", evento: "Nome dell'esposizione (esempio)", luogo: "Città", esito: "1° Eccellente" },
        { data: "2025-05-24", tipo: "lavoro", evento: "Nome della prova (esempio)", luogo: "Città", esito: "Brevetto superato" }
      ],
      galleria: ["", "", "", "", "", ""]
    },
    {
      id: "ilane",
      nome: "Ilane",
      nomeRegistrato: "",
      sesso: "",
      colore: "",
      nascita: "",
      breve: "Una frase di presentazione di Ilane.",
      descrizione: "",
      foto: "",
      salute: [
        { esame: "Displasia anche (HD)", esito: "da inserire" },
        { esame: "Von Willebrand (VWD)", esito: "da inserire" },
        { esame: "Cuore (eco e Holter)", esito: "da inserire" }
      ],
      pedigree: {
        padre: { nome: "", padre: "", madre: "" },
        madre: { nome: "", padre: "", madre: "" }
      },
      risultati: [
        { data: "2026-01-24", tipo: "esposizione", evento: "Nome dell'esposizione (esempio)", luogo: "Città", esito: "1° Eccellente" }
      ],
      galleria: ["", "", "", ""]
    }
  ],

  cucciolate: [
    // la prima della lista compare in home come ultima cucciolata
    {
      padre: { nome: "Nome del padre", id: "" }, // se il cane ha una scheda, metti il suo id (es. "byron") e il nome diventa un link
      madre: { nome: "Nome della madre", id: "" },
      nascita: "",
      composizione: "Numero di maschi e femmine, colori",
      stato: "Disponibili, prenotati o tutti assegnati",
      foto: "",
      note: ""
    }
  ]
};
