import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_ROLE_SCENARIOS, percentageRelation, percentageRoleScenario, snapPercentageRoleScenario } from "../src/percentage-roles-math.js";

test("Grundwert, Prozentwert und Prozentsatz bilden exakt eine Beziehung",()=>{
  assert.deepEqual(percentageRelation(80,20),{whole:80,part:20,rate:25});
  assert.deepEqual(percentageRelation(120,36),{whole:120,part:36,rate:30});
  assert.deepEqual(percentageRelation(200,50),{whole:200,part:50,rate:25});
});

test("alle dynamischen Situationen bleiben mathematisch konsistent",()=>{
  for(let index=0;index<PERCENTAGE_ROLE_SCENARIOS.length;index+=1){
    const relation=percentageRoleScenario(index);
    assert.equal(relation.part,relation.whole*relation.rate/100);
  }
});

test("diskrete Situationen werden sicher eingerastet",()=>{
  assert.equal(snapPercentageRoleScenario(-4),0);
  assert.equal(snapPercentageRoleScenario(1.6),2);
  assert.equal(snapPercentageRoleScenario(99),2);
});

test("unzulässige Beziehungen werden abgewiesen",()=>{
  assert.throws(()=>percentageRelation(0,0),RangeError);
  assert.throws(()=>percentageRelation(20,21),RangeError);
  assert.throws(()=>percentageRelation(80,Number.NaN),RangeError);
});
