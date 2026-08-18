import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_FACTOR_REVEAL_DURATION, percentageFactorRevealFrame } from "../src/percentage-factor-animation.js";

test("Reveal läuft begrenzt und endet exakt",()=>{
  assert.deepEqual(percentageFactorRevealFrame(-10),{opacity:0,complete:false});
  assert.deepEqual(percentageFactorRevealFrame(PERCENTAGE_FACTOR_REVEAL_DURATION/2),{opacity:0.5,complete:false});
  assert.deepEqual(percentageFactorRevealFrame(PERCENTAGE_FACTOR_REVEAL_DURATION),{opacity:1,complete:true});
  assert.throws(()=>percentageFactorRevealFrame(Number.NaN),RangeError);
});
