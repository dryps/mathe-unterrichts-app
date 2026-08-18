import assert from "node:assert/strict";
import test from "node:test";

function element(value = "") {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    hidden: false, disabled: false, textContent: "", value, dataset: {}, style: {},
    classList: { toggle(name, active) { active ? classes.add(name) : classes.delete(name); }, contains(name) { return classes.has(name); } },
    setAttribute(name, content) { attributes.set(name, String(content)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type) { return listeners.get(type)?.({ currentTarget: this, target: this }); },
  };
}

async function harness({ reduced = true } = {}) {
  const ids = ["lp-workspace", "lp-equal-wheel", "lp-unequal-wheel", "lp-count", "lp-areas", "lp-probability", "lp-explore", "lp-conclusion", "lp-equal-angle", "lp-unequal-angle", "lp-equal-probability", "lp-unequal-probability", "lp-result-slider", "lp-result-output", "lp-insight", "lp-live", "lp-next", "lp-reset"];
  const elements = new Map(ids.map((id) => [`#${id}`, element(id === "lp-result-slider" ? "1" : "")]));
  const selectedLabels = Array.from({ length: 8 }, () => element());
  const segments = ["equal", "unequal"].flatMap((wheel) => [1, 2, 3, 4].map((result) => { const item = element(); item.dataset.wheel = wheel; item.dataset.result = String(result); return item; }));
  const segmentLabels = ["equal", "unequal"].flatMap((wheel) => [1, 2, 3, 4].map((result) => { const item = element(); item.dataset.wheel = wheel; item.dataset.result = String(result); return item; }));
  const frames = [];
  const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: (selector) => selector === ".lp-selected-result" ? selectedLabels : selector === ".lp-segment" ? segments : selector === ".lp-segment-label" ? segmentLabels : [],
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reduced }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback) => { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value: (callback) => { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/laplace-app.js?${Date.now()}-${Math.random()}`);
  return { elements, segments, frames, timers };
}

test("Weiter öffnet alle Gates und der Regler aktualisiert beide Räder gemeinsam", async () => {
  const { elements, segments } = await harness();
  const next = elements.get("#lp-next");
  for (let step = 0; step < 4; step += 1) next.dispatch("click");
  assert.equal(elements.get("#lp-workspace").dataset.state, "explore");
  const slider = elements.get("#lp-result-slider");
  slider.value = "4";
  slider.dispatch("input");
  assert.equal(elements.get("#lp-equal-probability").textContent, "1/4");
  assert.equal(elements.get("#lp-unequal-probability").textContent, "2/15");
  assert.match(slider.getAttribute("aria-label"), /Ergebnis 4 von 4; Rad A 1\/4, Rad B 2\/15/);
  assert.match(elements.get("#lp-unequal-wheel").getAttribute("aria-label"), /Ergebnis 4.*48 Grad.*2\/15/);
  assert.equal(segments.filter((segment) => segment.classList.contains("is-selected")).every((segment) => segment.dataset.result === "4"), true);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Rückrufe", async () => {
  const { elements, frames, timers } = await harness({ reduced: false });
  const next = elements.get("#lp-next");
  next.dispatch("click");
  next.dispatch("click");
  elements.get("#lp-reset").dispatch("click");
  for (const callback of frames) callback(900);
  for (const callback of timers) callback();
  assert.equal(elements.get("#lp-workspace").dataset.state, "irritation");
  assert.equal(elements.get("#lp-workspace").getAttribute("aria-busy"), "false");
  assert.equal(elements.get("#lp-count").hidden, true);
});
