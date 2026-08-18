import assert from "node:assert/strict";
import test from "node:test";
import { MODEL_INPUTS,modelChoicePair,snapModelInput } from "../src/model-choice-math.js";

test("beide Modelle starten bei 4 → 12 und reagieren auf Verdopplung gegensätzlich",()=>{
  assert.deepEqual(modelChoicePair(4),{input:4,proportional:12,inverse:12,quotient:3,product:48});
  assert.deepEqual(modelChoicePair(8),{input:8,proportional:24,inverse:6,quotient:3,product:48});
});

test("alle Erkundungswerte bewahren ihren jeweiligen Modelltest",()=>{
  assert.deepEqual(MODEL_INPUTS,[2,4,8,12]);
  for(const input of MODEL_INPUTS){const pair=modelChoicePair(input);assert.equal(pair.proportional/input,3);assert.equal(pair.inverse*input,48);}
});

test("der diskrete Regler wird sicher auf erlaubte Werte abgebildet",()=>{
  assert.equal(snapModelInput(-4),2);assert.equal(snapModelInput(2),8);assert.equal(snapModelInput(99),12);
});
