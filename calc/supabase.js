/* Ремонтус44 — небольшой клиент Supabase без внешних библиотек.
   Умеет: настройки проекта, вход по email/паролю, обновление сессии,
   чтение/создание/изменение/удаление заказов через REST.
   Ключ service_role здесь использовать нельзя — только anon public key. */
(function () {
  "use strict";

  var CONFIG_KEY = "remontus44.supabase.v1";
  var SESSION_KEY = "remontus44.supabase.session.v1";

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* приватный режим */ }
  }

  function removeKey(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function normalizeUrl(url) {
    return String(url || "").trim().replace(/\/+$/, "");
  }

  function getConfig() {
    var local = readJson(CONFIG_KEY) || {};
    var base = window.SUPABASE_CONFIG || {};
    return {
      url: normalizeUrl(local.url || base.url || ""),
      anonKey: String(local.anonKey || base.anonKey || "").trim()
    };
  }

  function hasConfig() {
    var c = getConfig();
    return /^https:\/\/.+/i.test(c.url) && c.anonKey.length > 20;
  }

  function saveConfig(url, anonKey) {
    var c = {
      url: normalizeUrl(url),
      anonKey: String(anonKey || "").trim()
    };
    writeJson(CONFIG_KEY, c);
    return c;
  }

  function clearConfig() {
    removeKey(CONFIG_KEY);
  }

  function getSession() {
    var s = readJson(SESSION_KEY);
    if (!s || !s.access_token) return null;
    return s;
  }

  function saveSession(data) {
    var s = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (parseInt(data.expires_in, 10) || 3600) * 1000,
      email: (data.user && data.user.email) || "",
      user_id: (data.user && data.user.id) || ""
    };
    writeJson(SESSION_KEY, s);
    return s;
  }

  function clearSession() {
    removeKey(SESSION_KEY);
  }

  function isSignedIn() {
    var s = getSession();
    if (!s) return false;
    return s.expires_at > Date.now() + 5000 || !!s.refresh_token;
  }

  function parseError(res, body) {
    var msg = "";
    if (body) {
      if (typeof body === "string") msg = body;
      else if (body.message) msg = body.message;
      else if (body.error_description) msg = body.error_description;
      else if (body.msg) msg = body.msg;
      else if (body.error) msg = body.error;
    }
    if (!msg) msg = "HTTP " + res.status;
    return new Error(msg);
  }

  function authRequest(path, body) {
    var c = getConfig();
    if (!c.url || !c.anonKey) return Promise.reject(new Error("Supabase не настроен"));
    return fetch(c.url + path, {
      method: "POST",
      headers: { "apikey": c.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) throw parseError(res, data);
        return data;
      });
    });
  }

  function signIn(email, password) {
    return authRequest("/auth/v1/token?grant_type=password", {
      email: email,
      password: password
    }).then(function (data) { return saveSession(data); });
  }

  function signUp(email, password) {
    return authRequest("/auth/v1/signup", {
      email: email,
      password: password
    }).then(function (data) {
      if (data && data.access_token) return saveSession(data);
      return { needsConfirm: true, email: email };
    });
  }

  function refreshSession() {
    var s = getSession();
    if (!s || !s.refresh_token) return Promise.reject(new Error("Нет сессии"));
    return authRequest("/auth/v1/token?grant_type=refresh_token", {
      refresh_token: s.refresh_token
    }).then(function (data) { return saveSession(data); });
  }

  function ensureSession() {
    var s = getSession();
    if (!s) return Promise.reject(new Error("Нужно войти в базу заказов"));
    if (s.expires_at > Date.now() + 60000) return Promise.resolve(s);
    return refreshSession().catch(function (e) {
      clearSession();
      throw e;
    });
  }

  function rest(path, options) {
    options = options || {};
    return ensureSession().then(function (s) {
      var c = getConfig();
      var headers = {
        "apikey": c.anonKey,
        "Authorization": "Bearer " + s.access_token,
        "Content-Type": "application/json"
      };
      if (options.prefer) headers["Prefer"] = options.prefer;
      return fetch(c.url + "/rest/v1/" + path, {
        method: options.method || "GET",
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: "no-store"
      }).then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
          if (!res.ok) throw parseError(res, data);
          return data;
        });
      });
    });
  }

  function listOrders() {
    return rest("orders?select=*&order=order_date.desc,created_at.desc");
  }

  function createOrder(order) {
    return rest("orders", {
      method: "POST",
      body: order,
      prefer: "return=representation"
    }).then(function (rows) { return Array.isArray(rows) ? rows[0] : rows; });
  }

  function updateOrder(id, patch) {
    return rest("orders?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      body: patch,
      prefer: "return=representation"
    }).then(function (rows) { return Array.isArray(rows) ? rows[0] : rows; });
  }

  function deleteOrder(id) {
    return rest("orders?id=eq." + encodeURIComponent(id), { method: "DELETE" });
  }

  function signOut() {
    var s = getSession();
    clearSession();
    if (!s) return Promise.resolve();
    var c = getConfig();
    return fetch(c.url + "/auth/v1/logout", {
      method: "POST",
      headers: {
        "apikey": c.anonKey,
        "Authorization": "Bearer " + s.access_token,
        "Content-Type": "application/json"
      }
    }).catch(function () { /* сеть не важна */ }).then(function () { /* ready */ });
  }

  window.R44DB = {
    getConfig: getConfig,
    hasConfig: hasConfig,
    saveConfig: saveConfig,
    clearConfig: clearConfig,
    getSession: getSession,
    isSignedIn: isSignedIn,
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    refresh: refreshSession,
    listOrders: listOrders,
    createOrder: createOrder,
    updateOrder: updateOrder,
    deleteOrder: deleteOrder
  };
})();
