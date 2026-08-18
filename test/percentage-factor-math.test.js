import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_FACTOR_SCENARIOS, percentageFactorScenario, percentageToFactor, snapPercentageFactorScenario } from "../src/percentage-factor-math.js";

test("Prozentsatz, Hundertstelbruch, gekürzter Bruch und Dezimalfaktor sind gleichwertig",()=>{
  assert.deepEqual(percentageToFactor(25),{rate:25,numerator:25,denominator:100,reducedNumerator:1,reducedDenominator:4,factor:0.25,factorText:"0,25"});
  assert.deepEqual(percentageToFactor(40),{rate:40,numerator:40,denominator:100,reducedNumerator:2,reducedDenominator:5,factor:0.4,factorText:"0,4"});
});

test("alle Erkundungsbeispiele liefern ein exaktes Produkt",()=>{
  for(let index=0;index<PERCENTAGE_FACTOR_SCENARIOS.length;index+=1){
    const model=percentageFactorScenario(index);
    assert.equal(model.result,model.factor*model.whole);
    assert.equal(model.result,model.whole*model.rate/100);
  }
});

test("diskrete Situationen werden sicher eingerastet",()=>{
  assert.equal(snapPercentageFactorScenario(-8),0);
  assert.equal(snapPercentageFactorScenario(1.6),2);
  assert.equal(snapPercentageFactorScenario(99),3);
  assert.throws(()=>snapPercentageFactorScenario(Number.NaN),RangeError);
  assert.throws(()=>percentageToFactor(-1),RangeError);
});
