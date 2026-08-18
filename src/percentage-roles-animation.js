export const PERCENTAGE_ROLES_REVEAL_DURATION=800;

export function percentageRolesRevealFrame(elapsed){
  if(!Number.isFinite(elapsed)) throw new RangeError("Die Animationszeit muss endlich sein.");
  const progress=Math.max(0,Math.min(1,elapsed/PERCENTAGE_ROLES_REVEAL_DURATION));
  return Object.freeze({opacity:progress,complete:progress>=1});
}
