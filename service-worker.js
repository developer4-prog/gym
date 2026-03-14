const CACHE_NAME = "gym-app-v2";

const urlsToCache = [
  "/gym/",
  "/gym/index.html",
  "/gym/html/index.html",
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
  "/gym/imagenes/fondo.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});