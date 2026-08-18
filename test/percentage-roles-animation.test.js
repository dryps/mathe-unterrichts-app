import assert from "node:assert/strict";
import test from "node:test";
import { PERCENTAGE_ROLES_REVEAL_DURATION, percentageRolesRevealFrame } from "../src/percentage-roles-animation.js";

test("Reveal blendet deterministisch ein",()=>{
  assert.equal(percentageRolesRevealFrame(0).opacity,0);
  assert.equal(percentageRolesRevealFrame(PERCENTAGE_ROLES_REVEAL_DURATION/2).opacity,0.5);
  assert.deepEqual(percentageRolesRevealFrame(PERCENTAGE_ROLES_REVEAL_DURATION),{opacity:1,complete:true});
});

test("Animationszeit muss endlich sein",()=>assert.throws(()=>percentageRolesRevealFrame(Number.NaN),RangeError));
