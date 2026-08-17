import { REFLECTION_DURATION, reflectionFrame } from "./negative-inequality-animation.js";
import { numberLinePercent } from "./negative-inequality-math.js";
import { NEGATIVE_INEQUALITY_VIEWS, createNegativeInequalityState, finishReflection, negativeInequalityViewModel, nextNegativeInequalityState, resetNegativeInequalityState, setReflectionBase } from "./negative-inequality-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#negative-board"),sourceEquation=$("#negative-source-equation"),operation=$("#negative-operation"),lineStage=$("#negative-line-stage"),pointSmall=$("#negative-point-small"),pointLarge=$("#negative-point-large"),pointSmallLabel=$("#negative-point-small-label"),pointLargeLabel=$("#negative-point-large-label"),result=$("#negative-result"),resultEquation=$("#negative-result-equation"),explore=$("#negative-explore"),baseControl=$("#negative-base-control"),baseValue=$("#negative-base-value"),conclusion=$("#negative-conclusion"),conclusionText=$("#negative-conclusion-text"),insight=$("#negative-insight"),live=$("#negative-live"),next=$("#negative-next"),reset=$("#negative-reset");
let current=createNegativeInequalityState(),frameId=null,timerId=null,animationToken=0;

function pointText(value,multiplier){if(multiplier===0)return "0";return multiplier<0?`−${value}`:`${value}`;}
function setPoints(multiplier,model){
  pointSmall.style.setProperty("--point-position",`${numberLinePercent(model.base*multiplier)}%`);pointLarge.style.setProperty("--point-position",`${numberLinePercent(model.greater*multiplier)}%`);
  pointSmallLabel.textContent=pointText(model.base,multiplier);pointLargeLabel.textContent=pointText(model.greater,multiplier);
  pointSmall.setAttribute("aria-label",`Erster Punkt bei ${pointSmallLabel.textContent}`);pointLarge.setAttribute("aria-label",`Zweiter Punkt bei ${pointLargeLabel.textContent}`);
}
function clearAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;next.disabled=false;}
function render(){
  const model=negativeInequalityViewModel(current);board.dataset.state=current.view;sourceEquation.textContent=model.sourceEquation;operation.hidden=!model.showLine;lineStage.hidden=!model.showLine;lineStage.setAttribute("aria-busy",String(model.reflecting));result.hidden=!model.showResult;resultEquation.textContent=model.resultEquation;explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;conclusionText.textContent=model.conclusion;baseControl.value=String(model.base);baseControl.disabled=!model.interactive;baseValue.textContent=model.sourceEquation;insight.textContent=model.insight;next.hidden=!model.showNext;next.disabled=model.controlsLocked;
  live.textContent=model.showConclusion?`${model.sourceEquation}. Nach der Spiegelung gilt ${model.resultEquation}. ${model.conclusion}`:"";
  if(!model.reflecting)setPoints(model.multiplier,model);
}
function finishAnimation(token){if(token!==animationToken||current.view!==NEGATIVE_INEQUALITY_VIEWS.reflecting)return;clearAnimation();current=finishReflection(current);render();}
function animateReflection(){
  clearAnimation();const token=animationToken,model=negativeInequalityViewModel(current);next.disabled=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setPoints(-1,model);finishAnimation(token);return;}
  let started=null;timerId=setTimeout(()=>finishAnimation(token),REFLECTION_DURATION+120);
  function animate(time){if(token!==animationToken||current.view!==NEGATIVE_INEQUALITY_VIEWS.reflecting)return;if(started===null)started=time;const frame=reflectionFrame(time-started);setPoints(frame.multiplier,model);if(frame.complete)finishAnimation(token);else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}
next.addEventListener("click",()=>{if(current.locked)return;current=nextNegativeInequalityState(current);render();if(current.view===NEGATIVE_INEQUALITY_VIEWS.reflecting)animateReflection();});
reset.addEventListener("click",()=>{clearAnimation();current=resetNegativeInequalityState();render();});
baseControl.addEventListener("input",event=>{current=setReflectionBase(current,event.currentTarget.value);render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{});});
render();
