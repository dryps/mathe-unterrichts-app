import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PERCENTAGE_ROLES_VIEWS, PERCENTAGE_UNKNOWN_ROLES, createPercentageRolesState, finishPercentageRolesReveal, nextPercentageRolesState, percentageRolesViewModel, setPercentageRoleScenario, setUnknownPercentageRole } from "../src/percentage-roles-state.js";

const html=await readFile(new URL("../grundwert-prozentwert-prozentsatz.html",import.meta.url),"utf8");
const css=await readFile(new URL("../percentage-roles.css",import.meta.url),"utf8");
let state=createPercentageRolesState();
const rendered=[];

for(let step=0;step<5;step+=1){
  const model=percentageRolesViewModel(state);
  rendered.push(model);
  assert.equal(model.relation.part,model.relation.whole*model.relation.rate/100);
  state=finishPercentageRolesReveal(nextPercentageRolesState(state));
}

const explore={view:PERCENTAGE_ROLES_VIEWS.explore,locked:false,scenarioIndex:0,unknownRole:PERCENTAGE_UNKNOWN_ROLES.whole};
for(let index=0;index<3;index+=1){
  for(const role of Object.values(PERCENTAGE_UNKNOWN_ROLES)){
    const model=percentageRolesViewModel(setPercentageRoleScenario(setUnknownPercentageRole(explore,role),index));
    rendered.push(model);
    assert.equal(model.roles.filter(entry=>entry.hidden).length,1);
    assert.equal(model.roles.find(entry=>entry.hidden).key,role);
    assert.match(model.equation,/\?/);
  }
}

assert.match(html,/Drei Rollen derselben Beziehung\./);
assert.match(css,/@media\(max-width:720px\)/);
console.log(`${rendered.length}/${rendered.length} Prozentrollen-Zustände gerendert`);
