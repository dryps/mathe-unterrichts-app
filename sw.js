const CACHE_NAME = "mathe-unterrichts-app-v19";
const NAVIGATION_FALLBACK = "./index.html";
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
  "./zahlengerade.html",
  "./number-line.css",
  "./src/number-line-app.js",
  "./src/number-line-animation.js",
  "./src/number-line-geometry.js",
  "./src/number-line-state.js",
  "./ordnung.html",
  "./order-number-line.css",
  "./src/order-number-line-app.js",
  "./src/order-number-line-animation.js",
  "./src/order-number-line-geometry.js",
  "./src/order-number-line-state.js",
  "./betrag.html",
  "./absolute-value.css",
  "./src/absolute-value-app.js",
  "./src/absolute-value-animation.js",
  "./src/absolute-value-geometry.js",
  "./src/absolute-value-state.js",
  "./addition-negativ.html",
  "./addition-negative.css",
  "./src/addition-negative-app.js",
  "./src/addition-negative-animation.js",
  "./src/addition-negative-geometry.js",
  "./src/addition-negative-state.js",
  "./subtraktion-negativ.html",
  "./subtraction-negative.css",
  "./src/subtraction-negative-app.js",
  "./src/subtraction-negative-animation.js",
  "./src/subtraction-negative-geometry.js",
  "./src/subtraction-negative-state.js",
  "./multiplikation-negativ.html",
  "./multiplication-negative.css",
  "./src/multiplication-negative-app.js",
  "./src/multiplication-negative-animation.js",
  "./src/multiplication-negative-geometry.js",
  "./src/multiplication-negative-state.js",
  "./terme-variablen.html",
  "./terms-variables.css",
  "./src/terms-variables-app.js",
  "./src/terms-variables-math.js",
  "./src/terms-variables-state.js",
  "./gleichartige-terme.html",
  "./like-terms.css",
  "./src/like-terms-app.js",
  "./src/like-terms-math.js",
  "./src/like-terms-state.js",
  "./src/like-terms-animation.js",
  "./terme-multiplizieren.html",
  "./term-multiplication.css",
  "./src/term-multiplication-app.js",
  "./src/term-multiplication-math.js",
  "./src/term-multiplication-state.js",
  "./src/term-multiplication-animation.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./robots.txt",
  "./404.html",
];

function scopedRequest(path) {
  return new Request(new URL(path, self.registration.scope), {
    cache: "reload",
    credentials: "same-origin",
    redirect: "error",
  });
}

function isSafeRuntimeResponse(response) {
  if (!response.ok || response.redirected) return false;
  if (response.type !== "basic" && response.type !== "default") return false;
  if (!response.url) return true;
  const url = new URL(response.url);
  return url.origin === self.location.origin && url.href.startsWith(self.registration.scope);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES.map(scopedRequest)))
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

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(async (networkResponse) => {
          if (isSafeRuntimeResponse(networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(event.request)) ??
            (await cache.match(new URL(NAVIGATION_FALLBACK, self.registration.scope).href)) ??
            Response.error()
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      const networkResponse = await fetch(event.request);
      if (isSafeRuntimeResponse(networkResponse)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    }),
  );
});
