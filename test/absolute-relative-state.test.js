import assert from "node:assert/strict";
import test from "node:test";
import { ABSOLUTE_RELATIVE_VIEWS, absoluteRelativeViewModel, createAbsoluteRelativeState, finishAbsoluteRelativeReveal, nextAbsoluteRelativeState, resetAbsoluteRelativeState, setComparisonScale } from "../src/absolute-relative-state.js";

test("Start zeigt nur die beiden Gruppen und keine Folgerung",()=>{
  const model=absoluteRelativeViewModel(createAbsoluteRelativeState());
  for(const key of ["showAbsolute","showNormalization","showRelative","showExplore","showConclusion"]) assert.equal(model[key],false);
  assert.equal(model.left.label,"6 von 50");
  assert.equal(model.right.label,"5 von 40");
});

test("absolut, normalisiert, relativ und Erkundung öffnen seriell",()=>{
  let state=createAbsoluteRelativeState();
  for(const view of [ABSOLUTE_RELATIVE_VIEWS.absolute,ABSOLUTE_RELATIVE_VIEWS.normalize,ABSOLUTE_RELATIVE_VIEWS.relative,ABSOLUTE_RELATIVE_VIEWS.explore]){
    state=nextAbsoluteRelativeState(state);
    assert.equal(state.view,view);
    assert.equal(state.locked,true);
    assert.equal(nextAbsoluteRelativeState(state),state);
    state=finishAbsoluteRelativeReveal(state);
  }
  assert.equal(absoluteRelativeViewModel(state).showNext,false);
});

test("Erkundung synchronisiert alle Zahlen und zugänglichen Namen",()=>{
  const state=setComparisonScale({view:ABSOLUTE_RELATIVE_VIEWS.explore,locked:false,scaleIndex:0},2);
  const model=absoluteRelativeViewModel(state);
  assert.equal(model.scale,3);
  assert.equal(model.left.label,"18 von 150");
  assert.equal(model.right.label,"15 von 120");
  assert.equal(model.left.normalizedLabel,"72 von 600");
  assert.equal(model.right.normalizedLabel,"75 von 600");
  assert.equal(model.absoluteText,"18 > 15");
  assert.equal(model.relativeText,"12 % < 12,5 %");
  assert.equal(model.sliderAriaLabel,"Beide Gruppen gemeinsam skalieren: Faktor 3");
  assert.match(model.liveText,/18 von 150/);
  assert.match(model.liveText,/15 von 120/);
  assert.match(model.liveText,/12 Prozent ist kleiner als 12,5 Prozent/);
});

test("Regler bleibt vor der Erkundung und während Reveal gesperrt",()=>{
  const start=createAbsoluteRelativeState();
  assert.equal(setComparisonScale(start,2),start);
  const locked={view:ABSOLUTE_RELATIVE_VIEWS.explore,locked:true,scaleIndex:0};
  assert.equal(setComparisonScale(locked,2),locked);
});

test("Reset stellt die offene Irritation wieder her",()=>{
  assert.deepEqual(resetAbsoluteRelativeState(),createAbsoluteRelativeState());
});
