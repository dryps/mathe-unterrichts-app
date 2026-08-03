import { ADDITION_LIMITS, ADDITION_START, additionMovement, additionValueToPoint, additionValueToX, formatAddition, formatSigned, xToNegativeSummand } from "./addition-negative-geometry.js";
import { ADDITION_MOVEMENT_DURATION_MS, additionMovementFrame } from "./addition-negative-animation.js";
import { ADDITION_VIEWS, additionViewModel, createAdditionState, finishAdditionMovement, moveAdditionSummand, nextAdditionState, resetAdditionState } from "./addition-negative-state.js";

const SVG_NS="http://www.w3.org/2000/svg";
const $=(selector)=>document.querySelector(selector);
const board=$("#addition-board"), prompt=$("#addition-prompt"), axisLayer=$("#addition-axis-layer"), axis=$("#addition-axis");
const startPoint=$("#addition-start-point"), motion=$("#addition-motion"), motionLine=$("#addition-motion-line"), boundaries=$("#addition-step-boundaries"), arrowhead=$("#addition-motion-arrowhead");
const movingPoint=$("#addition-moving-point"), endHandle=$("#addition-end-handle"), formula=$("#addition-formula"), startTerm=$("#addition-start-term"), operatorTerm=$("#addition-operator"), summandTerm=$("#addition-summand-term"), resultTerm=$("#addition-result-term");
const insight=$("#addition-insight"), live=$("#addition-live-value"), nextButton=$("#addition-next"), resetButton=$("#addition-reset");
const ticks=[...document.querySelectorAll("[data-addition-value]")];

let state=createAdditionState(), activePointer=null, frameId=null, timerId=null;
function visible(element,show){ element.setAttribute("visibility",show?"visible":"hidden"); element.setAttribute("aria-hidden",String(!show)); }
function translate(element,x,y=ADDITION_LIMITS.y){ element.setAttribute("transform",`translate(${x} ${y})`); }
function renderBoundaries(movement, count=movement.stepCount){
  const nodes=movement.boundaries.slice(0,count+1).map((x)=>{const line=document.createElementNS(SVG_NS,"line"); line.setAttribute("x1",x);line.setAttribute("x2",x);line.setAttribute("y1",movement.y-20);line.setAttribute("y2",movement.y+20);return line;});
  boundaries.replaceChildren(...nodes);
}
function renderFormula(summand,showResult){
  summandTerm.textContent=`(${formatSigned(summand)})`; resultTerm.textContent=showResult?` = ${formatSigned(ADDITION_START+summand)}`:"";
}
function render(){
  const model=additionViewModel(state), movement=additionMovement(state.summand);
  const visibleMotionX=state.view===ADDITION_VIEWS.moving?movement.startX:movement.endX;
  prompt.hidden=!model.showPrompt; visible(axisLayer,model.showAxis); visible(startPoint,model.showStart); visible(formula,model.showFormula);
  visible(motion,model.showMotion); visible(movingPoint,model.showMovingPoint); visible(endHandle,model.showEnd);
  translate(startPoint,additionValueToX(ADDITION_START)); translate(endHandle,movement.endX); translate(movingPoint,state.view===ADDITION_VIEWS.moving?movement.startX:movement.endX);
  motionLine.setAttribute("x1",movement.startX); motionLine.setAttribute("x2",visibleMotionX+34); motionLine.setAttribute("y1",movement.y); motionLine.setAttribute("y2",movement.y);
  arrowhead.setAttribute("transform",`translate(${visibleMotionX} 0)`); if(model.showMotion)renderBoundaries(movement,state.view===ADDITION_VIEWS.moving?0:movement.stepCount);else boundaries.replaceChildren();
  renderFormula(state.summand,model.showEnd); startTerm.classList.toggle("is-highlighted",model.highlightStart); operatorTerm.classList.toggle("is-highlighted",model.highlightOperator); summandTerm.classList.toggle("is-highlighted",model.highlightSummand);
  board.dataset.state=state.view; insight.textContent=model.insight; live.textContent=model.showEnd?formatAddition(state.summand):"";
  endHandle.setAttribute("aria-valuenow",state.summand); endHandle.setAttribute("aria-valuetext",`${formatSigned(state.summand)}, Ergebnis ${formatSigned(movement.result)}`); endHandle.setAttribute("aria-disabled",String(!model.interactive));
  nextButton.hidden=!model.showNext; nextButton.disabled=model.controlsLocked; resetButton.disabled=model.controlsLocked;
}
function staticGeometry(){ axis.setAttribute("x1",ADDITION_LIMITS.lineStart);axis.setAttribute("x2",ADDITION_LIMITS.lineEnd);axis.setAttribute("y1",ADDITION_LIMITS.y);axis.setAttribute("y2",ADDITION_LIMITS.y); for(const tick of ticks){const x=additionValueToX(Number(tick.dataset.additionValue));tick.querySelector("line")?.setAttribute("x1",x);tick.querySelector("line")?.setAttribute("x2",x);tick.querySelector("text")?.setAttribute("x",x);} }
function clearAnimation(){ if(frameId!==null)cancelAnimationFrame(frameId);clearTimeout(timerId);frameId=null;timerId=null; }
function finishMovement(){clearAnimation();state=finishAdditionMovement(state);render();}
function animateMovement(){const movement=additionMovement(state.summand); if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){finishMovement();return;} let started=null; timerId=setTimeout(finishMovement,ADDITION_MOVEMENT_DURATION_MS+160); function animate(time){if(state.view!==ADDITION_VIEWS.moving)return;if(started===null)started=time;const frame=additionMovementFrame(time-started,movement);translate(movingPoint,frame.x);motionLine.setAttribute("x2",frame.x+34);arrowhead.setAttribute("transform",`translate(${frame.x} 0)`);renderBoundaries(movement,frame.visibleSteps);if(frame.complete){finishMovement();return;}frameId=requestAnimationFrame(animate);} frameId=requestAnimationFrame(animate);}
function runNext(){const next=nextAdditionState(state);if(next===state)return;state=next;activePointer=null;render();if(state.view===ADDITION_VIEWS.moving)animateMovement();}
function svgPoint(event){const point=board.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const matrix=board.getScreenCTM();if(!matrix)return null;const local=point.matrixTransform(matrix.inverse());return{x:local.x,y:local.y};}
function attemptMove(x){const next=moveAdditionSummand(state,xToNegativeSummand(x));if(next!==state){state=next;render();}}
function startDrag(event){if(![ADDITION_VIEWS.free,ADDITION_VIEWS.conclusion].includes(state.view)||!event.target.closest("#addition-end-handle"))return;event.preventDefault();activePointer=event.pointerId;endHandle.setPointerCapture(event.pointerId);const point=svgPoint(event);if(point)attemptMove(point.x);}
function drag(event){if(activePointer!==event.pointerId||![ADDITION_VIEWS.free,ADDITION_VIEWS.conclusion].includes(state.view))return;event.preventDefault();const point=svgPoint(event);if(point)attemptMove(point.x);}
function endDrag(event){if(activePointer!==event.pointerId)return;if(endHandle.hasPointerCapture(event.pointerId))endHandle.releasePointerCapture(event.pointerId);activePointer=null;}
function keyboard(event){if(![ADDITION_VIEWS.free,ADDITION_VIEWS.conclusion].includes(state.view))return;const delta={ArrowLeft:-1,ArrowRight:1}[event.key];if(delta===undefined)return;event.preventDefault();state=moveAdditionSummand(state,state.summand+delta);render();}
board.addEventListener("pointerdown",startDrag);board.addEventListener("pointermove",drag);board.addEventListener("pointerup",endDrag);board.addEventListener("pointercancel",endDrag);endHandle.addEventListener("keydown",keyboard);nextButton.addEventListener("click",runNext);resetButton.addEventListener("click",()=>{if(state.locked)return;clearAnimation();activePointer=null;state=resetAdditionState();render();});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
staticGeometry();render();
