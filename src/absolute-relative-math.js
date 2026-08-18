export const BASE_ABSOLUTE_RELATIVE_COMPARISON=Object.freeze({
  left:Object.freeze({part:6,whole:50}),
  right:Object.freeze({part:5,whole:40}),
});

export const COMPARISON_SCALE_FACTORS=Object.freeze([1,2,3]);

function validateShare(part,whole){
  if(!Number.isFinite(whole)||whole<=0) throw new RangeError("Das Ganze muss positiv sein.");
  if(!Number.isFinite(part)||part<0||part>whole) throw new RangeError("Der Anteil muss zwischen null und dem Ganzen liegen.");
}

function validateIntegerShare(share){
  validateShare(share.part,share.whole);
  if(!Number.isInteger(share.part)||!Number.isInteger(share.whole)) throw new RangeError("Anteil und Ganzes müssen ganzzahlig sein.");
}

function greatestCommonDivisor(a,b){
  let left=Math.abs(a),right=Math.abs(b);
  while(right!==0) [left,right]=[right,left%right];
  return left;
}

function leastCommonMultiple(a,b){
  return Math.abs(a*b)/greatestCommonDivisor(a,b);
}

export function percentOf(part,whole){
  validateShare(part,whole);
  return part/whole*100;
}

export function normalizeComparison(left,right){
  validateIntegerShare(left);
  validateIntegerShare(right);
  const commonWhole=leastCommonMultiple(left.whole,right.whole);
  const describe=share=>Object.freeze({
    part:share.part,
    whole:share.whole,
    percent:percentOf(share.part,share.whole),
    normalized:Object.freeze({part:share.part*(commonWhole/share.whole),whole:commonWhole}),
  });
  return Object.freeze({commonWhole,left:describe(left),right:describe(right)});
}

export function snapComparisonScale(index){
  const safe=Number.isFinite(Number(index))?Math.round(Number(index)):0;
  return COMPARISON_SCALE_FACTORS[Math.max(0,Math.min(COMPARISON_SCALE_FACTORS.length-1,safe))];
}

export function scaleComparison(factor){
  if(!COMPARISON_SCALE_FACTORS.includes(factor)) throw new RangeError("Unbekannter Skalierungsfaktor.");
  return normalizeComparison(
    {part:BASE_ABSOLUTE_RELATIVE_COMPARISON.left.part*factor,whole:BASE_ABSOLUTE_RELATIVE_COMPARISON.left.whole*factor},
    {part:BASE_ABSOLUTE_RELATIVE_COMPARISON.right.part*factor,whole:BASE_ABSOLUTE_RELATIVE_COMPARISON.right.whole*factor},
  );
}
