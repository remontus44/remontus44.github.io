/* Ремонтус44 — калькулятор: офлайн-кеш. Меняете файлы — поднимите версию. */

var CACHE = "remontus44-calc-v19";

var ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./orders.html",
  "./orders.css",
  "./orders.js",
  "./supabase-config.js",
  "./supabase.js",
  "./act.js",
  "./data/cars.js",
  "./data/labor.js",
  "./data/guides.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  var sameOrigin = false;
  try { sameOrigin = new URL(e.request.url).origin === self.location.origin; } catch (err) { sameOrigin = false; }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;

      return fetch(e.request).then(function (res) {
        if (sameOrigin && res && res.ok && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function (err) {
        if (e.request.mode === "navigate") {
          return caches.match(/orders\.html/i.test(e.request.url) ? "./orders.html" : "./index.html");
        }
        throw err;
      });
    })
  );
});
