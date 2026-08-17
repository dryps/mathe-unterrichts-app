import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const attrs = new Map();
  return { id, dataset: {}, hidden: false, disabled: false, textContent: "", value: "",
    setAttribute(name, value) { attrs.set(name, String(value)); }, getAttribute(name) { return attrs.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); }, dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const ids = ["properties-board", "properties-stage", "properties-shape", "properties-side-ab", "properties-side-bc", "properties-side-cd", "properties-side-da", "properties-markers", "properties-marker-ab", "properties-marker-cd", "properties-marker-bc-1", "properties-marker-bc-2", "properties-marker-da-1", "properties-marker-da-2", "properties-explore", "properties-rotation-control", "properties-shift-control", "properties-slant-control", "properties-rotation-value", "properties-shift-value", "properties-slant-value", "properties-rotation-decrease", "properties-rotation-increase", "properties-shift-decrease", "properties-shift-increase", "properties-slant-decrease", "properties-slant-increase", "properties-conclusion", "properties-conclusion-text", "properties-insight", "properties-live", "properties-next", "properties-reset"];
  const elements = new Map(ids.map((id) => [`#${id}`, element(id)])); const frames = []; const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => elements.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/quadrilateral-properties-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { elements, frames, timers };
}

test("Weiter zeigt erst Marker und danach die vollständige Veränderung", async () => {
  const setup = await harness(); const next = setup.elements.get("#properties-next");
  assert.equal(setup.elements.get("#properties-markers").hidden, true);
  next.dispatch("click");
  assert.equal(setup.elements.get("#properties-board").dataset.state, "properties");
  assert.equal(setup.elements.get("#properties-markers").hidden, false);
  next.dispatch("click");
  assert.equal(setup.elements.get("#properties-board").dataset.state, "transformed");
  assert.match(setup.elements.get("#properties-stage").getAttribute("aria-label"), /28 Grad/);
});

test("freie Veränderung synchronisiert Figur, Werte und Aha", async () => {
  const setup = await harness(); const next = setup.elements.get("#properties-next"); next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  setup.elements.get("#properties-rotation-increase").dispatch("click");
  assert.equal(setup.elements.get("#properties-board").dataset.state, "conclusion");
  assert.equal(setup.elements.get("#properties-rotation-value").textContent, "33°");
  assert.equal(setup.elements.get("#properties-conclusion-text").textContent, "Viereckstypen werden über Eigenschaften definiert, nicht über typische Bilder.");
  assert.equal(setup.elements.get("#properties-markers").hidden, false);
});

test("Reset neutralisiert verspätete Animationsrückrufe", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.elements.get("#properties-next"); next.dispatch("click"); next.dispatch("click");
  const staleFrame = setup.frames[0]; const staleTimer = setup.timers[0]; setup.elements.get("#properties-reset").dispatch("click"); staleFrame(1100); staleTimer();
  assert.equal(setup.elements.get("#properties-board").dataset.state, "irritation");
  assert.equal(setup.elements.get("#properties-markers").hidden, true);
});
