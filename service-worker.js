const CACHE_NAME = "gym-app-v10.1";
const BASE_PATH = self.location.pathname.replace(/\/service-worker\.js$/, "");

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/html/index.html`,
  `${BASE_PATH}/html/login.html`,
  `${BASE_PATH}/html/dashboard.html`,
  `${BASE_PATH}/html/historial.html`,
  `${BASE_PATH}/html/workout.html`,
  `${BASE_PATH}/html/tienda.html`,
  `${BASE_PATH}/html/gym-info.html`,
  `${BASE_PATH}/html/admin.html`,
  `${BASE_PATH}/html/admin-ventas.html`,
  `${BASE_PATH}/css/global.css`,
  `${BASE_PATH}/css/login.css`,
  `${BASE_PATH}/css/dashboard.css`,
  `${BASE_PATH}/css/gym-info.css`,
  `${BASE_PATH}/css/admin.css`,
  `${BASE_PATH}/js/login.js`,
  `${BASE_PATH}/js/firebase-config.js`,
  `${BASE_PATH}/js/admin-ventas.js`,
  `${BASE_PATH}/imagenes/fondo.jpg`,
  `${BASE_PATH}/imagenes/agua.jpg`,
  `${BASE_PATH}/imagenes/te.jpg`,
  `${BASE_PATH}/imagenes/powerade.jpg`,
  `${BASE_PATH}/imagenes/gatorade.jpg`,
  `${BASE_PATH}/imagenes/monster.jpg`,
  `${BASE_PATH}/imagenes/icon-192.png`,
  `${BASE_PATH}/imagenes/icon-512.png`,
  `${BASE_PATH}/manifest.json`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            return cachedResponse || caches.match(`${BASE_PATH}/index.html`);
          });
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(req).then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return networkResponse;
      });
    }),
  );
});
