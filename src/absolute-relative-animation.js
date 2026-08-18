export const ABSOLUTE_RELATIVE_REVEAL_DURATION=800;

export function absoluteRelativeRevealFrame(elapsed){
  if(!Number.isFinite(elapsed)) throw new RangeError("Die Animationszeit muss endlich sein.");
  const progress=Math.max(0,Math.min(1,elapsed/ABSOLUTE_RELATIVE_REVEAL_DURATION));
  return Object.freeze({opacity:progress,complete:progress>=1});
}
