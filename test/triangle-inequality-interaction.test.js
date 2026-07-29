import assert from "node:assert/strict";
import test from "node:test";

function createElement(dataset = {}) {
  const listeners = new Map();
  return {
    dataset,
    attributes: new Map(),
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
      this.attributes.set(name, String(value));
    },
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    closest(selector) {
      return selector === "[data-side-control]" && "index" in this.dataset
        ? this
        : null;
    },
  };
}

function createAppDom() {
  const sideValues = Array.from({ length: 3 }, () => createElement());
  const sideControls = [];
  for (let index = 0; index < 3; index += 1) {
    sideControls.push(
      createElement({ index: String(index), delta: "-1" }),
      createElement({ index: String(index), delta: "1" }),
    );
  }

  const ids = new Map(
    [
      "left-arc",
      "right-arc",
      "possible-triangle",
      "mirror-triangle",
      "degenerate-line",
      "intersection-upper",
      "intersection-lower",
      "tangent-point",
      "base-label",
      "left-radius-label",
      "right-radius-label",
      "inequality-equation",
      "triangle-status",
      "status-title",
      "status-detail",
      "inequality-reset",
    ].map((id) => [`#${id}`, createElement()]),
  );
  const sideInputs = createElement();

  return {
    sideValues,
    sideControls,
    sideInputs,
    ids,
    document: {
      querySelector(selector) {
        if (selector === ".side-inputs") return sideInputs;
        return ids.get(selector) ?? null;
      },
      querySelectorAll(selector) {
        if (selector === "[data-side-value]") return sideValues;
        if (selector === "[data-side-control]") return sideControls;
        return [];
      },
    },
  };
}

test("Plus, Minus, Statuswechsel, Grenzen und Zurücksetzen reagieren direkt", async () => {
  const dom = createAppDom();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: dom.document,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  try {
    await import(`../src/triangle-inequality-app.js?test=${Date.now()}`);

    const equation = dom.ids.get("#inequality-equation");
    const statusTitle = dom.ids.get("#status-title");
    const statusDetail = dom.ids.get("#status-detail");
    assert.equal(equation.textContent, "5 + 6 > 8");
    assert.equal(statusTitle.textContent, "Dreieck möglich");

    const increaseC = dom.sideControls.find(
      (button) => button.dataset.index === "2" && button.dataset.delta === "1",
    );
    const click = (button) =>
      dom.sideInputs.dispatch("click", {
        target: { closest: () => button },
      });

    click(increaseC);
    click(increaseC);
    click(increaseC);
    assert.equal(equation.textContent, "5 + 6 = 11");
    assert.equal(statusTitle.textContent, "Kein echtes Dreieck");
    assert.equal(statusDetail.textContent, "Die drei Punkte liegen auf einer Geraden.");

    click(increaseC);
    assert.equal(equation.textContent, "5 + 6 < 12");
    assert.equal(statusTitle.textContent, "Kein Dreieck möglich");
    assert.equal(
      statusDetail.textContent,
      "Die beiden kürzeren Seiten sind zusammen zu kurz.",
    );

    for (let index = 0; index < 20; index += 1) click(increaseC);
    assert.equal(dom.sideValues[2].textContent, 20);
    assert.equal(increaseC.disabled, true);

    dom.ids.get("#inequality-reset").dispatch("click");
    assert.deepEqual(
      dom.sideValues.map((element) => Number(element.textContent)),
      [5, 6, 8],
    );
    assert.equal(equation.textContent, "5 + 6 > 8");
    assert.equal(statusTitle.textContent, "Dreieck möglich");
  } finally {
    delete globalThis.document;
    delete globalThis.navigator;
  }
});
