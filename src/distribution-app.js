import { DISTRIBUTION_COPY_DURATION, distributionCopyFrame } from "./distribution-animation.js";
import { DISTRIBUTION_VIEWS, createDistributionState, distributionViewModel, finishDistributionCopy, nextDistributionState, resetDistributionState, setDistributionFactor } from "./distribution-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#distribution-board"), irritation=$("#distribution-irritation"), packagePanel=$("#distribution-package"), factorPanel=$("#distribution-factor"), copiesPanel=$("#distribution-copies"), regroup=$("#distribution-regroup"), result=$("#distribution-result"), explore=$("#distribution-explore"), conclusion=$("#distribution-conclusion"), conclusionTitle=$("#distribution-conclusion-title"), conclusionDetail=$("#distribution-conclusion-detail"), factorExpression=$("#factor-expression"), copiesExpression=$("#copies-expression"), xBundle=$("#x-bundle-label"), onesBundle=$("#ones-bundle-label"), resultEquation=$("#result-equation"), factorControl=$("#factor-control"), factorValue=$("#factor-value"), insight=$("#distribution-insight"), live=$("#distribution-live"), next=$("#distribution-next"), reset=$("#distribution-reset");
const packages=Array.from({length:5},(_,index)=>$(`#distribution-package-${index+1}`));
let current=createDistributionState(), frameId=null, timerId=null;

function setCopyProgress(values){packages.forEach((entry,index)=>entry.style.setProperty("--copy-progress",Array.isArray(values)?(values[index]??0):values));}

function render(){
  const model=distributionViewModel(current);
  board.dataset.state=current.view;
  irritation.hidden=!model.showIrritation;
  packagePanel.hidden=!(model.showPackage||model.showFactor);
  factorPanel.hidden=!model.showFactor;
  copiesPanel.hidden=!model.showCopies;
  regroup.hidden=!model.showRegroup;
  result.hidden=!model.showResult;
  explore.hidden=!model.showExplore;
  conclusion.hidden=!model.showConclusion;
  factorExpression.textContent=`${model.factor} · (x + 2)`;
  copiesExpression.textContent=model.copiesExpression;
  xBundle.textContent=`${model.totalX} x-Bausteine = ${model.factor}x`;
  onesBundle.textContent=`${model.totalOnes} Einer = ${model.totalOnes}`;
  resultEquation.textContent=model.equation;
  conclusionTitle.textContent=model.conclusion;
  conclusionDetail.textContent=model.conclusionDetail;
  factorControl.value=String(model.factor);factorControl.disabled=!model.interactive;
  factorValue.textContent=`${model.factor} vollständige Pakete`;
  insight.textContent=model.insight;
  live.textContent=model.showConclusion?`${model.factor} vollständige Pakete: Dabei werden beide Bestandteile ${model.factor}-mal vervielfacht.`:"";
  next.hidden=!model.showNext;next.disabled=model.controlsLocked;reset.disabled=false;
  packages.forEach((entry,index)=>{entry.hidden=index>=model.factor;entry.setAttribute?.("aria-label",`Paket ${index+1} von ${model.factor}: ein x-Baustein und zwei Einer`);});
  if(!model.showCopying)setCopyProgress(model.showCopies?1:0);
}

function clearAnimation(){if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;}
function finishCopy(){if(current.view!==DISTRIBUTION_VIEWS.copying)return;clearAnimation();current=finishDistributionCopy(current);render();}
function animateCopy(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setCopyProgress(distributionCopyFrame(DISTRIBUTION_COPY_DURATION,current.factor).packageProgress);finishCopy();return;}
  setCopyProgress(0);timerId=setTimeout(finishCopy,DISTRIBUTION_COPY_DURATION+120);let started=null;
  function animate(time){if(current.view!==DISTRIBUTION_VIEWS.copying)return;if(started===null)started=time;const frame=distributionCopyFrame(time-started,current.factor);setCopyProgress(frame.packageProgress);if(frame.complete)finishCopy();else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}
next.addEventListener("click",()=>{if(current.locked)return;current=nextDistributionState(current);render();if(current.view===DISTRIBUTION_VIEWS.copying)animateCopy();});
reset.addEventListener("click",()=>{clearAnimation();current=resetDistributionState();render();});
factorControl.addEventListener("input",event=>{current=setDistributionFactor(current,event.currentTarget.value);render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{});});
render();
