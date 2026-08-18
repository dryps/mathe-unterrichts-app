export const PERCENTAGE_FACTOR_SCENARIOS=Object.freeze([
  Object.freeze({rate:10,whole:60}),
  Object.freeze({rate:25,whole:80}),
  Object.freeze({rate:40,whole:50}),
  Object.freeze({rate:75,whole:40}),
]);

function greatestCommonDivisor(left,right){
  let a=Math.abs(left),b=Math.abs(right);
  while(b!==0){const remainder=a%b;a=b;b=remainder;}
  return a;
}

function germanDecimal(value){
  return String(Number(value.toFixed(4))).replace(".",",");
}

export function percentageToFactor(rate){
  if(!Number.isFinite(rate)||!Number.isInteger(rate)||rate<0||rate>100) throw new RangeError("Der Prozentsatz muss eine ganze Zahl zwischen 0 und 100 sein.");
  const divisor=greatestCommonDivisor(rate,100);
  const factor=rate/100;
  return Object.freeze({rate,numerator:rate,denominator:100,reducedNumerator:rate/divisor,reducedDenominator:100/divisor,factor,factorText:germanDecimal(factor)});
}

export function snapPercentageFactorScenario(index){
  if(!Number.isFinite(index)) throw new RangeError("Der Beispielindex muss endlich sein.");
  return Math.max(0,Math.min(PERCENTAGE_FACTOR_SCENARIOS.length-1,Math.round(index)));
}

export function percentageFactorScenario(index){
  const scenario=PERCENTAGE_FACTOR_SCENARIOS[snapPercentageFactorScenario(index)];
  const factor=percentageToFactor(scenario.rate);
  return Object.freeze({...factor,whole:scenario.whole,result:factor.factor*scenario.whole});
}
