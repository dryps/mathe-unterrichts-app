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

  const board = add("incircle-board");
  board.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() {
      return { x: this.x, y: this.y };
    },
  });
  board.getScreenCTM = () => ({ inverse: () => ({}) });

  for (const id of [
    "incircle-triangle",
    "incircle",
    "side-ab",
    "side-bc",
    "side-ca",
    "angle-a-first",
    "angle-a-second",
    "angle-a-mark-first",
    "angle-a-mark-second",
    "test-point-group",
    "test-point-control",
    "test-lot-ab",
    "test-lot-ac",
    "test-foot-ab",
    "test-foot-ac",
    "test-right-ab",
    "test-right-ac",
    "test-mark-ab",
    "test-mark-ac",
    "center-group",
    "center-control",
    "radius-equality",
    "incircle-insight",
    "incircle-feedback",
    "incircle-next",
    "incircle-reset",
  ]) {
    add(id);
  }
  for (let index = 1; index <= 3; index += 1) {
    add(`bisector-${index}`);
    add(`bisector-line-${index}`);
  }
  for (const side of ["ab", "bc", "ca"]) {
    add(`radius-${side}`);
    add(`touch-${side}`);
    add(`center-right-${side}`);
    add(`radius-mark-${side}`);
    add(`radius-label-${side}`);
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

  await import(`../src/incircle-app.js?test=${Date.now()}`);

  const pointer = (type, target, x, y, pointerId = 1, pointerType = "mouse") =>
    board.dispatch(type, {
      target,
      clientX: x,
      clientY: y,
      pointerId,
      pointerType,
    });

  return {
    board,
    ids,
    testHandle,
    vertexControls,
    clickNext() {
      ids.get("#incircle-next").dispatch("click");
    },
    reset() {
      ids.get("#incircle-reset").dispatch("click");
    },
    drag(target, from, to, pointerId = 1, pointerType = "mouse") {
      pointer("pointerdown", target, from.x, from.y, pointerId, pointerType);
      pointer("pointermove", target, to.x, to.y, pointerId, pointerType);
      pointer("pointerup", target, to.x, to.y, pointerId, pointerType);
    },
  };
}

function visible(element) {
  return element.getAttribute("visibility") === "visible";
}

test("vollständige Maus-, Touch- und Zustandsinteraktion entfernt alte SVG-Zustände", async () => {
  const harness = await createHarness();
  const { ids, board } = harness;

  try {
    assert.equal(board.dataset.state, "first");
    assert.equal(visible(ids.get("#bisector-1")), true);
    assert.equal(visible(ids.get("#bisector-2")), false);
    assert.equal(visible(ids.get("#bisector-3")), false);
    assert.equal(visible(ids.get("#test-point-group")), true);
    assert.equal(visible(ids.get("#center-group")), false);
    assert.equal(visible(ids.get("#incircle")), false);

    const initialP = ids.get("#test-point-control").getAttribute("transform");
    harness.drag(
      harness.testHandle,
      { x: 480, y: 450 },
      { x: 760, y: 240 },
      1,
      "touch",
    );
    assert.notEqual(ids.get("#test-point-control").getAttribute("transform"), initialP);
    assert.ok(ids.get("#test-lot-ab").getAttribute("x2"));
    assert.ok(ids.get("#test-lot-ac").getAttribute("x2"));

    harness.clickNext();
    assert.equal(board.dataset.state, "all-bisectors");
    assert.equal(board.classList.contains("is-revealing"), true);
    assert.equal(ids.get("#incircle-next").disabled, true);
    assert.equal(visible(ids.get("#bisector-2")), true);
    assert.equal(visible(ids.get("#bisector-3")), true);
    assert.equal(visible(ids.get("#test-point-group")), false);
    assert.equal(visible(ids.get("#center-group")), true);
    assert.equal(visible(ids.get("#incircle")), false);

    harness.clickNext();
    assert.equal(
      board.dataset.state,
      "all-bisectors",
      "schneller Mehrfachtipp wird während der Abfolge gesperrt",
    );
    await wait(850);
    assert.equal(board.classList.contains("is-revealing"), false);
    harness.clickNext();
    assert.equal(board.dataset.state, "incircle");
    assert.equal(visible(ids.get("#incircle")), true);
    assert.equal(ids.get("#incircle-next").hidden, true);

    await wait(320);
    const beforeCenter = ids.get("#center-control").getAttribute("transform");
    harness.drag(
      harness.vertexControls.C,
      { x: 600, y: 140 },
      { x: 720, y: 150 },
      2,
      "mouse",
    );
    assert.equal(
      ids.get("#vertex-C-control").getAttribute("transform"),
      "translate(720 150)",
    );
    assert.notEqual(ids.get("#center-control").getAttribute("transform"), beforeCenter);
    assert.ok(ids.get("#touch-bc").getAttribute("cx"));

    const validTransform = ids.get("#vertex-C-control").getAttribute("transform");
    harness.drag(
      harness.vertexControls.C,
      { x: 720, y: 150 },
      { x: 600, y: 550 },
      3,
      "touch",
    );
    assert.equal(ids.get("#vertex-C-control").getAttribute("transform"), validTransform);
    assert.equal(ids.get("#incircle-feedback").hidden, false);
    assert.ok(ids.get("#incircle-feedback").textContent);

    harness.reset();
    assert.equal(board.dataset.state, "first");
    assert.equal(visible(ids.get("#test-point-group")), true);
    assert.equal(visible(ids.get("#center-group")), false);
    assert.equal(visible(ids.get("#incircle")), false);

    harness.clickNext();
    await wait(850);
    harness.clickNext();
    assert.equal(board.dataset.state, "incircle");
    assert.equal(visible(ids.get("#incircle")), true);
  } finally {
    delete globalThis.document;
    delete globalThis.navigator;
  }
});

test("Zurücksetzen während der Winkelhalbierenden-Abfolge hebt die Sperre sauber auf", async () => {
  const harness = await createHarness();
  try {
    harness.clickNext();
    assert.equal(harness.ids.get("#incircle-next").disabled, true);
    harness.reset();
    assert.equal(harness.board.dataset.state, "first");
    assert.equal(harness.ids.get("#incircle-next").disabled, false);
    assert.equal(harness.board.classList.contains("is-revealing"), false);
    harness.clickNext();
    assert.equal(harness.board.dataset.state, "all-bisectors");
  } finally {
    harness.reset();
    await wait(5);
    delete globalThis.document;
    delete globalThis.navigator;
  }
});
