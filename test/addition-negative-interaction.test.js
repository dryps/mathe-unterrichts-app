import assert from "node:assert/strict";
import test from "node:test";

function element(id=""){
  const listeners=new Map(),attributes=new Map(),classes=new Set();let pointer=null;
  return {id,dataset:{},style:{},hidden:false,disabled:false,textContent:"",children:[],childrenBySelector:new Map(),classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)},addEventListener:(type,fn)=>listeners.set(type,fn),dispatch:(type,event={})=>listeners.get(type)?.(event),setAttribute:(name,value)=>attributes.set(name,String(value)),getAttribute:name=>attributes.get(name)??null,querySelector(selector){return this.childrenBySelector.get(selector)??null;},replaceChildren(...nodes){this.children=nodes;},closest(selector){return selector===`#${id}`?this:null;},setPointerCapture(id){pointer=id;},hasPointerCapture:id=>pointer===id,releasePointerCapture(id){if(pointer===id)pointer=null;}};
}

async function harness(){
  const names=["addition-board","addition-prompt","addition-axis-layer","addition-axis","addition-start-point","addition-motion","addition-motion-line","addition-step-boundaries","addition-motion-arrowhead","addition-moving-point","addition-end-handle","addition-formula","addition-start-term","addition-operator","addition-summand-term","addition-result-term","addition-insight","addition-live-value","addition-next","addition-reset"];
  const ids=new Map(names.map(id=>[`#${id}`,element(id)]));
  const ticks=Array.from({length:8},(_,i)=>{const g=element(`tick-${i-3}`);g.dataset.additionValue=String(i-3);g.childrenBySelector.set("line",element());g.childrenBySelector.set("text",element());return g;});
  const board=ids.get("#addition-board");board.createSVGPoint=()=>({x:0,y:0,matrixTransform(){return{x:this.x,y:this.y};}});board.getScreenCTM=()=>({inverse:()=>({})});
  Object.defineProperty(globalThis,"document",{configurable:true,value:{querySelector:s=>ids.get(s)??null,querySelectorAll:s=>s==="[data-addition-value]"?ticks:[],createElementNS:(_ns,name)=>element(name)}});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{addEventListener(){},matchMedia:()=>({matches:true})}});
  await import(`../src/addition-negative-app.js?interaction=${Date.now()}-${Math.random()}`);
  const event=(target,pointerId,clientX,clientY=999)=>({target,pointerId,clientX,clientY,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}});
  return{ids,ticks,board,event};
}

test("vollständiger Aufbau sperrt Bewegung und trennt Rechenzeichen vom Vorzeichen",async()=>{
  const h=await harness(),next=h.ids.get("#addition-next"),handle=h.ids.get("#addition-end-handle");
  assert.equal(h.board.dataset.state,"prompt");assert.equal(h.ids.get("#addition-prompt").hidden,false);assert.equal(h.ids.get("#addition-axis-layer").getAttribute("visibility"),"hidden");
  const blocked=h.event(handle,1,999,-999);h.board.dispatch("pointerdown",blocked);assert.equal(blocked.defaultPrevented,false);
  next.dispatch("click");assert.equal(h.board.dataset.state,"start");assert.equal(h.ids.get("#addition-start-term").classList.contains("is-highlighted"),true);assert.equal(h.ids.get("#addition-motion").getAttribute("visibility"),"hidden");
  next.dispatch("click");assert.equal(h.board.dataset.state,"operator");assert.equal(h.ids.get("#addition-operator").classList.contains("is-highlighted"),true);assert.equal(h.ids.get("#addition-summand-term").classList.contains("is-highlighted"),false);
  next.dispatch("click");assert.equal(h.board.dataset.state,"summand");assert.equal(h.ids.get("#addition-summand-term").classList.contains("is-highlighted"),true);
  next.dispatch("click");assert.equal(h.board.dataset.state,"result");assert.equal(handle.getAttribute("visibility"),"visible");assert.equal(h.ids.get("#addition-result-term").textContent," = −2");assert.equal(h.ids.get("#addition-step-boundaries").children.length,6);
  next.dispatch("click");assert.equal(h.board.dataset.state,"free");assert.equal(next.hidden,true);
});

test("Touch und Maus rasten −1 bis −6 ein und ignorieren vertikale Bewegung",async()=>{
  const h=await harness(),next=h.ids.get("#addition-next"),handle=h.ids.get("#addition-end-handle"),result=h.ids.get("#addition-result-term");for(let i=0;i<5;i+=1)next.dispatch("click");
  const left=h.event(handle,7,-9999,50000);h.board.dispatch("pointerdown",left);assert.equal(left.defaultPrevented,true);assert.equal(handle.getAttribute("aria-valuenow"),"-6");assert.equal(result.textContent," = −3");assert.equal(h.board.dataset.state,"conclusion");
  const right=h.event(handle,7,9999,-50000);h.board.dispatch("pointermove",right);assert.equal(right.defaultPrevented,true);assert.equal(handle.getAttribute("aria-valuenow"),"-1");assert.equal(result.textContent," = 2");h.board.dispatch("pointerup",h.event(handle,7,0));
  const mouse=h.event(handle,9,457,123456);h.board.dispatch("pointerdown",mouse);assert.equal(handle.getAttribute("aria-valuenow"),"-4");assert.equal(result.textContent," = −1");h.board.dispatch("pointerup",h.event(handle,9,0));
});

test("Tastatur, Reset und erneuter Aufbau bleiben deterministisch",async()=>{
  const h=await harness(),next=h.ids.get("#addition-next"),reset=h.ids.get("#addition-reset"),handle=h.ids.get("#addition-end-handle");for(let i=0;i<5;i+=1)next.dispatch("click");
  handle.dispatch("keydown",{key:"ArrowLeft",preventDefault(){}});assert.equal(handle.getAttribute("aria-valuenow"),"-6");handle.dispatch("keydown",{key:"ArrowRight",preventDefault(){}});assert.equal(handle.getAttribute("aria-valuenow"),"-5");
  reset.dispatch("click");assert.equal(h.board.dataset.state,"prompt");assert.equal(h.ids.get("#addition-prompt").hidden,false);assert.equal(h.ids.get("#addition-motion").getAttribute("visibility"),"hidden");assert.equal(h.ids.get("#addition-step-boundaries").children.length,0);
  for(let i=0;i<5;i+=1)next.dispatch("click");assert.equal(h.board.dataset.state,"free");assert.equal(handle.getAttribute("aria-valuenow"),"-5");
});
