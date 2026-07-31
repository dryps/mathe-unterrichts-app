import assert from "node:assert/strict";
import test from "node:test";

function createElement(id = "") {
  const listeners = new Map();
  const attributes = new Map();
  let capturedPointer = null;
  return {
    id,
    dataset: {},
    disabled: false,
    hidden: false,
    textContent: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      listeners.get(type)?.(event);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    closest(selector) {
      return selector === `#${id}` ? this : null;
    },
    setPointerCapture(pointerId) {
      capturedPointer = pointerId;
    },
    hasPointerCapture(pointerId) {
      return capturedPointer === pointerId;
    },
    releasePointerCapture(pointerId) {
      if (capturedPointer === pointerId) capturedPointer = null;
    },
  };
}

async function createHarness() {
  const ids = new Map(
    [
      "number-board",
      "number-point-control",
      "number-point-handle",
      "current-value",
      "current-value-text",
      "negative-ticks",
      "negative-tick-1",
      "negative-tick-2",
      "negative-tick-3",
      "number-insight",
      "number-live-value",
      "number-next",
      "number-reset",
    ].map((id) => [`#${id}`, createElement(id)]),
  );
  const board = ids.get("#number-board");
  board.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() {
      return { x: this.x, y: this.y };
    },
  });
  board.getScreenCTM = () => ({ inverse: () => ({}) });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelector: (selector) => ids.get(selector) ?? null },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      matchMedia: () => ({ matches: true }),
    },
  });

  await import(`../src/number-line-app.js?interaction=${Date.now()}`);

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

  return { ids, board, event };
}

test("Touch- und Mauspfad durchlaufen Aufbau, Einrasten, Schutzgrenzen und Reset", async () => {
  const harness = await createHarness();
  const next = harness.ids.get("#number-next");
  const reset = harness.ids.get("#number-reset");
  const point = harness.ids.get("#number-point-handle");
  const control = harness.ids.get("#number-point-control");

  assert.equal(harness.board.dataset.state, "initial");
  assert.equal(control.getAttribute("transform"), "translate(600 270)");
  assert.equal(harness.ids.get("#negative-ticks").getAttribute("visibility"), "hidden");

  const blockedDrag = harness.event(point, 1, 150);
  harness.board.dispatch("pointerdown", blockedDrag);
  assert.equal(blockedDrag.defaultPrevented, false);
  assert.equal(control.getAttribute("transform"), "translate(600 270)");

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "right");
  assert.equal(control.getAttribute("transform"), "translate(1050 270)");
  assert.match(harness.ids.get("#number-insight").textContent, /rechts.*größer/i);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "home");
  assert.equal(control.getAttribute("transform"), "translate(600 270)");

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "negative");
  assert.equal(control.getAttribute("transform"), "translate(150 270)");
  assert.equal(harness.ids.get("#negative-ticks").getAttribute("visibility"), "visible");

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "free");
  assert.equal(next.hidden, true);
  assert.equal(harness.ids.get("#current-value").getAttribute("visibility"), "visible");

  const touchDown = harness.event(point, 7, 742, 40);
  harness.board.dispatch("pointerdown", touchDown);
  assert.equal(touchDown.defaultPrevented, true);
  assert.equal(control.getAttribute("transform"), "translate(750 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "1");
  assert.equal(point.getAttribute("aria-valuetext"), "+1");

  const touchMove = harness.event(point, 7, 288, 5000);
  harness.board.dispatch("pointermove", touchMove);
  assert.equal(touchMove.defaultPrevented, true);
  assert.equal(control.getAttribute("transform"), "translate(300 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "-2");
  assert.equal(point.getAttribute("aria-valuetext"), "−2");
  harness.board.dispatch("pointerup", harness.event(point, 7, 288));

  const mouseDown = harness.event(point, 9, 9999, -500);
  harness.board.dispatch("pointerdown", mouseDown);
  assert.equal(control.getAttribute("transform"), "translate(1050 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "3");
  harness.board.dispatch("pointerup", harness.event(point, 9, 9999));

  const leftKey = { key: "ArrowLeft", preventDefault() {} };
  point.dispatch("keydown", leftKey);
  assert.equal(control.getAttribute("transform"), "translate(900 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "2");

  reset.dispatch("click");
  assert.equal(harness.board.dataset.state, "initial");
  assert.equal(control.getAttribute("transform"), "translate(600 270)");
  assert.equal(harness.ids.get("#negative-ticks").getAttribute("visibility"), "hidden");
  assert.equal(next.hidden, false);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "right");
});
