import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const styles = new Map();
  return {
    id, dataset: {}, hidden: false, disabled: false, textContent: "", value: "",
    style: { setProperty(name, value) { styles.set(name, String(value)); }, getPropertyValue(name) { return styles.get(name) ?? ""; } },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = [
    "bracket-sign-board", "bracket-sign-irritation", "bracket-sign-package",
    "bracket-sign-comparison", "bracket-sign-explore", "bracket-sign-conclusion",
    "outer-factor-token", "package-variable", "package-constant", "package-result",
    "acting-overlay", "acting-arrow-variable", "acting-arrow-constant",
    "comparison-plus-result", "comparison-minus-result", "factor-control", "factor-value",
    "bracket-sign-insight", "bracket-sign-live", "bracket-sign-next", "bracket-sign-reset",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const animationFrames = [];
  const timerCallbacks = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => ids.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { animationFrames.push(callback); return animationFrames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timerCallbacks.push(callback); return timerCallbacks.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/bracket-sign-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, animationFrames, timerCallbacks };
}

test("Weiter zeigt die Lernansichten in der vereinbarten Reihenfolge", async () => {
  const setup = await harness();
  const next = setup.ids.get("#bracket-sign-next");
  const board = setup.ids.get("#bracket-sign-board");
  assert.equal(board.dataset.state, "irritation");
  next.dispatch("click");
  assert.equal(board.dataset.state, "package");
  assert.equal(setup.ids.get("#package-result").hidden, true);
  next.dispatch("click");
  assert.equal(board.dataset.state, "plus");
  assert.equal(setup.ids.get("#outer-factor-token").textContent, "+1");
  next.dispatch("click");
  assert.equal(board.dataset.state, "minus");
  assert.equal(setup.ids.get("#package-result").textContent, "−x + 3");
  next.dispatch("click");
  assert.equal(board.dataset.state, "comparison");
  next.dispatch("click");
  assert.equal(board.dataset.state, "explore");
  assert.equal(next.hidden, true);
});

test("Mehrfachtipps überholen die laufende Minuswirkung nicht", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#bracket-sign-next");
  next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  assert.equal(setup.ids.get("#bracket-sign-board").dataset.state, "acting");
  assert.equal(next.disabled, true);
  assert.equal(setup.ids.get("#bracket-sign-reset").disabled, false);
  next.dispatch("click");
  assert.equal(setup.animationFrames.length, 1);
  setup.animationFrames[0](0);
  setup.animationFrames.at(-1)(1000);
  assert.equal(setup.ids.get("#bracket-sign-board").dataset.state, "minus");
});

test("Reset neutralisiert verspätete Animations- und Timeout-Rückrufe", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#bracket-sign-next");
  next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  const frame = setup.animationFrames[0];
  const timer = setup.timerCallbacks[0];
  setup.ids.get("#bracket-sign-reset").dispatch("click");
  assert.equal(setup.ids.get("#bracket-sign-board").dataset.state, "irritation");
  frame(1000); timer();
  assert.equal(setup.ids.get("#bracket-sign-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#package-result").hidden, true);
});

test("Regler wechselt beide Vorzeichen gemeinsam und öffnet die Schlussansicht", async () => {
  const setup = await harness();
  const next = setup.ids.get("#bracket-sign-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");
  const slider = setup.ids.get("#factor-control");
  slider.value = "1";
  slider.dispatch("input");
  assert.equal(setup.ids.get("#bracket-sign-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#factor-value").textContent, "+1");
  assert.equal(setup.ids.get("#package-variable").textContent, "+x");
  assert.equal(setup.ids.get("#package-constant").textContent, "−3");
  assert.equal(setup.ids.get("#package-result").textContent, "x − 3");
  assert.match(setup.ids.get("#bracket-sign-live").textContent, /beide Vorzeichen/);
});
