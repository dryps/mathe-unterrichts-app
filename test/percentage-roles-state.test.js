import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_ROLES_VIEWS, PERCENTAGE_UNKNOWN_ROLES, createPercentageRolesState, finishPercentageRolesReveal, nextPercentageRolesState, percentageRolesViewModel, resetPercentageRolesState, setPercentageRoleScenario, setUnknownPercentageRole } from "../src/percentage-roles-state.js";

test("Start verrät noch keine der drei Rollen",()=>{
  const model=percentageRolesViewModel(createPercentageRolesState());
  assert.equal(model.showWhole,false);
  assert.equal(model.showPart,false);
  assert.equal(model.showRate,false);
  assert.equal(model.showExplore,false);
  assert.equal(model.diagramAriaLabel,"Prozentband einer gemeinsamen Situation; noch ohne benannte Größen.");
});

test("Grundwert, Prozentwert, Prozentsatz und Erkundung öffnen seriell",()=>{
  let state=createPercentageRolesState();
  for(const view of [PERCENTAGE_ROLES_VIEWS.whole,PERCENTAGE_ROLES_VIEWS.part,PERCENTAGE_ROLES_VIEWS.rate,PERCENTAGE_ROLES_VIEWS.explore]){
    state=nextPercentageRolesState(state);
    assert.equal(state.view,view);
    assert.equal(state.locked,true);
    assert.equal(nextPercentageRolesState(state),state);
    state=finishPercentageRolesReveal(state);
  }
  const model=percentageRolesViewModel(state);
  assert.equal(model.showConclusion,true);
  assert.equal(model.showNext,false);
  assert.equal(model.conclusion,"Drei Rollen derselben Beziehung.");
});

test("in der Erkundung ist exakt die gewählte Rolle unbekannt",()=>{
  const base={view:PERCENTAGE_ROLES_VIEWS.explore,locked:false,scenarioIndex:0,unknownRole:PERCENTAGE_UNKNOWN_ROLES.whole};
  for(const role of Object.values(PERCENTAGE_UNKNOWN_ROLES)){
    const model=percentageRolesViewModel(setUnknownPercentageRole(base,role));
    const hidden=model.roles.filter(entry=>entry.hidden);
    assert.equal(hidden.length,1);
    assert.equal(hidden[0].key,role);
    assert.equal(hidden[0].valueText,"?");
    assert.doesNotMatch(model.diagramAriaLabel,new RegExp(String(hidden[0].value)));
  }
});

test("Situation und alle sichtbaren Werte ändern sich gemeinsam",()=>{
  const state=setPercentageRoleScenario({view:PERCENTAGE_ROLES_VIEWS.explore,locked:false,scenarioIndex:0,unknownRole:PERCENTAGE_UNKNOWN_ROLES.rate},1);
  const model=percentageRolesViewModel(state);
  assert.equal(model.relation.whole,120);
  assert.equal(model.relation.part,36);
  assert.equal(model.relation.rate,30);
  assert.equal(model.equation,"36 / 120 = ? / 100");
  assert.equal(model.sliderValueText,"Situation 2 von 3; 36 von 120 Karten; Prozentsatz gesucht");
  assert.match(model.liveText,/36 von 120/);
  assert.doesNotMatch(model.liveText,/30 Prozent/);
});

test("Interaktionen bleiben vor Explore und während Reveal gesperrt",()=>{
  const start=createPercentageRolesState();
  assert.equal(setUnknownPercentageRole(start,PERCENTAGE_UNKNOWN_ROLES.part),start);
  assert.equal(setPercentageRoleScenario(start,2),start);
  const locked={view:PERCENTAGE_ROLES_VIEWS.explore,locked:true,scenarioIndex:0,unknownRole:PERCENTAGE_UNKNOWN_ROLES.whole};
  assert.equal(setUnknownPercentageRole(locked,PERCENTAGE_UNKNOWN_ROLES.part),locked);
  assert.equal(setPercentageRoleScenario(locked,2),locked);
});

test("Reset stellt die offene Irritation wieder her",()=>{
  assert.deepEqual(resetPercentageRolesState(),createPercentageRolesState());
});
