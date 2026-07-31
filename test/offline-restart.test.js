import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const workerSource = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const origin = "https://mathe-app.test";

function createWorkerHarness() {
  const listeners = new Map();
  const stores = new Map([
    ["mathe-unterrichts-app-v11", new Map([["old", new Response("alt")]])],
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
            store.set(normalize(path), new Response(`offline:${path}`, { status: 200 }));
          }
        },
        async put(request, response) {
          store.set(normalize(request), response);
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
    URL,
    Response,
    caches,
    fetch: async () => {
      networkCalls += 1;
      throw new TypeError("Netzwerk ist im Flugmodus nicht verfügbar.");
    },
    self: {
      location: { origin },
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

  async function dispatchFetch(path) {
    let responsePromise;
    listeners.get("fetch")({
      request: new Request(new URL(path, `${origin}/`), { method: "GET" }),
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

test("Installation füllt Version 12 vollständig und Aktivierung entfernt alte Caches", async () => {
  const harness = createWorkerHarness();
  await harness.dispatchLifecycle("install");
  await harness.dispatchLifecycle("activate");

  assert.equal(harness.skipped, true);
  assert.equal(harness.claimed, true);
  assert.deepEqual([...harness.stores.keys()], ["mathe-unterrichts-app-v12"]);
  const current = harness.stores.get("mathe-unterrichts-app-v12");
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
  ]) {
    const response = await harness.dispatchFetch(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /^offline:/);
  }
  assert.equal(harness.networkCalls, 0);
});
