import assert from "node:assert/strict";
import test from "node:test";

function element(value = "") {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    hidden: false,
    disabled: false,
    textContent: "",
    value,
    dataset: {},
    style: {},
    classList: {
      toggle(name, active) { active ? classes.add(name) : classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    setAttribute(name, content) { attributes.set(name, String(content)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type) { return listeners.get(type)?.({ currentTarget: this, target: this }); },
  };
}

async function harness({ reduced = true } = {}) {
  const ids = [
    "rl-workspace", "rl-lab", "rl-result", "rl-room", "rl-event", "rl-event-label",
    "rl-event-set", "rl-explore", "rl-conclusion", "rl-event-select", "rl-insight",
    "rl-live", "rl-next", "rl-reset",
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
    querySelectorAll: (selector) => selector === ".rl-outcome" ? cards : [],
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reduced }), addEventListener() {} } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback) => { frames.push(callback); return frames.length; } });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, value() {} });
  Object.defineProperty(globalThis, "setTimeout", { configurable: true, value: (callback) => { timers.push(callback); return timers.length; } });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value() {} });
  await import(`../src/random-event-app.js?${Date.now()}-${Math.random()}`);
  return { elements, cards, frames, timers };
}

test("Weiter öffnet alle Gates und Erkundung aktualisiert Menge und Karten gemeinsam", async () => {
  const { elements, cards } = await harness();
  const next = elements.get("#rl-next");
  for (let step = 0; step < 4; step += 1) next.dispatch("click");
  assert.equal(elements.get("#rl-workspace").dataset.state, "explore");
  assert.equal(elements.get("#rl-event-set").textContent, "{2, 4, 6}");
  const select = elements.get("#rl-event-select");
  select.value = "greater-four";
  select.dispatch("change");
  assert.equal(elements.get("#rl-event-label").textContent, "größer als 4");
  assert.equal(elements.get("#rl-event-set").textContent, "{5, 6}");
  assert.equal(cards[4].classList.contains("is-member"), true);
  assert.equal(cards[3].classList.contains("is-member"), false);
  assert.match(cards[4].getAttribute("aria-label"), /gehört zum Ereignis größer als 4/);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Rückrufe", async () => {
  const { elements, frames, timers } = await harness({ reduced: false });
  const next = elements.get("#rl-next");
  next.dispatch("click");
  next.dispatch("click");
  elements.get("#rl-reset").dispatch("click");
  for (const callback of frames) callback(900);
  for (const callback of timers) callback();
  assert.equal(elements.get("#rl-workspace").dataset.state, "irritation");
  assert.equal(elements.get("#rl-workspace").getAttribute("aria-busy"), "false");
  assert.equal(elements.get("#rl-result").hidden, true);
});
