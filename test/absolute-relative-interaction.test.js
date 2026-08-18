import assert from "node:assert/strict";
import test from "node:test";

function element(id=""){
  const listeners=new Map(),attrs=new Map(),children=[];
  return {id,dataset:{},hidden:false,disabled:false,textContent:"",value:"",className:"",style:{},children,setAttribute(name,value){attrs.set(name,String(value));},getAttribute(name){return attrs.get(name)??null;},addEventListener(type,listener){listeners.set(type,listener);},dispatch(type,event={}){return listeners.get(type)?.({currentTarget:this,target:this,...event});},append(child){children.push(child);}};
}

async function harness({reduced=true}={}){
  const ids=["ar-workspace","ar-absolute","ar-normalize","ar-relative","ar-explore","ar-conclusion","ar-scale","ar-scale-output","ar-left-explore-label","ar-right-explore-label","ar-left-explore-track","ar-right-explore-track","ar-left-explore-image","ar-right-explore-image","ar-explore-common","ar-explore-absolute","ar-explore-relative","ar-insight","ar-live","ar-next","ar-reset","ar-left-dots","ar-right-dots"];
  const elements=new Map(ids.map(id=>[`#${id}`,element(id)])),frames=[],timers=[];
  Object.defineProperty(globalThis,"document",{configurable:true,value:{querySelector:selector=>elements.get(selector)??null,createElement:()=>element()}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{matchMedia:()=>({matches:reduced}),addEventListener(){}}});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});
  Object.defineProperty(globalThis,"requestAnimationFrame",{configurable:true,value(callback){frames.push(callback);return frames.length;}});
  Object.defineProperty(globalThis,"cancelAnimationFrame",{configurable:true,value(){}});
  Object.defineProperty(globalThis,"setTimeout",{configurable:true,value(callback){timers.push(callback);return timers.length;}});
  Object.defineProperty(globalThis,"clearTimeout",{configurable:true,value(){}});
  await import(`../src/absolute-relative-app.js?interaction=${Date.now()}-${Math.random()}`);
  return {elements,frames,timers};
}

test("Erkundung aktualisiert beide Gruppen, Normalisierung, Vergleiche und Namen gemeinsam",async()=>{
  const {elements}=await harness(),next=elements.get("#ar-next");
  for(let step=0;step<4;step+=1) next.dispatch("click");
  const input=elements.get("#ar-scale");
  input.value="2";
  input.dispatch("input");
  assert.equal(elements.get("#ar-left-explore-label").textContent,"18 von 150");
  assert.equal(elements.get("#ar-right-explore-label").textContent,"15 von 120");
  assert.equal(elements.get("#ar-left-explore-track").style.width,"12%");
  assert.equal(elements.get("#ar-right-explore-track").style.width,"12.5%");
  assert.equal(elements.get("#ar-explore-common").textContent,"Normalisiert: 72 von 600 · 75 von 600");
  assert.equal(elements.get("#ar-explore-absolute").textContent,"18 > 15");
  assert.equal(elements.get("#ar-explore-relative").textContent,"12 % < 12,5 %");
  assert.equal(input.getAttribute("aria-valuetext"),"Faktor 3; links 18 von 150, rechts 15 von 120");
  assert.equal(elements.get("#ar-left-explore-image").getAttribute("aria-label"),"18 markierte von 150; das sind 12 Prozent.");
  assert.equal(elements.get("#ar-right-explore-image").getAttribute("aria-label"),"15 markierte von 120; das sind 12,5 Prozent.");
  assert.equal(elements.get("#ar-left-dots").children.length,50);
  assert.equal(elements.get("#ar-right-dots").children.length,40);
});

test("Mehrfachtipp und Reset neutralisieren veraltete Animationsrückrufe",async()=>{
  const {elements,frames,timers}=await harness({reduced:false}),next=elements.get("#ar-next");
  next.dispatch("click");
  next.dispatch("click");
  assert.equal(elements.get("#ar-workspace").dataset.state,"absolute");
  assert.equal(elements.get("#ar-workspace").getAttribute("aria-busy"),"true");
  elements.get("#ar-reset").dispatch("click");
  for(const callback of frames) callback(900);
  for(const callback of timers) callback();
  assert.equal(elements.get("#ar-workspace").dataset.state,"irritation");
  assert.equal(elements.get("#ar-workspace").getAttribute("aria-busy"),"false");
  assert.equal(elements.get("#ar-workspace").style.opacity,"1");
  assert.equal(elements.get("#ar-absolute").hidden,true);
});
