/* Ремонтус44 — акт выполненных работ для печати / PDF.
   Использует те же печатные классы .pd, что и смета в калькуляторе. */
(function () {
  "use strict";

  var PHONE_B64 = "Kzc5NjA3NDMzMDc3"; // +7 960 743-30-77
  var SITE_SHORT = "remontus44.github.io";

  function phonePretty() {
    var raw = atob(PHONE_B64);
    return raw.charAt(0) + raw.charAt(1) + " " +
      raw.substr(2, 3) + " " + raw.substr(5, 3) + "-" +
      raw.substr(8, 2) + "-" + raw.substr(10, 2);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function num(value, fallback) {
    var n = parseFloat(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  function rub(value) {
    var n = Math.round(num(value, 0));
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  }

  function qtyText(value) {
    var n = num(value, 1);
    return String(Math.round(n * 100) / 100).replace(".", ",");
  }

  function fmtDate(value) {
    var d = value ? new Date(String(value) + "T12:00:00") : new Date();
    if (isNaN(d.getTime())) return String(value || "");
    try {
      return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function itemKind(item) {
    if (item.kind === "part" || item.kind === "fluid") return item.kind;
    if (item.kind === "custom") return "service";
    return "service";
  }

  function itemSum(item) {
    return Math.round(num(item.price, 0) * num(item.qty, 1));
  }

  function table(rows) {
    return '<table class="pd__table act__table">' +
      '<thead><tr>' +
        '<th class="pd__num">№</th>' +
        '<th>Наименование</th>' +
        '<th class="pd__num">Кол-во</th>' +
        '<th class="pd__num">Цена</th>' +
        '<th class="pd__num">Сумма</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
  }

  function group(title, items) {
    if (!items.length) return "";
    var rows = "";
    var number = 1;
    items.forEach(function (item) {
      var unit = item.kind === "part" || item.kind === "fluid" ? String(item.unit || "").trim() : "";
      var qty = qtyText(item.qty) + (unit ? " " + esc(unit) : "");
      rows += '<tr>' +
        '<td class="pd__num">' + (number++) + '</td>' +
        '<td>' + esc(item.name || "—") + '</td>' +
        '<td class="pd__num">' + qty + '</td>' +
        '<td class="pd__num">' + rub(item.price) + '</td>' +
        '<td class="pd__num">' + rub(itemSum(item)) + '</td>' +
      '</tr>';
    });
    return '<h3 class="pd__section">' + esc(title) + '</h3>' + table(rows);
  }

  function sumItems(items) {
    return items.reduce(function (sum, item) { return sum + itemSum(item); }, 0);
  }

  function build(order) {
    order = order || {};
    var items = Array.isArray(order.items) ? order.items : [];
    var works = items.filter(function (item) { return itemKind(item) === "service"; });
    var parts = items.filter(function (item) { return itemKind(item) === "part"; });
    var fluids = items.filter(function (item) { return itemKind(item) === "fluid"; });

    var total = num(order.client_total, sumItems(items));
    var number = order.id ? String(order.id).slice(0, 8).toUpperCase() : "б/н";
    var car = [order.make, order.model].filter(Boolean).join(" ");
    var owner = String(order.owner_name || "").trim();
    var phone = String(order.owner_phone || "").trim();

    var html = '<div class="pd act">';
    html += '<div class="pd__top">' +
      '<div>' +
        '<div class="pd__brand">Ремонтус44</div>' +
        '<div class="pd__city">Кострома · выезд по городу · 9:00–19:00</div>' +
        '<div class="pd__contacts">Сайт: ' + SITE_SHORT + ' · Телефон: ' + phonePretty() + '</div>' +
      '</div>' +
      '<div class="pd__doc">' +
        '<div class="pd__title">Акт выполненных работ</div>' +
        '<div class="pd__date">№ ' + esc(number) + ' · ' + esc(fmtDate(order.order_date)) + '</div>' +
      '</div>' +
    '</div>';

    html += '<div class="pd__car">' +
      '<div><b>Автомобиль:</b> ' + esc(car || "не указан") +
        (order.plate ? ' · госномер ' + esc(order.plate) : '') + '</div>' +
      '<div><b>VIN:</b> ' + esc(order.vin || "—") + '</div>' +
      '<div><b>Владелец:</b> ' + esc(owner || "—") +
        (phone ? ' · ' + esc(phone) : '') + '</div>' +
    '</div>';

    html += group("Работы", works);
    html += group("Запчасти", parts);
    html += group("Жидкости", fluids);

    if (!items.length) {
      html += '<p class="pd__note">В заказе пока нет позиций.</p>';
    }

    html += '<div class="pd__totals">' +
      '<div class="pd__grand"><span>Итого к оплате</span><b>' + rub(total) + '</b></div>' +
    '</div>';

    html += '<p class="pd__note">Работы выполнены в полном объёме. Заказчик претензий по качеству и срокам не имеет.</p>';

    html += '<div class="pd__sign">' +
      '<div><span>Исполнитель</span><b>Ремонтус44</b></div>' +
      '<div><span>Заказчик</span><b>' + esc(owner || "________________") + '</b></div>' +
    '</div>';

    html += '<p class="pd__foot">Ремонтус44 · Кострома · Сайт: ' + SITE_SHORT +
      ' · Телефон: ' + phonePretty() + '</p>';
    html += '</div>';
    return html;
  }

  function print(order) {
    var doc = document.getElementById("printDoc");
    if (!doc) return false;
    doc.innerHTML = build(order);

    var oldTitle = document.title;
    var d = order && order.order_date ? new Date(String(order.order_date) + "T12:00:00") : new Date();
    if (isNaN(d.getTime())) d = new Date();
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    document.title = "Акт Ремонтус44 " + d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

    var restored = false;
    function restore() {
      if (restored) return;
      restored = true;
      document.title = oldTitle;
      window.removeEventListener("afterprint", restore);
    }
    window.addEventListener("afterprint", restore);
    setTimeout(restore, 10000);

    try {
      window.print();
    } catch (e) {
      restore();
      return false;
    }
    return true;
  }

  window.R44Act = { build: build, print: print };
})();
