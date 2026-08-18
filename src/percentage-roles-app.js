import { PERCENTAGE_ROLES_REVEAL_DURATION, percentageRolesRevealFrame } from "./percentage-roles-animation.js";
import { createPercentageRolesState, finishPercentageRolesReveal, nextPercentageRolesState, percentageRolesViewModel, resetPercentageRolesState, setPercentageRoleScenario, setUnknownPercentageRole } from "./percentage-roles-state.js";

const $=selector=>document.querySelector(selector);
const workspace=$("#pr-workspace"),diagram=$("#pr-diagram"),fill=$("#pr-fill"),whole=$("#pr-whole"),part=$("#pr-part"),rate=$("#pr-rate"),relation=$("#pr-relation"),equation=$("#pr-equation"),explore=$("#pr-explore"),conclusion=$("#pr-conclusion"),scenarioInput=$("#pr-scenario"),scenarioOutput=$("#pr-scenario-output"),insight=$("#pr-insight"),live=$("#pr-live"),next=$("#pr-next"),reset=$("#pr-reset");
const roleElements={whole,part,rate};
const roleValueElements={whole:$("#pr-whole-value"),part:$("#pr-part-value"),rate:$("#pr-rate-value")};
const unknownButtons=[$("#pr-unknown-whole"),$("#pr-unknown-part"),$("#pr-unknown-rate")];

let current=createPercentageRolesState(),frameId=null,timerId=null,animationToken=0;

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
  const model=percentageRolesViewModel(current);
  workspace.dataset.state=model.view;
  diagram.setAttribute("aria-label",model.diagramAriaLabel);
  fill.style.width=`${model.fillPercent}%`;
  whole.hidden=!model.showWhole;
  part.hidden=!model.showPart;
  rate.hidden=!model.showRate;
  relation.hidden=!model.showRelation;
  explore.hidden=!model.showExplore;
  conclusion.hidden=!model.showConclusion;
  for(const role of model.roles){
    const roleElement=roleElements[role.key];
    const roleValue=roleValueElements[role.key];
    roleValue.textContent=role.valueText;
    roleElement.dataset.unknown=String(role.hidden);
    roleElement.setAttribute("aria-label",role.ariaLabel);
  }
  equation.textContent=model.equation;
  scenarioInput.value=String(model.scenarioIndex);
  scenarioInput.setAttribute("aria-label",model.sliderAriaLabel);
  scenarioInput.setAttribute("aria-valuetext",model.sliderValueText);
  scenarioInput.disabled=!model.controlsInteractive;
  scenarioOutput.textContent=`Situation ${model.scenarioIndex+1}`;
  unknownButtons.forEach(button=>{
    const selected=button.dataset.role===model.unknownRole;
    button.setAttribute("aria-pressed",String(selected));
    button.disabled=!model.controlsInteractive;
  });
  insight.textContent=model.insight;
  live.textContent=model.liveText;
  next.hidden=!model.showNext;
  next.disabled=current.locked;
}

function finishReveal(token){
  if(token!==animationToken||!current.locked) return;
  clearAnimation();
  current=finishPercentageRolesReveal(current);
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
  timerId=setTimeout(()=>finishReveal(token),PERCENTAGE_ROLES_REVEAL_DURATION+120);
  function animate(time){
    if(token!==animationToken||!current.locked) return;
    if(started===null) started=time;
    const frame=percentageRolesRevealFrame(time-started);
    workspace.style.opacity=String(frame.opacity);
    if(frame.complete) finishReveal(token);
    else frameId=requestAnimationFrame(animate);
  }
  frameId=requestAnimationFrame(animate);
}

next.addEventListener("click",()=>{
  if(current.locked) return;
  current=nextPercentageRolesState(current);
  render();
  if(current.locked) animateReveal();
});
reset.addEventListener("click",()=>{clearAnimation();current=resetPercentageRolesState();render();});
scenarioInput.addEventListener("input",event=>{current=setPercentageRoleScenario(current,Number(event.currentTarget.value));render();});
unknownButtons.forEach(button=>button.addEventListener("click",()=>{current=setUnknownPercentageRole(current,button.dataset.role);render();}));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{}));

render();
