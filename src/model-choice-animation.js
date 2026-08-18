export const MODEL_CHOICE_REVEAL_DURATION=700;
export function modelChoiceRevealFrame(elapsed){const progress=Math.min(1,Math.max(0,Number(elapsed)/MODEL_CHOICE_REVEAL_DURATION));return Object.freeze({opacity:Number(progress.toFixed(3)),complete:progress>=1});}
