import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  home: await read("index.html"),
  homeCss: await read("home.css"),
  worker: await read("sw.js"),
  pagesRuntime: await read("scripts/pages-runtime-files.mjs"),
  smoke: await read("scripts/smoke.mjs"),
  workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));

const runtimeFiles = [
  "terme-dividieren.html",
  "term-division.css",
  "src/term-division-app.js",
  "src/term-division-math.js",
  "src/term-division-state.js",
  "src/term-division-animation.js",
];

test("Startseite integriert K3.4 genau einmal als vierte K3-Karte", () => {
  const chapter = files.home.match(
    /<section\s+id="rechnen-mit-termen"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 6);
  assert.equal((files.home.match(/href="\.\/terme-dividieren\.html"/g) ?? []).length, 1);
  assert.match(
    files.home,
    /Warum bleibt beim Teilen eines Terms genau das übrig, was nicht weggeteilt wurde\?/,
  );
  assert.match(files.home, /<span class="module-subtitle">Terme dividieren<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 18);
});

test("K3-Raster bleibt nach der fünften Karte auf großen Breiten und iPad ausgewogen", () => {
  assert.match(
    files.homeCss,
    /\.chapter-terms \.module-grid\s*{[^}]*grid-template-columns:\s*repeat\(6,/s,
  );
  assert.match(
    files.homeCss,
    /@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?\.chapter-terms \.module-grid\s*{[^}]*repeat\(2,/,
  );
});

test("Cache v21 enthält ausschließlich die sechs neuen Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v23/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v20/);
  for (const file of runtimeFiles) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(files.worker, /render-term-division-states|term-division-(?:design|static\.test)/);
});

test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal", () => {
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."), "g");
    assert.equal((files.pagesRuntime.match(pattern) ?? []).length, 1, `Pages: ${file}`);
    assert.equal((files.smoke.match(pattern) ?? []).length, 1, `Smoke: ${file}`);
  }
  assert.doesNotMatch(files.pagesRuntime, /render-term-division-states|term-division-(?:design|static\.test)/);
});

test("Renderer ist als eigenes Skript im Paket und Pages-Workflow verdrahtet", () => {
  assert.equal(
    packageJson.scripts["test:term-division-visual"],
    "node scripts/render-term-division-states.mjs",
  );
  assert.equal((files.workflow.match(/npm run test:term-division-visual/g) ?? []).length, 1);
});
