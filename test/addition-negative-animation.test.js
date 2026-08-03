import assert from "node:assert/strict";
import test from "node:test";
import { ADDITION_MOVEMENT_DURATION_MS, additionMovementFrame, easeInOutCubic } from "../src/addition-negative-animation.js";
import { additionMovement } from "../src/addition-negative-geometry.js";

test("Bewegung startet bei 3 und endet deterministisch bei −2",()=>{const movement=additionMovement(-5);const first=additionMovementFrame(0,movement);const last=additionMovementFrame(ADDITION_MOVEMENT_DURATION_MS,movement);assert.equal(first.x,movement.startX);assert.equal(first.visibleSteps,0);assert.ok(Math.abs(last.x-movement.endX)<1e-9);assert.equal(last.visibleSteps,5);assert.equal(last.complete,true);});
test("Animationsbilder verändern nicht die mathematische Berechnung",()=>{const movement=additionMovement(-6);for(const elapsed of [0,100,777,1699,1700,9999]){const frame=additionMovementFrame(elapsed,movement);assert.equal(movement.result,-3);assert.ok(frame.x<=movement.startX&&frame.x>=movement.endX);assert.ok(Number.isInteger(frame.visibleSteps));}});
test("Easing bleibt begrenzt und monoton",()=>{const samples=[-1,0,.2,.5,.8,1,2].map(easeInOutCubic);assert.deepEqual(samples,[0,0,...samples.slice(2,5),1,1]);for(let i=1;i<samples.length;i+=1)assert.ok(samples[i]>=samples[i-1]);});
