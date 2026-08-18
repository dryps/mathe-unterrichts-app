import assert from "node:assert/strict";
import test from "node:test";
import { comparisonRows,graphPoint,growingRecord,proportionalRecord,scalingEvidence,snapComparisonInput } from "../src/proportional-comparison-math.js";

test("beide Beziehungen steigen, aber nur eine besitzt einen konstanten Quotienten",()=>{for(let input=1;input<=4;input+=1){const proportional=proportionalRecord(input),growing=growingRecord(input);assert.equal(proportional.output,input*2);assert.equal(proportional.quotient,2);assert.equal(growing.output,input*2+3);assert.equal(growing.quotient,(input*2+3)/input);}assert.deepEqual(comparisonRows().map(row=>row.proportional.output),[2,4,6,8]);assert.deepEqual(comparisonRows().map(row=>row.growing.output),[5,7,9,11]);});
test("nur der proportionale Graph enthält den Ursprung",()=>{assert.deepEqual(graphPoint({input:0,output:0}),{x:70,y:360});assert.deepEqual(graphPoint({input:0,output:3}),{x:70,y:300});});
test("Verdoppeln skaliert nur die proportionale Beziehung linear",()=>{assert.deepEqual(scalingEvidence(),{fromInput:2,toInput:4,proportionalFrom:4,proportionalTo:8,growingFrom:7,growingTo:11,proportionalDoubles:true,growingDoubles:false});});
test("Erkundungswerte rasten ganzzahlig und innerhalb eins bis vier",()=>{assert.equal(snapComparisonInput(2.49),2);assert.equal(snapComparisonInput(2.51),3);assert.equal(snapComparisonInput(-5),1);assert.equal(snapComparisonInput(12),4);assert.throws(()=>snapComparisonInput(Number.NaN),/endlich/);});
