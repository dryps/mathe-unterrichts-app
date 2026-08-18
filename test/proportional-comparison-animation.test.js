import assert from "node:assert/strict";
import test from "node:test";
import { COMPARISON_REVEAL_DURATION,comparisonRevealFrame } from "../src/proportional-comparison-animation.js";

test("Reveal dauert 650 Millisekunden und endet exakt",()=>{assert.equal(COMPARISON_REVEAL_DURATION,650);assert.deepEqual(comparisonRevealFrame(0),{progress:0,opacity:0,complete:false});assert.deepEqual(comparisonRevealFrame(650),{progress:1,opacity:1,complete:true});});
test("Reveal bleibt monoton und weist ungültige Zeiten ab",()=>{let previous=-1;for(const time of [0,100,250,400,550,650]){const frame=comparisonRevealFrame(time);assert.ok(frame.opacity>=previous);previous=frame.opacity;}assert.throws(()=>comparisonRevealFrame(-1),/nicht negativ/);assert.throws(()=>comparisonRevealFrame(Number.NaN),/endlich/);});
