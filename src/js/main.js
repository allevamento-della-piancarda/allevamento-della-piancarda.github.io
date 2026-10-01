/* Allevamento della Piancarda — unico JavaScript del sito: menu su mobile e foto ingrandite.
   Senza JavaScript il sito funziona lo stesso (menu sempre aperto, foto aperte in una nuova pagina). */
(function () {
  "use strict";

  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var aperto = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", aperto ? "true" : "false");
    });
  }

  var lightbox = document.getElementById("lightbox");
  var img = document.getElementById("lightbox-img");
  if (!lightbox || typeof lightbox.showModal !== "function") return;

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest(".g-btn");
    if (!link) return;
    e.preventDefault();
    img.src = link.getAttribute("href");
    img.alt = link.getAttribute("data-alt") || "";
    lightbox.showModal();
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.closest(".lb-close")) lightbox.close();
  });
})();

/* Carosello della home. Blocco separato: il lightbox qui sopra esce con un
   return anticipato quando <dialog> non e' supportato, e il carosello deve
   funzionare comunque. Senza questo file le foto restano tutte visibili
   come striscia scorrevole (vedi il CSS). */
(function () {
  "use strict";

  var INTERVALLO = 6000;
  var caroselli = document.querySelectorAll("[data-car]");

  Array.prototype.forEach.call(caroselli, function (car) {
    var slide = Array.prototype.slice.call(car.querySelectorAll(".car-slide"));
    if (slide.length < 2) return;

    var track = car.querySelector("[data-car-track]");
    var punti = Array.prototype.slice.call(car.querySelectorAll("[data-car-va]"));
    var play = car.querySelector("[data-car-play]");
    var corrente = 0;
    var timer = null;

    var ridotto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    function senzaMovimento() { return !!(ridotto && ridotto.matches); }

    function mostra(n) {
      corrente = (n + slide.length) % slide.length;
      slide.forEach(function (s, k) {
        var attiva = k === corrente;
        s.classList.toggle("is-on", attiva);
        s.setAttribute("aria-hidden", attiva ? "false" : "true");
      });
      punti.forEach(function (p, k) {
        if (k === corrente) p.setAttribute("aria-current", "true");
        else p.removeAttribute("aria-current");
      });
    }

    function aggiornaPulsante() {
      var inPausa = !timer;
      if (play) {
        play.setAttribute("aria-pressed", inPausa ? "true" : "false");
        play.setAttribute("aria-label", inPausa
          ? "Riprendi lo scorrimento automatico"
          : "Metti in pausa lo scorrimento automatico");
      }
      // da fermo i cambi di slide possono essere annunciati, in movimento no:
      // altrimenti lo screen reader parlerebbe ogni sei secondi
      if (track) track.setAttribute("aria-live", inPausa ? "polite" : "off");
    }

    function avvia() {
      if (timer || senzaMovimento()) { aggiornaPulsante(); return; }
      timer = setInterval(function () { mostra(corrente + 1); }, INTERVALLO);
      aggiornaPulsante();
    }

    function ferma() {
      if (timer) { clearInterval(timer); timer = null; }
      aggiornaPulsante();
    }

    // qualunque comando usato a mano interrompe lo scorrimento: chi ha preso
    // il controllo non vuole vedersi cambiare la foto sotto il dito
    function vaiA(n) { ferma(); mostra(n); }

    var prev = car.querySelector("[data-car-prev]");
    var next = car.querySelector("[data-car-next]");
    if (prev) prev.addEventListener("click", function () { vaiA(corrente - 1); });
    if (next) next.addEventListener("click", function () { vaiA(corrente + 1); });
    punti.forEach(function (p) {
      p.addEventListener("click", function () {
        vaiA(parseInt(p.getAttribute("data-car-va"), 10) || 0);
      });
    });
    if (play) {
      play.addEventListener("click", function () {
        if (timer) ferma(); else { timer = null; avvia(); }
      });
    }

    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); vaiA(corrente - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); vaiA(corrente + 1); }
    });

    // in pausa mentre il puntatore o il fuoco sono dentro
    car.addEventListener("mouseenter", function () { if (timer) { ferma(); car.dataset.ripristina = "1"; } });
    car.addEventListener("mouseleave", function () { if (car.dataset.ripristina) { delete car.dataset.ripristina; avvia(); } });
    car.addEventListener("focusin", function () { if (timer) { ferma(); car.dataset.ripristinaFuoco = "1"; } });
    car.addEventListener("focusout", function () {
      if (car.contains(document.activeElement)) return;
      if (car.dataset.ripristinaFuoco) { delete car.dataset.ripristinaFuoco; avvia(); }
    });

    // niente giri a vuoto quando la scheda e' in secondo piano
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) ferma(); else avvia();
    });

    // swipe col dito
    var x0 = null;
    car.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    car.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var d = e.clientX - x0;
      x0 = null;
      if (Math.abs(d) > 40) vaiA(corrente + (d < 0 ? 1 : -1));
    });

    if (ridotto && ridotto.addEventListener) {
      ridotto.addEventListener("change", function () {
        if (senzaMovimento()) ferma(); else avvia();
      });
    }

    mostra(0);
    avvia();
  });
})();
