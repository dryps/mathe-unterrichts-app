import { PROPERTIES_TRANSFORM_DURATION, quadrilateralTransformFrame } from "./quadrilateral-properties-animation.js";
import { createParallelogram } from "./quadrilateral-properties-geometry.js";
import { PROPERTIES_VIEWS, createPropertiesState, finishPropertiesTransform, nextPropertiesState, propertiesViewModel, resetPropertiesState, setPropertiesControl } from "./quadrilateral-properties-state.js";

const $ = (selector) => document.querySelector(selector);
const board=$("#properties-board"),stage=$("#properties-stage"),shape=$("#properties-shape"),sideAB=$("#properties-side-ab"),sideBC=$("#properties-side-bc"),sideCD=$("#properties-side-cd"),sideDA=$("#properties-side-da"),markers=$("#properties-markers"),markerAB=$("#properties-marker-ab"),markerCD=$("#properties-marker-cd"),markerBC1=$("#properties-marker-bc-1"),markerBC2=$("#properties-marker-bc-2"),markerDA1=$("#properties-marker-da-1"),markerDA2=$("#properties-marker-da-2"),explore=$("#properties-explore"),rotationControl=$("#properties-rotation-control"),shiftControl=$("#properties-shift-control"),slantControl=$("#properties-slant-control"),rotationValue=$("#properties-rotation-value"),shiftValue=$("#properties-shift-value"),slantValue=$("#properties-slant-value"),rotationDecrease=$("#properties-rotation-decrease"),rotationIncrease=$("#properties-rotation-increase"),shiftDecrease=$("#properties-shift-decrease"),shiftIncrease=$("#properties-shift-increase"),slantDecrease=$("#properties-slant-decrease"),slantIncrease=$("#properties-slant-increase"),conclusion=$("#properties-conclusion"),conclusionText=$("#properties-conclusion-text"),insight=$("#properties-insight"),live=$("#properties-live"),next=$("#properties-next"),reset=$("#properties-reset");
const sideLines=[sideAB,sideBC,sideCD,sideDA];
let current=createPropertiesState(),frameId=null,timerId=null,animationToken=0;

function setLine(line,from,to){line.setAttribute("x1",from.x);line.setAttribute("y1",from.y);line.setAttribute("x2",to.x);line.setAttribute("y2",to.y);}
function tickAt(from,to,fraction=0.5){const x=from.x+(to.x-from.x)*fraction,y=from.y+(to.y-from.y)*fraction,dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),nx=-dy/length*10,ny=dx/length*10;return [{x:x-nx,y:y-ny},{x:x+nx,y:y+ny}];}
function drawGeometry(config,showMarkers){
  const model=createParallelogram(config),points=model.points;shape.setAttribute("points",points.map(point=>`${point.x},${point.y}`).join(" "));
  for(let index=0;index<4;index+=1)setLine(sideLines[index],points[index],points[(index+1)%4]);
  const ticks=[[markerAB,0,1,.5],[markerCD,2,3,.5],[markerBC1,1,2,.45],[markerBC2,1,2,.55],[markerDA1,3,0,.45],[markerDA2,3,0,.55]];
  for(const [line,start,end,fraction] of ticks){const [from,to]=tickAt(points[start],points[end],fraction);setLine(line,from,to);}
  markers.toggleAttribute("hidden",!showMarkers);stage.setAttribute("aria-label",showMarkers?`Parallelogramm: Drehung ${model.config.rotation} Grad, Verschiebung ${model.config.shiftX}, Formwert ${model.config.slant}; gegenüberliegende Seiten bleiben parallel und gleich lang.`:"Unmarkiertes Parallelogramm in typischer Lage.");
}
function clearAnimation(){animationToken+=1;if(frameId!==null)cancelAnimationFrame(frameId);if(timerId!==null)clearTimeout(timerId);frameId=null;timerId=null;next.disabled=false;}
function render(){
  const model=propertiesViewModel(current);board.dataset.state=current.view;stage.setAttribute("aria-busy",String(model.transforming));drawGeometry(model.config,model.showMarkers);explore.hidden=!model.showExplore;conclusion.hidden=!model.showConclusion;conclusionText.textContent=model.conclusion;insight.textContent=model.insight;next.hidden=!model.showNext;next.disabled=model.controlsLocked;rotationControl.value=String(model.config.rotation);shiftControl.value=String(model.config.shiftX);slantControl.value=String(model.config.slant);rotationValue.textContent=`${model.config.rotation}°`;shiftValue.textContent=String(model.config.shiftX);slantValue.textContent=String(model.config.slant);for(const control of [rotationControl,shiftControl,slantControl,rotationDecrease,rotationIncrease,shiftDecrease,shiftIncrease,slantDecrease,slantIncrease])control.disabled=!model.controlsInteractive;
  live.textContent=model.showConclusion?`${model.conclusion} Gegenüberliegende Seiten bleiben parallel und gleich lang.`:"";
}
function finishAnimation(token){if(token!==animationToken||current.view!==PROPERTIES_VIEWS.transforming)return;clearAnimation();current=finishPropertiesTransform(current);render();}
function animateTransformation(){
  clearAnimation();const token=animationToken;next.disabled=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){drawGeometry(quadrilateralTransformFrame(PROPERTIES_TRANSFORM_DURATION).config,true);finishAnimation(token);return;}
  let started=null;timerId=setTimeout(()=>finishAnimation(token),PROPERTIES_TRANSFORM_DURATION+120);
  function animate(time){if(token!==animationToken||current.view!==PROPERTIES_VIEWS.transforming)return;if(started===null)started=time;const frame=quadrilateralTransformFrame(time-started);drawGeometry(frame.config,true);if(frame.complete)finishAnimation(token);else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
}
function change(control,value){current=setPropertiesControl(current,control,value);render();}
next.addEventListener("click",()=>{if(current.locked)return;current=nextPropertiesState(current);render();if(current.view===PROPERTIES_VIEWS.transforming)animateTransformation();});
reset.addEventListener("click",()=>{clearAnimation();current=resetPropertiesState();render();});
rotationControl.addEventListener("input",event=>change("rotation",event.currentTarget.value));shiftControl.addEventListener("input",event=>change("shiftX",event.currentTarget.value));slantControl.addEventListener("input",event=>change("slant",event.currentTarget.value));
rotationDecrease.addEventListener("click",()=>change("rotation",current.config.rotation-5));rotationIncrease.addEventListener("click",()=>change("rotation",current.config.rotation+5));shiftDecrease.addEventListener("click",()=>change("shiftX",current.config.shiftX-15));shiftIncrease.addEventListener("click",()=>change("shiftX",current.config.shiftX+15));slantDecrease.addEventListener("click",()=>change("slant",current.config.slant-10));slantIncrease.addEventListener("click",()=>change("slant",current.config.slant+10));
if("serviceWorker" in navigator)window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(()=>{});});
render();
