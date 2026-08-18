import assert from "node:assert/strict";
import test from "node:test";
import { ABSOLUTE_RELATIVE_REVEAL_DURATION, absoluteRelativeRevealFrame } from "../src/absolute-relative-animation.js";

test("Reveal bleibt kurz, monoton und endet exakt",()=>{
  assert.equal(ABSOLUTE_RELATIVE_REVEAL_DURATION,800);
  assert.deepEqual(absoluteRelativeRevealFrame(0),{opacity:0,complete:false});
  assert.equal(absoluteRelativeRevealFrame(400).opacity,0.5);
  assert.deepEqual(absoluteRelativeRevealFrame(800),{opacity:1,complete:true});
  assert.deepEqual(absoluteRelativeRevealFrame(1200),{opacity:1,complete:true});
  assert.throws(()=>absoluteRelativeRevealFrame(Number.NaN),/endlich/);
});
