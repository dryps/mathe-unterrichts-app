import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PERCENTAGE_FACTOR_VIEWS, createPercentageFactorState, finishPercentageFactorReveal, nextPercentageFactorState, percentageFactorViewModel, setPercentageFactorScenario } from "../src/percentage-factor-state.js";

const html=await readFile(new URL("../prozent-als-faktor.html",import.meta.url),"utf8");
const css=await readFile(new URL("../percentage-factor.css",import.meta.url),"utf8");
let state=createPercentageFactorState();
const rendered=[];
for(let step=0;step<6;step+=1){const model=percentageFactorViewModel(state);rendered.push(model);assert.equal(model.relation.result,model.relation.whole*model.relation.rate/100);state=finishPercentageFactorReveal(nextPercentageFactorState(state));}
const explore={view:PERCENTAGE_FACTOR_VIEWS.explore,locked:false,scenarioIndex:1};
for(let index=0;index<4;index+=1){const model=percentageFactorViewModel(setPercentageFactorScenario(explore,index));rendered.push(model);assert.equal(model.relation.result,model.relation.factor*model.relation.whole);assert.match(model.productText,/=/);}
assert.match(html,/Ein Prozentsatz lässt sich als Dezimalfaktor ausdrücken\./);
assert.match(css,/@media\(max-width:720px\)/);
console.log(`${rendered.length}/${rendered.length} Prozentfaktor-Zustände gerendert`);
