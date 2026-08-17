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
const runtimeFiles = ["loesungsmengen.html", "solution-set.css", "solution-set-steps.css", "src/solution-set-app.js", "src/solution-set-math.js", "src/solution-set-state.js", "src/solution-set-animation.js"];

test("Startseite integriert K4.4 genau einmal als vierte Kapitel-4-Karte", () => {
  const chapter = files.home.match(/<section\s+id="gleichungen-ungleichungen"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((files.home.match(/href="\.\/loesungsmengen\.html"/g) ?? []).length, 1);
  assert.match(chapter, /Warum beschreibt eine Ungleichung einen ganzen Bereich statt nur einen Wert\?/);
  assert.match(chapter, /<span class="module-subtitle">Lösungsmengen<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 22);
});

test("Kapitel-4-Raster ordnet vier Karten responsiv ohne Überlauf", () => {
  assert.match(files.homeCss, /\.chapter-equations \.module-grid\s*{[^}]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(files.homeCss, /@media \(max-width: 720px\)[\s\S]*\.chapter-equations \.module-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(files.homeCss, /@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*\.chapter-equations \.module-grid\s*{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
});

test("Cache v27 und Pages-Artefakt enthalten ausschließlich die sieben Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v27/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v26/);
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(files.worker, pattern);
    assert.match(files.runtime, pattern);
    assert.match(files.smoke, pattern);
  }
  assert.doesNotMatch(files.worker, /render-solution-set-states|solution-set-(?:design|static\.test)/);
});

test("Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet", () => {
  assert.equal(packageJson.scripts["test:solution-set-visual"], "node scripts/render-solution-set-states.mjs");
  assert.equal((files.workflow.match(/npm run test:solution-set-visual/g) ?? []).length, 1);
});
