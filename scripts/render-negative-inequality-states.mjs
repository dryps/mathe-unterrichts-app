import assert from "node:assert/strict";
import { REFLECTION_DURATION, reflectionFrame } from "../src/negative-inequality-animation.js";
import { createReflectionModel, numberLinePercent } from "../src/negative-inequality-math.js";
import { NEGATIVE_INEQUALITY_VIEWS, createNegativeInequalityState, negativeInequalityViewModel } from "../src/negative-inequality-state.js";

const states=[createNegativeInequalityState(),...Object.values(NEGATIVE_INEQUALITY_VIEWS).filter(view=>view!==NEGATIVE_INEQUALITY_VIEWS.irritation).map(view=>({view,base:view===NEGATIVE_INEQUALITY_VIEWS.conclusion?4:2,locked:view===NEGATIVE_INEQUALITY_VIEWS.reflecting}))];
const render=state=>{const model=negativeInequalityViewModel(state);return `<section data-state="${state.view}" data-base="${model.base}"><p>${model.sourceEquation}</p><p>${model.resultEquation}</p><i>${numberLinePercent(model.base*model.multiplier)}</i><p>${model.insight}</p></section>`;};
let rendered=0;
for(const state of states){const first=render(state);assert.equal(first,render({...state}));assert.doesNotMatch(first,/undefined|NaN|Infinity/);assert.match(first,/(?:2 < 5|4 < 7)/);rendered+=1;}
for(let base=1;base<=4;base+=1){const model=createReflectionModel(base);assert.equal(model.sourceTrue,true);assert.equal(model.resultTrue,true);rendered+=1;}
let previous=1;for(const elapsed of [0,250,500,750,REFLECTION_DURATION]){const frame=reflectionFrame(elapsed);assert.ok(frame.multiplier<=previous);previous=frame.multiplier;rendered+=1;}
assert.equal(rendered,15);console.log(`${rendered}/${rendered} Negative-Ungleichungs-Zustände gerendert`);
