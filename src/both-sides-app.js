import { BOTH_SIDES_REMOVAL_DURATION, bothSidesRemovalFrame } from "./both-sides-animation.js";
import { BOTH_SIDES_VIEWS, bothSidesViewModel, createBothSidesState, finishBothSidesRemoval, nextBothSidesState, resetBothSidesState, setSharedCoefficient } from "./both-sides-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#both-sides-board"),source=$("#both-sides-source"),sourceEquation=$("#both-sides-source-equation"),leftShared=$("#both-sides-left-shared"),rightShared=$("#both-sides-right-shared"),leftSharedLabel=$("#both-sides-left-shared-label"),rightSharedLabel=$("#both-sides-right-shared-label"),reduced=$("#both-sides-reduced"),reducedEquation=$("#both-sides-reduced-equation"),explore=$("#both-sides-explore"),conclusion=$("#both-sides-conclusion"),conclusionText=$("#both-sides-conclusion-text"),sharedControl=$("#both-sides-shared-control"),sharedValue=$("#both-sides-shared-value"),insight=$("#both-sides-insight"),live=$("#both-sides-live"),next=$("#both-sides-next"),reset=$("#both-sides-reset");
const leftTiles=Array.from({length:4},(_,index)=>$(`#both-sides-left-shared-${index+1}`));
const rightTiles=Array.from({length:4},(_,index)=>$(`#both-sides-right-shared-${index+1}`));
let current=createBothSidesState(),frameId=null,timerId=null,animationToken=0;

function setRemoval(frame){for(const group of [leftShared,rightShared]){group.style.setProperty("--remove-progress",String(frame.progress));group.style.setProperty("--remove-lift",`${frame.lift}px`);}}
function clearAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;next.disabled=false;}
function render(){
  const model=bothSidesViewModel(current),sharedName=model.shared===1?"ein x-Baustein":`${model.shared} x-Bausteine`;board.dataset.state=current.view;source.hidden=!model.showSource;sourceEquation.textContent=model.sourceEquation;reduced.hidden=!model.showReduced;reducedEquation.textContent=model.reducedEquation;explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;conclusionText.textContent=model.conclusion;
  leftShared.hidden=!model.showSource;rightShared.hidden=!model.showSource;
  leftShared.setAttribute("aria-label",model.showDecomposition?`Gemeinsame Gruppe links: ${sharedName}`:"x-Bausteine auf der linken Seite");rightShared.setAttribute("aria-label",model.showDecomposition?`Gemeinsame Gruppe rechts: ${sharedName}`:"x-Bausteine auf der rechten Seite");
  leftSharedLabel.hidden=!model.showDecomposition;rightSharedLabel.hidden=!model.showDecomposition;leftSharedLabel.textContent=`− ${model.shared}x`;rightSharedLabel.textContent=`− ${model.shared}x`;
  leftTiles.forEach((tile,index)=>tile.hidden=index>=model.shared);rightTiles.forEach((tile,index)=>tile.hidden=index>=model.shared);
  sharedControl.value=String(model.shared);sharedControl.disabled=!model.interactive;sharedValue.textContent=`${model.shared}x`;insight.textContent=model.insight;next.hidden=!model.showNext;next.disabled=model.controlsLocked;
  live.textContent=model.showConclusion?(model.shared===1?"x wird auf beiden Seiten entfernt. Übrig bleibt 3x plus 3 gleich 18.":`${model.shared}x werden auf beiden Seiten entfernt. Übrig bleibt 3x plus 3 gleich 18.`):"";
  if(!model.removing)setRemoval({progress:0,lift:0});
}
function finishRemoval(token){if(token!==animationToken||current.view!==BOTH_SIDES_VIEWS.removing)return;clearAnimation();current=finishBothSidesRemoval(current);render();}
function animateRemoval(){
  clearAnimation();const token=animationToken;next.disabled=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setRemoval(bothSidesRemovalFrame(BOTH_SIDES_REMOVAL_DURATION));finishRemoval(token);return;}
  let started=null;timerId=setTimeout(()=>finishRemoval(token),BOTH_SIDES_REMOVAL_DURATION+120);
  function animate(time){if(token!==animationToken||current.view!==BOTH_SIDES_VIEWS.removing)return;if(started===null)started=time;const frame=bothSidesRemovalFrame(time-started);setRemoval(frame);if(frame.complete)finishRemoval(token);else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}
next.addEventListener("click",()=>{if(current.locked)return;current=nextBothSidesState(current);render();if(current.view===BOTH_SIDES_VIEWS.removing)animateRemoval();});
reset.addEventListener("click",()=>{clearAnimation();current=resetBothSidesState();render();});
sharedControl.addEventListener("input",event=>{current=setSharedCoefficient(current,event.currentTarget.value);render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{});});
render();
