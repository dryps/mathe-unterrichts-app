import assert from "node:assert/strict";
import test from "node:test";

function createElement(dataset = {}, attributes = {}) {
  const listeners = new Map();
  return {
    dataset,
    attributes: new Map(Object.entries(attributes)),
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
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    hasAttribute(name) {
      return this.attributes.has(name);
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

async function createHarness() {
  const sideValues = Array.from({ length: 3 }, () => createElement());
  const sideControls = [];
  for (let index = 0; index < 3; index += 1) {
    sideControls.push(
      createElement({ index: String(index), delta: "-1" }),
      createElement({ index: String(index), delta: "1" }),
    );
  }

  const transientIds = new Set([
    "degenerate-line",
    "intersection-upper",
    "intersection-lower",
    "tangent-point",
  ]);
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
    ].map((id) => [
      `#${id}`,
      createElement({}, transientIds.has(id) ? { hidden: "" } : {}),
    ]),
  );
  const sideInputs = createElement();
  const document = {
    querySelector(selector) {
      if (selector === ".side-inputs") return sideInputs;
      return ids.get(selector) ?? null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-side-value]") return sideValues;
      if (selector === "[data-side-control]") return sideControls;
      return [];
    },
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  await import(`../src/triangle-inequality-app.js?test=${Date.now()}`);

  const clickControl = (index, delta) => {
    const button = sideControls.find(
      (candidate) =>
        candidate.dataset.index === String(index) &&
        candidate.dataset.delta === String(delta),
    );
    assert.ok(button);
    sideInputs.dispatch("click", {
      target: { closest: () => button },
    });
  };

  const currentSides = () => sideValues.map((element) => Number(element.textContent));
  const setSides = (target) => {
    const current = currentSides();
    target.forEach((value, index) => {
      const delta = value > current[index] ? 1 : -1;
      for (let step = 0; step < Math.abs(value - current[index]); step += 1) {
        clickControl(index, delta);
      }
    });
    assert.deepEqual(currentSides(), target);
  };

  return {
    ids,
    currentSides,
    sideControls,
    reset() {
      ids.get("#inequality-reset").dispatch("click");
    },
    setSides,
  };
}

const stateSpecificIds = [
  "possible-triangle",
  "mirror-triangle",
  "degenerate-line",
  "intersection-upper",
  "intersection-lower",
  "tangent-point",
];

function assertCurrentSvgState(harness, expectedState) {
  const expectedVisible = {
    possible: new Set([
      "possible-triangle",
      "mirror-triangle",
      "intersection-upper",
      "intersection-lower",
    ]),
    degenerate: new Set(["degenerate-line", "tangent-point"]),
    impossible: new Set(),
  }[expectedState];

  for (const id of stateSpecificIds) {
    const element = harness.ids.get(`#${id}`);
    const shouldBeVisible = expectedVisible.has(id);
    assert.equal(
      element.getAttribute("visibility"),
      shouldBeVisible ? "visible" : "hidden",
      `${id} besitzt im Zustand ${expectedState} die falsche Sichtbarkeit`,
    );
    assert.equal(
      element.getAttribute("aria-hidden"),
      String(!shouldBeVisible),
      `${id} besitzt im Zustand ${expectedState} den falschen aria-hidden-Wert`,
    );
    assert.equal(element.hasAttribute("hidden"), false);
  }

  for (const id of ["possible-triangle", "mirror-triangle"]) {
    const path = harness.ids.get(`#${id}`);
    assert.equal(Boolean(path.getAttribute("d")), expectedState === "possible");
  }

  const line = harness.ids.get("#degenerate-line");
  assert.equal(Boolean(line.getAttribute("points")), expectedState === "degenerate");

  for (const id of ["intersection-upper", "intersection-lower"]) {
    const point = harness.ids.get(`#${id}`);
    assert.equal(Boolean(point.getAttribute("cx")), expectedState === "possible");
    assert.equal(Boolean(point.getAttribute("cy")), expectedState === "possible");
  }

  const tangent = harness.ids.get("#tangent-point");
  assert.equal(Boolean(tangent.getAttribute("cx")), expectedState === "degenerate");
  assert.equal(Boolean(tangent.getAttribute("cy")), expectedState === "degenerate");

  for (const id of ["left-arc", "right-arc"]) {
    assert.ok(harness.ids.get(`#${id}`).getAttribute("d"));
    assert.notEqual(harness.ids.get(`#${id}`).getAttribute("visibility"), "hidden");
  }

  assert.equal(harness.ids.get("#triangle-status").dataset.state, expectedState);
}

test("SVG-Zustandswechsel entfernen alle früheren Markierungen", async (t) => {
  const harness = await createHarness();

  try {
    await t.test("möglich → Grenzfall", () => {
      harness.reset();
      assertCurrentSvgState(harness, "possible");
      harness.setSides([5, 6, 11]);
      assertCurrentSvgState(harness, "degenerate");
    });

    await t.test("möglich → unmöglich", () => {
      harness.reset();
      assertCurrentSvgState(harness, "possible");
      harness.setSides([5, 6, 12]);
      assertCurrentSvgState(harness, "impossible");
    });

    await t.test("Grenzfall → möglich", () => {
      harness.setSides([5, 6, 11]);
      assertCurrentSvgState(harness, "degenerate");
      harness.setSides([5, 6, 8]);
      assertCurrentSvgState(harness, "possible");
    });

    await t.test("Grenzfall → unmöglich", () => {
      harness.setSides([5, 6, 11]);
      assertCurrentSvgState(harness, "degenerate");
      harness.setSides([5, 6, 12]);
      assertCurrentSvgState(harness, "impossible");
    });

    await t.test("unmöglich → möglich", () => {
      harness.setSides([5, 6, 12]);
      assertCurrentSvgState(harness, "impossible");
      harness.setSides([5, 6, 8]);
      assertCurrentSvgState(harness, "possible");
    });

    await t.test("unmöglich → Grenzfall", () => {
      harness.setSides([5, 6, 12]);
      assertCurrentSvgState(harness, "impossible");
      harness.setSides([5, 6, 11]);
      assertCurrentSvgState(harness, "degenerate");
    });

    await t.test("mehrfacher schneller Wechsel aller Zustände", () => {
      const sequence = [
        [[5, 6, 8], "possible"],
        [[5, 6, 11], "degenerate"],
        [[5, 6, 12], "impossible"],
        [[9, 6, 8], "possible"],
        [[9, 6, 15], "degenerate"],
        [[9, 6, 16], "impossible"],
        [[5, 6, 8], "possible"],
      ];
      for (let round = 0; round < 3; round += 1) {
        for (const [sides, state] of sequence) {
          harness.setSides(sides);
          assertCurrentSvgState(harness, state);
        }
      }
    });

    await t.test("Reset entfernt Markierungen aus jedem Ausgangszustand", () => {
      for (const sides of [
        [5, 6, 8],
        [5, 6, 11],
        [5, 6, 12],
      ]) {
        harness.setSides(sides);
        harness.reset();
        assert.deepEqual(harness.currentSides(), [5, 6, 8]);
        assertCurrentSvgState(harness, "possible");
      }
    });

    await t.test("Wechsel der längsten Seite erhält die aktuelle Darstellung", () => {
      harness.setSides([9, 6, 8]);
      assert.equal(harness.ids.get("#base-label").textContent, "a = 9");
      assert.equal(harness.ids.get("#inequality-equation").textContent, "6 + 8 > 9");
      assertCurrentSvgState(harness, "possible");
    });

    await t.test("Statussprache und Plus-/Minus-Grenzen bleiben unverändert", () => {
      harness.setSides([5, 6, 11]);
      assert.equal(harness.ids.get("#status-title").textContent, "Kein echtes Dreieck");
      assert.equal(
        harness.ids.get("#status-detail").textContent,
        "Die drei Punkte liegen auf einer Geraden.",
      );

      harness.setSides([5, 6, 12]);
      assert.equal(harness.ids.get("#status-title").textContent, "Kein Dreieck möglich");
      assert.equal(
        harness.ids.get("#status-detail").textContent,
        "Die beiden kürzeren Seiten sind zusammen zu kurz.",
      );

      harness.setSides([5, 6, 20]);
      const increaseC = harness.sideControls.find(
        (button) => button.dataset.index === "2" && button.dataset.delta === "1",
      );
      assert.equal(increaseC.disabled, true);
    });
  } finally {
    delete globalThis.document;
    delete globalThis.navigator;
  }
});
