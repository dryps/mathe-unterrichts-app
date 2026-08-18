import { ABSOLUTE_RELATIVE_REVEAL_DURATION, absoluteRelativeRevealFrame } from "./absolute-relative-animation.js";
import { absoluteRelativeViewModel, createAbsoluteRelativeState, finishAbsoluteRelativeReveal, nextAbsoluteRelativeState, resetAbsoluteRelativeState, setComparisonScale } from "./absolute-relative-state.js";

const $=selector=>document.querySelector(selector);
const workspace=$("#ar-workspace"),absolute=$("#ar-absolute"),normalize=$("#ar-normalize"),relative=$("#ar-relative"),explore=$("#ar-explore"),conclusion=$("#ar-conclusion"),scaleInput=$("#ar-scale"),scaleOutput=$("#ar-scale-output"),leftExploreLabel=$("#ar-left-explore-label"),rightExploreLabel=$("#ar-right-explore-label"),leftExploreTrack=$("#ar-left-explore-track"),rightExploreTrack=$("#ar-right-explore-track"),leftExploreImage=$("#ar-left-explore-image"),rightExploreImage=$("#ar-right-explore-image"),exploreCommon=$("#ar-explore-common"),exploreAbsolute=$("#ar-explore-absolute"),exploreRelative=$("#ar-explore-relative"),insight=$("#ar-insight"),live=$("#ar-live"),next=$("#ar-next"),reset=$("#ar-reset");

let current=createAbsoluteRelativeState(),frameId=null,timerId=null,animationToken=0;

function createDots(container,total,marked){
  for(let index=0;index<total;index+=1){
    const dot=document.createElement("span");
    if(index<marked) dot.className="marked";
    dot.setAttribute("aria-hidden","true");
    container.append(dot);
  }
}

function clearAnimation(){
  animationToken += 1;
  if(frameId!==null) cancelAnimationFrame(frameId);
  if(timerId!==null) clearTimeout(timerId);
  frameId=null;
  timerId=null;
  next.disabled=false;
  workspace.style.opacity="1";
  workspace.setAttribute("aria-busy","false");
}

function render(){
  const model=absoluteRelativeViewModel(current);
  workspace.dataset.state=model.view;
  absolute.hidden=!model.showAbsolute;
  normalize.hidden=!model.showNormalization;
  relative.hidden=!model.showRelative;
  explore.hidden=!model.showExplore;
  conclusion.hidden=!model.showConclusion;
  scaleInput.value=String(model.scaleIndex);
  scaleInput.setAttribute("aria-label",model.sliderAriaLabel);
  scaleInput.setAttribute("aria-valuetext",model.sliderValueText);
  scaleInput.disabled=!model.controlsInteractive;
  scaleOutput.textContent=`Faktor ${model.scale}`;
  leftExploreLabel.textContent=model.left.label;
  rightExploreLabel.textContent=model.right.label;
  leftExploreTrack.style.width=`${model.left.percent}%`;
  rightExploreTrack.style.width=`${model.right.percent}%`;
  leftExploreImage.setAttribute("aria-label",model.left.ariaLabel);
  rightExploreImage.setAttribute("aria-label",model.right.ariaLabel);
  exploreCommon.textContent=`Normalisiert: ${model.left.normalizedLabel} · ${model.right.normalizedLabel}`;
  exploreAbsolute.textContent=model.absoluteText;
  exploreRelative.textContent=model.relativeText;
  insight.textContent=model.insight;
  next.hidden=!model.showNext;
  next.disabled=current.locked;
  live.textContent=model.liveText;
}

function finishReveal(token){
  if(token!==animationToken||!current.locked) return;
  clearAnimation();
  current=finishAbsoluteRelativeReveal(current);
  render();
}

function animateReveal(){
  clearAnimation();
  const token=animationToken;
  workspace.style.opacity="0";
  workspace.setAttribute("aria-busy","true");
  next.disabled=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){finishReveal(token);return;}
  let started=null;
  timerId=setTimeout(()=>finishReveal(token),ABSOLUTE_RELATIVE_REVEAL_DURATION+120);
  function animate(time){
    if(token!==animationToken||!current.locked) return;
    if(started===null) started=time;
    const frame=absoluteRelativeRevealFrame(time-started);
    workspace.style.opacity=String(frame.opacity);
    if(frame.complete) finishReveal(token);
    else frameId=requestAnimationFrame(animate);
  }
  frameId=requestAnimationFrame(animate);
}

next.addEventListener("click",()=>{
  if(current.locked) return;
  current=nextAbsoluteRelativeState(current);
  render();
  if(current.locked) animateReveal();
});
reset.addEventListener("click",()=>{clearAnimation();current=resetAbsoluteRelativeState();render();});
scaleInput.addEventListener("input",event=>{current=setComparisonScale(current,Number(event.currentTarget.value));render();});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{}));

createDots($("#ar-left-dots"),50,6);
createDots($("#ar-right-dots"),40,5);
render();
