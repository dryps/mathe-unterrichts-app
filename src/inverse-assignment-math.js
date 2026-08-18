export const INVERSE_PEOPLE=Object.freeze([2,3,4,6,8,12]);export const WORK_PRODUCT=48;
export function snapPeople(index){if(!Number.isFinite(index))return 4;const safe=Math.max(0,Math.min(INVERSE_PEOPLE.length-1,Math.round(index)));return INVERSE_PEOPLE[safe];}
export function inversePair(people){if(!INVERSE_PEOPLE.includes(people))throw new RangeError("Unzulässige Personenzahl.");return Object.freeze({people,hours:WORK_PRODUCT/people,product:WORK_PRODUCT});}
export function inversePairs(){return INVERSE_PEOPLE.map(inversePair);}
export function inversePoint(pair){return Object.freeze({x:70+40*pair.people,y:360-(pair.hours/24)*300});}

