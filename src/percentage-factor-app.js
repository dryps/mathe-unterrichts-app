import { PERCENTAGE_FACTOR_REVEAL_DURATION, percentageFactorRevealFrame } from "./percentage-factor-animation.js";
import { createPercentageFactorState, finishPercentageFactorReveal, nextPercentageFactorState, percentageFactorViewModel, resetPercentageFactorState, setPercentageFactorScenario } from "./percentage-factor-state.js";

const $=selector=>document.querySelector(selector);
const workspace=$("#pf-workspace"),chain=$("#pf-chain"),rate=$("#pf-rate"),hundredthStep=$("#pf-hundredth-step"),reducedStep=$("#pf-reduced-step"),decimalStep=$("#pf-decimal-step"),hundredth=$("#pf-hundredth"),reduced=$("#pf-reduced"),decimal=$("#pf-decimal"),product=$("#pf-product"),warning=$("#pf-warning"),warningTitle=$("#pf-warning-title"),warningText=$("#pf-warning-text"),explore=$("#pf-explore"),conclusion=$("#pf-conclusion"),scenarioInput=$("#pf-scenario"),scenarioOutput=$("#pf-scenario-output"),insight=$("#pf-insight"),live=$("#pf-live"),next=$("#pf-next"),reset=$("#pf-reset");
let current=createPercentageFactorState(),frameId=null,timerId=null,animationToken=0;

function clearAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;next.disabled=false;workspace.style.opacity="1";workspace.setAttribute("aria-busy","false");}

function render(){
  const model=percentageFactorViewModel(current);
  workspace.dataset.state=model.view;
  chain.setAttribute("aria-label",model.chainAriaLabel);
  rate.textContent=model.rateText;hundredth.textContent=model.hundredthText;reduced.textContent=model.reducedText;decimal.textContent=model.decimalText;product.textContent=model.productText;warningTitle.textContent=model.warningTitle;warningText.textContent=model.warningText;
  hundredthStep.hidden=!model.showHundredth;reducedStep.hidden=!model.showReduced;decimalStep.hidden=!model.showDecimal;product.hidden=!model.showProduct;warning.hidden=!model.showWarning;explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;
  scenarioInput.value=String(model.scenarioIndex);scenarioInput.disabled=!model.controlsInteractive;scenarioInput.setAttribute("aria-label",model.sliderAriaLabel);scenarioInput.setAttribute("aria-valuetext",model.sliderValueText);scenarioOutput.textContent=`${model.rateText} → ${model.decimalText}`;
  insight.textContent=model.insight;live.textContent=model.liveText;next.hidden=!model.showNext;next.disabled=current.locked;
}

function finishReveal(token){if(token!==animationToken||!current.locked)return;clearAnimation();current=finishPercentageFactorReveal(current);render();}
function animateReveal(){clearAnimation();const token=animationToken;workspace.style.opacity="0";workspace.setAttribute("aria-busy","true");next.disabled=true;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){finishReveal(token);return;}let started=null;timerId=setTimeout(()=>finishReveal(token),PERCENTAGE_FACTOR_REVEAL_DURATION+120);function animate(time){if(token!==animationToken||!current.locked)return;if(started===null)started=time;const frame=percentageFactorRevealFrame(time-started);workspace.style.opacity=String(frame.opacity);if(frame.complete)finishReveal(token);else frameId=requestAnimationFrame(animate);}frameId=requestAnimationFrame(animate);}
next.addEventListener("click",()=>{if(current.locked)return;current=nextPercentageFactorState(current);render();if(current.locked)animateReveal();});
reset.addEventListener("click",()=>{clearAnimation();current=resetPercentageFactorState();render();});
scenarioInput.addEventListener("input",event=>{current=setPercentageFactorScenario(current,Number(event.currentTarget.value));render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{}));
render();
