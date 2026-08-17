import assert from "node:assert/strict";
import test from "node:test";

import {
  addToEquation,
  createEquation,
  divideEquation,
  equationModel,
  solveEquation,
} from "../src/equivalence-math.js";

test("3x + 5 = 20 besitzt genau die Lösung x = 5", () => {
  const equation = createEquation(3, 5, 0, 20);
  assert.equal(solveEquation(equation), 5);
  assert.deepEqual(equationModel(equation), {
    leftText: "3x + 5",
    rightText: "20",
    solution: 5,
    leftValue: 20,
    rightValue: 20,
    difference: 0,
    balanced: true,
  });
});

test("nur links fünf zu entfernen verändert Wahrheit und Lösungsmenge", () => {
  const original = createEquation(3, 5, 0, 20);
  const oneSided = addToEquation(original, -5, 0);
  const model = equationModel(oneSided, solveEquation(original));
  assert.equal(model.leftText, "3x");
  assert.equal(model.rightText, "20");
  assert.equal(model.leftValue, 15);
  assert.equal(model.rightValue, 20);
  assert.equal(model.balanced, false);
  assert.notEqual(solveEquation(oneSided), solveEquation(original));
});

test("dieselbe Subtraktion und dieselbe Division erhalten die Lösung", () => {
  const original = createEquation(3, 5, 0, 20);
  const subtracted = addToEquation(original, -5, -5);
  const divided = divideEquation(subtracted, 3);
  assert.equal(equationModel(subtracted).leftText, "3x");
  assert.equal(equationModel(subtracted).rightText, "15");
  assert.equal(equationModel(divided).leftText, "x");
  assert.equal(equationModel(divided).rightText, "5");
  assert.equal(solveEquation(subtracted), 5);
  assert.equal(solveEquation(divided), 5);
});

test("freie gleiche Additionen von −8 bis +8 halten x = 5 im Gleichgewicht", () => {
  const original = createEquation(3, 5, 0, 20);
  for (let delta = -8; delta <= 8; delta += 1) {
    const changed = addToEquation(original, delta, delta);
    assert.equal(solveEquation(changed), 5);
    assert.equal(equationModel(changed).balanced, true);
  }
});

test("Division durch null wird als unzulässige Operation abgewiesen", () => {
  assert.throws(() => divideEquation(createEquation(3, 5, 0, 20), 0), /null/);
});
