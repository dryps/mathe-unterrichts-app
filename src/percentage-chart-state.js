import { percentageChartModel, snapPercentageChartValue } from "./percentage-chart-math.js";
export const PERCENTAGE_CHART_VIEWS=Object.freeze({irritation:"irritation",whole:"whole",unit:"unit",sector:"sector",explore:"explore"});
const ORDER=Object.freeze(Object.values(PERCENTAGE_CHART_VIEWS)),CONCLUSION="Kreisdiagramme stellen denselben relativen Anteil über einen Anteil am Vollwinkel dar.";
const make=(view,locked=false,percent=25)=>Object.freeze({view,locked:Boolean(locked),percent:snapPercentageChartValue(percent)});
export function createPercentageChartState(){return make(PERCENTAGE_CHART_VIEWS.irritation);}
export function nextPercentageChartState(current){if(current.locked)return current;const index=ORDER.indexOf(current.view);return index<0||index>=ORDER.length-1?current:make(ORDER[index+1],true,current.percent);}
export function finishPercentageChartReveal(current){return current.locked?make(current.view,false,current.percent):current;}
export function setPercentageChartValue(current,value){return current.locked||current.view!==PERCENTAGE_CHART_VIEWS.explore?current:make(current.view,false,value);}
export function resetPercentageChartState(){return createPercentageChartState();}
export function percentageChartViewModel(current){
  const rank=ORDER.indexOf(current.view);if(rank<0)throw new RangeError("Unbekannter Lernzustand.");const relation=percentageChartModel(current.percent),percentText=`${relation.percent} %`,angleText=`${String(relation.angle).replace(".",",")}°`;
  const names=["Kreis ohne markierten Anteil.","Vollkreis: 100 Prozent entsprechen 360 Grad.","Vollkreis: 100 Prozent entsprechen 360 Grad; ein Prozent entspricht 3,6 Grad.",`Kreisdiagramm: ${relation.percent} Prozent entsprechen einem Kreissektor von ${String(relation.angle).replace(".",",")} Grad.`];
  const insights={irritation:"Ein Kreis – wie wird aus einem Prozentanteil ein Winkel?",whole:"Der ganze Kreis umfasst 100 Prozent und zugleich 360 Grad.",unit:"Darum entsprechen 1 Prozent genau 3,6 Grad.",sector:`25 Prozent markieren ein Viertel des Kreises: 90 Grad.`,explore:CONCLUSION};
  const sliderValueText=`${relation.percent} Prozent entsprechen ${String(relation.angle).replace(".",",")} Grad`;
  return Object.freeze({view:current.view,relation,percentText,angleText,sectorAngle:relation.angle,chartAriaLabel:names[Math.min(rank,3)],showWhole:rank>=1,showUnit:rank>=2,showSector:rank>=3,showExplore:rank>=4,showConclusion:rank>=4,showNext:rank<4,controlsInteractive:rank>=4&&!current.locked,sliderValueText,sliderAriaLabel:`Prozentanteil und Kreissektor verändern: ${sliderValueText}`,insight:insights[current.view],liveText:rank>=4?`${sliderValueText}. ${CONCLUSION}`:insights[current.view],conclusion:CONCLUSION});
}
