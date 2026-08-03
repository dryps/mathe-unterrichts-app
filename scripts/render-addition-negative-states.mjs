import assert from "node:assert/strict";
import { additionMovement, additionNumberLineTicks, additionValueToX, formatAddition } from "../src/addition-negative-geometry.js";
const states=["prompt","start","operator","summand","moving","result","free","conclusion"];
let rendered=0;
for(const state of states){const axis=state!=="prompt";const motion=["moving","result","free","conclusion"].includes(state);const end=["result","free","conclusion"].includes(state);const movement=additionMovement(-5);const svg=`<svg viewBox="0 0 1400 520" data-state="${state}">${axis?`<line id="axis" x1="132" x2="1268"/>${additionNumberLineTicks().map(t=>`<g transform="translate(${t.x} 290)"></g>`).join("")}`:""}${motion?`<line id="motion" x1="${movement.startX}" x2="${movement.endX}"/>`:""}${end?`<g id="end" transform="translate(${additionValueToX(movement.result)} 290)"><text>${formatAddition(-5)}</text></g>`:""}</svg>`;assert.doesNotMatch(svg,/NaN|undefined/);assert.equal(svg.includes('id="axis"'),axis);assert.equal(svg.includes('id="motion"'),motion);assert.equal(svg.includes('id="end"'),end);rendered+=1;}
console.log(`${rendered}/${rendered} Additions-Zustände als SVG gerendert`);
