import assert from "node:assert/strict";
import test from "node:test";

function element(id = "") {
  const listeners = new Map(); const styles = new Map(); const classes = new Set();
  return { id, dataset:{}, hidden:false, disabled:false, textContent:"", value:"",
    style:{setProperty(n,v){styles.set(n,String(v));},getPropertyValue(n){return styles.get(n)??"";}},
    classList:{toggle(n,on){if(on)classes.add(n);else classes.delete(n);},contains(n){return classes.has(n);}},
    addEventListener(t,l){listeners.set(t,l);}, dispatch(t,e={}){return listeners.get(t)?.({currentTarget:this,target:this,...e});},
  };
}

async function harness({ reducedMotion = true } = {}) {
  const names = ["distribution-board","distribution-irritation","distribution-package","distribution-factor","distribution-copies","distribution-regroup","distribution-result","distribution-explore","distribution-conclusion","distribution-conclusion-title","distribution-conclusion-detail","factor-expression","copies-expression","x-bundle-label","ones-bundle-label","result-equation","factor-control","factor-value","distribution-insight","distribution-live","distribution-next","distribution-reset",...Array.from({length:5},(_,i)=>`distribution-package-${i+1}`)];
  const ids=new Map(names.map(id=>[`#${id}`,element(id)])); const animationFrames=[]; const timerCallbacks=[];
  Object.defineProperty(globalThis,"document",{configurable:true,value:{querySelector:s=>ids.get(s)??null}});
  Object.defineProperty(globalThis,"window",{configurable:true,value:{matchMedia:()=>({matches:reducedMotion}),addEventListener(){}}});
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});
  Object.defineProperty(globalThis,"requestAnimationFrame",{configurable:true,value(cb){animationFrames.push(cb);return animationFrames.length;}});
  Object.defineProperty(globalThis,"cancelAnimationFrame",{configurable:true,value(){}});
  Object.defineProperty(globalThis,"setTimeout",{configurable:true,value(cb){timerCallbacks.push(cb);return timerCallbacks.length;}});
  Object.defineProperty(globalThis,"clearTimeout",{configurable:true,value(){}});
  await import(`../src/distribution-app.js?interaction=${Date.now()}-${Math.random()}`);
  return {ids,animationFrames,timerCallbacks};
}

test("Weiter zeigt den vollständigen Lernweg ohne verfrühtes Ergebnis", async () => {
  const setup=await harness(); const next=setup.ids.get("#distribution-next"); const board=setup.ids.get("#distribution-board");
  assert.equal(board.dataset.state,"irritation");
  next.dispatch("click"); assert.equal(board.dataset.state,"package");
  next.dispatch("click"); assert.equal(board.dataset.state,"factor");
  next.dispatch("click"); assert.equal(board.dataset.state,"copies");
  assert.equal(setup.ids.get("#distribution-result").hidden,true);
  next.dispatch("click"); assert.equal(board.dataset.state,"regroup");
  next.dispatch("click"); assert.equal(board.dataset.state,"result"); assert.equal(setup.ids.get("#result-equation").textContent,"3(x + 2) = 3x + 6");
  next.dispatch("click"); assert.equal(board.dataset.state,"explore"); assert.equal(next.hidden,true);
});

test("Mehrfachtipps überholen die laufende Kopieranimation nicht", async () => {
  const setup=await harness({reducedMotion:false}); const next=setup.ids.get("#distribution-next");
  next.dispatch("click");next.dispatch("click");next.dispatch("click");
  assert.equal(setup.ids.get("#distribution-board").dataset.state,"copying"); assert.equal(next.disabled,true); assert.equal(setup.ids.get("#distribution-reset").disabled,false);
  next.dispatch("click"); assert.equal(setup.animationFrames.length,1);
  setup.animationFrames[0](0);setup.animationFrames.at(-1)(1100);
  assert.equal(setup.ids.get("#distribution-board").dataset.state,"copies");
});

test("Reset neutralisiert verspätete RAF- und Timeout-Rückrufe", async () => {
  const setup=await harness({reducedMotion:false});const next=setup.ids.get("#distribution-next");
  next.dispatch("click");next.dispatch("click");next.dispatch("click");const frame=setup.animationFrames[0];const timer=setup.timerCallbacks[0];
  setup.ids.get("#distribution-reset").dispatch("click");frame(1100);timer();
  assert.equal(setup.ids.get("#distribution-board").dataset.state,"irritation");
  assert.equal(setup.ids.get("#distribution-package-1").style.getPropertyValue("--copy-progress"),"0");
});

test("Regler synchronisiert Kopien, beide Bündel und Ergebnis", async () => {
  const setup=await harness();const next=setup.ids.get("#distribution-next");for(let i=0;i<6;i+=1)next.dispatch("click");
  const slider=setup.ids.get("#factor-control");slider.value="5";slider.dispatch("input");
  assert.equal(setup.ids.get("#distribution-board").dataset.state,"conclusion");
  assert.equal(setup.ids.get("#factor-value").textContent,"5 vollständige Pakete");
  assert.equal(setup.ids.get("#distribution-package-5").hidden,false);
  assert.equal(setup.ids.get("#x-bundle-label").textContent,"5 x-Bausteine = 5x");
  assert.equal(setup.ids.get("#ones-bundle-label").textContent,"10 Einer = 10");
  assert.equal(setup.ids.get("#result-equation").textContent,"5(x + 2) = 5x + 10");
  assert.equal(setup.ids.get("#distribution-conclusion-title").textContent,"Der Faktor 5 vervielfacht das gesamte Paket.");
  assert.equal(setup.ids.get("#distribution-conclusion-detail").textContent,"Darum entstehen aus fünf Paketen 5 x-Bausteine und 10 Einer.");
  assert.match(setup.ids.get("#distribution-live").textContent,/beide Bestandteile/);
});
