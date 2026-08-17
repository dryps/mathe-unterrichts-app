import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  let pointer = null;
  return {
    id,
    dataset: {},
    style: {},
    hidden: false,
    disabled: false,
    textContent: "",
    children: [],
    childrenBySelector: new Map(),
    classList: {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    },
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
    querySelector(selector) {
      return this.childrenBySelector.get(selector) ?? null;
    },
    replaceChildren(...nodes) {
      this.children = nodes;
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
    "subtraction-board", "subtraction-prompt", "subtraction-axis-layer", "subtraction-axis",
    "subtraction-start-point", "subtraction-original-vector", "subtraction-original-line",
    "subtraction-original-boundaries", "subtraction-original-arrowhead", "subtraction-reversal-vector",
    "subtraction-reversal-line", "subtraction-reversal-boundaries", "subtraction-reversal-arrowhead",
    "subtraction-effective-vector", "subtraction-effective-line", "subtraction-effective-boundaries",
    "subtraction-effective-arrowhead", "subtraction-moving-point", "subtraction-result-point",
    "subtraction-end-handle", "subtraction-formula", "subtraction-start-term", "subtraction-operator",
    "subtraction-sign", "subtraction-magnitude", "subtraction-result-term", "subtraction-equations",
    "subtraction-equation-one", "subtraction-equation-two", "subtraction-equation-three",
    "subtraction-insight", "subtraction-conclusion-detail", "subtraction-live-value",
    "subtraction-next", "subtraction-reset", "subtraction-original-label", "subtraction-effective-label",
  ];
  const ids = new Map(names.map((id) => [`#${id}`, element(id)]));
  const ticks = Array.from({ length: 9 }, (_, value) => {
    const group = element(`tick-${value}`);
    group.dataset.subtractionValue = String(value);
    group.childrenBySelector.set("line", element());
    group.childrenBySelector.set("text", element());
    return group;
  });
  const board = ids.get("#subtraction-board");
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
      querySelectorAll: (selector) =>
        selector === "[data-subtraction-value]" ? ticks : [],
      createElementNS: (_namespace, name) => element(name),
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

  await import(`../src/subtraction-negative-app.js?interaction=${Date.now()}-${Math.random()}`);
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
  return { ids, ticks, board, animationFrames, event };
}

test("vollständiger Aufbau trennt beide Minuszeichen und zeigt die Umkehrung", async () => {
  const setup = await harness();
  const next = setup.ids.get("#subtraction-next");
  assert.equal(setup.board.dataset.state, "prompt");
  assert.equal(setup.ids.get("#subtraction-axis-layer").getAttribute("visibility"), "hidden");

  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "start");
  assert.equal(setup.ids.get("#subtraction-start-term").classList.contains("is-highlighted"), true);

  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "negative");
  assert.equal(setup.ids.get("#subtraction-sign").classList.contains("is-highlighted"), true);
  assert.equal(setup.ids.get("#subtraction-magnitude").classList.contains("is-highlighted"), true);
  assert.equal(setup.ids.get("#subtraction-operator").classList.contains("is-highlighted"), false);
  assert.equal(setup.ids.get("#subtraction-original-vector").getAttribute("visibility"), "visible");

  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "result");
  assert.equal(setup.ids.get("#subtraction-original-vector").getAttribute("visibility"), "visible");
  assert.equal(setup.ids.get("#subtraction-effective-vector").getAttribute("visibility"), "visible");
  assert.equal(setup.ids.get("#subtraction-equation-one").textContent, "4 − (−2) = 6");
  assert.equal(setup.ids.get("#subtraction-equation-two").textContent, "4 + 2 = 6");
  assert.equal(setup.ids.get("#subtraction-equation-three").textContent, "4 − (−2) = 4 + 2");

  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "free");
  assert.equal(next.hidden, true);
});

test("schnelle Mehrfachtipps starten keine zweite Umkehranimation", async () => {
  const setup = await harness({ reducedMotion: false });
  const next = setup.ids.get("#subtraction-next");
  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "reversing");
  assert.equal(next.disabled, true);
  assert.equal(setup.ids.get("#subtraction-reset").disabled, true);
  assert.equal(setup.animationFrames.length, 1);
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(setup.board.dataset.state, "reversing");
  assert.equal(setup.animationFrames.length, 1);
});

test("Touch und Maus rasten −1 bis −4 ein und ignorieren vertikale Bewegung", async () => {
  const setup = await harness();
  const next = setup.ids.get("#subtraction-next");
  const handle = setup.ids.get("#subtraction-end-handle");
  for (let index = 0; index < 4; index += 1) next.dispatch("click");

  const left = setup.event(handle, 7, -9999, 50000);
  setup.board.dispatch("pointerdown", left);
  assert.equal(left.defaultPrevented, true);
  assert.equal(handle.getAttribute("aria-valuenow"), "-4");
  assert.equal(setup.ids.get("#subtraction-equation-one").textContent, "4 − (−4) = 8");
  assert.equal(setup.board.dataset.state, "conclusion");
  assert.equal(setup.ids.get("#subtraction-conclusion-detail").hidden, false);

  const right = setup.event(handle, 7, 9999, -50000);
  setup.board.dispatch("pointermove", right);
  assert.equal(right.defaultPrevented, true);
  assert.equal(handle.getAttribute("aria-valuenow"), "-1");
  assert.equal(setup.ids.get("#subtraction-equation-one").textContent, "4 − (−1) = 5");
  setup.board.dispatch("pointerup", setup.event(handle, 7, 0));
});

test("Tastatur, Reset und erneuter Aufbau bleiben deterministisch", async () => {
  const setup = await harness();
  const next = setup.ids.get("#subtraction-next");
  const reset = setup.ids.get("#subtraction-reset");
  const handle = setup.ids.get("#subtraction-end-handle");
  for (let index = 0; index < 4; index += 1) next.dispatch("click");

  handle.dispatch("keydown", { key: "ArrowLeft", preventDefault() {} });
  assert.equal(handle.getAttribute("aria-valuenow"), "-3");
  handle.dispatch("keydown", { key: "ArrowRight", preventDefault() {} });
  assert.equal(handle.getAttribute("aria-valuenow"), "-2");

  reset.dispatch("click");
  assert.equal(setup.board.dataset.state, "prompt");
  assert.equal(setup.ids.get("#subtraction-prompt").hidden, false);
  assert.equal(setup.ids.get("#subtraction-original-vector").getAttribute("visibility"), "hidden");
  assert.equal(setup.ids.get("#subtraction-effective-boundaries").children.length, 0);

  for (let index = 0; index < 4; index += 1) next.dispatch("click");
  assert.equal(setup.board.dataset.state, "free");
  assert.equal(handle.getAttribute("aria-valuenow"), "-2");
});
