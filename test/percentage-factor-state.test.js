import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_FACTOR_VIEWS, createPercentageFactorState, finishPercentageFactorReveal, nextPercentageFactorState, percentageFactorViewModel, resetPercentageFactorState, setPercentageFactorScenario } from "../src/percentage-factor-state.js";

test("Start zeigt nur 25 Prozent und verrät keine spätere Darstellung",()=>{
  const model=percentageFactorViewModel(createPercentageFactorState());
  assert.equal(model.rateText,"25 %");
  assert.equal(model.showHundredth,false);
  assert.equal(model.showReduced,false);
  assert.equal(model.showDecimal,false);
  assert.equal(model.showProduct,false);
  assert.equal(model.showExplore,false);
  assert.equal(model.chainAriaLabel,"25 Prozent; weitere Darstellungen noch verborgen.");
});

test("alle Darstellungen öffnen seriell und enden im exakten Aha",()=>{
  let state=createPercentageFactorState();
  for(const view of [PERCENTAGE_FACTOR_VIEWS.hundredth,PERCENTAGE_FACTOR_VIEWS.reduced,PERCENTAGE_FACTOR_VIEWS.decimal,PERCENTAGE_FACTOR_VIEWS.product,PERCENTAGE_FACTOR_VIEWS.explore]){
    state=nextPercentageFactorState(state);
    assert.equal(state.view,view);
    assert.equal(state.locked,true);
    assert.equal(nextPercentageFactorState(state),state);
    state=finishPercentageFactorReveal(state);
  }
  const model=percentageFactorViewModel(state);
  assert.equal(model.showConclusion,true);
  assert.equal(model.showNext,false);
  assert.equal(model.conclusion,"Ein Prozentsatz lässt sich als Dezimalfaktor ausdrücken.");
});

test("Erkundung hält die vollständige Darstellung synchron",()=>{
  const state=setPercentageFactorScenario({view:PERCENTAGE_FACTOR_VIEWS.explore,locked:false,scenarioIndex:1},3);
  const model=percentageFactorViewModel(state);
  assert.equal(model.rateText,"75 %");
  assert.equal(model.hundredthText,"75 / 100");
  assert.equal(model.reducedText,"3 / 4");
  assert.equal(model.decimalText,"0,75");
  assert.equal(model.productText,"0,75 · 40 = 30");
  assert.equal(model.sliderValueText,"Beispiel 4 von 4: 75 Prozent sind der Faktor 0,75; 0,75 mal 40 ist 30");
  assert.match(model.liveText,/75 Prozent.*0,75.*40.*30/);
});

test("Erkundung bleibt vor dem Schluss und während Reveal gesperrt",()=>{
  const start=createPercentageFactorState();
  assert.equal(setPercentageFactorScenario(start,3),start);
  const locked={view:PERCENTAGE_FACTOR_VIEWS.explore,locked:true,scenarioIndex:1};
  assert.equal(setPercentageFactorScenario(locked,3),locked);
});

test("Reset stellt die Irritation wieder her",()=>{
  assert.deepEqual(resetPercentageFactorState(),createPercentageFactorState());
});
