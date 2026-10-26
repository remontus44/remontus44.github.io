/* Ремонтус44 — показ телефона по кнопке.
   Номер хранится в base64, в HTML его нет: простые сборщики номеров
   со страницы его не найдут. */
(function () {
  "use strict";

  var RAW = atob("Kzc5NjA3NDMzMDc3");
  var PRETTY = RAW.charAt(0) + RAW.charAt(1) + " " +
    RAW.substr(2, 3) + " " + RAW.substr(5, 3) + "-" +
    RAW.substr(8, 2) + "-" + RAW.substr(10, 2);

  function reveal(btn) {
    var a = document.createElement("a");
    a.href = "tel:" + RAW;
    a.textContent = PRETTY;
    a.className = btn.getAttribute("data-reveal-class") || btn.className;

    var hint = btn.nextElementSibling;
    if (hint && hint.classList && hint.classList.contains("phone-hint")) {
      hint.parentNode.removeChild(hint);
    }

    btn.parentNode.replaceChild(a, btn);
    a.focus({ preventScroll: true });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-phone-reveal]");
    if (!btn) return;
    e.preventDefault();
    reveal(btn);
  });
})();
