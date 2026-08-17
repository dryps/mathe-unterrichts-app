import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_DIVISION_DEFAULT_GROUPS,
  TERM_DIVISION_GROUP_SIZE,
  TERM_DIVISION_MAX_GROUPS,
  TERM_DIVISION_MIN_GROUPS,
  createTermDivisionModel,
  normalizeTermDivisionGroups,
} from "../src/term-division-math.js";

test("jede erlaubte Gruppenanzahl macht genau ihren vorhandenen Faktor rückgängig", () => {
  for (let groups = 2; groups <= 5; groups += 1) {
    const model = createTermDivisionModel(groups);

    assert.equal(model.groups, groups);
    assert.equal(model.divisor, groups);
    assert.equal(model.groupSize, 4);
    assert.equal(model.totalXUnits, groups * 4);
    assert.equal(model.resultCoefficient, 4);
    assert.equal(model.factorExpression, `${groups} · 4 · x`);
    assert.equal(model.divisionExpression, `(${groups} · 4 · x) : ${groups}`);
    assert.equal(model.resultExpression, "4x");
    assert.equal(model.equation, `(${groups} · 4 · x) : ${groups} = 4x`);
  }
});

test("jedes sichtbare Paket enthält exakt vier gleiche x-Bausteine", () => {
  const model = createTermDivisionModel(5);

  assert.equal(model.packages.length, 5);
  for (const packageUnits of model.packages) {
    assert.deepEqual(packageUnits, ["x", "x", "x", "x"]);
    assert.ok(Object.isFrozen(packageUnits));
  }
  assert.ok(Object.isFrozen(model.packages));
});

test("Gruppeneingaben rasten ganzzahlig ein und bleiben zwischen zwei und fünf", () => {
  assert.equal(TERM_DIVISION_MIN_GROUPS, 2);
  assert.equal(TERM_DIVISION_MAX_GROUPS, 5);
  assert.equal(TERM_DIVISION_DEFAULT_GROUPS, 3);
  assert.equal(TERM_DIVISION_GROUP_SIZE, 4);

  assert.equal(normalizeTermDivisionGroups(-9), 2);
  assert.equal(normalizeTermDivisionGroups(99), 5);
  assert.equal(normalizeTermDivisionGroups(3.6), 4);
  assert.equal(normalizeTermDivisionGroups("2"), 2);
});

test("fehlende und nicht endliche Gruppenzahlen fallen sicher auf drei zurück", () => {
  for (const value of [undefined, null, "", Number.NaN, Number.POSITIVE_INFINITY, "x"]) {
    assert.equal(normalizeTermDivisionGroups(value), 3);
  }
});

test("das Modell führt keine Variablendivision oder Definitionsbereichsaussage ein", () => {
  const model = createTermDivisionModel(3);

  assert.doesNotMatch(model.equation, /:\s*x|x\s*≠|Definitionsbereich/);
  assert.match(model.explanation, /vorhandene Faktor 3/);
  assert.match(model.explanation, /Inhalt einer Gruppe/);
});
