import assert from "node:assert/strict";
import test from "node:test";
import { ADDITION_START, additionDirection, additionMovement, additionPointIsOnLine, additionResult, additionStepCount, additionValueToPoint, formatAddition, snapNegativeSummand, xToNegativeSummand } from "../src/addition-negative-geometry.js";

test("alle sechs negativen Summanden liefern exakte Ergebnisse",()=>{const expected=new Map([[-1,2],[-2,1],[-3,0],[-4,-1],[-5,-2],[-6,-3]]);for(const [summand,result] of expected){assert.equal(additionResult(summand),result);assert.equal(additionDirection(summand),"left");assert.equal(additionStepCount(summand),Math.abs(summand));}});
test("Startwert bleibt unabhängig vom Summanden exakt drei",()=>{for(let s=-6;s<=-1;s+=1){const movement=additionMovement(s);assert.equal(movement.start,ADDITION_START);assert.equal(movement.values[0],3);assert.equal(movement.values.at(-1),additionResult(s));}});
test("fünf Schritte führen über 2, 1, 0 und −1 nach −2",()=>{assert.deepEqual(additionMovement(-5).values,[3,2,1,0,-1,-2]);assert.equal(additionMovement(-5).boundaries.length,6);});
test("Einrasten kennt keine Zwischenwerte und schützt beide Grenzen",()=>{assert.equal(snapNegativeSummand(-4.49),-4);assert.equal(snapNegativeSummand(-4.51),-5);assert.equal(snapNegativeSummand(10),-1);assert.equal(snapNegativeSummand(-99),-6);});
test("Pfeilposition wird ausschließlich in negative Summanden übersetzt",()=>{for(let s=-6;s<=-1;s+=1){const movement=additionMovement(s);assert.equal(xToNegativeSummand(movement.endX),s);}assert.equal(xToNegativeSummand(-9999),-6);assert.equal(xToNegativeSummand(9999),-1);});
test("alle Start- und Endpunkte liegen exakt auf der Zahlengeraden",()=>{assert.equal(additionPointIsOnLine(additionValueToPoint(3)),true);for(let s=-6;s<=-1;s+=1)assert.equal(additionPointIsOnLine(additionValueToPoint(additionResult(s))),true);});
test("Rechnung formatiert Minuszeichen und Ergebnis korrekt",()=>{assert.equal(formatAddition(-3),"3 + (−3) = 0");assert.equal(formatAddition(-5),"3 + (−5) = −2");assert.equal(formatAddition(-6),"3 + (−6) = −3");});

