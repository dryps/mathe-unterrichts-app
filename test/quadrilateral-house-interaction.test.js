import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const attrs = new Map();
  return { id, dataset: {}, hidden: false, disabled: false, checked: false, textContent: "", style: {},
    setAttribute(name, value) { attrs.set(name, String(value)); }, getAttribute(name) { return attrs.get(name) ?? null; },
    toggleAttribute(name, force) { if (force) attrs.set(name, ""); else attrs.delete(name); },
    addEventListener(type, listener) { listeners.set(type, listener); }, dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const ids = ["house-board", "house-preview", "house-shape", "house-side-ab", "house-side-bc", "house-side-cd", "house-side-da", "house-right-markers", "house-right-a", "house-right-b", "house-right-c", "house-right-d", "house-equal-markers", "house-equal-ab", "house-equal-bc", "house-equal-cd", "house-equal-da", "house-parallelogram", "house-rectangle", "house-rhombus", "house-square", "house-path-rectangle", "house-path-rhombus", "house-path-square", "house-explore", "house-right-control", "house-equal-control", "house-current-type", "house-property-summary", "house-conclusion", "house-conclusion-text", "house-insight", "house-live", "house-next", "house-reset"];
  const elements = new Map(ids.map((id) => [`#${id}`, element(id)])); const frames = []; const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => elements.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/quadrilateral-house-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { elements, frames, timers };
}

test("Weiter baut alle vier Hausknoten kontrolliert auf", async () => {
  const setup = await harness(); const next = setup.elements.get("#house-next");
  for (const [state, node] of [["parallelogram", "#house-parallelogram"], ["rectangle", "#house-rectangle"], ["rhombus", "#house-rhombus"], ["square", "#house-square"]]) {
    next.dispatch("click");
    assert.equal(setup.elements.get("#house-board").dataset.state, state);
    assert.equal(setup.elements.get(node).hidden, false);
  }
  assert.match(setup.elements.get("#house-preview").getAttribute("aria-label"), /Quadrat/);
});

test("eigene Kombination klassifiziert erst Rechteck und dann Quadrat mit Aha", async () => {
  const setup = await harness(); const next = setup.elements.get("#house-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");
  const right = setup.elements.get("#house-right-control"), equal = setup.elements.get("#house-equal-control");
  right.checked = true; right.dispatch("change");
  assert.equal(setup.elements.get("#house-current-type").textContent, "Rechteck");
  assert.equal(setup.elements.get("#house-conclusion").hidden, true);
  equal.checked = true; equal.dispatch("change");
  assert.equal(setup.elements.get("#house-current-type").textContent, "Quadrat");
  assert.equal(setup.elements.get("#house-conclusion").hidden, false);
  assert.equal(setup.elements.get("#house-conclusion-text").textContent, "Spezielle Figuren behalten die Eigenschaften ihrer Oberbegriffe.");
});

test("Reset neutralisiert verspätete Reveal-Rückrufe", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.elements.get("#house-next");
  next.dispatch("click"); const staleFrame = setup.frames[0], staleTimer = setup.timers[0];
  setup.elements.get("#house-reset").dispatch("click"); staleFrame(650); staleTimer();
  assert.equal(setup.elements.get("#house-board").dataset.state, "irritation");
  assert.equal(setup.elements.get("#house-parallelogram").hidden, true);
});
