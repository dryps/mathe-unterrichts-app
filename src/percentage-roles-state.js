import { PERCENTAGE_ROLE_SCENARIOS, percentageRoleScenario, snapPercentageRoleScenario } from "./percentage-roles-math.js";

export const PERCENTAGE_ROLES_VIEWS=Object.freeze({irritation:"irritation",whole:"whole",part:"part",rate:"rate",explore:"explore"});
export const PERCENTAGE_UNKNOWN_ROLES=Object.freeze({whole:"whole",part:"part",rate:"rate"});

const ORDER=Object.freeze(Object.values(PERCENTAGE_ROLES_VIEWS));
const ROLES=Object.freeze(Object.values(PERCENTAGE_UNKNOWN_ROLES));
const CONCLUSION="Drei Rollen derselben Beziehung.";
const make=(view,locked=false,scenarioIndex=0,unknownRole=PERCENTAGE_UNKNOWN_ROLES.whole)=>Object.freeze({view,locked:Boolean(locked),scenarioIndex:snapPercentageRoleScenario(scenarioIndex),unknownRole:ROLES.includes(unknownRole)?unknownRole:PERCENTAGE_UNKNOWN_ROLES.whole});

export function createPercentageRolesState(){return make(PERCENTAGE_ROLES_VIEWS.irritation);}

export function nextPercentageRolesState(current){
  if(current.locked) return current;
  const index=ORDER.indexOf(current.view);
  if(index<0||index>=ORDER.length-1) return current;
  return make(ORDER[index+1],true,current.scenarioIndex,current.unknownRole);
}

export function finishPercentageRolesReveal(current){
  return current.locked?make(current.view,false,current.scenarioIndex,current.unknownRole):current;
}

export function setUnknownPercentageRole(current,role){
  if(current.locked||current.view!==PERCENTAGE_ROLES_VIEWS.explore||!ROLES.includes(role)) return current;
  return make(current.view,false,current.scenarioIndex,role);
}

export function setPercentageRoleScenario(current,index){
  if(current.locked||current.view!==PERCENTAGE_ROLES_VIEWS.explore) return current;
  return make(current.view,false,index,current.unknownRole);
}

export function resetPercentageRolesState(){return createPercentageRolesState();}

function diagramDescription(rank,relation,unknownRole){
  if(rank===0) return "Prozentband einer gemeinsamen Situation; noch ohne benannte Größen.";
  if(rank===1) return `Prozentband; Ganzes: ${relation.whole} Karten.`;
  if(rank===2) return `Prozentband; Ganzes: ${relation.whole} Karten; markierter Teil: ${relation.part} Karten.`;
  if(rank===3) return `Prozentband; Ganzes: ${relation.whole} Karten; markierter Teil: ${relation.part} Karten; Verhältnis: ${relation.rate} Prozent.`;
  if(unknownRole===PERCENTAGE_UNKNOWN_ROLES.whole) return `Prozentband; ganze Anzahl gesucht; markierter Teil: ${relation.part} Karten; Verhältnis: ${relation.rate} Prozent.`;
  if(unknownRole===PERCENTAGE_UNKNOWN_ROLES.part) return `Prozentband; Ganzes: ${relation.whole} Karten; markierter Teil gesucht; Verhältnis: ${relation.rate} Prozent.`;
  return `Prozentband; Ganzes: ${relation.whole} Karten; markierter Teil: ${relation.part} Karten; Verhältnis gesucht.`;
}

export function percentageRolesViewModel(current){
  const rank=ORDER.indexOf(current.view);
  if(rank<0) throw new RangeError("Unbekannter Lernzustand.");
  const scenarioIndex=snapPercentageRoleScenario(current.scenarioIndex);
  const relation=percentageRoleScenario(scenarioIndex);
  const explore=rank>=4;
  const hiddenRole=explore?current.unknownRole:null;
  const specs=[
    {key:PERCENTAGE_UNKNOWN_ROLES.whole,name:"Grundwert",symbol:"G",value:relation.whole,unit:"Karten"},
    {key:PERCENTAGE_UNKNOWN_ROLES.part,name:"Prozentwert",symbol:"W",value:relation.part,unit:"Karten"},
    {key:PERCENTAGE_UNKNOWN_ROLES.rate,name:"Prozentsatz",symbol:"p %",value:relation.rate,unit:"%"},
  ];
  const roles=Object.freeze(specs.map(role=>{
    const hidden=role.key===hiddenRole;
    const valueText=hidden?"?":role.key===PERCENTAGE_UNKNOWN_ROLES.rate?`${role.value} %`:String(role.value);
    return Object.freeze({...role,hidden,valueText,ariaLabel:hidden?`${role.name} ${role.symbol}: gesucht`:`${role.name} ${role.symbol}: ${valueText}`});
  }));
  const token=key=>roles.find(role=>role.key===key).valueText;
  const equation=`${token(PERCENTAGE_UNKNOWN_ROLES.part)} / ${token(PERCENTAGE_UNKNOWN_ROLES.whole)} = ${token(PERCENTAGE_UNKNOWN_ROLES.rate).replace(" %","")} / 100`;
  const unknownName=roles.find(role=>role.key===current.unknownRole).name;
  const insights={
    irritation:"Eine Situation – aber welche Zahl übernimmt welche Rolle?",
    whole:`Das Ganze mit ${relation.whole} Karten ist der Grundwert G.`,
    part:`Der markierte Teil mit ${relation.part} Karten ist der Prozentwert W.`,
    rate:`Das Verhältnis von Teil zu Ganzem ist der Prozentsatz p = ${relation.rate} %.`,
    explore:CONCLUSION,
  };
  const visibleRelation=hiddenRole===PERCENTAGE_UNKNOWN_ROLES.whole?`${relation.part} Karten sind ${relation.rate} Prozent; Grundwert gesucht`:hiddenRole===PERCENTAGE_UNKNOWN_ROLES.part?`${relation.rate} Prozent von ${relation.whole} Karten; Prozentwert gesucht`:`${relation.part} von ${relation.whole} Karten; Prozentsatz gesucht`;
  return Object.freeze({
    view:current.view,
    scenarioIndex,
    relation,
    roles,
    equation,
    diagramAriaLabel:diagramDescription(rank,relation,current.unknownRole),
    fillPercent:relation.rate,
    showWhole:rank>=1,
    showPart:rank>=2,
    showRate:rank>=3,
    showRelation:rank>=3,
    showExplore:explore,
    showConclusion:explore,
    showNext:rank<4,
    controlsInteractive:explore&&!current.locked,
    sliderAriaLabel:"Gemeinsame Prozent-Situation verändern",
    sliderValueText:`Situation ${scenarioIndex+1} von ${PERCENTAGE_ROLE_SCENARIOS.length}; ${visibleRelation}`,
    unknownRole:current.unknownRole,
    unknownName,
    conclusion:CONCLUSION,
    insight:insights[current.view],
    liveText:explore?`${visibleRelation}. ${CONCLUSION}`:insights[current.view],
  });
}
