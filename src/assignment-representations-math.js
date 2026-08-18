export function snapAssignmentInput(value){if(!Number.isFinite(value))throw new RangeError("Der Eingabewert muss endlich sein.");return Math.max(1,Math.min(6,Math.round(value)));}
export function assignmentRecord(input){if(!Number.isInteger(input))throw new TypeError("Die Eingabe muss eine ganze Zahl sein.");if(input<1||input>6)throw new RangeError("Die Eingabe muss zwischen 1 und 6 liegen.");const output=input*2;return Object.freeze({input,output,pair:Object.freeze([input,output]),situation:`${input} ${input===1?"Heft kostet":"Hefte kosten"} ${output} €.`});}
export function assignmentTable(){return Object.freeze(Array.from({length:6},(_,index)=>assignmentRecord(index+1)));}
export function graphPoint(record){return Object.freeze({x:70+record.input*75,y:360-record.output*22});}
