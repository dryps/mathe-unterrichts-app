export const PERCENTAGE_WHOLES=Object.freeze([20,80,200]);
export function snapPercentageWhole(index){const safe=Math.min(PERCENTAGE_WHOLES.length-1,Math.max(0,Math.round(Number.isFinite(index)?index:0)));return PERCENTAGE_WHOLES[safe];}
export function percentageShare(whole){const value=Number(whole);if(!PERCENTAGE_WHOLES.includes(value))throw new RangeError("Das Ganze muss 20, 80 oder 200 sein.");return Object.freeze({percent:25,whole:value,part:value/4});}
