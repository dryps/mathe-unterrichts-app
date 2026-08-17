import { SOLUTION_REVEAL_DURATION, solutionRevealFrame } from "./solution-set-animation.js";
import { solutionLinePercent } from "./solution-set-math.js";
import { SOLUTION_SET_VIEWS, createSolutionSetState, finishSolutionReveal, nextSolutionSetState, resetSolutionSetState, setSolutionTestValue, solutionSetViewModel } from "./solution-set-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#solution-board"),sourceEquation=$("#solution-source-equation"),testPanel=$("#solution-test-panel"),testControl=$("#solution-test-control"),testDecrease=$("#solution-test-decrease"),testIncrease=$("#solution-test-increase"),testValue=$("#solution-test-value"),substitution=$("#solution-substitution"),comparison=$("#solution-comparison"),truth=$("#solution-truth"),boundary=$("#solution-boundary"),boundaryEquation=$("#solution-boundary-equation"),lineStage=$("#solution-line-stage"),range=$("#solution-range"),point=$("#solution-point"),pointLabel=$("#solution-point-label"),explore=$("#solution-explore"),conclusion=$("#solution-conclusion"),conclusionText=$("#solution-conclusion-text"),insight=$("#solution-insight"),live=$("#solution-live"),next=$("#solution-next"),reset=$("#solution-reset");
let current=createSolutionSetState(),frameId=null,timerId=null,animationToken=0;

function displayNumber(value){return value<0?`−${Math.abs(value)}`:`${value}`;}
function setPoint(model){
  point.style.setProperty("--test-position",`${Math.round(solutionLinePercent(model.x)*1000)/1000}%`);
  pointLabel.textContent=displayNumber(model.x);
  point.setAttribute("aria-label",`Testwert ${displayNumber(model.x)}, ${model.isSolution?"Lösung":"keine Lösung"}`);
  point.dataset.solution=String(model.isSolution);
}
function clearAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;next.disabled=false;}
function render(){
  const model=solutionSetViewModel(current);board.dataset.state=current.view;sourceEquation.textContent=model.sourceEquation;testPanel.hidden=!model.showTest;testControl.value=String(model.x);testControl.disabled=!model.testInteractive;testDecrease.disabled=!model.testInteractive||model.x<=-2;testIncrease.disabled=!model.testInteractive||model.x>=6;testValue.textContent=`x = ${displayNumber(model.x)}`;substitution.textContent=model.substitution.replaceAll("-","−");comparison.textContent=model.testedComparison.replaceAll("-","−");truth.textContent=model.truthText;truth.dataset.truth=String(model.isSolution);boundary.hidden=!model.showBoundary;boundaryEquation.textContent=model.solutionInequality;lineStage.hidden=!model.showSolutionLine;lineStage.setAttribute("aria-busy",String(model.revealing));lineStage.setAttribute("aria-label",model.revealing?"Der Lösungsbereich wird auf der Zahlengeraden markiert":"Zahlengerade von minus zwei bis sechs; offener Rand bei drei; alle Zahlen links von drei sind markiert");range.style.setProperty("--solution-progress",model.showSolutionRange?"1":"0");point.hidden=!model.showSolutionRange;setPoint(model);explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;conclusionText.textContent=model.conclusion;insight.textContent=model.insight;next.hidden=!model.showNext;next.disabled=model.controlsLocked;
  live.textContent=current.view===SOLUTION_SET_VIEWS.testing&&current.hasTested?`Für x gleich ${displayNumber(model.x)} ist ${model.testedComparison} ${model.truthText}.`:model.showConclusion?`${model.x} ist ${model.isSolution?"Teil":"kein Teil"} der Lösungsmenge. ${model.conclusion}`:"";
}
function finishAnimation(token){if(token!==animationToken||current.view!==SOLUTION_SET_VIEWS.revealing)return;clearAnimation();current=finishSolutionReveal(current);render();}
function animateSolutionRange(){
  clearAnimation();const token=animationToken;range.style.setProperty("--solution-progress","0");next.disabled=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){range.style.setProperty("--solution-progress","1");finishAnimation(token);return;}
  let started=null;timerId=setTimeout(()=>finishAnimation(token),SOLUTION_REVEAL_DURATION+120);
  function animate(time){if(token!==animationToken||current.view!==SOLUTION_SET_VIEWS.revealing)return;if(started===null)started=time;const frame=solutionRevealFrame(time-started);range.style.setProperty("--solution-progress",String(frame.progress));if(frame.complete)finishAnimation(token);else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}
next.addEventListener("click",()=>{if(current.locked)return;current=nextSolutionSetState(current);render();if(current.view===SOLUTION_SET_VIEWS.revealing)animateSolutionRange();});
testControl.addEventListener("input",event=>{current=setSolutionTestValue(current,event.currentTarget.value);render();});
testDecrease.addEventListener("click",()=>{current=setSolutionTestValue(current,current.x-1);render();});
testIncrease.addEventListener("click",()=>{current=setSolutionTestValue(current,current.x+1);render();});
reset.addEventListener("click",()=>{clearAnimation();current=resetSolutionSetState();render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).catch(()=>{});});
render();
