import { EQUIVALENCE_TILT_DURATION, balanceTilt, equivalenceTiltFrame } from "./equivalence-animation.js";
import { createEquivalenceState, equivalenceViewModel, nextEquivalenceState, resetEquivalenceState, setEquivalenceDelta } from "./equivalence-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#equivalence-board"),leftEquation=$("#equivalence-left-equation"),rightEquation=$("#equivalence-right-equation"),leftValue=$("#equivalence-left-value"),rightValue=$("#equivalence-right-value"),beam=$("#equivalence-beam"),warning=$("#equivalence-warning"),restorePanel=$("#equivalence-restore"),subtractBoth=$("#equivalence-subtract-both"),divideBoth=$("#equivalence-divide-both"),groups=$("#equivalence-groups"),explore=$("#equivalence-explore"),conclusion=$("#equivalence-conclusion"),conclusionText=$("#equivalence-conclusion-text"),deltaControl=$("#equivalence-delta"),deltaValue=$("#equivalence-delta-value"),insight=$("#equivalence-insight"),live=$("#equivalence-live"),next=$("#equivalence-next"),reset=$("#equivalence-reset");
let current=createEquivalenceState(),currentTilt=0,frameId=null,animationToken=0;

function setTilt(value){currentTilt=value;beam.style.setProperty("--balance-tilt",`${value}deg`);}
function stopAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;next.disabled=false;}

function render(){
  const model=equivalenceViewModel(current);
  board.dataset.state=current.view;
  leftEquation.textContent=model.leftText;rightEquation.textContent=model.rightText;
  leftValue.textContent=String(model.leftValue);rightValue.textContent=String(model.rightValue);
  warning.hidden=!model.showWarning;restorePanel.hidden=!model.showRestore;subtractBoth.hidden=!model.showSubtractBoth;divideBoth.hidden=!model.showDivideBoth;groups.hidden=!model.showGroups;explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;
  conclusionText.textContent=model.conclusion;deltaControl.value=String(current.delta);deltaControl.disabled=!model.interactive;deltaValue.textContent=model.operation;
  insight.textContent=model.insight;next.hidden=!model.showNext;
  live.textContent=model.showConclusion?`${model.operation} auf beiden Seiten: Beide Seiten haben für x gleich fünf weiterhin den Wert ${model.leftValue}.`:model.showWarning?"Nur die linke Seite wurde verändert. Die Waage ist nicht mehr im Gleichgewicht.":"";
  board.classList.toggle("is-unbalanced",!model.balanced);
  return balanceTilt(model.leftValue,model.rightValue);
}

function animateTilt(target){
  stopAnimation();
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setTilt(target);return;}
  const token=animationToken,startTilt=currentTilt;let started=null;next.disabled=true;
  function animate(time){if(token!==animationToken)return;if(started===null)started=time;const frame=equivalenceTiltFrame(time-started,startTilt,target);setTilt(frame.tilt);if(frame.complete){frameId=null;next.disabled=false;}else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}

next.addEventListener("click",()=>{if(next.disabled)return;current=nextEquivalenceState(current);animateTilt(render());});
reset.addEventListener("click",()=>{stopAnimation();current=resetEquivalenceState();setTilt(render());next.disabled=false;});
deltaControl.addEventListener("input",event=>{current=setEquivalenceDelta(current,event.currentTarget.value);animateTilt(render());});
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{});});
setTilt(render());
