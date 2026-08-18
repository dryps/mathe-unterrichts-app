import { PERCENTAGE_FACTOR_SCENARIOS, percentageFactorScenario, snapPercentageFactorScenario } from "./percentage-factor-math.js";

export const PERCENTAGE_FACTOR_VIEWS=Object.freeze({irritation:"irritation",hundredth:"hundredth",reduced:"reduced",decimal:"decimal",product:"product",explore:"explore"});
const ORDER=Object.freeze(Object.values(PERCENTAGE_FACTOR_VIEWS));
const CONCLUSION="Ein Prozentsatz lässt sich als Dezimalfaktor ausdrücken.";
const make=(view,locked=false,scenarioIndex=1)=>Object.freeze({view,locked:Boolean(locked),scenarioIndex:snapPercentageFactorScenario(scenarioIndex)});

export function createPercentageFactorState(){return make(PERCENTAGE_FACTOR_VIEWS.irritation);}
export function nextPercentageFactorState(current){
  if(current.locked) return current;
  const index=ORDER.indexOf(current.view);
  if(index<0||index>=ORDER.length-1) return current;
  return make(ORDER[index+1],true,current.scenarioIndex);
}
export function finishPercentageFactorReveal(current){return current.locked?make(current.view,false,current.scenarioIndex):current;}
export function setPercentageFactorScenario(current,index){return current.locked||current.view!==PERCENTAGE_FACTOR_VIEWS.explore?current:make(current.view,false,index);}
export function resetPercentageFactorState(){return createPercentageFactorState();}

export function percentageFactorViewModel(current){
  const rank=ORDER.indexOf(current.view);
  if(rank<0) throw new RangeError("Unbekannter Lernzustand.");
  const scenarioIndex=snapPercentageFactorScenario(current.scenarioIndex);
  const relation=percentageFactorScenario(scenarioIndex);
  const rateText=`${relation.rate} %`;
  const hundredthText=`${relation.numerator} / ${relation.denominator}`;
  const reducedText=`${relation.reducedNumerator} / ${relation.reducedDenominator}`;
  const decimalText=relation.factorText;
  const productText=`${decimalText} · ${relation.whole} = ${relation.result}`;
  const revealed=[`${relation.rate} Prozent`];
  if(rank>=1) revealed.push(`${relation.numerator} Hundertstel`);
  if(rank>=2) revealed.push(`gekürzt ${relation.reducedNumerator} durch ${relation.reducedDenominator}`);
  if(rank>=3) revealed.push(`Dezimalfaktor ${decimalText}`);
  if(rank>=4) revealed.push(`${decimalText} mal ${relation.whole} ist ${relation.result}`);
  const chainAriaLabel=rank===0?`${relation.rate} Prozent; weitere Darstellungen noch verborgen.`:`Gleichwertige Darstellungen: ${revealed.join("; ")}.`;
  const sliderValueText=`Beispiel ${scenarioIndex+1} von ${PERCENTAGE_FACTOR_SCENARIOS.length}: ${relation.rate} Prozent sind der Faktor ${decimalText}; ${decimalText} mal ${relation.whole} ist ${relation.result}`;
  const insights={
    irritation:"25 Prozent – welche Zahl wirkt beim Multiplizieren?",
    hundredth:"Prozent bedeutet von hundert: 25 Prozent sind 25 Hundertstel.",
    reduced:"25 Hundertstel lassen sich zu einem Viertel kürzen.",
    decimal:"Ein Viertel ist als Dezimalzahl 0,25.",
    product:"Darum wirkt 25 Prozent als Faktor 0,25 – nicht als Faktor 25.",
    explore:CONCLUSION,
  };
  return Object.freeze({
    view:current.view,scenarioIndex,relation,rateText,hundredthText,reducedText,decimalText,productText,chainAriaLabel,
    showHundredth:rank>=1,showReduced:rank>=2,showDecimal:rank>=3,showProduct:rank>=4,showWarning:rank>=4,showExplore:rank>=5,showConclusion:rank>=5,showNext:rank<5,
    controlsInteractive:rank>=5&&!current.locked,sliderValueText,sliderAriaLabel:`Prozentbeispiel verändern: ${sliderValueText}`,
    insight:insights[current.view],liveText:rank>=5?`${sliderValueText}. ${CONCLUSION}`:insights[current.view],conclusion:CONCLUSION,
  });
}
