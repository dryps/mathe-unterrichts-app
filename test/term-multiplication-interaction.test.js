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
    "term-multiplication-board",
    "term-multiplication-irritation",
    "term-multiplication-addition",
    "term-multiplication-square",
    "term-multiplication-comparison",
    "term-multiplication-explore",
    "term-multiplication-conclusion",
    "addition-total",
    "square-area-label",
    "explore-addition-formula",
    "explore-multiplication-formula",
    "term-multiplication-comparison-note",
    "x-control",
    "x-value",
    "term-multiplication-insight",
    "term-multiplication-live",
    "term-multiplication-next",
    "term-multiplication-reset",
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

  await import(`../src/term-multiplication-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, animationFrames, timerCallbacks };
}

test("Weiter zeigt alle sechs Lernansichten in der vereinbarten Reihenfolge", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-multiplication-next");
  const board = setup.ids.get("#term-multiplication-board");

  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#term-multiplication-irritation").hidden, false);

  next.dispatch("click");
  assert.equal(board.dataset.state, "addition");
  assert.equal(setup.ids.get("#addition-total").textContent, "Gesamtlänge 2x");

  next.dispatch("click");
  assert.equal(board.dataset.state, "square");

  next.dispatch("click");
  assert.equal(board.dataset.state, "area");
  assert.equal(setup.ids.get("#square-area-label").textContent, "Fläche x²");

  next.dispatch("click");
  assert.equal(board.dataset.state, "comparison");

  next.dispatch("click");
  assert.equal(board.dataset.state, "explore");
  assert.equal(next.hidden, true);
  assert.equal(setup.ids.get("#x-control").disabled, false);
});

test("Mehrfachtipps und Reset können eine laufende Füllung nicht überholen", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#term-multiplication-next");
  const reset = setup.ids.get("#term-multiplication-reset");
  const board = setup.ids.get("#term-multiplication-board");

  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(board.dataset.state, "filling");
  assert.equal(next.disabled, true);
  assert.equal(reset.disabled, true);
  assert.equal(setup.animationFrames.length, 1);

  next.dispatch("click");
  reset.dispatch("click");
  assert.equal(board.dataset.state, "filling");
  assert.equal(setup.animationFrames.length, 1);

  setup.animationFrames[0](0);
  setup.animationFrames.at(-1)(900);
  assert.equal(board.dataset.state, "area");
  assert.equal(next.disabled, false);
});

test("Timeout-Fallback beendet die Füllung ohne Animationsframe korrekt", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#term-multiplication-next");
  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");

  assert.equal(setup.timerCallbacks.length, 1);
  setup.timerCallbacks[0]();
  assert.equal(setup.ids.get("#term-multiplication-board").dataset.state, "area");
});

test("der native Regler synchronisiert Länge, Fläche, Live-Text und Schluss", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-multiplication-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");

  const slider = setup.ids.get("#x-control");
  slider.value = "4";
  slider.dispatch("input");

  assert.equal(setup.ids.get("#term-multiplication-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#x-value").textContent, "x = 4");
  assert.equal(setup.ids.get("#explore-addition-formula").textContent, "x + x = 2x = 8");
  assert.equal(setup.ids.get("#explore-multiplication-formula").textContent, "x · x = x² = 16");
  assert.equal(setup.ids.get("#term-multiplication-conclusion").hidden, false);
  assert.match(setup.ids.get("#term-multiplication-live").textContent, /Länge 8, Fläche 16/);
});

test("x = 2 meldet die Zahlenwert-Koinzidenz zugänglich", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-multiplication-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");

  const slider = setup.ids.get("#x-control");
  slider.value = "2";
  slider.dispatch("input");

  assert.match(
    setup.ids.get("#term-multiplication-comparison-note").textContent,
    /Beide Zahlenwerte sind 4/,
  );
  assert.match(setup.ids.get("#term-multiplication-live").textContent, /Beide Zahlenwerte sind 4/);
});

test("Reset bricht Folgezustände ab und stellt x = 3 vollständig wieder her", async () => {
  const setup = await harness();
  const next = setup.ids.get("#term-multiplication-next");
  const reset = setup.ids.get("#term-multiplication-reset");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");
  const slider = setup.ids.get("#x-control");
  slider.value = "5";
  slider.dispatch("input");

  reset.dispatch("click");
  assert.equal(setup.ids.get("#term-multiplication-board").dataset.state, "irritation");
  assert.equal(slider.value, "3");
  assert.equal(setup.ids.get("#term-multiplication-conclusion").hidden, true);
  assert.equal(setup.ids.get("#term-multiplication-board").style.getPropertyValue("--fill-scale"), "0");
});
