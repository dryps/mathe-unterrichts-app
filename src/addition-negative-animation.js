export const ADDITION_MOVEMENT_DURATION_MS = 1700;
export function easeInOutCubic(progress) { const p=Math.max(0,Math.min(1,progress)); return p<.5?4*p**3:1-((-2*p+2)**3)/2; }
export function additionMovementFrame(elapsed, movement) {
  if (!Number.isFinite(elapsed)) throw new RangeError("Die Animationszeit muss endlich sein.");
  const progress=easeInOutCubic(Math.max(0,Math.min(ADDITION_MOVEMENT_DURATION_MS,elapsed))/ADDITION_MOVEMENT_DURATION_MS);
  return { progress, x:movement.startX+(movement.endX-movement.startX)*progress, visibleSteps:Math.min(movement.stepCount,Math.floor(progress*movement.stepCount+1e-9)), complete:elapsed>=ADDITION_MOVEMENT_DURATION_MS };
}
