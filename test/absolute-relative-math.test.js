import assert from "node:assert/strict";
import test from "node:test";
import { BASE_ABSOLUTE_RELATIVE_COMPARISON, COMPARISON_SCALE_FACTORS, normalizeComparison, percentOf, scaleComparison, snapComparisonScale } from "../src/absolute-relative-math.js";

test("das verbindliche Beispiel kehrt absoluten und relativen Vergleich um",()=>{
  const model=normalizeComparison(BASE_ABSOLUTE_RELATIVE_COMPARISON.left,BASE_ABSOLUTE_RELATIVE_COMPARISON.right);
  assert.deepEqual(BASE_ABSOLUTE_RELATIVE_COMPARISON,{left:{part:6,whole:50},right:{part:5,whole:40}});
  assert.equal(model.left.part>model.right.part,true);
  assert.equal(model.left.percent,12);
  assert.equal(model.right.percent,12.5);
  assert.equal(model.left.percent<model.right.percent,true);
});

test("Normalisierung verwendet exakt die gemeinsame Bezugsgröße 200",()=>{
  const model=normalizeComparison({part:6,whole:50},{part:5,whole:40});
  assert.equal(model.commonWhole,200);
  assert.deepEqual(model.left.normalized,{part:24,whole:200});
  assert.deepEqual(model.right.normalized,{part:25,whole:200});
  assert.equal(model.left.normalized.part/model.commonWhole,6/50);
  assert.equal(model.right.normalized.part/model.commonWhole,5/40);
});

test("gemeinsames Skalieren erhält beide Prozentwerte und beide Vergleichsrichtungen",()=>{
  assert.deepEqual(COMPARISON_SCALE_FACTORS,[1,2,3]);
  for(const factor of COMPARISON_SCALE_FACTORS){
    const model=scaleComparison(factor);
    assert.equal(model.left.part,6*factor);
    assert.equal(model.left.whole,50*factor);
    assert.equal(model.right.part,5*factor);
    assert.equal(model.right.whole,40*factor);
    assert.equal(model.left.percent,12);
    assert.equal(model.right.percent,12.5);
    assert.equal(model.left.part>model.right.part,true);
    assert.equal(model.left.percent<model.right.percent,true);
  }
});

test("Regler rastet auf erlaubte Faktoren und ungültige Anteile werden abgewiesen",()=>{
  assert.equal(snapComparisonScale(-4),1);
  assert.equal(snapComparisonScale(1),2);
  assert.equal(snapComparisonScale(99),3);
  assert.equal(percentOf(1,8),12.5);
  assert.throws(()=>percentOf(-1,8),/Anteil/);
  assert.throws(()=>percentOf(9,8),/Anteil/);
  assert.throws(()=>percentOf(1,0),/Ganze/);
  assert.throws(()=>normalizeComparison({part:1.5,whole:8},{part:1,whole:4}),/ganzzahlig/);
});
