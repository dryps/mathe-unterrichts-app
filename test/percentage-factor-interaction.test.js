import assert from "node:assert/strict";
import test from "node:test";

function element(){const listeners=new Map(),attrs=new Map();return {hidden:false,disabled:false,textContent:"",value:"",style:{},dataset:{},setAttribute(name,value){attrs.set(name,String(value));},getAttribute(name){return attrs.get(name)??null;},addEventListener(type,listener){listeners.set(type,listener);},dispatch(type,event={}){return listeners.get(type)?.({currentTarget:this,target:this,...event});}};}

async function harness({reduced=true}={}){
  const ids=["pf-workspace","pf-chain","pf-rate","pf-hundredth","pf-reduced","pf-decimal","pf-product","pf-warning","pf-explore","pf-conclusion","pf-scenario","pf-scenario-output","pf-insight","pf-live","pf-next","pf-reset"];
  const elements=new Map(ids.map(id=>[`#${id}`,element()])),frames=[],timers=[];
  Object.defineProperty(globalThis,"document",{configurable:true,value:{querySelector:selector=>elements.get(selector)??null}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{matchMedia:()=>({matches:reduced}),addEventListener(){}}});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});
  Object.defineProperty(globalThis,"requestAnimationFrame",{configurable:true,value(callback){frames.push(callback);return frames.length;}});
  Object.defineProperty(globalThis,"cancelAnimationFrame",{configurable:true,value(){}});
  Object.defineProperty(globalThis,"setTimeout",{configurable:true,value(callback){timers.push(callback);return timers.length;}});
  Object.defineProperty(globalThis,"clearTimeout",{configurable:true,value(){}});
  await import(`../src/percentage-factor-app.js?interaction=${Date.now()}-${Math.random()}`);
  return {elements,frames,timers};
}

test("Erkundung aktualisiert die ganze Kette und den zugänglichen Reglernamen",async()=>{
  const {elements}=await harness(),next=elements.get("#pf-next");
  for(let step=0;step<5;step+=1) next.dispatch("click");
  const input=elements.get("#pf-scenario");
  input.value="3";input.dispatch("input");
  assert.equal(elements.get("#pf-rate").textContent,"75 %");
  assert.equal(elements.get("#pf-hundredth").textContent,"75 / 100");
  assert.equal(elements.get("#pf-reduced").textContent,"3 / 4");
  assert.equal(elements.get("#pf-decimal").textContent,"0,75");
  assert.equal(elements.get("#pf-product").textContent,"0,75 · 40 = 30");
  assert.equal(input.getAttribute("aria-label"),"Prozentbeispiel verändern: Beispiel 4 von 4: 75 Prozent sind der Faktor 0,75; 0,75 mal 40 ist 30");
  assert.equal(input.getAttribute("aria-valuetext"),"Beispiel 4 von 4: 75 Prozent sind der Faktor 0,75; 0,75 mal 40 ist 30");
});

test("Mehrfachtipp und Reset neutralisieren alte Rückrufe",async()=>{
  const {elements,frames,timers}=await harness({reduced:false}),next=elements.get("#pf-next");
  next.dispatch("click");next.dispatch("click");
  assert.equal(elements.get("#pf-workspace").dataset.state,"hundredth");
  elements.get("#pf-reset").dispatch("click");
  for(const callback of frames) callback(900);
  for(const callback of timers) callback();
  assert.equal(elements.get("#pf-workspace").dataset.state,"irritation");
  assert.equal(elements.get("#pf-workspace").getAttribute("aria-busy"),"false");
  assert.equal(elements.get("#pf-hundredth").hidden,true);
});
