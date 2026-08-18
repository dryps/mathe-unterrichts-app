import assert from "node:assert/strict";
import test from "node:test";

function element(id=""){
  const listeners=new Map(),attrs=new Map();
  const dataset={};
  if(id.startsWith("pr-unknown-")) dataset.role=id.replace("pr-unknown-","");
  return {id,dataset,hidden:false,disabled:false,textContent:"",value:"",style:{},setAttribute(name,value){attrs.set(name,String(value));},getAttribute(name){return attrs.get(name)??null;},addEventListener(type,listener){listeners.set(type,listener);},dispatch(type,event={}){return listeners.get(type)?.({currentTarget:this,target:this,...event});}};
}

async function harness({reduced=true}={}){
  const ids=["pr-workspace","pr-diagram","pr-fill","pr-whole-caption","pr-part-caption","pr-whole","pr-part","pr-rate","pr-relation","pr-equation","pr-explore","pr-conclusion","pr-scenario","pr-scenario-output","pr-insight","pr-live","pr-next","pr-reset","pr-whole-value","pr-part-value","pr-rate-value","pr-unknown-whole","pr-unknown-part","pr-unknown-rate"];
  const elements=new Map(ids.map(id=>[`#${id}`,element(id)])),frames=[],timers=[];
  Object.defineProperty(globalThis,"document",{configurable:true,value:{querySelector:selector=>elements.get(selector)??null}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{matchMedia:()=>({matches:reduced}),addEventListener(){}}});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});
  Object.defineProperty(globalThis,"requestAnimationFrame",{configurable:true,value(callback){frames.push(callback);return frames.length;}});
  Object.defineProperty(globalThis,"cancelAnimationFrame",{configurable:true,value(){}});
  Object.defineProperty(globalThis,"setTimeout",{configurable:true,value(callback){timers.push(callback);return timers.length;}});
  Object.defineProperty(globalThis,"clearTimeout",{configurable:true,value(){}});
  await import(`../src/percentage-roles-app.js?interaction=${Date.now()}-${Math.random()}`);
  return {elements,frames,timers};
}

test("Erkundung blendet immer genau eine Rolle aus und hält alle Darstellungen synchron",async()=>{
  const {elements}=await harness(),next=elements.get("#pr-next");
  for(let step=0;step<4;step+=1) next.dispatch("click");
  assert.equal(elements.get("#pr-workspace").dataset.state,"explore");
  assert.equal(elements.get("#pr-whole-value").textContent,"?");
  assert.equal(elements.get("#pr-part-value").textContent,"20");
  assert.equal(elements.get("#pr-rate-value").textContent,"25 %");
  assert.equal(elements.get("#pr-equation").textContent,"20 / ? = 25 / 100");
  assert.doesNotMatch(elements.get("#pr-diagram").getAttribute("aria-label"),/80/);

  elements.get("#pr-unknown-part").dispatch("click");
  const input=elements.get("#pr-scenario");
  input.value="1";
  input.dispatch("input");
  assert.equal(elements.get("#pr-whole-value").textContent,"120");
  assert.equal(elements.get("#pr-part-value").textContent,"?");
  assert.equal(elements.get("#pr-rate-value").textContent,"30 %");
  assert.equal(elements.get("#pr-fill").style.width,"30%");
  assert.equal(elements.get("#pr-equation").textContent,"? / 120 = 30 / 100");
  assert.equal(input.getAttribute("aria-valuetext"),"Situation 2 von 3; 30 Prozent von 120 Karten; Prozentwert gesucht");
  assert.doesNotMatch(elements.get("#pr-diagram").getAttribute("aria-label"),/36/);
  assert.doesNotMatch(elements.get("#pr-live").textContent,/36/);

  elements.get("#pr-unknown-rate").dispatch("click");
  input.value="2";
  input.dispatch("input");
  assert.equal(elements.get("#pr-whole-value").textContent,"200");
  assert.equal(elements.get("#pr-part-value").textContent,"50");
  assert.equal(elements.get("#pr-rate-value").textContent,"?");
  assert.equal(elements.get("#pr-equation").textContent,"50 / 200 = ? / 100");
  assert.equal(elements.get("#pr-unknown-rate").getAttribute("aria-pressed"),"true");
  assert.match(elements.get("#pr-diagram").getAttribute("aria-label"),/Verhältnis gesucht/);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Animationsrückrufe",async()=>{
  const {elements,frames,timers}=await harness({reduced:false}),next=elements.get("#pr-next");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(elements.get("#pr-workspace").dataset.state,"whole");
  assert.equal(elements.get("#pr-workspace").getAttribute("aria-busy"),"true");
  elements.get("#pr-reset").dispatch("click");
  for(const callback of frames) callback(900);
  for(const callback of timers) callback();
  assert.equal(elements.get("#pr-workspace").dataset.state,"irritation");
  assert.equal(elements.get("#pr-workspace").getAttribute("aria-busy"),"false");
  assert.equal(elements.get("#pr-workspace").style.opacity,"1");
  assert.equal(elements.get("#pr-whole").hidden,true);
});
