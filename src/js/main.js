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
