import assert from "node:assert/strict";
import test from "node:test";

function element() {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    hidden: false,
    disabled: false,
    textContent: "",
    dataset: {},
    style: {},
    classList: {
      toggle(name, active) { active ? classes.add(name) : classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type) { return listeners.get(type)?.({ currentTarget: this, target: this }); },
  };
}

async function harness({ reduced = true } = {}) {
  const ids = [
    "os-workspace", "os-lab", "os-placeholder", "os-six", "os-wrong", "os-missing",
    "os-correct", "os-conclusion", "os-insight", "os-live", "os-next", "os-reset",
  ];
  const elements = new Map(ids.map((id) => [`#${id}`, element()]));
  const cards = [1, 2, 3, 4, 5, 6].map((value) => {
    const card = element();
    card.dataset.value = String(value);
    return card;
  });
  const frames = [];
  const timers = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: (selector) => selector === ".os-outcome" ? cards : [],
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reduced }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback) => { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value: (callback) => { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/outcome-space-app.js?${Date.now()}-${Math.random()}`);
  return { elements, cards, frames, timers };
}

test("Weiter korrigiert Raum, günstige Ergebnisse und Rechnung erst am vollständigen Gate", async () => {
  const { elements, cards } = await harness();
  const next = elements.get("#os-next");
  next.dispatch("click");
  assert.equal(elements.get("#os-wrong").hidden, false);
  assert.equal(elements.get("#os-six").hidden, true);
  assert.equal(cards[1].classList.contains("is-favorable"), true);
  assert.equal(cards[5].classList.contains("is-favorable"), false);
  next.dispatch("click");
  assert.equal(elements.get("#os-missing").hidden, false);
  assert.equal(elements.get("#os-six").hidden, true);
  next.dispatch("click");
  assert.equal(elements.get("#os-placeholder").hidden, true);
  assert.equal(elements.get("#os-six").hidden, false);
  assert.equal(elements.get("#os-missing").hidden, true);
  assert.equal(elements.get("#os-correct").hidden, false);
  assert.equal(cards[5].classList.contains("is-favorable"), true);
  assert.match(cards[5].getAttribute("aria-label"), /günstig/);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Rückrufe", async () => {
  const { elements, frames, timers } = await harness({ reduced: false });
  const next = elements.get("#os-next");
  next.dispatch("click");
  next.dispatch("click");
  elements.get("#os-reset").dispatch("click");
  for (const callback of frames) callback(900);
  for (const callback of timers) callback();
  assert.equal(elements.get("#os-workspace").dataset.state, "irritation");
  assert.equal(elements.get("#os-workspace").getAttribute("aria-busy"), "false");
  assert.equal(elements.get("#os-wrong").hidden, true);
  assert.equal(elements.get("#os-six").hidden, true);
});
