export function percentageAngle(percent){
  if(!Number.isFinite(percent)||percent<0||percent>100)throw new RangeError("Der Prozentanteil muss zwischen 0 und 100 liegen.");
  return Number((percent*3.6).toFixed(4));
}
export function snapPercentageChartValue(value){
  if(!Number.isFinite(value))throw new RangeError("Der Reglerwert muss endlich sein.");
  return Math.max(1,Math.min(100,Math.round(value)));
}
export function percentageChartModel(value){const percent=snapPercentageChartValue(value);return Object.freeze({percent,angle:percentageAngle(percent)});}
