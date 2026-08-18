export const PERCENTAGE_FACTOR_REVEAL_DURATION=800;
export function percentageFactorRevealFrame(elapsed){
  if(!Number.isFinite(elapsed)) throw new RangeError("Die Animationszeit muss endlich sein.");
  const opacity=Math.max(0,Math.min(1,elapsed/PERCENTAGE_FACTOR_REVEAL_DURATION));
  return Object.freeze({opacity,complete:opacity>=1});
}

