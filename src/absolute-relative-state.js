import { COMPARISON_SCALE_FACTORS, scaleComparison, snapComparisonScale } from "./absolute-relative-math.js";

export const ABSOLUTE_RELATIVE_VIEWS=Object.freeze({
  irritation:"irritation",
  absolute:"absolute",
  normalize:"normalize",
  relative:"relative",
  explore:"explore",
});

const ORDER=Object.freeze(Object.values(ABSOLUTE_RELATIVE_VIEWS));
const CONCLUSION="Absolute Anzahl und relativer Anteil beantworten unterschiedliche Fragen.";
const make=(view,locked=false,scaleIndex=0)=>Object.freeze({view,locked:Boolean(locked),scaleIndex:Number(scaleIndex)});
const percentText=value=>String(value).replace(".",",");

export function createAbsoluteRelativeState(){return make(ABSOLUTE_RELATIVE_VIEWS.irritation);}

export function nextAbsoluteRelativeState(current){
  if(current.locked) return current;
  const index=ORDER.indexOf(current.view);
  if(index<0||index>=ORDER.length-1) return current;
  return make(ORDER[index+1],true,current.scaleIndex);
}

export function finishAbsoluteRelativeReveal(current){
  return current.locked?make(current.view,false,current.scaleIndex):current;
}

export function setComparisonScale(current,index){
  if(current.locked||current.view!==ABSOLUTE_RELATIVE_VIEWS.explore) return current;
  const scale=snapComparisonScale(index);
  return make(current.view,false,COMPARISON_SCALE_FACTORS.indexOf(scale));
}

export function resetAbsoluteRelativeState(){return createAbsoluteRelativeState();}

export function absoluteRelativeViewModel(current){
  const rank=ORDER.indexOf(current.view);
  if(rank<0) throw new RangeError("Unbekannter Lernzustand.");
  const scale=snapComparisonScale(current.scaleIndex);
  const comparison=scaleComparison(scale);
  const describe=side=>Object.freeze({
    part:side.part,
    whole:side.whole,
    percent:side.percent,
    percentText:percentText(side.percent),
    label:`${side.part} von ${side.whole}`,
    normalizedLabel:`${side.normalized.part} von ${side.normalized.whole}`,
    ariaLabel:`${side.part} markierte von ${side.whole}; das sind ${percentText(side.percent)} Prozent.`,
  });
  const left=describe(comparison.left),right=describe(comparison.right);
  const absoluteText=`${left.part} > ${right.part}`;
  const relativeText=`${left.percentText} % < ${right.percentText} %`;
  const insights={
    irritation:"Welche Gruppe hat mehr Markierte – und welche den größeren Anteil?",
    absolute:`Absolut gilt: ${absoluteText}.`,
    normalize:`Mit derselben Bezugsgröße ${comparison.commonWhole} werden daraus ${left.normalizedLabel} und ${right.normalizedLabel}.`,
    relative:`Relativ gilt: ${relativeText}.`,
    explore:CONCLUSION,
  };
  return Object.freeze({
    view:current.view,
    scale,
    scaleIndex:COMPARISON_SCALE_FACTORS.indexOf(scale),
    commonWhole:comparison.commonWhole,
    left,
    right,
    absoluteText,
    relativeText,
    sliderAriaLabel:`Beide Gruppen gemeinsam skalieren: Faktor ${scale}`,
    sliderValueText:`Faktor ${scale}; links ${left.label}, rechts ${right.label}`,
    showAbsolute:rank>=1,
    showNormalization:rank>=2,
    showRelative:rank>=3,
    showExplore:rank>=4,
    showConclusion:rank>=4,
    showNext:rank<4,
    controlsInteractive:rank>=4&&!current.locked,
    conclusion:CONCLUSION,
    insight:insights[current.view],
    liveText:rank>=4?`${left.label} entsprechen ${left.percentText} Prozent. ${right.label} entsprechen ${right.percentText} Prozent. ${left.percentText} Prozent ist kleiner als ${right.percentText} Prozent. ${CONCLUSION}`:insights[current.view],
  });
}
