import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  return {
    id,
    dataset: {},
    hidden: false,
    disabled: false,
    textContent: "",
    value: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      return listeners.get(type)?.(event);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
  };
}

async function harness({ reducedMotion = false } = {}) {
  const names = [
    "terms-board",
    "terms-blocks",
    "terms-prompt",
    "terms-assigned",
    "terms-x-label",
    "terms-x-block-value-a",
    "terms-x-block-value-b",
    "terms-substituted",
    "terms-expanded",
    "terms-value",
    "terms-comparison",
    "terms-exploration",
    "terms-x-slider",
    "terms-slider-output",
    "terms-insight",
    "terms-conclusion",
    "terms-live",
    "terms-next",
    "terms-reset",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const symbols = [element("symbol-a"), element("symbol-b")];
  const capturedTimers = [];
  const activeTimers = new Map();
  let timerId = 0;

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector: (selector) => ids.get(selector) ?? null,
      querySelectorAll: (selector) => selector === ".terms-block-symbol" ? symbols : [],
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: () => ({ matches: reducedMotion }),
    },
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value(callback, delay) {
      timerId += 1;
      const timer = { id: timerId, callback, delay, cleared: false };
      capturedTimers.push(timer);
      activeTimers.set(timer.id, timer);
      return timer.id;
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    configurable: true,
    value(id) {
      const timer = activeTimers.get(id);
      if (timer) timer.cleared = true;
      activeTimers.delete(id);
    },
  });

  await import(`../src/terms-variables-app.js?interaction=${Date.now()}-${Math.random()}`);

  function runActiveTimers() {
    for (const timer of [...activeTimers.values()].sort((a, b) => a.delay - b.delay)) {
      if (timer.cleared) continue;
      activeTimers.delete(timer.id);
      timer.callback();
    }
  }

  function runAllCapturedCallbacks() {
    for (const timer of capturedTimers) timer.callback();
  }

  return { ids, symbols, capturedTimers, activeTimers, runActiveTimers, runAllCapturedCallbacks };
}

function buildToChanging(setup) {
  const next = setup.ids.get("#terms-next");
  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");
  return next;
}

function finishToExploration(setup) {
  const next = buildToChanging(setup);
  setup.runActiveTimers();
  next.dispatch("click");
  next.dispatch("click");
  return next;
}

test("Weiter baut die sechs Ansichten auf und Mehrfachtipps starten keine zweite Sequenz", async () => {
  const setup = await harness();
  const next = setup.ids.get("#terms-next");
  const board = setup.ids.get("#terms-board");

  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#terms-blocks").hidden, true);

  next.dispatch("click");
  assert.equal(board.dataset.state, "structure");
  assert.equal(setup.ids.get("#terms-blocks").hidden, false);

  next.dispatch("click");
  assert.equal(board.dataset.state, "assigned");
  assert.equal(setup.ids.get("#terms-x-label").textContent, "x = 1");
  assert.equal(setup.ids.get("#terms-substituted").textContent, "2 · 1 + 3 = 5");

  next.dispatch("click");
  assert.equal(board.dataset.state, "changing");
  assert.equal(next.disabled, true);
  assert.equal(setup.ids.get("#terms-reset").disabled, false);
  assert.equal(setup.capturedTimers.length, 2);

  next.dispatch("click");
  next.dispatch("click");
  assert.equal(board.dataset.state, "changing");
  assert.equal(setup.capturedTimers.length, 2);

  setup.runActiveTimers();
  assert.equal(board.dataset.state, "changing");
  assert.equal(setup.ids.get("#terms-x-label").textContent, "x = 3");
  assert.equal(next.disabled, false);

  next.dispatch("click");
  assert.equal(board.dataset.state, "comparison");
  assert.equal(setup.ids.get("#terms-comparison").hidden, false);

  next.dispatch("click");
  assert.equal(board.dataset.state, "exploration");
  assert.equal(setup.ids.get("#terms-exploration").hidden, false);
  assert.equal(setup.ids.get("#terms-conclusion").hidden, false);
  assert.equal(next.hidden, true);
});

test("Reset bleibt in Zustand vier aktiv und neutralisiert selbst verspätete Timer", async () => {
  const setup = await harness();
  const next = buildToChanging(setup);
  const reset = setup.ids.get("#terms-reset");
  const board = setup.ids.get("#terms-board");

  assert.equal(next.disabled, true);
  assert.equal(reset.disabled, false);
  assert.equal(setup.activeTimers.size, 2);

  reset.dispatch("click");
  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.activeTimers.size, 0);
  assert.equal(setup.ids.get("#terms-prompt").hidden, false);
  assert.equal(setup.ids.get("#terms-blocks").hidden, true);

  setup.runAllCapturedCallbacks();
  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#terms-x-label").textContent, "");
  assert.equal(next.disabled, false);
});

test("Touch- und Mausänderungen über input halten x ganzzahlig zwischen null und fünf", async () => {
  const setup = await harness();
  finishToExploration(setup);
  const slider = setup.ids.get("#terms-x-slider");
  const expected = [3, 5, 7, 9, 11, 13];

  assert.equal(slider.disabled, false);
  for (let x = 0; x <= 5; x += 1) {
    slider.value = String(x);
    slider.dispatch("input", { pointerType: x % 2 === 0 ? "touch" : "mouse" });
    assert.equal(setup.ids.get("#terms-x-label").textContent, `x = ${x}`);
    assert.equal(setup.ids.get("#terms-x-block-value-a").textContent, String(x));
    assert.equal(setup.ids.get("#terms-x-block-value-b").textContent, String(x));
    assert.equal(setup.ids.get("#terms-value").textContent, String(expected[x]));
    assert.equal(
      setup.ids.get("#terms-substituted").textContent,
      `2 · ${x} + 3 = ${expected[x]}`,
    );
    assert.equal(slider.getAttribute("aria-valuetext"), `x ist ${x}, Termwert ${expected[x]}`);
  }

  slider.value = "99";
  slider.dispatch("input");
  assert.equal(slider.value, "5");
  assert.match(setup.ids.get("#terms-live").textContent, /x ist 5.*Termwert 13/);
});

test("reduzierte Bewegung beendet Zustand vier direkt und vollständig", async () => {
  const setup = await harness({ reducedMotion: true });
  const next = buildToChanging(setup);

  assert.equal(setup.ids.get("#terms-board").dataset.state, "changing");
  assert.equal(setup.ids.get("#terms-x-label").textContent, "x = 3");
  assert.equal(next.disabled, false);
  assert.equal(setup.capturedTimers.length, 0);
});

test("Abschlussbotschaft und erneuter Aufbau nach Reset bleiben deterministisch", async () => {
  const setup = await harness();
  finishToExploration(setup);
  const reset = setup.ids.get("#terms-reset");
  const next = setup.ids.get("#terms-next");

  assert.equal(
    setup.ids.get("#terms-conclusion").textContent,
    "2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.",
  );

  reset.dispatch("click");
  assert.equal(setup.ids.get("#terms-board").dataset.state, "irritation");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(setup.ids.get("#terms-board").dataset.state, "assigned");
  assert.equal(setup.ids.get("#terms-x-label").textContent, "x = 1");
});
