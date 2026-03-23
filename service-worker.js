const CACHE_NAME = "gym-app-v10.46";
const BASE_PATH = self.location.pathname.replace(/\/service-worker\.js$/, "");

const urlsToCache = [
  `${BASE_PATH}/`,
  // `${BASE_PATH}/index.html`, // probable ruta mala, la quitamos por ahora
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
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log("Cacheado:", url);
        } catch (error) {
          console.error("No se pudo cachear:", url, error);
        }
      }
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );

      await self.clients.claim();
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(req);
          return cachedResponse || caches.match(`${BASE_PATH}/html/index.html`);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return networkResponse;
      });
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
