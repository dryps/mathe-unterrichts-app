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
    hasAttribute(name) { return attributes.has(name); },
    toggleAttribute(name, active) { active ? attributes.set(name, "") : attributes.delete(name); if (name === "hidden") this.hidden = active; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type) { return listeners.get(type)?.({ currentTarget: this, target: this }); },
  };
}

async function harness({ reduced = true } = {}) {
  const ids = ["rh-workspace", "rh-chart-card", "rh-chart", "rh-line", "rh-chart-heading", "rh-stage-summary", "rh-scroll-hint", "rh-explore", "rh-conclusion", "rh-throws", "rh-sixes", "rh-fraction", "rh-frequency", "rh-checkpoint-slider", "rh-checkpoint-output", "rh-insight", "rh-live", "rh-next", "rh-reset"];
  const elements = new Map(ids.map((id) => [`#${id}`, element(id === "rh-checkpoint-slider" ? "0" : "")]));
  const rows = [0, 1, 2, 3].map((index) => { const item = element(); item.dataset.index = String(index); return item; });
  const points = [0, 1, 2, 3].map((index) => { const item = element(); item.dataset.index = String(index); return item; });
  const xLabels = [0, 1, 2, 3].map((index) => { const item = element(); item.dataset.index = String(index); return item; });
  const frames = [];
  const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: (selector) => selector === ".rh-row" ? rows : selector === ".rh-point" ? points : selector === ".rh-x-label" ? xLabels : [],
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reduced }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback) => { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value: (callback) => { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/relative-frequency-app.js?${Date.now()}-${Math.random()}`);
  return { elements, rows, points, xLabels, frames, timers };
}

test("Weiter zeigt alle vier Checkpoints seriell und öffnet dann die Erkundung", async () => {
  const { elements, rows, points, xLabels } = await harness();
  const next = elements.get("#rh-next");
  for (let step = 0; step < 4; step += 1) {
    next.dispatch("click");
    assert.equal(rows.filter((row) => !row.hidden).length, step + 1);
    assert.equal(points.filter((point) => !point.hasAttribute("hidden")).length, step + 1);
    assert.equal(xLabels.filter((label) => !label.hasAttribute("hidden")).length, step + 1);
    assert.doesNotMatch(elements.get("#rh-stage-summary").textContent, step === 0 ? /100|1\.000|10\.000/ : step === 1 ? /1\.000|10\.000/ : step === 2 ? /10\.000/ : /$^/);
  }
  next.dispatch("click");
  assert.equal(elements.get("#rh-workspace").dataset.state, "explore");
  assert.equal(elements.get("#rh-conclusion").hidden, false);
  assert.equal(elements.get("#rh-scroll-hint").hidden, false);
});

test("Regler aktualisiert 10 bis 10.000 Würfe gemeinsam", async () => {
  const { elements, points } = await harness();
  for (let step = 0; step < 5; step += 1) elements.get("#rh-next").dispatch("click");
  const slider = elements.get("#rh-checkpoint-slider");
  slider.value = "2";
  slider.dispatch("input");
  assert.equal(elements.get("#rh-throws").textContent, "1.000");
  assert.equal(elements.get("#rh-sixes").textContent, "174");
  assert.equal(elements.get("#rh-frequency").textContent, "17,4 %");
  assert.match(slider.getAttribute("aria-label"), /1\.000 Würfe, 174 Sechsen, relative Häufigkeit 17,4 Prozent/);
  assert.equal(points.filter((point) => point.classList.contains("is-selected")).every((point) => point.dataset.index === "2"), true);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Rückrufe", async () => {
  const { elements, frames, timers } = await harness({ reduced: false });
  elements.get("#rh-next").dispatch("click");
  elements.get("#rh-next").dispatch("click");
  elements.get("#rh-reset").dispatch("click");
  for (const callback of frames) callback(900);
  for (const callback of timers) callback();
  assert.equal(elements.get("#rh-workspace").dataset.state, "irritation");
  assert.equal(elements.get("#rh-workspace").getAttribute("aria-busy"), "false");
  assert.equal(elements.get("#rh-chart-card").hidden, true);
});
