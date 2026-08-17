import assert from "node:assert/strict";
import { BOTH_SIDES_REMOVAL_DURATION, bothSidesRemovalFrame } from "../src/both-sides-animation.js";
import { createCancellationModel } from "../src/both-sides-math.js";
import { BOTH_SIDES_VIEWS, bothSidesViewModel, createBothSidesState } from "../src/both-sides-state.js";

const states=[createBothSidesState(),...Object.values(BOTH_SIDES_VIEWS).filter(view=>view!==BOTH_SIDES_VIEWS.irritation).map(view=>({view,shared:view===BOTH_SIDES_VIEWS.conclusion?4:2,locked:view===BOTH_SIDES_VIEWS.removing}))];
const render=state=>{const model=bothSidesViewModel(state);return `<section data-state="${state.view}" data-shared="${model.shared}"><p>${model.sourceEquation}</p><p>${model.equation}</p><p>${model.insight}</p></section>`;};
let rendered=0;
for(const state of states){const first=render(state);assert.equal(first,render({...state}));assert.doesNotMatch(first,/undefined|NaN|Infinity/);assert.match(first,/3x \+ 3 = 18|x \+ 3/);rendered+=1;}
for(let shared=1;shared<=4;shared+=1){const model=createCancellationModel(shared);assert.equal(model.reducedEquation,"3x + 3 = 18");assert.equal(model.sourceLeftValue,model.sourceRightValue);rendered+=1;}
let previous=1;for(const elapsed of [0,225,450,675,BOTH_SIDES_REMOVAL_DURATION]){const frame=bothSidesRemovalFrame(elapsed);assert.ok(frame.opacity<=previous);previous=frame.opacity;rendered+=1;}
assert.equal(rendered,15);console.log(`${rendered}/${rendered} Terme-auf-beiden-Seiten-Zustände gerendert`);
