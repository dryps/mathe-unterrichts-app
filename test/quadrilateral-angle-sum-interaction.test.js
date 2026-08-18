import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appPath = new URL("../src/quadrilateral-angle-sum-app.js", import.meta.url);
const source = await readFile(appPath, "utf8").catch(() => "");

test("der Controller setzt echte hidden-Zustände an allen Reveal-Gates", () => {
  assert.match(source, /diagonal\.toggleAttribute\("hidden", !model\.showDiagonal\)/);
  assert.match(source, /triangleFills\.toggleAttribute\("hidden", !model\.showTriangles\)/);
  assert.match(source, /angleLabels\.toggleAttribute\("hidden", !model\.showAngles\)/);
  assert.match(source, /equation\.hidden = !model\.showEquation/);
  assert.match(source, /explore\.hidden = !model\.showExplore/);
  assert.match(source, /conclusion\.hidden = !model\.showConclusion/);
});

test("Reset, Reduced Motion und veraltete Callbacks sind abgesichert", () => {
  assert.match(source, /animationToken \+= 1/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /token !== animationToken/);
  assert.match(source, /resetAngleSumState\(\)/);
});

test("der dynamische Alternativtext und die Live-Region folgen dem aktuellen Modell", () => {
  assert.match(source, /board\.setAttribute\("aria-label", model\.boardDescription\)/);
  assert.match(source, /live\.textContent = model\.liveText/);
  assert.match(source, /positionControl\.addEventListener\("input"/);
});
