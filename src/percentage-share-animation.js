export const PERCENTAGE_SHARE_REVEAL_DURATION=700;
export function percentageShareRevealFrame(elapsed){const value=Number(elapsed);if(!Number.isFinite(value))throw new RangeError("Die Animationszeit muss endlich sein.");const progress=Math.min(1,Math.max(0,value/PERCENTAGE_SHARE_REVEAL_DURATION));return Object.freeze({opacity:Number(progress.toFixed(3)),complete:progress>=1});}
