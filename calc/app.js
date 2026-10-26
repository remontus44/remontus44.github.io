/* Ремонтус44 — калькулятор стоимости работ.
   Один файл без зависимостей: работает офлайн, данные в localStorage. */

(function () {
  "use strict";

  /* ---------- данные ---------- */

  var CATS = [
    { id: "top", name: "Частое" },
    { id: "diag", name: "Диагностика" },
    { id: "ac", name: "Кондиционер" },
    { id: "engine", name: "Двигатель" },
    { id: "visit", name: "Выезд" }
  ];

  var PINNED = ["diag-comp", "endo", "ac-freon", "timing-belt", "timing-chain", "oil", "plugs", "visit"];

  var SERVICES = [
    /* диагностика */
    { id: "diag-comp", cat: "diag", name: "Компьютерная диагностика", note: "Чтение ошибок, анализ параметров в динамике", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "сканер компьютерная ошибки чек лаунч launch" },
    { id: "diag-engine", cat: "diag", name: "Диагностика двигателя", note: "Параметры, компрессия, подсос воздуха, давление топлива", min: 1500, max: 3000, tmin: 30, tmax: 60, tags: "двигатель троит компрессия подсос топливо" },
    { id: "diag-full", cat: "diag", name: "Комплексная диагностика", note: "Все блоки плюс механические замеры", min: 3000, max: 3000, tmin: 60, tmax: 60, tags: "комплексная полная все блоки" },
    { id: "endo", cat: "diag", name: "Видеоэндоскопия, 4 цилиндра", note: "Задиры, нагар, хон, клапаны. Фото и видеоотчёт", min: 2000, max: 2500, tmin: 45, tmax: 45, tags: "эндоскоп эндоскопия задиры камера цилиндры хон нагар" },
    { id: "adapt", cat: "diag", name: "Адаптация дросселя, АКПП, робота", note: "Если адаптацию заказывают отдельно — диагностика бесплатно", min: 2000, max: 3000, tmin: 40, tmax: 60, tags: "адаптация дроссель акпп робот обучение" },
    { id: "diag-abs", cat: "diag", name: "Диагностика ABS и SRS", note: "По блокам, с расшифровкой ошибок", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "abs srs абс подушка тормоза" },
    { id: "diag-akpp", cat: "diag", name: "Диагностика АКПП и РКПП", note: "Ошибки, параметры, проверка адаптаций", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "акпп ркпп коробка вариатор" },
    { id: "diag-el", cat: "diag", name: "Диагностика электрооборудования", note: "Проверка цепей, датчиков, потребителей", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "электрика электрооборудование проводка датчик" },
    { id: "prebuy", cat: "diag", name: "Проверка авто перед покупкой", note: "Электроника, ошибки, пробег, по запросу — эндоскопия", min: 4500, max: 4500, tmin: 90, tmax: 90, tags: "покупка осмотр подбор проверка" },
    { id: "service-reset", cat: "diag", name: "Сброс сервисного интервала", note: "После замены масла, напоминания", min: 800, max: 800, tmin: 15, tmax: 15, tags: "сервис сброс масло напоминание" },
    { id: "battery", cat: "diag", name: "Регистрация нового АКБ", note: "Прописка батареи в блоке управления", min: 800, max: 800, tmin: 15, tmax: 15, tags: "акб аккумулятор батарея прописка" },
    { id: "epb", cat: "diag", name: "Разведение колодок ручника", note: "Для замены тормозных колодок", min: 800, max: 800, tmin: 15, tmax: 15, tags: "ручник колодки тормоза электронный" },

    /* кондиционер */
    { id: "ac-freon", cat: "ac", name: "Заправка кондиционера R134a", note: "Работа + газ по факту, 3 ₽ за 1 г", base: 1500, perGram: 3, tmin: 40, tmax: 40, tags: "заправка фреон кондиционер r134a газ" },
    { id: "ac-clean", cat: "ac", name: "Заправка очищенным фреоном", note: "После откачки: фильтрация и возврат газа. Газ не оплачивается", min: 1800, max: 1800, tmin: 40, tmax: 40, tags: "очищенный фреон свой газ повторно вернуть" },
    { id: "ac-recover", cat: "ac", name: "Откачка фреона", note: "Слив в баллон перед ремонтом, с сохранением или утилизацией", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "откачка слить газ баллон утилизация" },
    { id: "ac-leak", cat: "ac", name: "Опрессовка и поиск утечек", note: "Проверка герметичности перед заправкой", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "утечка опрессовка герметичность" },
    { id: "ac-flush", cat: "ac", name: "Промывка системы", note: "Со снятием запаха", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "промывка" },
    { id: "ac-antibac", cat: "ac", name: "Обработка испарителя", note: "Антибактериальная, против запаха в салоне", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "запах антибактериальная испаритель" },
    { id: "ac-filter", cat: "ac", name: "Замена салонного фильтра", note: "Фильтр отдельно", min: 500, max: 500, tmin: 15, tmax: 15, tags: "салонный фильтр" },
    { id: "ac-compressor", cat: "ac", name: "Замена компрессора", note: "Запчасть и фреон отдельно", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "компрессор" },
    { id: "ac-radiator", cat: "ac", name: "Замена радиатора кондиционера", note: "Запчасть и фреон отдельно", min: 5000, max: 5000, tmin: 150, tmax: 150, tags: "радиатор конденсор" },
    { id: "ac-pipes", cat: "ac", name: "Замена трубок и датчиков", note: "По объёму работ", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "трубки датчик" },
    { id: "ac-diag", cat: "ac", name: "Диагностика кондиционера", note: "Не холодит, не включается, шумит", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "не холодит диагностика кондиционера" },

    /* двигатель */
    { id: "timing-belt", cat: "engine", name: "Замена ремня ГРМ", note: "С роликами и натяжителями", min: 5000, max: 6000, tmin: 150, tmax: 180, tags: "грм ремень ролики натяжитель" },
    { id: "timing-chain", cat: "engine", name: "Замена цепи ГРМ", note: "Зависит от компоновки под капотом", min: 8000, max: 9000, tmin: 240, tmax: 270, tags: "грм цепь" },
    { id: "head-gasket", cat: "engine", name: "Замена прокладки ГБЦ", note: "Со снятием головки", min: 8000, max: 8000, tmin: 240, tmax: 240, tags: "прокладка гбц головка" },
    { id: "head-remove", cat: "engine", name: "Снятие и установка ГБЦ", note: "Без ремонта самой головки", min: 6000, max: 6000, tmin: 180, tmax: 180, tags: "гбц головка снятие установка" },
    { id: "valve-seals", cat: "engine", name: "Замена маслосъёмных колпачков", note: "Устранение масложора и дыма", min: 12000, max: 12000, tmin: 360, tmax: 360, tags: "колпачки масложор дым маслосъемные" },
    { id: "rings", cat: "engine", name: "Замена колец и вкладышей", note: "После дефектовки, с проверкой цилиндров", min: 20000, max: 32000, tmin: 600, tmax: 960, tags: "кольца вкладыши поршень" },
    { id: "seals", cat: "engine", name: "Замена сальников, течь масла", note: "Передний и задний сальники, поддон, крышка", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "сальник течь масло поддон" },
    { id: "pump", cat: "engine", name: "Замена помпы", note: "С заменой антифриза", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "помпа водяной насос антифриз" },
    { id: "mounts", cat: "engine", name: "Замена опор двигателя", note: "Подушки, гидроопоры", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "опоры подушки гидроопора" },
    { id: "aux-belt", cat: "engine", name: "Замена ремня навесного", note: "С роликами", min: 2000, max: 3000, tmin: 60, tmax: 90, tags: "ремень навесной генератор ролики" },
    { id: "decoke", cat: "engine", name: "Раскоксовка", note: "Если реально помогает без разборки", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "раскоксовка" },
    { id: "rebuild", cat: "engine", name: "Переборка двигателя", note: "Снятие, разборка, дефектовка, сборка, установка", min: 24000, max: 40000, tmin: 720, tmax: 1200, tags: "переборка капиталка капремонт" },
    { id: "oil", cat: "engine", name: "Замена масла и фильтра", note: "С вашими расходниками или подберу сам", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "масло фильтр то" },
    { id: "plugs", cat: "engine", name: "Замена свечей", note: "С проверкой колодцев", min: 1500, max: 1500, tmin: 60, tmax: 60, tags: "свечи" },

    /* выезд */
    { id: "visit", cat: "visit", name: "Выезд в пределах города", note: "Дом, офис, гараж, место поломки", min: 500, max: 500, tmin: 0, tmax: 0, tags: "выезд" }
  ];

  var STORE = "remontus44.calc.v1";
  var GRAM_STEP = 50;
  var GRAM_MIN = 200;
  var GRAM_MAX = 1200;
  var GRAM_DEFAULT = 600;

  /* ---------- утилиты ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var nf = new Intl.NumberFormat("ru-RU");

  function nums(n) {
    return nf.format(Math.round(n)).replace(/\u00A0/g, " ");
  }

  function rub(n) {
    return nums(n) + " ₽";
  }

  function rubRange(a, b) {
    if (a === b) return rub(a);
    return nums(a) + "–" + nums(b) + " ₽";
  }

  function dur(m) {
    if (!m) return "—";
    if (m < 60) return m + " мин";
    var h = Math.floor(m / 60);
    var rest = m % 60;
    return rest ? h + " ч " + rest + " мин" : h + " ч";
  }

  function durRange(a, b) {
    if (!a && !b) return "—";
    if (a === b) return dur(a);
    return dur(a) + " – " + dur(b);
  }

  /* компактно для списка: «30–60 мин», «2,5–3 ч» */
  function hours(m) {
    return String(Math.round(m / 6) / 10).replace(".", ",");
  }

  function shortDur(m) {
    if (!m) return "—";
    if (m < 60) return m + " мин";
    if (m % 30 === 0) return hours(m) + " ч";
    return dur(m);
  }

  function shortRange(a, b) {
    if (!a && !b) return "—";
    if (a === b) return shortDur(a);
    if (b <= 60) return a + "–" + b + " мин";
    if (a >= 60) return hours(a) + "–" + hours(b) + " ч";
    return dur(a) + "–" + dur(b);
  }

  function plural(n, one, few, many) {
    var d = n % 10;
    var dd = n % 100;
    if (d === 1 && dd !== 11) return one;
    if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
    return many;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }

  function byId(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }

  function def(item) {
    if (item.custom) return item;
    return byId(item.id);
  }

  function catName(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return "";
  }

  function unitPrice(item) {
    var d = def(item);
    if (d.perGram) {
      var p = d.base + (item.grams || GRAM_DEFAULT) * d.perGram;
      return { min: p, max: p };
    }
    return { min: d.min, max: d.max };
  }

  function totals() {
    var min = 0, max = 0, tmin = 0, tmax = 0;
    state.cart.forEach(function (item) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      min += u.min * item.qty;
      max += u.max * item.qty;
      tmin += (d.tmin || 0) * item.qty;
      tmax += (d.tmax || 0) * item.qty;
    });
    return { min: min, max: max, tmin: tmin, tmax: tmax };
  }

  /* ---------- состояние ---------- */

  var state = { cat: "all", cart: [], note: true };

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (Array.isArray(data.cart)) {
        state.cart = data.cart.filter(function (it) {
          if (!it || !it.id) return false;
          it.qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 99);
          if (it.custom) return !!it.name;
          return !!byId(it.id);
        });
      }
      if (typeof data.note === "boolean") state.note = data.note;
    } catch (e) { /* приватный режим или битые данные — не страшно */ }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ cart: state.cart, note: state.note }));
    } catch (e) { /* переполнение или приватный режим */ }
  }

  /* ---------- список ---------- */

  function matches(s, words) {
    if (!words.length) return true;
    var hay = norm([s.name, s.note, s.tags, catName(s.cat)].join(" "));
    return words.every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function rowHtml(s) {
    var inCart = null;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === s.id) { inCart = state.cart[i]; break; }
    }
    var price = s.perGram ? "от " + nums(s.base) + " ₽ + газ" : rubRange(s.min, s.max);
    return '<button class="svc' + (inCart ? " svc--on" : "") + '" type="button" data-add="' + s.id + '">' +
      '<span class="svc__text">' +
        '<span class="svc__name">' + esc(s.name) + '</span>' +
        '<span class="svc__note">' + esc(s.note) + '</span>' +
      '</span>' +
      '<span class="svc__side">' +
        '<span class="svc__price">' + price + '</span>' +
        '<span class="svc__time">' + shortRange(s.tmin, s.tmax) + '</span>' +
      '</span>' +
    '</button>';
  }

  function renderChips() {
    var html = '<button class="chip' + (state.cat === "all" ? " chip--on" : "") + '" type="button" data-cat="all">Все</button>';
    CATS.forEach(function (c) {
      html += '<button class="chip' + (state.cat === c.id ? " chip--on" : "") + '" type="button" data-cat="' + c.id + '">' + c.name + '</button>';
    });
    $("chips").innerHTML = html;
  }

  function renderList() {
    var words = norm($("q").value).split(" ").filter(Boolean);
    var html = "";
    var effCat = state.cat === "top" && words.length ? "all" : state.cat;

    if (state.cat === "top" && !words.length) {
      var pinned = PINNED.map(byId).filter(Boolean);
      html += '<h2 class="group">Что спрашивают чаще всего</h2>';
      pinned.forEach(function (s) { html += rowHtml(s); });
    } else {
      CATS.forEach(function (c) {
        if (c.id === "top") return;
        if (effCat !== "all" && effCat !== c.id) return;
        var items = SERVICES.filter(function (s) {
          return s.cat === c.id && matches(s, words);
        });
        if (!items.length) return;
        html += '<h2 class="group">' + c.name + '</h2>';
        items.forEach(function (s) { html += rowHtml(s); });
      });
    }

    $("list").innerHTML = html;
    $("empty").hidden = html !== "";
    $("clearQ").hidden = $("q").value === "";
  }

  /* ---------- нижняя панель ---------- */

  function renderBar() {
    var t = totals();
    var n = state.cart.length;
    var bar = $("bar");
    if (!n) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    $("barSum").textContent = rubRange(t.min, t.max);
    var parts = [n + " " + plural(n, "позиция", "позиции", "позиций")];
    if (t.tmax) parts.push(durRange(t.tmin, t.tmax));
    $("barMeta").textContent = parts.join(" · ");
  }

  /* ---------- смета ---------- */

  function renderSheet() {
    if (!state.cart.length) {
      closeSheet();
      return;
    }

    var html = "";
    state.cart.forEach(function (item, i) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      var lineMin = u.min * item.qty;
      var lineMax = u.max * item.qty;

      if (d.perGram) {
        html += '<div class="item" data-i="' + i + '">' +
          '<div class="item__text">' +
            '<div class="item__name">' + esc(d.name) + '</div>' +
            '<div class="item__sum">' + nums(d.base) + ' ₽ + ' + item.grams + ' г × ' + d.perGram + ' ₽ = ' + rubRange(lineMin, lineMax) + '</div>' +
            '<div class="grams">' +
              '<button type="button" data-g="-' + GRAM_STEP + '" aria-label="Меньше газа">−' + GRAM_STEP + '</button>' +
              '<b>' + item.grams + ' г</b>' +
              '<button type="button" data-g="' + GRAM_STEP + '" aria-label="Больше газа">+' + GRAM_STEP + '</button>' +
            '</div>' +
          '</div>' +
          '<button class="item__del" type="button" data-del aria-label="Удалить">×</button>' +
        '</div>';
        return;
      }

      html += '<div class="item" data-i="' + i + '">' +
        '<div class="item__text">' +
          '<div class="item__name">' + esc(d.name) + '</div>' +
          '<div class="item__sum">' + rubRange(lineMin, lineMax) + '</div>' +
        '</div>' +
        '<div class="step">' +
          '<button type="button" data-dec aria-label="Меньше">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button type="button" data-inc aria-label="Больше">+</button>' +
        '</div>' +
        '<button class="item__del" type="button" data-del aria-label="Удалить">×</button>' +
      '</div>';
    });

    html += '<button class="addown" type="button" id="addOwn">+ Своя строка</button>' +
      '<form class="ownform" id="ownForm" hidden>' +
        '<input id="ownName" placeholder="Название работы" maxlength="60" autocomplete="off">' +
        '<input id="ownPrice" type="number" inputmode="numeric" min="0" step="100" placeholder="₽">' +
        '<button type="submit">Добавить в смету</button>' +
      '</form>';

    $("sheetBody").innerHTML = html;

    var t = totals();
    $("sheetSum").textContent = rubRange(t.min, t.max);
    var n = state.cart.length;
    var info = [n + " " + plural(n, "позиция", "позиции", "позиций")];
    info.push(t.tmax ? "работы " + durRange(t.tmin, t.tmax) : "без работ в боксе");
    $("sheetTime").textContent = info.join(" · ");

    var own = $("addOwn");
    if (own) {
      own.addEventListener("click", function () {
        $("ownForm").hidden = false;
        own.hidden = true;
        $("ownName").focus();
      });
    }

    var form = $("ownForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = $("ownName").value.trim();
        var price = parseInt($("ownPrice").value, 10);
        if (!name || !(price >= 0)) {
          toast(name ? "Укажите сумму" : "Укажите название работы");
          return;
        }
        state.cart.push({
          id: "own-" + Date.now(),
          custom: true,
          name: name,
          min: price,
          max: price,
          tmin: 0,
          tmax: 0,
          qty: 1
        });
        save();
        renderSheet();
        renderBar();
        renderList();
      });
    }
  }

  /* ---------- шторка: открыть / закрыть ---------- */

  var sheetOpen = false;

  function openSheet() {
    if (!state.cart.length) return;
    if (sheetOpen) return;
    sheetOpen = true;
    $("sheet").hidden = false;
    renderSheet();
    requestAnimationFrame(function () {
      $("sheet").classList.add("is-open");
    });
    try { history.pushState({ sheet: 1 }, ""); } catch (e) { /* file:// */ }
  }

  function closeSheet(fromPop) {
    if (!sheetOpen) return;
    sheetOpen = false;
    $("sheet").classList.remove("is-open");
    setTimeout(function () {
      if (!sheetOpen) $("sheet").hidden = true;
    }, 240);
    if (!fromPop) {
      try { history.back(); } catch (e) { /* ignore */ }
    }
  }

  window.addEventListener("popstate", function () {
    if (sheetOpen) closeSheet(true);
  });

  /* ---------- текст для чата ---------- */

  function buildText() {
    var lines = ["Ремонтус44, Кострома"];
    state.cart.forEach(function (item) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      var name = d.name;
      if (d.perGram) name += ", " + item.grams + " г";
      var qty = item.qty > 1 ? " × " + item.qty : "";
      lines.push("• " + name + qty + " — " + rubRange(u.min * item.qty, u.max * item.qty));
    });

    var t = totals();
    lines.push("");
    lines.push("Итого: " + rubRange(t.min, t.max));
    if (t.tmax) lines.push("Время работ: " + durRange(t.tmin, t.tmax));
    if (state.note) lines.push("Точную сумму скажу после осмотра.");

    return lines.join("\n");
  }

  function copy(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return Promise.resolve(fallback());
  }

  function copyEstimate() {
    if (!state.cart.length) return;
    copy(buildText()).then(function (ok) {
      toast(ok ? "Смета скопирована" : "Не получилось скопировать");
    });
  }

  function shareEstimate() {
    var text = buildText();
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () { /* отменили — не ошибка */ });
    } else {
      copy(text).then(function (ok) { toast(ok ? "Смета скопирована" : "Не получилось"); });
    }
  }

  /* ---------- тост ---------- */

  var toastTimer = null;

  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 1900);
  }

  /* ---------- события ---------- */

  load();
  renderChips();
  renderList();
  renderBar();
  $("noteTgl").checked = state.note;

  $("q").addEventListener("input", renderList);

  $("q").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.blur();
    }
  });

  $("clearQ").addEventListener("click", function () {
    $("q").value = "";
    $("q").focus();
    renderList();
  });

  $("chips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.cat = btn.getAttribute("data-cat");
    renderChips();
    renderList();
    $("list").scrollIntoView({ block: "start", behavior: "smooth" });
  });

  $("list").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var id = btn.getAttribute("data-add");
    var s = byId(id);
    if (!s) return;

    var added = null;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === id) { added = state.cart[i]; break; }
    }

    if (added) {
      if (added.qty < 99) added.qty += 1;
    } else {
      var item = { id: id, qty: 1 };
      if (s.perGram) item.grams = GRAM_DEFAULT;
      state.cart.push(item);
    }

    if (navigator.vibrate) navigator.vibrate(8);
    save();
    renderList();
    renderBar();
    if (sheetOpen) renderSheet();
  });

  $("bar").addEventListener("click", function (e) {
    if (e.target.closest("#openSheet")) openSheet();
  });

  $("quickCopy").addEventListener("click", copyEstimate);

  $("sheet").addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { closeSheet(); return; }

    var itemEl = e.target.closest(".item");
    if (!itemEl) return;
    var i = parseInt(itemEl.getAttribute("data-i"), 10);
    var item = state.cart[i];
    if (!item) return;

    if (e.target.closest("[data-del]")) {
      state.cart.splice(i, 1);
    } else if (e.target.closest("[data-inc]")) {
      if (item.qty < 99) item.qty += 1;
    } else if (e.target.closest("[data-dec]")) {
      if (item.qty > 1) item.qty -= 1;
      else state.cart.splice(i, 1);
    } else if (e.target.closest("[data-g]")) {
      var delta = parseInt(e.target.closest("[data-g]").getAttribute("data-g"), 10);
      item.grams = Math.min(Math.max((item.grams || GRAM_DEFAULT) + delta, GRAM_MIN), GRAM_MAX);
    } else {
      return;
    }

    save();
    renderSheet();
    renderBar();
    renderList();
  });

  $("copyBtn").addEventListener("click", copyEstimate);
  $("shareBtn").addEventListener("click", shareEstimate);

  $("clearBtn").addEventListener("click", function () {
    if (!state.cart.length) return;
    if (!window.confirm("Очистить смету?")) return;
    state.cart = [];
    save();
    closeSheet();
    renderBar();
    renderList();
    toast("Смета очищена");
  });

  $("noteTgl").addEventListener("change", function () {
    state.note = this.checked;
    save();
  });

  /* ---------- офлайн ---------- */

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () { /* не критично */ });
    });
  }
})();
