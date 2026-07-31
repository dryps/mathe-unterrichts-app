const CACHE_NAME = "mathe-unterrichts-app-v9";
const APP_FILES = [
  "./",
  "./index.html",
  "./home.css",
  "./navigation.css",
  "./src/shell.js",
  "./winkelsumme.html",
  "./styles.css",
  "./src/app.js",
  "./src/geometry.js",
  "./dreiecksungleichung.html",
  "./triangle-inequality.css",
  "./src/triangle-inequality-app.js",
  "./src/triangle-inequality-geometry.js",
  "./dreiecksflaeche.html",
  "./triangle-area.css",
  "./src/triangle-area-app.js",
  "./src/triangle-area-animation.js",
  "./src/triangle-area-geometry.js",
  "./src/triangle-area-state.js",
  "./mittelsenkrechten.html",
  "./circumcircle.css",
  "./src/circumcircle-app.js",
  "./src/circumcircle-geometry.js",
  "./src/circumcircle-state.js",
  "./winkelhalbierende.html",
  "./incircle.css",
  "./src/incircle-app.js",
  "./src/incircle-geometry.js",
  "./src/incircle-state.js",
  "./eindeutige-dreiecke.html",
  "./unique-triangles.css",
  "./src/unique-triangles-app.js",
  "./src/unique-triangles-animation.js",
  "./src/unique-triangles-geometry.js",
  "./src/unique-triangles-state.js",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cachedResponse) =>
        cachedResponse ??
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }),
    ),
  );
});
