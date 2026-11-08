/* Ремонтус44 — база заказов: список, статистика, редактор, акт. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var allOrders = [];
  var current = null;
  var isNew = false;
  var editorOpen = false;
  var toastTimer = null;

  /* ---------- утилиты ---------- */

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

  function isoDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return y + "-" + (m.length < 2 ? "0" + m : m) + "-" + (day.length < 2 ? "0" + day : day);
  }

  function todayISO() { return isoDate(new Date()); }

  function monthStartISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01";
  }

  function yearStartISO() { return new Date().getFullYear() + "-01-01"; }

  function fmtDate(value) {
    if (!value) return "—";
    var parts = String(value).split("-");
    if (parts.length === 3) return parts[2] + "." + parts[1] + "." + parts[0];
    return String(value);
  }

  function monthName() {
    var months = ["январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
    var d = new Date();
    return months[d.getMonth()] + " " + d.getFullYear();
  }

  function toast(msg) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 2400);
  }

  function setStatus(text, isError) {
    var el = $("loginStatus");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-error", !!isError);
  }

  function setView(name) {
    ["setup", "login", "main"].forEach(function (key) {
      var el = $(key + "View");
      if (el) el.hidden = key !== name;
    });
  }

  /* ---------- статистика ---------- */

  function inPeriod(order) {
    var d = order.order_date || "";
    var from = $("fromDate").value;
    var to = $("toDate").value;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  function isThisMonth(order) {
    var d = order.order_date || "";
    var now = new Date();
    return d.slice(0, 7) === now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  }

  function sum(list, key) {
    return list.reduce(function (acc, item) { return acc + num(item[key], 0); }, 0);
  }

  function periodLabel() {
    var from = $("fromDate").value;
    var to = $("toDate").value;
    if (!from && !to) return "всё время";
    return (from ? fmtDate(from) : "начало") + " — " + (to ? fmtDate(to) : "сегодня");
  }

  function renderStats() {
    var period = allOrders.filter(inPeriod);
    var allEarn = sum(allOrders, "earnings");
    var monthEarn = sum(allOrders.filter(isThisMonth), "earnings");
    var revenue = sum(period, "revenue");
    var cost = sum(period, "counted_cost");
    var avg = period.length ? sum(period, "client_total") / period.length : 0;

    var cards = [
      { label: "Заработано за всё время", value: rub(allEarn), hint: "прибыль по всем заказам" },
      { label: "Заработано за месяц", value: rub(monthEarn), hint: monthName() },
      { label: "Выручка за период", value: rub(revenue), hint: "только позиции с галочкой" },
      { label: "Средний чек", value: rub(avg), hint: period.length + " " + plural(period.length, "заказ", "заказа", "заказов") },
      { label: "Себестоимость за период", value: rub(cost), hint: "закупка запчастей и жидкостей" },
      { label: "Заказов за период", value: String(period.length), hint: periodLabel() }
    ];

    $("stats").innerHTML = cards.map(function (card) {
      return '<div class="stat">' +
        '<div class="stat__label">' + esc(card.label) + '</div>' +
        '<div class="stat__value">' + esc(card.value) + '</div>' +
        '<div class="stat__hint">' + esc(card.hint) + '</div>' +
      '</div>';
    }).join("");
  }

  function plural(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  /* ---------- список заказов ---------- */

  function cardHtml(order) {
    var car = [order.make, order.model].filter(Boolean).join(" ") || "Автомобиль не указан";
    var plate = order.plate ? " · " + esc(order.plate) : "";
    var owner = String(order.owner_name || "").trim();
    var phone = String(order.owner_phone || "").trim();
    var ownerLine = owner
      ? "Владелец: " + esc(owner) + (phone ? " · " + esc(phone) : "")
      : (phone ? "Телефон: " + esc(phone) : "");

    return '<article class="order-card" data-id="' + esc(order.id) + '">' +
      '<div class="order-card__head">' +
        '<div>' +
          '<div class="order-card__date">' + esc(fmtDate(order.order_date)) + '</div>' +
          '<div class="order-card__car">' + esc(car) + plate + '</div>' +
        '</div>' +
        '<div class="order-card__sum">' + rub(order.client_total) + '</div>' +
      '</div>' +
      (ownerLine ? '<div class="order-card__meta">' + ownerLine + '</div>' : '') +
      '<div class="order-card__profit">Заработок: ' + rub(order.earnings) +
        ' · без наценки: ' + rub(order.cost_total) + '</div>' +
      '<div class="order-card__btns">' +
        '<button class="order-card__btn order-card__btn--green" type="button" data-open>Открыть</button>' +
        '<button class="order-card__btn" type="button" data-act>Акт PDF</button>' +
        '<button class="order-card__btn order-card__btn--red" type="button" data-del>Удалить</button>' +
      '</div>' +
    '</article>';
  }

  function renderList() {
    var period = allOrders.filter(inPeriod);
    $("ordersEmpty").hidden = period.length > 0;
    $("ordersList").innerHTML = period.map(cardHtml).join("");
  }

  function render() {
    renderStats();
    renderList();
  }

  /* ---------- загрузка ---------- */

  function loadOrders() {
    $("ordersEmpty").hidden = true;
    $("ordersList").innerHTML = '<p class="orders__empty">Загружаю заказы…</p>';

    R44DB.listOrders().then(function (rows) {
      allOrders = Array.isArray(rows) ? rows : [];
      render();
    }).catch(function (err) {
      var msg = String(err && err.message || err);
      if (/jwt|token|auth|401|403|permission/i.test(msg)) {
        R44DB.signOut().then(function () {
          setView("login");
          setStatus("Сессия истекла. Войдите снова.", true);
        });
        return;
      }
      $("ordersList").innerHTML = "";
      $("ordersEmpty").hidden = false;
      if (/relation|does not exist|schema|42P01/i.test(msg)) {
        $("ordersList").innerHTML = '<div class="panel__note">Таблица заказов не найдена. Выполните <b>supabase/schema.sql</b> в SQL Editor проекта Supabase, затем нажмите «Обновить».</div>';
        $("ordersEmpty").hidden = true;
      }
      toast("Ошибка загрузки: " + msg);
    });
  }

  function openMain() {
    setView("main");
    var session = R44DB.getSession();
    $("userEmail").textContent = session && session.email ? session.email : "";
    if (!$("fromDate").value) $("fromDate").value = monthStartISO();
    if (!$("toDate").value) $("toDate").value = todayISO();
    loadOrders();
  }

  function prefillSetup() {
    var c = R44DB.getConfig();
    if ($("setupUrl") && !$("setupUrl").value) $("setupUrl").value = c.url || "";
    if ($("setupKey") && !$("setupKey").value) $("setupKey").value = c.anonKey || "";
  }

  /* ---------- редактор ---------- */

  function blankOrder() {
    return {
      id: "",
      order_date: todayISO(),
      vin: "",
      make: "",
      model: "",
      plate: "",
      owner_name: "",
      owner_phone: "",
      note: "",
      items: [],
      client_total: 0,
      cost_total: 0,
      counted_client: 0,
      counted_cost: 0,
      earnings: 0,
      revenue: 0
    };
  }

  function str(value) { return String(value == null ? "" : value).trim(); }

  function calcTotals(items) {
    var client = 0, cost = 0, countedClient = 0, countedCost = 0;
    (items || []).forEach(function (item) {
      var qty = num(item.qty, 1);
      var price = num(item.price, 0);
      var unitCost = num(item.cost, 0);
      client += price * qty;
      cost += unitCost * qty;
      if (item.counted !== false) {
        countedClient += price * qty;
        countedCost += unitCost * qty;
      }
    });
    return {
      client: Math.round(client),
      cost: Math.round(cost),
      countedClient: Math.round(countedClient),
      countedCost: Math.round(countedCost),
      earnings: Math.round(countedClient - countedCost)
    };
  }

  function field(name, label, value, type) {
    return '<label class="field"><span>' + esc(label) + '</span>' +
      '<input data-f="' + name + '" type="' + (type || "text") + '" value="' + esc(value || "") + '"></label>';
  }

  function kindOptions(kind) {
    var options = [
      ["service", "Работа"],
      ["part", "Запчасть"],
      ["fluid", "Жидкость"],
      ["custom", "Своя строка"]
    ];
    return options.map(function (pair) {
      return '<option value="' + pair[0] + '"' + (kind === pair[0] ? " selected" : "") + '>' + pair[1] + '</option>';
    }).join("");
  }

  function itemHtml(item, index) {
    var qty = num(item.qty, 1);
    var price = num(item.price, 0);
    var cost = num(item.cost, 0);
    return '<div class="oitem" data-i="' + index + '">' +
      '<div class="oitem__row">' +
        '<select data-f="kind" aria-label="Тип">' + kindOptions(item.kind || "service") + '</select>' +
        '<input data-f="name" placeholder="Название" value="' + esc(item.name) + '">' +
      '</div>' +
      '<div class="oitem__row oitem__row--4">' +
        '<label class="field"><span>Кол-во</span><input data-f="qty" type="number" step="0.01" min="0" value="' + qty + '"></label>' +
        '<label class="field"><span>Ед.</span><input data-f="unit" value="' + esc(item.unit || "") + '"></label>' +
        '<label class="field"><span>Цена</span><input data-f="price" type="number" step="1" min="0" value="' + price + '"></label>' +
        '<label class="field"><span>Закупка</span><input data-f="cost" type="number" step="1" min="0" value="' + cost + '"></label>' +
      '</div>' +
      '<div class="oitem__bottom">' +
        '<label class="oitem__count"><input type="checkbox" data-f="counted"' + (item.counted !== false ? " checked" : "") + '> в заработке</label>' +
        '<button class="oitem__del" type="button" data-delitem>Удалить</button>' +
      '</div>' +
    '</div>';
  }

  function renderEditor() {
    if (!current) return;
    $("editorTitle").textContent = isNew ? "Новый заказ" : "Заказ";
    $("saveEditorBtn").textContent = isNew ? "Сохранить заказ" : "Сохранить изменения";
    $("deleteEditorBtn").hidden = isNew;

    var html = '<div class="editgrid">' +
      field("order_date", "Дата", current.order_date, "date") +
      field("vin", "VIN", current.vin) +
      field("make", "Марка", current.make) +
      field("model", "Модель", current.model) +
      field("plate", "Госномер", current.plate) +
      field("owner_name", "Владелец", current.owner_name) +
      field("owner_phone", "Телефон", current.owner_phone, "tel") +
      '</div>' +
      '<div class="oitems" id="oitems">' +
        (current.items.length
          ? current.items.map(itemHtml).join("")
          : '<p class="orders__empty">Пока нет позиций. Добавьте работу, запчасть или жидкость.</p>') +
      '</div>' +
      '<button class="additem" id="addItemBtn" type="button">+ Добавить позицию</button>';

    var body = $("editorBody");
    var scrollTop = body.scrollTop;
    body.innerHTML = html;
    body.scrollTop = scrollTop;
    updateEditorTotals();
  }

  function updateEditorTotals() {
    if (!current) return;
    var t = calcTotals(current.items);
    current.client_total = t.client;
    current.cost_total = t.cost;
    current.counted_client = t.countedClient;
    current.counted_cost = t.countedCost;
    current.earnings = t.earnings;
    current.revenue = t.countedClient;

    $("editorTotals").innerHTML =
      '<div class="editor__row"><span>Итого клиенту</span><b>' + rub(t.client) + '</b></div>' +
      '<div class="editor__row"><span>Без наценки</span><b>' + rub(t.cost) + '</b></div>' +
      '<div class="editor__row"><span>В заработок (по галочкам)</span><b>' + rub(t.countedClient) + '</b></div>' +
      '<div class="editor__row editor__row--grand"><span>Заработок</span><b>' + rub(t.earnings) + '</b></div>';
  }

  function openEditor(order, newOrder) {
    current = JSON.parse(JSON.stringify(order));
    isNew = !!newOrder;
    editorOpen = true;
    $("editorSheet").hidden = false;
    renderEditor();
    requestAnimationFrame(function () {
      $("editorSheet").classList.add("is-open");
    });
    $("editorBody").scrollTop = 0;
    try { history.pushState({ editor: 1 }, ""); } catch (e) { /* file:// */ }
  }

  function closeEditor(fromPop) {
    if (!editorOpen) return;
    editorOpen = false;
    $("editorSheet").classList.remove("is-open");
    setTimeout(function () {
      if (!editorOpen) $("editorSheet").hidden = true;
    }, 240);
    if (!fromPop) {
      try { history.back(); } catch (e) { /* ignore */ }
    }
  }

  function normalizeItem(item) {
    var kind = item.kind;
    if (kind !== "part" && kind !== "fluid" && kind !== "custom") kind = "service";
    return {
      kind: kind,
      name: str(item.name),
      qty: Math.max(num(item.qty, 1), 0.01),
      unit: str(item.unit),
      price: Math.max(num(item.price, 0), 0),
      cost: Math.max(num(item.cost, 0), 0),
      counted: item.counted !== false
    };
  }

  function saveEditor() {
    if (!current) return;
    var items = (current.items || []).map(normalizeItem).filter(function (item) { return item.name; });
    if (!items.length) {
      toast("Добавьте хотя бы одну позицию с названием");
      return;
    }

    var t = calcTotals(items);
    var payload = {
      order_date: current.order_date || todayISO(),
      vin: str(current.vin),
      make: str(current.make),
      model: str(current.model),
      plate: str(current.plate),
      owner_name: str(current.owner_name),
      owner_phone: str(current.owner_phone),
      note: str(current.note),
      items: items,
      client_total: t.client,
      cost_total: t.cost,
      counted_client: t.countedClient,
      counted_cost: t.countedCost,
      earnings: t.earnings,
      revenue: t.countedClient,
      status: "done"
    };

    var btn = $("saveEditorBtn");
    btn.disabled = true;
    var request = isNew ? R44DB.createOrder(payload) : R44DB.updateOrder(current.id, payload);
    request.then(function () {
      btn.disabled = false;
      toast(isNew ? "Заказ создан" : "Заказ обновлён");
      closeEditor(true);
      loadOrders();
    }).catch(function (err) {
      btn.disabled = false;
      toast("Не удалось сохранить: " + (err && err.message ? err.message : err));
    });
  }

  function deleteCurrent() {
    if (!current || !current.id) return;
    if (!window.confirm("Удалить этот заказ?")) return;
    R44DB.deleteOrder(current.id).then(function () {
      toast("Заказ удалён");
      closeEditor(true);
      loadOrders();
    }).catch(function (err) {
      toast("Не удалось удалить: " + (err && err.message ? err.message : err));
    });
  }

  function actCurrent() {
    if (!current) return;
    var t = calcTotals(current.items);
    var order = {
      id: current.id,
      order_date: current.order_date,
      vin: current.vin,
      make: current.make,
      model: current.model,
      plate: current.plate,
      owner_name: current.owner_name,
      owner_phone: current.owner_phone,
      items: (current.items || []).map(normalizeItem),
      client_total: t.client
    };
    R44Act.print(order);
  }

  /* ---------- события ---------- */

  function bind() {
    $("setupForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var url = $("setupUrl").value.trim();
      var key = $("setupKey").value.trim();
      if (!/^https:\/\/.+/i.test(url)) {
        toast("Project URL должен начинаться с https://");
        return;
      }
      if (key.length < 20) {
        toast("Вставьте anon public key");
        return;
      }
      R44DB.saveConfig(url, key);
      toast("Настройки сохранены");
      if (R44DB.isSignedIn()) openMain();
      else setView("login");
    });

    $("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("loginEmail").value.trim();
      var password = $("loginPassword").value;
      if (!email || !password) {
        setStatus("Введите email и пароль", true);
        return;
      }
      setStatus("Вход…", false);
      R44DB.signIn(email, password).then(function () {
        setStatus("", false);
        $("loginPassword").value = "";
        openMain();
      }).catch(function (err) {
        setStatus("Не удалось войти: " + (err && err.message ? err.message : err), true);
      });
    });

    $("signupBtn").addEventListener("click", function () {
      var email = $("loginEmail").value.trim();
      var password = $("loginPassword").value;
      if (!email || password.length < 6) {
        setStatus("Укажите email и пароль не короче 6 символов", true);
        return;
      }
      setStatus("Создаю аккаунт…", false);
      R44DB.signUp(email, password).then(function (result) {
        if (result && result.needsConfirm) {
          setStatus("Аккаунт создан. Подтвердите почту, затем войдите.", false);
        } else {
          setStatus("", false);
          openMain();
        }
      }).catch(function (err) {
        setStatus("Не удалось создать аккаунт: " + (err && err.message ? err.message : err), true);
      });
    });

    $("resetConfigBtn").addEventListener("click", function () {
      R44DB.signOut().then(function () {
        R44DB.clearConfig();
        $("setupUrl").value = "";
        $("setupKey").value = "";
        setView("setup");
      });
    });

    $("logoutBtn").addEventListener("click", function () {
      R44DB.signOut().then(function () {
        allOrders = [];
        setView("login");
        setStatus("", false);
      });
    });

    $("newOrderBtn").addEventListener("click", function () {
      openEditor(blankOrder(), true);
    });

    $("refreshBtn").addEventListener("click", loadOrders);

    $("fromDate").addEventListener("change", render);
    $("toDate").addEventListener("change", render);

    document.querySelectorAll("[data-period]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-period");
        if (kind === "month") {
          $("fromDate").value = monthStartISO();
          $("toDate").value = todayISO();
        } else if (kind === "year") {
          $("fromDate").value = yearStartISO();
          $("toDate").value = todayISO();
        } else {
          var dates = allOrders.map(function (o) { return o.order_date; }).filter(Boolean).sort();
          $("fromDate").value = dates.length ? dates[0] : "";
          $("toDate").value = todayISO();
        }
        render();
      });
    });

    $("ordersList").addEventListener("click", function (e) {
      var card = e.target.closest(".order-card");
      if (!card) return;
      var id = card.getAttribute("data-id");
      var order = allOrders.filter(function (item) { return String(item.id) === String(id); })[0];
      if (!order) return;

      if (e.target.closest("[data-open]")) {
        openEditor(order, false);
      } else if (e.target.closest("[data-act]")) {
        R44Act.print(order);
      } else if (e.target.closest("[data-del]")) {
        if (!window.confirm("Удалить заказ от " + fmtDate(order.order_date) + "?")) return;
        R44DB.deleteOrder(order.id).then(function () {
          toast("Заказ удалён");
          loadOrders();
        }).catch(function (err) {
          toast("Не удалось удалить: " + (err && err.message ? err.message : err));
        });
      }
    });

    $("editorBody").addEventListener("input", function (e) {
      var el = e.target.closest("[data-f]");
      if (!el || !current) return;
      var fieldName = el.getAttribute("data-f");
      var value = el.type === "checkbox" ? el.checked : el.value;
      var itemEl = el.closest(".oitem");
      if (itemEl) {
        var index = parseInt(itemEl.getAttribute("data-i"), 10);
        if (current.items[index]) current.items[index][fieldName] = value;
      } else {
        current[fieldName] = value;
      }
      updateEditorTotals();
    });

    $("editorBody").addEventListener("change", function (e) {
      var el = e.target.closest("[data-f]");
      if (!el) return;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    $("editorBody").addEventListener("click", function (e) {
      if (e.target.closest("#addItemBtn")) {
        current.items.push({ kind: "service", name: "", qty: 1, unit: "", price: 0, cost: 0, counted: true });
        renderEditor();
        var names = $("editorBody").querySelectorAll('[data-f="name"]');
        if (names.length) names[names.length - 1].focus();
        $("editorBody").scrollTop = $("editorBody").scrollHeight;
        return;
      }

      var del = e.target.closest("[data-delitem]");
      if (del) {
        var itemEl = del.closest(".oitem");
        var index = parseInt(itemEl.getAttribute("data-i"), 10);
        if (current.items[index]) current.items.splice(index, 1);
        renderEditor();
      }
    });

    $("saveEditorBtn").addEventListener("click", saveEditor);
    $("deleteEditorBtn").addEventListener("click", deleteCurrent);
    $("actEditorBtn").addEventListener("click", actCurrent);

    $("editorSheet").addEventListener("click", function (e) {
      if (e.target.closest("[data-eclose]")) closeEditor();
    });

    window.addEventListener("popstate", function () {
      if (editorOpen) closeEditor(true);
    });
  }

  /* ---------- старт ---------- */

  bind();
  prefillSetup();

  if (!R44DB.hasConfig()) {
    setView("setup");
  } else if (!R44DB.isSignedIn()) {
    setView("login");
  } else {
    openMain();
  }
})();
