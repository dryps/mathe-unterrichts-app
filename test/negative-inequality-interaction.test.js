import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const styles = new Map(); const attributes = new Map();
  return { id, dataset: {}, hidden: false, disabled: false, textContent: "", value: "",
    style: { setProperty(name, value) { styles.set(name, String(value)); }, getPropertyValue(name) { return styles.get(name) ?? ""; } },
    setAttribute(name, value) { attributes.set(name, String(value)); }, getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); }, dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = ["negative-board", "negative-source-equation", "negative-operation", "negative-line-stage", "negative-point-small", "negative-point-large", "negative-point-small-label", "negative-point-large-label", "negative-result", "negative-result-equation", "negative-explore", "negative-base-control", "negative-base-value", "negative-conclusion", "negative-conclusion-text", "negative-insight", "negative-live", "negative-next", "negative-reset"];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)])); const frames = []; const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => ids.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/negative-inequality-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, frames, timers };
}

test("Weiter zeigt Ordnung, spiegelt synchron und öffnet erst dann das Ergebnis", async () => {
  const setup = await harness(); const next = setup.ids.get("#negative-next"); const board = setup.ids.get("#negative-board");
  assert.equal(board.dataset.state, "irritation"); assert.equal(setup.ids.get("#negative-line-stage").hidden, true);
  next.dispatch("click"); assert.equal(board.dataset.state, "ordered"); assert.equal(setup.ids.get("#negative-line-stage").hidden, false);
  next.dispatch("click"); assert.equal(board.dataset.state, "reflected"); assert.equal(setup.ids.get("#negative-result-equation").textContent, "−2 > −5");
  next.dispatch("click"); assert.equal(board.dataset.state, "explore"); assert.equal(next.hidden, true);
});

test("Regler aktualisiert beide Vergleiche, Punkte und Schluss", async () => {
  const setup = await harness(); const next = setup.ids.get("#negative-next"); for (let index = 0; index < 3; index += 1) next.dispatch("click");
  const slider = setup.ids.get("#negative-base-control"); slider.value = "4"; slider.dispatch("input");
  assert.equal(setup.ids.get("#negative-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#negative-source-equation").textContent, "4 < 7");
  assert.equal(setup.ids.get("#negative-result-equation").textContent, "−4 > −7");
  assert.equal(setup.ids.get("#negative-point-small-label").textContent, "−4");
  assert.equal(setup.ids.get("#negative-point-large-label").textContent, "−7");
  assert.equal(setup.ids.get("#negative-conclusion-text").textContent, "Negative Skalierung kehrt die Ordnung um.");
});

test("Mehrfachtipps überholen die laufende Spiegelung nicht", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#negative-next");
  next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  assert.equal(setup.ids.get("#negative-board").dataset.state, "reflecting"); assert.equal(next.disabled, true);
  setup.frames[0](0); setup.frames.at(-1)(1000);
  assert.equal(setup.ids.get("#negative-board").dataset.state, "reflected");
});

test("Reset neutralisiert verspätete Animations- und Timeout-Rückrufe", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#negative-next");
  next.dispatch("click"); next.dispatch("click"); const staleFrame = setup.frames[0]; const staleTimer = setup.timers[0];
  setup.ids.get("#negative-reset").dispatch("click"); staleFrame(1000); staleTimer();
  assert.equal(setup.ids.get("#negative-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#negative-point-small").style.getPropertyValue("--point-position"), "62.5%");
});
