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
    childrenBySelector: new Map(),
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
    querySelector(selector) {
      return this.childrenBySelector.get(selector) ?? null;
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
  const idNames = [
    "order-board",
    "order-prompt",
    "order-axis-layer",
    "order-axis",
    "order-marker-eight",
    "order-marker-three",
    "order-comparison",
    "order-direction",
    "order-point-control",
    "order-point-handle",
    "order-current-value-text",
    "order-insight",
    "order-live-value",
    "order-next",
    "order-reset",
  ];
  const ids = new Map(idNames.map((id) => [`#${id}`, createElement(id)]));
  const ticks = Array.from({ length: 14 }, (_, index) => {
    const group = createElement(`tick-${index - 10}`);
    group.dataset.orderValue = String(index - 10);
    group.childrenBySelector.set("line", createElement());
    if ([-10, -8, -3, 0, 3].includes(index - 10)) {
      group.childrenBySelector.set("text", createElement());
    }
    return group;
  });
  const board = ids.get("#order-board");
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
    value: {
      querySelector: (selector) => ids.get(selector) ?? null,
      querySelectorAll: (selector) =>
        selector === "[data-order-value]" ? ticks : [],
    },
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

  await import(
    `../src/order-number-line-app.js?interaction=${Date.now()}-${Math.random()}`
  );

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

  return { ids, ticks, board, event };
}

test("Touch und Maus durchlaufen Auflösung, Vergleich, Einrasten und Reset", async () => {
  const harness = await createHarness();
  const prompt = harness.ids.get("#order-prompt");
  const axisLayer = harness.ids.get("#order-axis-layer");
  const markerEight = harness.ids.get("#order-marker-eight");
  const markerThree = harness.ids.get("#order-marker-three");
  const comparison = harness.ids.get("#order-comparison");
  const next = harness.ids.get("#order-next");
  const reset = harness.ids.get("#order-reset");
  const point = harness.ids.get("#order-point-handle");
  const control = harness.ids.get("#order-point-control");

  assert.equal(harness.board.dataset.state, "prompt");
  assert.equal(prompt.hidden, false);
  assert.equal(axisLayer.getAttribute("visibility"), "hidden");
  assert.equal(comparison.getAttribute("visibility"), "hidden");
  assert.equal(control.getAttribute("visibility"), "hidden");

  const blockedDrag = harness.event(point, 1, 295, -500);
  harness.board.dispatch("pointerdown", blockedDrag);
  assert.equal(blockedDrag.defaultPrevented, false);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "line");
  assert.equal(prompt.hidden, true);
  assert.equal(axisLayer.getAttribute("visibility"), "visible");
  assert.equal(markerEight.getAttribute("transform"), "translate(295 270)");
  assert.equal(markerThree.getAttribute("transform"), "translate(745 270)");
  assert.match(harness.ids.get("#order-insight").textContent, /weiter rechts/i);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "comparison");
  assert.equal(comparison.getAttribute("visibility"), "visible");
  assert.equal(control.getAttribute("visibility"), "hidden");
  assert.match(harness.ids.get("#order-insight").textContent, /−3.*größer/i);

  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "free");
  assert.equal(next.hidden, true);
  assert.equal(control.getAttribute("visibility"), "visible");
  assert.equal(control.getAttribute("transform"), "translate(1015 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "0");

  const touchDown = harness.event(point, 7, 295, 5000);
  harness.board.dispatch("pointerdown", touchDown);
  assert.equal(touchDown.defaultPrevented, true);
  assert.equal(harness.board.dataset.state, "conclusion");
  assert.equal(control.getAttribute("transform"), "translate(295 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "-8");
  assert.equal(point.getAttribute("aria-valuetext"), "−8");
  assert.match(harness.ids.get("#order-insight").textContent, /Position.*entscheidet/i);

  const touchMove = harness.event(point, 7, 745, -9000);
  harness.board.dispatch("pointermove", touchMove);
  assert.equal(touchMove.defaultPrevented, true);
  assert.equal(control.getAttribute("transform"), "translate(745 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "-3");
  harness.board.dispatch("pointerup", harness.event(point, 7, 745));

  const mouseDown = harness.event(point, 9, 9999, -500);
  harness.board.dispatch("pointerdown", mouseDown);
  assert.equal(control.getAttribute("transform"), "translate(1285 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "3");
  assert.equal(point.getAttribute("aria-valuetext"), "+3");
  harness.board.dispatch("pointerup", harness.event(point, 9, 9999));

  point.dispatch("keydown", { key: "ArrowLeft", preventDefault() {} });
  assert.equal(point.getAttribute("aria-valuenow"), "2");
  point.dispatch("keydown", { key: "Home", preventDefault() {} });
  assert.equal(control.getAttribute("transform"), "translate(115 270)");
  assert.equal(point.getAttribute("aria-valuenow"), "-10");
  point.dispatch("keydown", { key: "End", preventDefault() {} });
  assert.equal(point.getAttribute("aria-valuenow"), "3");

  reset.dispatch("click");
  assert.equal(harness.board.dataset.state, "prompt");
  assert.equal(prompt.hidden, false);
  assert.equal(axisLayer.getAttribute("visibility"), "hidden");
  assert.equal(comparison.getAttribute("visibility"), "hidden");
  assert.equal(control.getAttribute("visibility"), "hidden");
  assert.equal(next.hidden, false);

  next.dispatch("click");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(harness.board.dataset.state, "free");
});

test("statische Tickpositionen werden aus derselben Geometrie gesetzt", async () => {
  const harness = await createHarness();
  for (const tick of harness.ticks) {
    const value = Number(tick.dataset.orderValue);
    const expectedX = 115 + (value + 10) * 90;
    assert.equal(
      tick.childrenBySelector.get("line").getAttribute("x1"),
      String(expectedX),
    );
    assert.equal(
      tick.childrenBySelector.get("line").getAttribute("x2"),
      String(expectedX),
    );
    const text = tick.childrenBySelector.get("text");
    if (text) assert.equal(text.getAttribute("x"), String(expectedX));
  }
});
