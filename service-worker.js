const CACHE_NAME = "gym-app-v8";

const urlsToCache = [
  "/gym/",
  "/gym/index.html",
  "/gym/html/index.html",
  "/gym/html/login.html",
  "/gym/html/dashboard.html",
  "/gym/html/historial.html",
  "/gym/html/workout.html",
  "/gym/html/tienda.html",
  "/gym/html/gym-info.html",
  "/gym/css/global.css",
  "/gym/css/login.css",
  "/gym/css/dashboard.css",
  "/gym/css/gym-info.css",
  "/gym/js/login.js",
  "/gym/js/firebase-config.js",
  "/gym/imagenes/fondo.jpg",
];

// INSTALAR
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
  self.skipWaiting();
});

// ACTIVAR
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

// FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const req = event.request;
  const url = new URL(req.url);

  // HTML: red primero
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
            return cachedResponse || caches.match("/gym/index.html");
          });
        }),
    );
    return;
  }

  // CSS y JS: red primero, fallback a caché
  if (url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return networkResponse;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  // Imágenes: caché primero
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
