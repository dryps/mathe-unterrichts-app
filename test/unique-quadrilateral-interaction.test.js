import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/unique-quadrilateral-app.js", import.meta.url), "utf8").catch(() => "");

test("alle Angaben bleiben bis zu ihrem Gate wirklich verborgen", () => {
  assert.match(source, /parallelMarkers\.toggleAttribute\("hidden", !model\.showParallel\)/);
  assert.match(source, /equalMarkers\.toggleAttribute\("hidden", !model\.showEqual\)/);
  assert.match(source, /freedom\.hidden = !model\.showFreedom/);
  assert.match(source, /independent\.hidden = !model\.showIndependent/);
  assert.match(source, /conclusion\.hidden = !model\.showConclusion/);
});

test("Reset, Reduced Motion und veraltete Callback-Frames sind abgesichert", () => {
  assert.match(source, /animationToken \+= 1/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /token !== animationToken/);
  assert.match(source, /resetUniqueQuadrilateralState\(\)/);
});

test("Regler, Alternativtext und Live-Region folgen dem reinen Zustandsmodell", () => {
  assert.match(source, /shearControl\.addEventListener\("input"/);
  assert.match(source, /board\.setAttribute\("aria-label", model\.boardDescription\)/);
  assert.match(source, /live\.textContent = model\.liveText/);
});

test("gegenüberliegende Seitenpaare erhalten unterscheidbare Einfach- und Doppelmarker", () => {
  assert.match(source, /index%2===0\?\[0\]:\[-10,10\]/);
  assert.match(source, /if\(index%2===0\)return arrowHead/);
});
