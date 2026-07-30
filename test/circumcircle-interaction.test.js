import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import test from "node:test";

function createElement(dataset = {}) {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const capturedPointers = new Set();
  return {
    dataset,
    attributes,
    classList: {
      contains(name) {
        return classes.has(name);
      },
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    disabled: false,
    hidden: false,
    textContent: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event = {}) {
      listeners.get(type)?.({
        preventDefault() {},
        ...event,
      });
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    closest(selector) {
      return selector === "[data-drag-kind]" && this.dataset.dragKind ? this : null;
    },
    setPointerCapture(pointerId) {
      capturedPointers.add(pointerId);
    },
    hasPointerCapture(pointerId) {
      return capturedPointers.has(pointerId);
    },
    releasePointerCapture(pointerId) {
      capturedPointers.delete(pointerId);
    },
  };
}

async function createHarness() {
  const ids = new Map();
  const add = (id, dataset = {}) => {
    const element = createElement(dataset);
    ids.set(`#${id}`, element);
    return element;
  };

  const board = add("circumcircle-board");
  board.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() {
      return { x: this.x, y: this.y };
    },
  });
  board.getScreenCTM = () => ({ inverse: () => ({}) });

  for (const id of [
    "circumcircle-triangle",
    "circumcircle",
    "side-ab",
    "side-bc",
    "side-ca",
    "test-point-group",
    "test-point-control",
    "distance-pa",
    "distance-pb",
    "center-group",
    "center-control",
    "radius-ma",
    "radius-mb",
    "radius-mc",
    "circumcircle-insight",
    "circumcircle-feedback",
    "circumcircle-next",
    "circumcircle-reset",
  ]) {
    add(id);
  }
  for (let index = 1; index <= 3; index += 1) {
    add(`bisector-${index}`);
    add(`bisector-line-${index}`);
    add(`bisector-angle-${index}`);
    add(`midpoint-${index}`);
  }
  const testHandle = add("test-point-handle", { dragKind: "test" });
  const vertexControls = Object.fromEntries(
    ["A", "B", "C"].map((key) => [
      key,
      add(`vertex-${key}-control`, { dragKind: "vertex", key }),
    ]),
  );

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector(selector) {
        return ids.get(selector) ?? null;
      },
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  await import(`../src/circumcircle-app.js?test=${Date.now()}`);

  const pointer = (type, target, x, y, pointerId = 1) =>
    board.dispatch(type, {
      target,
      clientX: x,
      clientY: y,
      pointerId,
    });

  return {
    board,
    ids,
    testHandle,
    vertexControls,
    clickNext() {
      ids.get("#circumcircle-next").dispatch("click");
    },
    reset() {
      ids.get("#circumcircle-reset").dispatch("click");
    },
    drag(target, from, to, pointerId = 1) {
      pointer("pointerdown", target, from.x, from.y, pointerId);
      pointer("pointermove", target, to.x, to.y, pointerId);
      pointer("pointerup", target, to.x, to.y, pointerId);
    },
  };
}

function visible(element) {
  return element.getAttribute("visibility") === "visible";
}

test("vollständige Pointer- und Zustandsinteraktion entfernt alte SVG-Zustände", async () => {
  const harness = await createHarness();
  const { ids, board } = harness;

  try {
    assert.equal(board.dataset.state, "first");
    assert.equal(visible(ids.get("#bisector-1")), true);
    assert.equal(visible(ids.get("#bisector-2")), false);
    assert.equal(visible(ids.get("#bisector-3")), false);
    assert.equal(visible(ids.get("#test-point-group")), true);
    assert.equal(visible(ids.get("#center-group")), false);
    assert.equal(visible(ids.get("#circumcircle")), false);

    harness.drag(harness.testHandle, { x: 600, y: 300 }, { x: 980, y: 650 });
    assert.match(ids.get("#test-point-control").getAttribute("transform"), /^translate\(600 /);

    harness.clickNext();
    assert.equal(board.dataset.state, "second");
    assert.equal(visible(ids.get("#bisector-2")), true);
    assert.equal(visible(ids.get("#bisector-3")), false);
    assert.equal(visible(ids.get("#test-point-group")), false);

    harness.clickNext();
    assert.equal(board.dataset.state, "second", "schneller Mehrfachtipp wird gesperrt");
    await wait(310);
    harness.clickNext();
    assert.equal(board.dataset.state, "intersection");
    assert.equal(visible(ids.get("#bisector-3")), true);
    assert.equal(visible(ids.get("#center-group")), true);
    assert.equal(visible(ids.get("#circumcircle")), false);

    await wait(310);
    harness.clickNext();
    assert.equal(board.dataset.state, "circle");
    assert.equal(visible(ids.get("#circumcircle")), true);
    assert.equal(ids.get("#circumcircle-next").hidden, true);

    const beforeCenter = ids.get("#center-control").getAttribute("transform");
    harness.drag(harness.vertexControls.C, { x: 540, y: 180 }, { x: 650, y: 210 }, 2);
    assert.equal(
      ids.get("#vertex-C-control").getAttribute("transform"),
      "translate(650 210)",
    );
    assert.notEqual(ids.get("#center-control").getAttribute("transform"), beforeCenter);

    const validTransform = ids.get("#vertex-C-control").getAttribute("transform");
    harness.drag(harness.vertexControls.C, { x: 650, y: 210 }, { x: 600, y: 539 }, 3);
    assert.equal(ids.get("#vertex-C-control").getAttribute("transform"), validTransform);
    assert.equal(ids.get("#circumcircle-feedback").hidden, false);
    assert.ok(ids.get("#circumcircle-feedback").textContent);

    harness.reset();
    assert.equal(board.dataset.state, "first");
    assert.equal(visible(ids.get("#test-point-group")), true);
    assert.equal(visible(ids.get("#center-group")), false);
    assert.equal(visible(ids.get("#circumcircle")), false);

    for (let step = 0; step < 3; step += 1) {
      harness.clickNext();
      await wait(310);
    }
    assert.equal(board.dataset.state, "circle");
    assert.equal(visible(ids.get("#circumcircle")), true);
  } finally {
    delete globalThis.document;
    delete globalThis.navigator;
  }
});
