export const MODEL_INPUTS=Object.freeze([2,4,8,12]);
export function snapModelInput(index){const safe=Math.min(MODEL_INPUTS.length-1,Math.max(0,Math.round(Number.isFinite(index)?index:1)));return MODEL_INPUTS[safe];}
export function modelChoicePair(input){const value=Number(input);if(!MODEL_INPUTS.includes(value))throw new RangeError("Die Eingabe muss 2, 4, 8 oder 12 sein.");return Object.freeze({input:value,proportional:value*3,inverse:48/value,quotient:3,product:48});}
