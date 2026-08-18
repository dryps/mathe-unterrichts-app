import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const files = {
  home: await read("index.html"),
  worker: await read("sw.js"),
  runtime: await read("scripts/pages-runtime-files.mjs"),
  smoke: await read("scripts/smoke.mjs"),
  workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));
const runtimeFiles = [
  "viereck-winkelsumme.html",
  "quadrilateral-angle-sum.css",
  "src/quadrilateral-angle-sum-app.js",
  "src/quadrilateral-angle-sum-animation.js",
  "src/quadrilateral-angle-sum-math.js",
  "src/quadrilateral-angle-sum-state.js",
];

test("Startseite behält K5.3 genau einmal innerhalb der vier Kapitel-5-Karten", () => {
  const chapter = files.home.match(/<section\s+id="vierecke"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((files.home.match(/href="\.\/viereck-winkelsumme\.html"/g) ?? []).length, 1);
  assert.match(chapter, /Warum sind es im Viereck immer 360°\?/);
  assert.match(chapter, /<span class="module-subtitle">Winkelsumme im Viereck<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 28);
});

test("Cache v33, Pages und Smoke enthalten exakt die sechs neuen Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v33/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v29/);
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(files.worker, pattern);
    assert.match(files.runtime, pattern);
    assert.match(files.smoke, pattern);
  }
  assert.doesNotMatch(files.worker, /render-quadrilateral-angle-sum-states|quadrilateral-angle-sum-(?:design|static\.test)/);
});

test("K5.3-Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet", () => {
  assert.equal(packageJson.scripts["test:quadrilateral-angle-sum-visual"], "node scripts/render-quadrilateral-angle-sum-states.mjs");
  assert.equal((files.workflow.match(/npm run test:quadrilateral-angle-sum-visual/g) ?? []).length, 1);
});
