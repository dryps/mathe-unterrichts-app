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
  const names = ["solution-board", "solution-source-equation", "solution-test-panel", "solution-test-control", "solution-test-decrease", "solution-test-increase", "solution-test-value", "solution-substitution", "solution-comparison", "solution-truth", "solution-boundary", "solution-boundary-equation", "solution-line-stage", "solution-range", "solution-point", "solution-point-label", "solution-explore", "solution-conclusion", "solution-conclusion-text", "solution-insight", "solution-live", "solution-next", "solution-reset"];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)])); const frames = []; const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => ids.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/solution-set-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, frames, timers };
}

test("erst ein geänderter Einzelwert öffnet den Grenzschritt", async () => {
  const setup = await harness(); const next = setup.ids.get("#solution-next");
  next.dispatch("click");
  assert.equal(setup.ids.get("#solution-board").dataset.state, "testing");
  assert.equal(next.hidden, true);
  const slider = setup.ids.get("#solution-test-control"); slider.value = "2"; slider.dispatch("input");
  assert.equal(setup.ids.get("#solution-comparison").textContent, "4 < 6");
  assert.equal(setup.ids.get("#solution-truth").textContent, "wahr");
  assert.equal(next.hidden, false);
  next.dispatch("click");
  assert.equal(setup.ids.get("#solution-boundary-equation").textContent, "x < 3");
  assert.equal(setup.ids.get("#solution-line-stage").hidden, true);
});

test("zugängliche Schrittknöpfe verändern denselben Testwert wie der Regler", async () => {
  const setup = await harness(); const next = setup.ids.get("#solution-next"); next.dispatch("click");
  setup.ids.get("#solution-test-decrease").dispatch("click");
  assert.equal(setup.ids.get("#solution-test-value").textContent, "x = 3");
  assert.equal(setup.ids.get("#solution-truth").textContent, "falsch");
  setup.ids.get("#solution-test-decrease").dispatch("click");
  assert.equal(setup.ids.get("#solution-test-value").textContent, "x = 2");
  assert.equal(setup.ids.get("#solution-truth").textContent, "wahr");
  assert.equal(setup.ids.get("#solution-test-control").value, "2");
});

test("Reduced Motion zeigt den ganzen Bereich ohne Zwischenzustand", async () => {
  const setup = await harness(); const next = setup.ids.get("#solution-next"); const slider = setup.ids.get("#solution-test-control");
  next.dispatch("click"); slider.value = "2"; slider.dispatch("input"); next.dispatch("click"); next.dispatch("click");
  assert.equal(setup.ids.get("#solution-board").dataset.state, "solution");
  assert.equal(setup.ids.get("#solution-line-stage").hidden, false);
  assert.equal(setup.ids.get("#solution-range").style.getPropertyValue("--solution-progress"), "1");
});

test("freie Erkundung koppelt Prüfwert, Punkt und Aha-Satz", async () => {
  const setup = await harness(); const next = setup.ids.get("#solution-next"); const slider = setup.ids.get("#solution-test-control");
  next.dispatch("click"); slider.value = "2"; slider.dispatch("input"); next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  slider.value = "5"; slider.dispatch("input");
  assert.equal(setup.ids.get("#solution-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#solution-point-label").textContent, "5");
  assert.equal(setup.ids.get("#solution-point").getAttribute("aria-label"), "Testwert 5, keine Lösung");
  assert.equal(setup.ids.get("#solution-conclusion-text").textContent, "Ungleichungen beschreiben häufig Mengen von Lösungen.");
});

test("Reset neutralisiert verspätete Frames und Timer", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#solution-next"); const slider = setup.ids.get("#solution-test-control");
  next.dispatch("click"); slider.value = "2"; slider.dispatch("input"); next.dispatch("click"); next.dispatch("click");
  const staleFrame = setup.frames[0]; const staleTimer = setup.timers[0]; setup.ids.get("#solution-reset").dispatch("click"); staleFrame(800); staleTimer();
  assert.equal(setup.ids.get("#solution-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#solution-line-stage").hidden, true);
});
