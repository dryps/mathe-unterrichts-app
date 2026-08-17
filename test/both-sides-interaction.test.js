import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const styles = new Map(); const classes = new Set(); const attributes = new Map();
  return { id, dataset: {}, hidden: false, disabled: false, textContent: "", value: "",
    style: { setProperty(name, value) { styles.set(name, String(value)); }, getPropertyValue(name) { return styles.get(name) ?? ""; } },
    classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); } },
    setAttribute(name, value) { attributes.set(name, String(value)); }, getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); }, dispatch(type, event = {}) { return listeners.get(type)?.({ currentTarget: this, target: this, ...event }); },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = ["both-sides-board", "both-sides-source", "both-sides-source-equation", "both-sides-left-shared", "both-sides-right-shared", "both-sides-left-shared-label", "both-sides-right-shared-label", "both-sides-reduced", "both-sides-reduced-equation", "both-sides-explore", "both-sides-conclusion", "both-sides-conclusion-text", "both-sides-shared-control", "both-sides-shared-value", "both-sides-insight", "both-sides-live", "both-sides-next", "both-sides-reset", ...Array.from({ length: 4 }, (_, index) => `both-sides-left-shared-${index + 1}`), ...Array.from({ length: 4 }, (_, index) => `both-sides-right-shared-${index + 1}`)];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)])); const frames = []; const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: (selector) => ids.get(selector) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value(callback) { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value(callback) { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/both-sides-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, frames, timers };
}

test("Weiter markiert dieselbe Gruppe, entfernt sie synchron und zeigt 3x + 3 = 18", async () => {
  const setup = await harness(); const next = setup.ids.get("#both-sides-next"); const board = setup.ids.get("#both-sides-board");
  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#both-sides-left-shared-label").hidden, true);
  assert.equal(setup.ids.get("#both-sides-right-shared-label").hidden, true);
  assert.doesNotMatch(setup.ids.get("#both-sides-left-shared").getAttribute("aria-label") ?? "", /gemeinsame|2 x/i);
  next.dispatch("click"); assert.equal(board.dataset.state, "decompose");
  assert.equal(setup.ids.get("#both-sides-left-shared").hidden, false);
  assert.equal(setup.ids.get("#both-sides-right-shared").hidden, false);
  assert.equal(setup.ids.get("#both-sides-left-shared-label").hidden, false);
  assert.equal(setup.ids.get("#both-sides-right-shared-label").hidden, false);
  assert.equal(setup.ids.get("#both-sides-left-shared").getAttribute("aria-label"), "Gemeinsame Gruppe links: 2 x-Bausteine");
  assert.equal(setup.ids.get("#both-sides-right-shared").getAttribute("aria-label"), "Gemeinsame Gruppe rechts: 2 x-Bausteine");
  next.dispatch("click"); assert.equal(board.dataset.state, "reduced");
  assert.equal(setup.ids.get("#both-sides-reduced-equation").textContent, "3x + 3 = 18");
  next.dispatch("click"); assert.equal(board.dataset.state, "explore"); assert.equal(next.hidden, true);
});

test("Regler synchronisiert Ausgangsgleichung, beide Gruppen und Schluss", async () => {
  const setup = await harness(); const next = setup.ids.get("#both-sides-next"); for (let index = 0; index < 3; index += 1) next.dispatch("click");
  const slider = setup.ids.get("#both-sides-shared-control"); slider.value = "4"; slider.dispatch("input");
  assert.equal(setup.ids.get("#both-sides-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#both-sides-source-equation").textContent, "7x + 3 = 4x + 18");
  assert.equal(setup.ids.get("#both-sides-left-shared-4").hidden, false);
  assert.equal(setup.ids.get("#both-sides-right-shared-4").hidden, false);
  assert.equal(setup.ids.get("#both-sides-left-shared").getAttribute("aria-label"), "Gemeinsame Gruppe links: 4 x-Bausteine");
  assert.equal(setup.ids.get("#both-sides-right-shared").getAttribute("aria-label"), "Gemeinsame Gruppe rechts: 4 x-Bausteine");
  assert.equal(setup.ids.get("#both-sides-reduced-equation").textContent, "3x + 3 = 18");
  assert.match(setup.ids.get("#both-sides-conclusion-text").textContent, /verkürzte Schreibweise/);
  assert.match(setup.ids.get("#both-sides-live").textContent, /beiden Seiten/);
});

test("Mehrfachtipps überholen die laufende Entfernung nicht", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#both-sides-next");
  next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  assert.equal(setup.ids.get("#both-sides-board").dataset.state, "removing");
  assert.equal(next.disabled, true);
  setup.frames[0](0); setup.frames.at(-1)(900);
  assert.equal(setup.ids.get("#both-sides-board").dataset.state, "reduced");
});

test("Reset neutralisiert verspätete Animations- und Timeout-Rückrufe", async () => {
  const setup = await harness({ reducedMotion: false }); const next = setup.ids.get("#both-sides-next");
  next.dispatch("click"); next.dispatch("click"); const staleFrame = setup.frames[0]; const staleTimer = setup.timers[0];
  setup.ids.get("#both-sides-reset").dispatch("click"); staleFrame(900); staleTimer();
  assert.equal(setup.ids.get("#both-sides-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#both-sides-left-shared").style.getPropertyValue("--remove-progress"), "0");
});
