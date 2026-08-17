import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const styleValues = new Map();
  return {
    id,
    dataset: {},
    hidden: false,
    disabled: false,
    textContent: "",
    value: "",
    style: {
      setProperty(name, value) {
        styleValues.set(name, String(value));
      },
      getPropertyValue(name) {
        return styleValues.get(name) ?? "";
      },
    },
    classList: {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      return listeners.get(type)?.({ currentTarget: this, target: this, ...event });
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = [
    "term-division-board",
    "term-division-irritation",
    "term-division-factors",
    "term-division-packages",
    "term-division-division",
    "term-division-result",
    "term-division-explore",
    "term-division-conclusion",
    "factor-formula",
    "package-equation",
    "group-caption",
    "division-formula",
    "division-question",
    "result-equation",
    "group-control",
    "group-value",
    "term-division-insight",
    "term-division-live",
    "term-division-next",
    "term-division-reset",
    "division-package-1",
    "division-package-2",
    "division-package-3",
    "division-package-4",
    "division-package-5",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const animationFrames = [];
  const timerCallbacks = [];

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector(selector) {
        return ids.get(selector) ?? null;
      },
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia() {
        return { matches: reducedMotion };
      },
      addEventListener() {},
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value() {},
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value(callback) {
      timerCallbacks.push(callback);
      return timerCallbacks.length;
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    configurable: true,
    value() {},
  });

  await import(`../src/term-division-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, animationFrames, timerCallbacks };
}

test("Weiter zeigt alle sieben Lernansichten in der vereinbarten Reihenfolge", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-division-next");
  const board = setup.ids.get("#term-division-board");

  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#term-division-irritation").hidden, false);

  next.dispatch("click");
  assert.equal(board.dataset.state, "factors");
  assert.equal(setup.ids.get("#factor-formula").textContent, "3 · (4x)");

  next.dispatch("click");
  assert.equal(board.dataset.state, "groups");
  assert.equal(setup.ids.get("#group-caption").textContent, "3 gleiche Gruppen mit je 4x");

  next.dispatch("click");
  assert.equal(board.dataset.state, "division");
  assert.equal(setup.ids.get("#term-division-division").hidden, false);
  assert.equal(setup.ids.get("#term-division-result").hidden, true);

  next.dispatch("click");
  assert.equal(board.dataset.state, "result");
  assert.equal(setup.ids.get("#result-equation").textContent, "(3 · 4 · x) : 3 = 4x");

  next.dispatch("click");
  assert.equal(board.dataset.state, "explore");
  assert.equal(next.hidden, true);
  assert.equal(setup.ids.get("#group-control").disabled, false);
});

test("Mehrfachtipps überholen den gesperrten Gruppenaufbau nicht", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#term-division-next");
  const reset = setup.ids.get("#term-division-reset");
  const board = setup.ids.get("#term-division-board");

  next.dispatch("click");
  next.dispatch("click");
  assert.equal(board.dataset.state, "building");
  assert.equal(next.disabled, true);
  assert.equal(reset.disabled, false);
  assert.equal(setup.animationFrames.length, 1);

  next.dispatch("click");
  assert.equal(board.dataset.state, "building");
  assert.equal(setup.animationFrames.length, 1);

  setup.animationFrames[0](0);
  setup.animationFrames.at(-1)(1000);
  assert.equal(board.dataset.state, "groups");
  assert.equal(next.disabled, false);
});

test("Reset beendet den Aufbau und neutralisiert verspätete RAF- und Timer-Rückrufe", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#term-division-next");
  const reset = setup.ids.get("#term-division-reset");
  const board = setup.ids.get("#term-division-board");

  next.dispatch("click");
  next.dispatch("click");
  const queuedFrame = setup.animationFrames[0];
  const queuedFallback = setup.timerCallbacks[0];
  reset.dispatch("click");

  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#division-package-1").style.getPropertyValue("--package-progress"), "0");
  queuedFrame(1000);
  queuedFallback();
  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#term-division-result").hidden, true);
});

test("Timeout-Fallback beendet den Gruppenaufbau ohne Animationsframe", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#term-division-next");
  next.dispatch("click");
  next.dispatch("click");

  assert.equal(setup.timerCallbacks.length, 1);
  setup.timerCallbacks[0]();
  assert.equal(setup.ids.get("#term-division-board").dataset.state, "groups");
});

test("Regler synchronisiert Faktor, Divisor, Pakete, Ergebnis und Live-Text", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-division-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");

  const slider = setup.ids.get("#group-control");
  slider.value = "5";
  slider.dispatch("input");

  assert.equal(setup.ids.get("#term-division-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#group-value").textContent, "5 gleiche Gruppen");
  assert.equal(setup.ids.get("#division-formula").textContent, "(5 · 4 · x) : 5");
  assert.equal(setup.ids.get("#result-equation").textContent, "(5 · 4 · x) : 5 = 4x");
  assert.equal(setup.ids.get("#division-package-5").hidden, false);
  assert.equal(setup.ids.get("#term-division-conclusion").hidden, false);
  assert.match(setup.ids.get("#term-division-live").textContent, /fünf|5 gleiche Pakete/i);
});

test("Division markiert repräsentativ genau eine Gruppe ohne andere zu durchstreichen", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-division-next");
  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");

  assert.equal(setup.ids.get("#division-package-1").classList.contains("is-chosen"), true);
  assert.equal(setup.ids.get("#division-package-2").classList.contains("is-muted"), true);
  assert.equal(
    setup.ids.get("#division-package-1").getAttribute("aria-label"),
    "Gruppe 1 von 3 mit vier x-Bausteinen; ihr Inhalt wird bestimmt",
  );
});

test("Reset stellt nach freier Erkundung vollständig drei Gruppen wieder her", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-division-next");
  const reset = setup.ids.get("#term-division-reset");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");
  const slider = setup.ids.get("#group-control");
  slider.value = "5";
  slider.dispatch("input");

  reset.dispatch("click");
  assert.equal(setup.ids.get("#term-division-board").dataset.state, "irritation");
  assert.equal(slider.value, "3");
  assert.equal(setup.ids.get("#division-package-4").hidden, true);
  assert.equal(setup.ids.get("#term-division-conclusion").hidden, true);
});
