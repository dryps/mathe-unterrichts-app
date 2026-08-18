import assert from "node:assert/strict";
import test from "node:test";
import { MODEL_CHOICE_REVEAL_DURATION,modelChoiceRevealFrame } from "../src/model-choice-animation.js";

test("Reveal blendet reproduzierbar von 0 auf 1",()=>{assert.deepEqual(modelChoiceRevealFrame(-1),{opacity:0,complete:false});assert.deepEqual(modelChoiceRevealFrame(MODEL_CHOICE_REVEAL_DURATION/2),{opacity:0.5,complete:false});assert.deepEqual(modelChoiceRevealFrame(MODEL_CHOICE_REVEAL_DURATION),{opacity:1,complete:true});});
