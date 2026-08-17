import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const styleValues = new Map();
  return {
    id,
    dataset: {},
    hidden: false,
    disabled: false,
    textContent: "",
    className: "",
    value: "",
    children: [],
    rect: { left: 0, right: 0 },
    style: {
      setProperty(name, value) {
        styleValues.set(name, String(value));
      },
      getPropertyValue(name) {
        return styleValues.get(name) ?? "";
      },
    },
    classList: {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      return listeners.get(type)?.({ currentTarget: this, target: this, ...event });
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
    getBoundingClientRect() {
      return this.rect;
    },
  };
}

async function harness({
  reducedMotion = true,
  mergeFirstRight = 100,
  mergeSecondLeft = 160,
  mergeBlockGap = 8,
} = {}) {
  const names = [
    "like-terms-board",
    "like-terms-irritation",
    "like-terms-groups",
    "like-terms-combined",
    "like-terms-counterexample",
    "like-terms-comparison",
    "like-terms-explore",
    "like-terms-conclusion",
    "like-group-first",
    "like-group-second",
    "combined-blocks",
    "counter-x-blocks",
    "counter-one-blocks",
    "compare-like-blocks",
    "compare-x-blocks",
    "compare-one-blocks",
    "explore-first-blocks",
    "explore-second-blocks",
    "explore-result-blocks",
    "explore-formula",
    "first-coefficient",
    "second-coefficient",
    "first-value",
    "second-value",
    "like-terms-insight",
    "like-terms-live",
    "like-terms-next",
    "like-terms-reset",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const animationFrames = [];
  const timerCallbacks = [];
  ids.get("#like-group-first").rect = { left: 20, right: mergeFirstRight };
  ids.get("#like-group-second").rect = { left: mergeSecondLeft, right: mergeSecondLeft + 80 };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector(selector) {
        return ids.get(selector) ?? null;
      },
      createElement(name) {
        return element(name);
      },
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia() {
        return { matches: reducedMotion };
      },
    },
  });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
  });
  Object.defineProperty(globalThis, "getComputedStyle", {
    configurable: true,
    value() {
      return { columnGap: `${mergeBlockGap}px` };
    },
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value() {},
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value(callback) {
      timerCallbacks.push(callback);
      return timerCallbacks.length;
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    configurable: true,
    value() {},
  });

  await import(`../src/like-terms-app.js?interaction=${Date.now()}-${Math.random()}`);
  return { ids, animationFrames, timerCallbacks };
}

test("Weiter zeigt alle sechs didaktischen Zustände in der vereinbarten Reihenfolge", async () => {
  const setup = await harness();
  const next = setup.ids.get("#like-terms-next");
  const board = setup.ids.get("#like-terms-board");

  assert.equal(board.dataset.state, "irritation");
  assert.equal(setup.ids.get("#like-terms-irritation").hidden, false);
  assert.equal(setup.ids.get("#like-terms-groups").hidden, true);

  next.dispatch("click");
  assert.equal(board.dataset.state, "groups");
  assert.equal(setup.ids.get("#like-group-first").children.length, 3);
  assert.equal(setup.ids.get("#like-group-second").children.length, 2);

  next.dispatch("click");
  assert.equal(board.dataset.state, "combined");
  assert.equal(setup.ids.get("#combined-blocks").children.length, 5);

  next.dispatch("click");
  assert.equal(board.dataset.state, "counterexample");
  assert.equal(setup.ids.get("#counter-x-blocks").children.length, 3);
  assert.equal(setup.ids.get("#counter-one-blocks").children.length, 2);

  next.dispatch("click");
  assert.equal(board.dataset.state, "comparison");
  assert.equal(setup.ids.get("#compare-like-blocks").children.length, 5);
  assert.equal(setup.ids.get("#compare-x-blocks").children.length, 3);
  assert.equal(setup.ids.get("#compare-one-blocks").children.length, 2);

  next.dispatch("click");
  assert.equal(board.dataset.state, "explore");
  assert.equal(next.hidden, true);
  assert.equal(setup.ids.get("#first-coefficient").disabled, false);
  assert.equal(setup.ids.get("#second-coefficient").disabled, false);
});

test("Mehrfachtipps starten während der Animation keinen zweiten Übergang", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#like-terms-next");
  const reset = setup.ids.get("#like-terms-reset");
  const board = setup.ids.get("#like-terms-board");

  next.dispatch("click");
  next.dispatch("click");
  assert.equal(board.dataset.state, "merging");
  assert.equal(next.disabled, true);
  assert.equal(reset.disabled, true);
  assert.equal(setup.animationFrames.length, 1);

  next.dispatch("click");
  next.dispatch("click");
  reset.dispatch("click");
  assert.equal(board.dataset.state, "merging");
  assert.equal(setup.animationFrames.length, 1);

  setup.animationFrames[0](0);
  setup.animationFrames.at(-1)(1100);
  assert.equal(board.dataset.state, "combined");
  assert.equal(next.disabled, false);
});

test("Zusammenführung misst bei kleinen und großen Viewports die echte Gruppenlücke", async () => {
  for (const geometry of [
    { mergeFirstRight: 100, mergeSecondLeft: 160, mergeBlockGap: 8, halfShift: "-26.000px" },
    { mergeFirstRight: 250, mergeSecondLeft: 400, mergeBlockGap: 16, halfShift: "-67.000px" },
  ]) {
    const setup = await harness({ reducedMotion: false, ...geometry });
    const next = setup.ids.get("#like-terms-next");
    next.dispatch("click");
    next.dispatch("click");
    setup.animationFrames[0](0);
    setup.animationFrames.at(-1)(550);
    assert.equal(
      setup.ids.get("#like-terms-board").style.getPropertyValue("--merge-shift"),
      geometry.halfShift,
    );
  }
});

test("Timeout-Fallback beendet die Zusammenführung auch ohne Animationsframe", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#like-terms-next");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(setup.ids.get("#like-terms-board").dataset.state, "merging");
  assert.equal(setup.timerCallbacks.length, 1);
  setup.timerCallbacks[0]();
  assert.equal(setup.ids.get("#like-terms-board").dataset.state, "combined");
});

test("beide nativen Regler aktualisieren Formel, Bausteine und Schlussaussage", async () => {
  const setup = await harness();
  const next = setup.ids.get("#like-terms-next");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");

  const first = setup.ids.get("#first-coefficient");
  const second = setup.ids.get("#second-coefficient");
  first.value = "1";
  first.dispatch("input");
  assert.equal(setup.ids.get("#like-terms-board").dataset.state, "conclusion");
  assert.equal(setup.ids.get("#explore-first-blocks").children.length, 1);
  assert.equal(setup.ids.get("#explore-formula").textContent, "1x + 2x = 3x");
  assert.equal(setup.ids.get("#like-terms-conclusion").hidden, false);

  second.value = "4";
  second.dispatch("input");
  assert.equal(setup.ids.get("#explore-second-blocks").children.length, 4);
  assert.equal(setup.ids.get("#explore-result-blocks").children.length, 5);
  assert.equal(setup.ids.get("#explore-formula").textContent, "1x + 4x = 5x");
  assert.equal(setup.ids.get("#like-terms-live").textContent, "1x + 4x = 5x");
});

test("Reset entfernt spätere Ebenen und stellt Ausgangswerte deterministisch wieder her", async () => {
  const setup = await harness();
  const next = setup.ids.get("#like-terms-next");
  const reset = setup.ids.get("#like-terms-reset");
  for (let step = 0; step < 5; step += 1) next.dispatch("click");
  const first = setup.ids.get("#first-coefficient");
  first.value = "4";
  first.dispatch("input");

  reset.dispatch("click");
  assert.equal(setup.ids.get("#like-terms-board").dataset.state, "irritation");
  assert.equal(setup.ids.get("#like-terms-irritation").hidden, false);
  assert.equal(setup.ids.get("#like-terms-conclusion").hidden, true);
  assert.equal(first.value, "3");
  assert.equal(setup.ids.get("#second-coefficient").value, "2");
});
