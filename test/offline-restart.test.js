import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const workerSource = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const origin = "https://mathe-app.test";

function createWorkerHarness() {
  const listeners = new Map();
  const stores = new Map([
    ["mathe-unterrichts-app-v25", new Map([["old", new Response("alt")]])],
  ]);
  let claimed = false;
  let skipped = false;
  let networkCalls = 0;

  function normalize(request) {
    if (typeof request === "string") return new URL(request, `${origin}/`).href;
    return request.url;
  }

  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(paths) {
          for (const path of paths) {
            const key = normalize(path);
            store.set(key, new Response(`offline:${new URL(key).pathname}`, { status: 200 }));
          }
        },
        async put(request, response) {
          store.set(normalize(request), response);
        },
        async match(request) {
          const response = store.get(normalize(request));
          return response?.clone();
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(request) {
      const key = normalize(request);
      for (const store of stores.values()) {
        if (store.has(key)) return store.get(key).clone();
      }
      return undefined;
    },
  };

  const context = vm.createContext({
    Request,
    URL,
    Response,
    caches,
    fetch: async () => {
      networkCalls += 1;
      throw new TypeError("Netzwerk ist im Flugmodus nicht verfügbar.");
    },
    self: {
      location: { origin },
      registration: { scope: `${origin}/` },
      clients: {
        async claim() {
          claimed = true;
        },
      },
      addEventListener(type, listener) {
        listeners.set(type, listener);
      },
      async skipWaiting() {
        skipped = true;
      },
    },
  });
  vm.runInContext(workerSource, context);

  async function dispatchLifecycle(type) {
    let pending;
    listeners.get(type)({
      waitUntil(promise) {
        pending = promise;
      },
    });
    await pending;
  }

  async function dispatchFetch(path, mode = "same-origin") {
    let responsePromise;
    listeners.get("fetch")({
      request: {
        method: "GET",
        mode,
        url: new URL(path, `${origin}/`).href,
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });
    return responsePromise;
  }

  return {
    stores,
    dispatchLifecycle,
    dispatchFetch,
    get claimed() {
      return claimed;
    },
    get skipped() {
      return skipped;
    },
    get networkCalls() {
      return networkCalls;
    },
  };
}

test("Installation füllt Version 28 vollständig und Aktivierung entfernt ältere Versionen", async () => {
  const harness = createWorkerHarness();
  await harness.dispatchLifecycle("install");
  await harness.dispatchLifecycle("activate");

  assert.equal(harness.skipped, true);
  assert.equal(harness.claimed, true);
  assert.deepEqual([...harness.stores.keys()], ["mathe-unterrichts-app-v28"]);
  const current = harness.stores.get("mathe-unterrichts-app-v28");
  for (const path of [
    "./",
    "./index.html",
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
    "./terme-dividieren.html",
    "./term-division.css",
    "./src/term-division-app.js",
    "./src/term-division-math.js",
    "./src/term-division-state.js",
    "./src/term-division-animation.js",
    "./plus-minus-klammern.html",
    "./bracket-sign.css",
    "./src/bracket-sign-app.js",
    "./src/bracket-sign-math.js",
    "./src/bracket-sign-state.js",
    "./src/bracket-sign-animation.js",
    "./ausmultiplizieren.html",
    "./distribution.css",
    "./src/distribution-app.js",
    "./src/distribution-math.js",
    "./src/distribution-state.js",
    "./src/distribution-animation.js",
    "./aequivalenzumformungen.html",
    "./equivalence.css",
    "./src/equivalence-app.js",
    "./src/equivalence-math.js",
    "./src/equivalence-state.js",
    "./src/equivalence-animation.js",
    "./terme-beide-seiten.html",
    "./both-sides.css",
    "./src/both-sides-app.js",
    "./src/both-sides-math.js",
    "./src/both-sides-state.js",
    "./src/both-sides-animation.js",
    "./ungleichungen-negativ.html",
    "./negative-inequality.css",
    "./src/negative-inequality-app.js",
    "./src/negative-inequality-math.js",
    "./src/negative-inequality-state.js",
    "./src/negative-inequality-animation.js",
    "./loesungsmengen.html",
    "./solution-set.css",
    "./solution-set-steps.css",
    "./src/solution-set-app.js",
    "./src/solution-set-math.js",
    "./src/solution-set-state.js",
    "./src/solution-set-animation.js",
  ]) {
    assert.equal(current.has(new URL(path, `${origin}/`).href), true);
  }
});

test("Offline-Neustart liefert Startseite und alle Kapitel ohne Netzwerk aus", async () => {
  const harness = createWorkerHarness();
  await harness.dispatchLifecycle("install");
  await harness.dispatchLifecycle("activate");

  for (const path of [
    "/",
    "/index.html",
    "/winkelhalbierende.html",
    "/incircle.css",
    "/src/incircle-app.js",
    "/src/incircle-geometry.js",
    "/src/incircle-state.js",
    "/eindeutige-dreiecke.html",
    "/unique-triangles.css",
    "/src/unique-triangles-app.js",
    "/src/unique-triangles-animation.js",
    "/src/unique-triangles-geometry.js",
    "/src/unique-triangles-state.js",
    "/zahlengerade.html",
    "/number-line.css",
    "/src/number-line-app.js",
    "/src/number-line-animation.js",
    "/src/number-line-geometry.js",
    "/src/number-line-state.js",
    "/ordnung.html",
    "/order-number-line.css",
    "/src/order-number-line-app.js",
    "/src/order-number-line-animation.js",
    "/src/order-number-line-geometry.js",
    "/src/order-number-line-state.js",
    "/betrag.html",
    "/absolute-value.css",
    "/src/absolute-value-app.js",
    "/src/absolute-value-animation.js",
    "/src/absolute-value-geometry.js",
    "/src/absolute-value-state.js",
    "/addition-negativ.html",
    "/addition-negative.css",
    "/src/addition-negative-app.js",
    "/src/addition-negative-animation.js",
    "/src/addition-negative-geometry.js",
    "/src/addition-negative-state.js",
    "/subtraktion-negativ.html",
    "/subtraction-negative.css",
    "/src/subtraction-negative-app.js",
    "/src/subtraction-negative-animation.js",
    "/src/subtraction-negative-geometry.js",
    "/src/subtraction-negative-state.js",
    "/multiplikation-negativ.html",
    "/multiplication-negative.css",
    "/src/multiplication-negative-app.js",
    "/src/multiplication-negative-animation.js",
    "/src/multiplication-negative-geometry.js",
    "/src/multiplication-negative-state.js",
    "/terme-variablen.html",
    "/terms-variables.css",
    "/src/terms-variables-app.js",
    "/src/terms-variables-math.js",
    "/src/terms-variables-state.js",
    "/gleichartige-terme.html",
    "/like-terms.css",
    "/src/like-terms-app.js",
    "/src/like-terms-math.js",
    "/src/like-terms-state.js",
    "/src/like-terms-animation.js",
    "/terme-multiplizieren.html",
    "/term-multiplication.css",
    "/src/term-multiplication-app.js",
    "/src/term-multiplication-math.js",
    "/src/term-multiplication-state.js",
    "/src/term-multiplication-animation.js",
    "/terme-dividieren.html",
    "/term-division.css",
    "/src/term-division-app.js",
    "/src/term-division-math.js",
    "/src/term-division-state.js",
    "/src/term-division-animation.js",
    "/plus-minus-klammern.html",
    "/bracket-sign.css",
    "/src/bracket-sign-app.js",
    "/src/bracket-sign-math.js",
    "/src/bracket-sign-state.js",
    "/src/bracket-sign-animation.js",
    "/ausmultiplizieren.html",
    "/distribution.css",
    "/src/distribution-app.js",
    "/src/distribution-math.js",
    "/src/distribution-state.js",
    "/src/distribution-animation.js",
    "/aequivalenzumformungen.html",
    "/equivalence.css",
    "/src/equivalence-app.js",
    "/src/equivalence-math.js",
    "/src/equivalence-state.js",
    "/src/equivalence-animation.js",
    "/terme-beide-seiten.html",
    "/both-sides.css",
    "/src/both-sides-app.js",
    "/src/both-sides-math.js",
    "/src/both-sides-state.js",
    "/src/both-sides-animation.js",
    "/ungleichungen-negativ.html",
    "/negative-inequality.css",
    "/src/negative-inequality-app.js",
    "/src/negative-inequality-math.js",
    "/src/negative-inequality-state.js",
    "/src/negative-inequality-animation.js",
    "/loesungsmengen.html",
    "/solution-set.css",
    "/solution-set-steps.css",
    "/src/solution-set-app.js",
    "/src/solution-set-math.js",
    "/src/solution-set-state.js",
    "/src/solution-set-animation.js",
  ]) {
    const response = await harness.dispatchFetch(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /^offline:/);
  }
  assert.equal(harness.networkCalls, 0);
});

test("Offline-Navigation auf einen unbekannten Pfad fällt kontrolliert auf die Startseite zurück", async () => {
  const harness = createWorkerHarness();
  await harness.dispatchLifecycle("install");
  await harness.dispatchLifecycle("activate");

  const response = await harness.dispatchFetch("/nicht-vorhanden", "navigate");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "offline:/index.html");
  assert.equal(harness.networkCalls, 1);
});
