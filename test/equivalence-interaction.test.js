import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const styles = new Map(); const classes = new Set();
  return { id, dataset: {}, hidden: false, disabled: false, textContent: "", value: "",
    style: { setProperty(name, value) { styles.set(name, String(value)); }, getPropertyValue(name) { return styles.get(name) ?? ""; } },
    classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); } },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = ["equivalence-board", "equivalence-left-equation", "equivalence-right-equation", "equivalence-left-value", "equivalence-right-value", "equivalence-beam", "equivalence-warning", "equivalence-restore", "equivalence-subtract-both", "equivalence-divide-both", "equivalence-groups", "equivalence-explore", "equivalence-conclusion", "equivalence-conclusion-text", "equivalence-delta", "equivalence-delta-value", "equivalence-insight", "equivalence-live", "equivalence-next", "equivalence-reset"];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)])); const frames = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => ids.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  await import(`../src/equivalence-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, frames };
}

test("Weiter zeigt den vollständigen Lernweg und kippt nur beim einseitigen Entfernen", async () => {
  const setup = await harness(); const next = setup.ids.get("#equivalence-next"); const board = setup.ids.get("#equivalence-board");
  assert.equal(board.dataset.state, "irritation");
  next.dispatch("click");
  assert.equal(board.dataset.state, "oneSided");
  assert.equal(setup.ids.get("#equivalence-warning").hidden, false);
  assert.equal(setup.ids.get("#equivalence-left-value").textContent, "15");
  assert.equal(setup.ids.get("#equivalence-right-value").textContent, "20");
  assert.equal(setup.ids.get("#equivalence-beam").style.getPropertyValue("--balance-tilt"), "6deg");
  next.dispatch("click"); assert.equal(board.dataset.state, "restore");
  next.dispatch("click"); assert.equal(board.dataset.state, "subtractBoth");
  assert.equal(setup.ids.get("#equivalence-left-equation").textContent, "3x");
  assert.equal(setup.ids.get("#equivalence-right-equation").textContent, "15");
  next.dispatch("click"); assert.equal(board.dataset.state, "divideBoth");
  assert.equal(setup.ids.get("#equivalence-left-equation").textContent, "x");
  assert.equal(setup.ids.get("#equivalence-right-equation").textContent, "5");
  next.dispatch("click"); assert.equal(board.dataset.state, "explore"); assert.equal(next.hidden, true);
});

test("Regler verändert beide Seiten synchron und formuliert die Schlussfolgerung", async () => {
  const setup = await harness(); const next = setup.ids.get("#equivalence-next");
  for (let index = 0; index < 5; index += 1) next.dispatch("click");
  const slider = setup.ids.get("#equivalence-delta"); slider.value = "4"; slider.dispatch("input");
  assert.equal(setup.ids.get("#equivalence-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#equivalence-left-equation").textContent, "3x + 9");
  assert.equal(setup.ids.get("#equivalence-right-equation").textContent, "24");
  assert.equal(setup.ids.get("#equivalence-left-value").textContent, "24");
  assert.equal(setup.ids.get("#equivalence-right-value").textContent, "24");
  assert.match(setup.ids.get("#equivalence-conclusion-text").textContent, /erhalten die Lösungsmenge/);
  assert.match(setup.ids.get("#equivalence-live").textContent, /beiden Seiten/);
});

test("Reset neutralisiert einen verspäteten Animationsrückruf", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#equivalence-next");
  next.dispatch("click"); const staleFrame = setup.frames[0];
  setup.ids.get("#equivalence-reset").dispatch("click"); staleFrame(999);
  assert.equal(setup.ids.get("#equivalence-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#equivalence-beam").style.getPropertyValue("--balance-tilt"), "0deg");
  assert.equal(next.disabled, false);
});
