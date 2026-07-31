import assert from "node:assert/strict";
import test from "node:test";

function createElement(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  let capturedPointer = null;
  return {
    id,
    dataset: {},
    style: {},
    disabled: false,
    hidden: false,
    textContent: "",
    children: [],
    childrenBySelector: new Map(),
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { listeners.get(type)?.(event); },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    querySelector(selector) { return this.childrenBySelector.get(selector) ?? null; },
    replaceChildren(...children) { this.children = children; },
    closest(selector) { return selector === `#${id}` ? this : null; },
    setPointerCapture(pointerId) { capturedPointer = pointerId; },
    hasPointerCapture(pointerId) { return capturedPointer === pointerId; },
    releasePointerCapture(pointerId) { if (capturedPointer === pointerId) capturedPointer = null; },
  };
}

async function createHarness() {
  const idNames = [
    "absolute-board", "absolute-prompt", "absolute-axis-layer", "absolute-axis",
    "absolute-negative-marker", "absolute-positive-marker", "absolute-direction",
    "absolute-direction-line", "absolute-negative-distance", "absolute-positive-distance",
    "absolute-negative-formula", "absolute-equality-formula", "absolute-dynamic-formula",
    "absolute-dynamic-formula-text", "absolute-point-control", "absolute-point-handle",
    "absolute-current-value-text", "absolute-insight", "absolute-live-value",
    "absolute-next", "absolute-reset",
  ];
  const ids = new Map(idNames.map((id) => [`#${id}`, createElement(id)]));

  for (const prefix of ["negative", "positive"]) {
    const group = ids.get(`#absolute-${prefix}-distance`);
    group.childrenBySelector.set(".distance-line", createElement(`${prefix}-line`));
    group.childrenBySelector.set("[data-distance-boundaries]", createElement(`${prefix}-boundaries`));
  }

  const ticks = Array.from({ length: 13 }, (_, index) => {
    const value = index - 6;
    const group = createElement(`tick-${value}`);
    group.dataset.absoluteValue = String(value);
    group.childrenBySelector.set("line", createElement());
    if ([-6, -4, 0, 4, 6].includes(value)) group.childrenBySelector.set("text", createElement());
    return group;
  });

  const board = ids.get("#absolute-board");
  board.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() { return { x: this.x, y: this.y }; },
  });
  board.getScreenCTM = () => ({ inverse: () => ({}) });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector: (selector) => ids.get(selector) ?? null,
      querySelectorAll: (selector) => selector === "[data-absolute-value]" ? ticks : [],
      createElementNS: (_namespace, name) => createElement(name),
    },
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { addEventListener() {}, matchMedia: () => ({ matches: true }) },
  });

  await import(`../src/absolute-value-app.js?interaction=${Date.now()}-${Math.random()}`);

  const event = (target, pointerId, clientX, clientY = 999) => ({
    target, pointerId, clientX, clientY, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
  });
  return { ids, ticks, board, event };
}

test("Touch und Maus durchlaufen Richtung, Abstand, Gegenüberstellung und freie Erkundung", async () => {
  const harness = await createHarness();
  const next = harness.ids.get("#absolute-next");
  const reset = harness.ids.get("#absolute-reset");
  const point = harness.ids.get("#absolute-point-handle");
  const control = harness.ids.get("#absolute-point-control");
  const negativeDistance = harness.ids.get("#absolute-negative-distance");
  const positiveDistance = harness.ids.get("#absolute-positive-distance");
  const negativeLine = negativeDistance.querySelector(".distance-line");
  const boundaries = negativeDistance.querySelector("[data-distance-boundaries]");

  assert.equal(harness.board.dataset.state, "prompt");
  assert.equal(harness.ids.get("#absolute-prompt").hidden, false);
  assert.equal(harness.ids.get("#absolute-axis-layer").getAttribute("visibility"), "hidden");

  const blocked = harness.event(point, 1, 1090, -5000);
  harness.board.dispatch("pointerdown", blocked);
  assert.equal(blocked.defaultPrevented, false);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "direction");
  assert.equal(harness.ids.get("#absolute-direction").getAttribute("visibility"), "visible");
  assert.match(harness.ids.get("#absolute-insight").textContent, /Vorzeichen.*Richtung/i);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "distance");
  assert.equal(negativeDistance.getAttribute("visibility"), "visible");
  assert.equal(negativeLine.getAttribute("x1"), "310");
  assert.equal(negativeLine.getAttribute("x2"), "700");
  assert.equal(boundaries.children.length, 5);
  assert.equal(harness.ids.get("#absolute-negative-formula").getAttribute("visibility"), "visible");

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "opposite");
  assert.equal(positiveDistance.getAttribute("visibility"), "visible");
  assert.equal(harness.ids.get("#absolute-equality-formula").getAttribute("visibility"), "visible");

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "free");
  assert.equal(next.hidden, true);
  assert.equal(control.getAttribute("visibility"), "visible");
  assert.equal(control.getAttribute("transform"), "translate(310 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "-4");

  const touchDown = harness.event(point, 7, 992.5, 5000);
  harness.board.dispatch("pointerdown", touchDown);
  assert.equal(touchDown.defaultPrevented, true);
  assert.equal(harness.board.dataset.state, "conclusion");
  assert.equal(control.getAttribute("transform"), "translate(992.5 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "3");
  assert.equal(harness.ids.get("#absolute-dynamic-formula-text").textContent, "|3| = 3");
  assert.equal(negativeLine.getAttribute("x1"), "700");
  assert.equal(negativeLine.getAttribute("x2"), "992.5");

  const touchMove = harness.event(point, 7, 700, -9000);
  harness.board.dispatch("pointermove", touchMove);
  assert.equal(touchMove.defaultPrevented, true);
  assert.equal(control.getAttribute("transform"), "translate(700 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "0");
  assert.equal(harness.ids.get("#absolute-dynamic-formula-text").textContent, "|0| = 0");
  assert.equal(negativeLine.getAttribute("x1"), "700");
  assert.equal(negativeLine.getAttribute("x2"), "700");
  assert.equal(boundaries.children.length, 1);
  harness.board.dispatch("pointerup", harness.event(point, 7, 700));

  const mouseDown = harness.event(point, 9, -9999, -500);
  harness.board.dispatch("pointerdown", mouseDown);
  assert.equal(point.getAttribute("aria-valuenow"), "-6");
  assert.equal(harness.ids.get("#absolute-dynamic-formula-text").textContent, "|−6| = 6");
  harness.board.dispatch("pointerup", harness.event(point, 9, -9999));

  reset.dispatch("click");
  assert.equal(harness.board.dataset.state, "prompt");
  assert.equal(harness.ids.get("#absolute-prompt").hidden, false);
  assert.equal(control.getAttribute("visibility"), "hidden");
  assert.equal(next.hidden, false);

  next.dispatch("click"); next.dispatch("click"); next.dispatch("click"); next.dispatch("click");
  assert.equal(harness.board.dataset.state, "free");
});

test("Tastatur, Grenzen und statische Tickpositionen verwenden dieselbe Geometrie", async () => {
  const harness = await createHarness();
  const next = harness.ids.get("#absolute-next");
  for (let index = 0; index < 4; index += 1) next.dispatch("click");
  const point = harness.ids.get("#absolute-point-handle");
  const control = harness.ids.get("#absolute-point-control");

  point.dispatch("keydown", { key: "ArrowRight", preventDefault() {} });
  assert.equal(point.getAttribute("aria-valuenow"), "-3");
  point.dispatch("keydown", { key: "Home", preventDefault() {} });
  assert.equal(control.getAttribute("transform"), "translate(115 270)");
  point.dispatch("keydown", { key: "End", preventDefault() {} });
  assert.equal(control.getAttribute("transform"), "translate(1285 270)");

  for (const tick of harness.ticks) {
    const value = Number(tick.dataset.absoluteValue);
    const expectedX = 115 + (value + 6) * 97.5;
    assert.equal(tick.querySelector("line").getAttribute("x1"), String(expectedX));
    const text = tick.querySelector("text");
    if (text) assert.equal(text.getAttribute("x"), String(expectedX));
  }
});
