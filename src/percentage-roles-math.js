export const PERCENTAGE_ROLE_SCENARIOS=Object.freeze([
  Object.freeze({whole:80,part:20}),
  Object.freeze({whole:120,part:36}),
  Object.freeze({whole:200,part:50}),
]);

export function percentageRelation(whole,part){
  if(!Number.isFinite(whole)||!Number.isFinite(part)||whole<=0||part<0||part>whole) throw new RangeError("Teil und Ganzes müssen eine gültige Prozentbeziehung bilden.");
  return Object.freeze({whole,part,rate:Number(((part/whole)*100).toFixed(4))});
}

export function snapPercentageRoleScenario(index){
  if(!Number.isFinite(index)) throw new RangeError("Der Situationsindex muss endlich sein.");
  return Math.max(0,Math.min(PERCENTAGE_ROLE_SCENARIOS.length-1,Math.round(index)));
}

export function percentageRoleScenario(index){
  const scenario=PERCENTAGE_ROLE_SCENARIOS[snapPercentageRoleScenario(index)];
  return percentageRelation(scenario.whole,scenario.part);
}
