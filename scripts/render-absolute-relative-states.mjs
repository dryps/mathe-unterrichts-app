import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { absoluteRelativeViewModel, createAbsoluteRelativeState, finishAbsoluteRelativeReveal, nextAbsoluteRelativeState, setComparisonScale } from "../src/absolute-relative-state.js";

const html=await readFile(new URL("../absolut-relativ.html",import.meta.url),"utf8");
const css=await readFile(new URL("../absolute-relative.css",import.meta.url),"utf8");
let state=createAbsoluteRelativeState();
const rendered=[];
for(let step=0;step<5;step+=1){
  const model=absoluteRelativeViewModel(state);
  rendered.push(model);
  if(model.showAbsolute) assert.equal(model.left.part>model.right.part,true);
  if(model.showNormalization) assert.equal(model.left.normalizedLabel.split(" von ")[1],model.right.normalizedLabel.split(" von ")[1]);
  if(model.showRelative) assert.equal(model.left.percent<model.right.percent,true);
  state=finishAbsoluteRelativeReveal(nextAbsoluteRelativeState(state));
}
for(let index=0;index<3;index+=1){
  const model=absoluteRelativeViewModel(setComparisonScale({view:"explore",locked:false,scaleIndex:0},index));
  rendered.push(model);
  assert.equal(model.left.percent,12);
  assert.equal(model.right.percent,12.5);
}
assert.match(html,/Gemeinsame Bezugsgröße: 200/);
assert.match(css,/@media\(max-width:720px\)/);
console.log(`${rendered.length}/${rendered.length} Absolut-relativ-Zustände gerendert`);
