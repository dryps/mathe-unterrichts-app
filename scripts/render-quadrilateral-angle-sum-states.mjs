import assert from "node:assert/strict";
import { ANGLE_SUM_REVEAL_DURATION, angleSumRevealFrame } from "../src/quadrilateral-angle-sum-animation.js";
import { createAngleSumQuadrilateral, isStrictlyConvex, splitByDiagonal } from "../src/quadrilateral-angle-sum-math.js";
import { ANGLE_SUM_VIEWS, angleSumViewModel, createAngleSumState } from "../src/quadrilateral-angle-sum-state.js";

const states=[createAngleSumState(),...Object.values(ANGLE_SUM_VIEWS).slice(1).map(view=>({view,locked:false,position:view===ANGLE_SUM_VIEWS.explore?72:0}))];
const render=(state)=>{const model=angleSumViewModel(state);return `<section data-state="${model.view}"><polygon points="${model.points.map(({x,y})=>`${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}"/><line hidden="${!model.showDiagonal}"/><p>${model.showEquation?model.equation:""}</p><p>${model.showAngles?model.angleEquation:""}</p></section>`;};
let rendered=0;
for(const state of states){const first=render(state);assert.equal(first,render({...state}));assert.doesNotMatch(first,/undefined|NaN|Infinity/);rendered+=1;}
for(const position of [-100,-50,0,50,100]){const points=createAngleSumQuadrilateral(position);assert.equal(isStrictlyConvex(points),true);const split=splitByDiagonal(points);assert.ok(Math.abs(split.first.angles.reduce((a,b)=>a+b,0)-180)<1e-8);assert.ok(Math.abs(split.second.angles.reduce((a,b)=>a+b,0)-180)<1e-8);rendered+=1;}
let previous=-1;for(const elapsed of [0,130,260,390,520,ANGLE_SUM_REVEAL_DURATION]){const frame=angleSumRevealFrame(elapsed);assert.ok(frame.opacity>=previous);previous=frame.opacity;rendered+=1;}
assert.equal(rendered,16);
console.log(`${rendered}/${rendered} Viereck-Winkelsummen-Zustände gerendert`);
