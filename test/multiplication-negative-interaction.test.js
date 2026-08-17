import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  let pointer = null;
  return {
    id,
    hidden: false,
    disabled: false,
    textContent: "",
    dataset: {},
    style: {},
    childrenBySelector: new Map(),
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      event.target ??= this;
      return listeners.get(type)?.(event);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    querySelector(selector) {
      return this.childrenBySelector.get(selector) ?? null;
    },
    closest(selector) {
      return selector === `#${id}` ? this : null;
    },
    setPointerCapture(pointerId) {
      pointer = pointerId;
    },
    hasPointerCapture(pointerId) {
      return pointer === pointerId;
    },
    releasePointerCapture(pointerId) {
      if (pointer === pointerId) pointer = null;
    },
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = [
    "multiplication-stage",
    "multiplication-prompt",
    "multiplication-pattern",
    "multiplication-pattern-steps",
    "multiplication-crossing",
    "multiplication-confirmation",
    "multiplication-secondary-rule",
    "multiplication-board",
    "multiplication-product-axis",
    "multiplication-factor-axis",
    "multiplication-factor-layer",
    "multiplication-product-point",
    "multiplication-first-factor-handle",
    "multiplication-explorer-formula",
    "multiplication-explorer-first-factor",
    "multiplication-explorer-product",
    "multiplication-insight",
    "multiplication-conclusion",
    "multiplication-live-value",
    "multiplication-next",
    "multiplication-reset",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const productTicks = Array.from({ length: 17 }, (_, index) => {
    const group = element(`product-${index - 8}`);
    group.dataset.multiplicationProduct = String(index - 8);
    group.childrenBySelector.set("line", element());
    group.childrenBySelector.set("text", element());
    return group;
  });
  const factorTicks = Array.from({ length: 9 }, (_, index) => {
    const group = element(`factor-${index - 4}`);
    group.dataset.multiplicationFactor = String(index - 4);
    group.childrenBySelector.set("line", element());
    group.childrenBySelector.set("text", element());
    return group;
  });
  const patternPoints = [
    [-6, "known"],
    [-4, "known"],
    [-2, "known"],
    [0, "known"],
    [2, "crossing"],
    [4, "confirmation"],
    [6, "confirmation"],
  ].map(([product, groupName]) => {
    const point = element(`pattern-${product}`);
    point.dataset.patternProduct = String(product);
    point.dataset.patternGroup = groupName;
    return point;
  });
  const board = ids.get("#multiplication-board");
  board.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() {
      return { x: this.x, y: this.y };
    },
  });
  board.getScreenCTM = () => ({ inverse: () => ({}) });

  const animationFrames = [];
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector: (selector) => ids.get(selector) ?? null,
      querySelectorAll(selector) {
        if (selector === "[data-multiplication-product]") return productTicks;
        if (selector === "[data-multiplication-factor]") return factorTicks;
        if (selector === "[data-pattern-product]") return patternPoints;
        return [];
      },
    },
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      matchMedia: () => ({ matches: reducedMotion }),
    },
  });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value() {},
  });

  await import(`../src/multiplication-negative-app.js?interaction=${Date.now()}-${Math.random()}`);
  const event = (target, pointerId, clientX, clientY = 999) => ({
    target,
    pointerId,
    clientX,
    clientY,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  });
  return { ids, board, productTicks, factorTicks, patternPoints, animationFrames, event };
}

function advanceToFree(setup) {
  const next = setup.ids.get("#multiplication-next");
  for (let index = 0; index < 5; index += 1) next.dispatch("click");
  return next;
}

test("vollständiger Aufbau enthüllt Muster, Nullübergang, Bestätigung und erst dann Erkundung", async () => {
  const setup = await harness();
  const next = setup.ids.get("#multiplication-next");
  assert.equal(setup.board.dataset.state, "prompt");
  assert.equal(setup.ids.get("#multiplication-prompt").hidden, false);
  assert.equal(setup.ids.get("#multiplication-pattern").hidden, true);
  assert.equal(setup.ids.get("#multiplication-board").hidden, true);

  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "known");
  assert.equal(setup.ids.get("#multiplication-pattern").hidden, false);
  assert.equal(setup.ids.get("#multiplication-pattern-steps").hidden, true);
  assert.equal(setup.patternPoints[0].getAttribute("visibility"), "visible");
  assert.equal(setup.patternPoints[4].getAttribute("visibility"), "hidden");

  next.dispatch("click");
  assert.equal(setup.ids.get("#multiplication-pattern-steps").hidden, false);
  next.dispatch("click");
  assert.equal(setup.ids.get("#multiplication-crossing").hidden, false);
  assert.equal(setup.patternPoints[4].getAttribute("visibility"), "visible");
  next.dispatch("click");
  assert.equal(setup.ids.get("#multiplication-confirmation").hidden, false);
  assert.equal(setup.ids.get("#multiplication-secondary-rule").hidden, false);
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "free");
  assert.equal(next.hidden, true);
  assert.equal(setup.ids.get("#multiplication-factor-layer").getAttribute("visibility"), "visible");
  assert.equal(setup.ids.get("#multiplication-explorer-formula").textContent, "(−1) · (−2) = 2");
});

test("schnelle Mehrfachtipps starten während einer Einblendung keinen zweiten Übergang", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#multiplication-next");
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "known");
  assert.equal(next.disabled, true);
  assert.equal(setup.ids.get("#multiplication-reset").disabled, true);
  assert.equal(setup.animationFrames.length, 1);
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "known");
  assert.equal(setup.animationFrames.length, 1);
  setup.animationFrames[0](0);
  setup.animationFrames[1](650);
  assert.equal(next.disabled, false);
});

test("Touch und Maus rasten horizontal auf minus vier bis plus vier und ignorieren y", async () => {
  const setup = await harness();
  advanceToFree(setup);
  const handle = setup.ids.get("#multiplication-first-factor-handle");

  const left = setup.event(handle, 7, -9999, 50000);
  setup.board.dispatch("pointerdown", left);
  assert.equal(left.defaultPrevented, true);
  assert.equal(handle.getAttribute("aria-valuenow"), "-4");
  assert.equal(setup.ids.get("#multiplication-explorer-formula").textContent, "(−4) · (−2) = 8");
  assert.equal(setup.ids.get("#multiplication-conclusion").hidden, false);

  const right = setup.event(handle, 7, 9999, -50000);
  setup.board.dispatch("pointermove", right);
  assert.equal(right.defaultPrevented, true);
  assert.equal(handle.getAttribute("aria-valuenow"), "4");
  assert.equal(setup.ids.get("#multiplication-explorer-formula").textContent, "4 · (−2) = −8");
  setup.board.dispatch("pointerup", setup.event(handle, 7, 0));
});

test("Tastatur, Reset und erneuter Aufbau bleiben deterministisch", async () => {
  const setup = await harness();
  const next = advanceToFree(setup);
  const handle = setup.ids.get("#multiplication-first-factor-handle");
  const reset = setup.ids.get("#multiplication-reset");

  handle.dispatch("keydown", { key: "ArrowLeft", preventDefault() {} });
  assert.equal(handle.getAttribute("aria-valuenow"), "-2");
  assert.equal(setup.ids.get("#multiplication-explorer-formula").textContent, "(−2) · (−2) = 4");
  handle.dispatch("keydown", { key: "ArrowRight", preventDefault() {} });
  assert.equal(handle.getAttribute("aria-valuenow"), "-1");
  handle.dispatch("keydown", { key: "ArrowUp", preventDefault() {} });
  assert.equal(handle.getAttribute("aria-valuenow"), "-1");

  reset.dispatch("click");
  assert.equal(setup.board.dataset.state, "prompt");
  assert.equal(setup.ids.get("#multiplication-prompt").hidden, false);
  assert.equal(setup.ids.get("#multiplication-pattern").hidden, true);
  assert.equal(setup.ids.get("#multiplication-factor-layer").getAttribute("visibility"), "hidden");

  for (let index = 0; index < 5; index += 1) next.dispatch("click");
  assert.equal(setup.board.dataset.state, "free");
  assert.equal(handle.getAttribute("aria-valuenow"), "-1");
});

test("reduzierte Bewegung erzeugt direkt den mathematisch identischen Endzustand", async () => {
  const setup = await harness({ reducedMotion: true });
  const next = setup.ids.get("#multiplication-next");
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "known");
  assert.equal(next.disabled, false);
  assert.equal(setup.animationFrames.length, 0);
});
