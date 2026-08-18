import assert from "node:assert/strict";
import { COMPARISON_REVEAL_DURATION,comparisonRevealFrame } from "../src/proportional-comparison-animation.js";
import { graphPoint,growingRecord,proportionalRecord } from "../src/proportional-comparison-math.js";
import { COMPARISON_VIEWS,comparisonViewModel,createComparisonState } from "../src/proportional-comparison-state.js";
const states=[createComparisonState(),...Object.values(COMPARISON_VIEWS).slice(1).map(view=>({view,locked:false,input:view===COMPARISON_VIEWS.explore?4:2}))];
let count=0;
for(const state of states){const model=comparisonViewModel(state),rendered=JSON.stringify({view:model.view,proportional:model.proportionalPair,growing:model.growingPair,p:model.proportionalPoint,g:model.growingPoint});assert.equal(rendered,JSON.stringify({view:model.view,proportional:model.proportionalPair,growing:model.growingPair,p:model.proportionalPoint,g:model.growingPoint}));assert.doesNotMatch(rendered,/undefined|NaN|Infinity/);count+=1;}
for(const input of [1,2,3,4]){assert.deepEqual(graphPoint(proportionalRecord(input)),{x:70+input*75,y:360-input*40});assert.deepEqual(graphPoint(growingRecord(input)),{x:70+input*75,y:300-input*40});count+=1;}
let previous=-1;for(const time of [0,130,260,390,520,COMPARISON_REVEAL_DURATION]){const frame=comparisonRevealFrame(time);assert.ok(frame.opacity>=previous);previous=frame.opacity;count+=1;}
assert.equal(count,16);console.log(`${count}/${count} Proportionalitätsvergleich gerendert`);
