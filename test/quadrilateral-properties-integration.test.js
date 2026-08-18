import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const files = {
  home: await read("index.html"),
  homeCss: await read("home.css"),
  worker: await read("sw.js"),
  runtime: await read("scripts/pages-runtime-files.mjs"),
  smoke: await read("scripts/smoke.mjs"),
  workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));
const runtimeFiles = ["eigenschaften-statt-optik.html", "quadrilateral-properties.css", "src/quadrilateral-properties-app.js", "src/quadrilateral-properties-animation.js", "src/quadrilateral-properties-geometry.js", "src/quadrilateral-properties-state.js"];

test("Startseite integriert K5.1 genau einmal als erste Kapitel-5-Karte", () => {
  const chapter = files.home.match(/<section\s+id="vierecke"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((files.home.match(/href="\.\/eigenschaften-statt-optik\.html"/g) ?? []).length, 1);
  assert.match(chapter, /Warum bleibt ein Viereck dieselbe Art, obwohl ich es drehe oder anders zeichne\?/);
  assert.match(chapter, /<span class="module-subtitle">Eigenschaften statt Optik<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length,29);
});

test("Kapitel-5-Raster bleibt mit vier Karten responsiv", () => {
  assert.match(files.homeCss, /\.chapter-quadrilaterals \.module-grid\s*{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(files.homeCss, /@media \(max-width: 720px\)[\s\S]*\.chapter-quadrilaterals \.module-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
});

test("Cache v34 und Pages-Artefakt enthalten ausschließlich die sechs Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v34/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v27/);
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(files.worker, pattern);
    assert.match(files.runtime, pattern);
    assert.match(files.smoke, pattern);
  }
  assert.doesNotMatch(files.worker, /render-quadrilateral-properties-states|quadrilateral-properties-(?:design|static\.test)/);
});

test("Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet", () => {
  assert.equal(packageJson.scripts["test:quadrilateral-properties-visual"], "node scripts/render-quadrilateral-properties-states.mjs");
  assert.equal((files.workflow.match(/npm run test:quadrilateral-properties-visual/g) ?? []).length, 1);
});
