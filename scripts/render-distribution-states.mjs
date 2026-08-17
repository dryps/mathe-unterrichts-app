import assert from "node:assert/strict";
import { distributionCopyFrame } from "../src/distribution-animation.js";
import { createDistributionModel } from "../src/distribution-math.js";
import { DISTRIBUTION_VIEWS, createDistributionState, distributionViewModel } from "../src/distribution-state.js";

const states=[createDistributionState(),...Object.values(DISTRIBUTION_VIEWS).filter(view=>view!=="irritation").map(view=>({view,factor:view==="conclusion"?5:3,locked:view==="copying"}))];
const render=state=>{const model=distributionViewModel(state);return `<section data-state="${state.view}" data-factor="${model.factor}" data-locked="${state.locked}"><p>${model.sourceExpression}</p><ol>${model.packages.map(item=>`<li>${item.xUnits}x + ${item.ones}</li>`).join("")}</ol><p>${model.equation}</p><p>${model.insight}</p></section>`;};
let rendered=0;
for(const state of states){const first=render(state);assert.equal(first,render({...state}));assert.doesNotMatch(first,/undefined|NaN|Infinity/);assert.match(first,/x \+ 2/);rendered+=1;}
for(let factor=2;factor<=5;factor+=1){const model=createDistributionModel(factor);assert.equal(model.packages.length,factor);assert.match(render({view:"conclusion",factor,locked:false}),new RegExp(`data-factor="${factor}"`));rendered+=1;}
let previous=[0,0,0];for(const elapsed of [0,275,550,825,1100]){const frame=distributionCopyFrame(elapsed,3);frame.packageProgress.forEach((value,index)=>assert.ok(value>=previous[index]));previous=frame.packageProgress;rendered+=1;}
assert.equal(rendered,18);console.log(`${rendered}/${rendered} Ausmultiplizieren-Zustände gerendert`);
