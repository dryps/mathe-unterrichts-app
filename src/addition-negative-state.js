import { snapNegativeSummand } from "./addition-negative-geometry.js";

export const ADDITION_VIEWS = Object.freeze({ prompt:"prompt", start:"start", operator:"operator", summand:"summand", moving:"moving", result:"result", free:"free", conclusion:"conclusion" });
export const ADDITION_INSIGHTS = Object.freeze({
  prompt:"Bedeutet das Plus, dass wir nach rechts gehen?",
  start:"Wir starten bei 3.",
  operator:"Wir addieren eine weitere Zahl.",
  summand:"Die Zahl −5 zeigt fünf Einheiten nach links.",
  moving:"Eine negative Zahl zu addieren bedeutet: nach links gehen.",
  result:"Das Vorzeichen des Summanden bestimmt die Richtung.",
  free:"Ziehe das Pfeilende und beobachte den negativen Summanden.",
  conclusion:"Beim Addieren bestimmt das Vorzeichen des Summanden die Richtung. Negativer Summand: Bewegung nach links.",
});

export function createAdditionState() { return { view:ADDITION_VIEWS.prompt, summand:-5, locked:false }; }
export function nextAdditionState(state) {
  if (state.locked) return state;
  const next = { prompt:"start", start:"operator", operator:"summand", summand:"moving", result:"free", free:"conclusion" }[state.view];
  if (!next) return state;
  return { ...state, view:next, locked:next === ADDITION_VIEWS.moving };
}
export function finishAdditionMovement(state) { return state.view === ADDITION_VIEWS.moving ? { ...state, view:ADDITION_VIEWS.result, locked:false } : state; }
export function moveAdditionSummand(state, summand) {
  if (![ADDITION_VIEWS.free, ADDITION_VIEWS.conclusion].includes(state.view) || state.locked) return state;
  const snapped = snapNegativeSummand(summand);
  return snapped === state.summand ? state : { ...state, view:ADDITION_VIEWS.conclusion, summand:snapped };
}
export function resetAdditionState() { return createAdditionState(); }
export function additionViewModel(state) {
  const order = Object.values(ADDITION_VIEWS); const index = order.indexOf(state.view);
  const at = (view) => index >= order.indexOf(view);
  return {
    showPrompt:state.view === ADDITION_VIEWS.prompt, showAxis:at(ADDITION_VIEWS.start),
    showStart:at(ADDITION_VIEWS.start), highlightStart:state.view === ADDITION_VIEWS.start,
    showFormula:at(ADDITION_VIEWS.start), highlightOperator:state.view === ADDITION_VIEWS.operator,
    highlightSummand:state.view === ADDITION_VIEWS.summand,
    showMotion:at(ADDITION_VIEWS.moving), showMovingPoint:state.view === ADDITION_VIEWS.moving,
    showEnd:at(ADDITION_VIEWS.result), interactive:[ADDITION_VIEWS.free,ADDITION_VIEWS.conclusion].includes(state.view) && !state.locked,
    showNext:![ADDITION_VIEWS.free,ADDITION_VIEWS.conclusion].includes(state.view), controlsLocked:state.locked,
    insight:ADDITION_INSIGHTS[state.view],
  };
}
