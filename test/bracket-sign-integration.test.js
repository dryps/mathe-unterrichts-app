import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  home: await read("index.html"), homeCss: await read("home.css"), worker: await read("sw.js"),
  pagesRuntime: await read("scripts/pages-runtime-files.mjs"), smoke: await read("scripts/smoke.mjs"),
  workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));
const runtimeFiles = [
  "plus-minus-klammern.html", "bracket-sign.css", "src/bracket-sign-app.js",
  "src/bracket-sign-math.js", "src/bracket-sign-state.js", "src/bracket-sign-animation.js",
];

test("Startseite integriert K3.5 genau einmal als fünfte K3-Karte", () => {
  const chapter = files.home.match(/<section\s+id="rechnen-mit-termen"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 5);
  assert.equal((files.home.match(/href="\.\/plus-minus-klammern\.html"/g) ?? []).length, 1);
  assert.match(files.home, /Warum ändern sich bei einer Minusklammer alle Vorzeichen\?/);
  assert.match(files.home, /<span class="module-subtitle">Plus- und Minusklammern<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 17);
});

test("K3-Raster ordnet fünf Karten auf großen Breiten als drei plus zwei ausgewogen an", () => {
  assert.match(files.homeCss, /\.chapter-terms \.module-grid\s*{[^}]*grid-template-columns:\s*repeat\(6,/s);
  assert.match(files.homeCss, /\.chapter-terms \.module-card\s*{[^}]*grid-column:\s*span 2/s);
  assert.match(files.homeCss, /\.chapter-terms \.module-card:nth-child\(4\)[^}]*grid-column:\s*2 \/ span 2/s);
  assert.match(files.homeCss, /\.chapter-terms \.module-card:nth-child\(5\)[^}]*grid-column:\s*4 \/ span 2/s);
});

test("Cache v22 enthält ausschließlich die sechs neuen Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v22/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v21/);
  for (const file of runtimeFiles) assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  assert.doesNotMatch(files.worker, /render-bracket-sign-states|bracket-sign-(?:design|static\.test)/);
});

test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal", () => {
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."), "g");
    assert.equal((files.pagesRuntime.match(pattern) ?? []).length, 1, `Pages: ${file}`);
    assert.equal((files.smoke.match(pattern) ?? []).length, 1, `Smoke: ${file}`);
  }
});

test("Renderer ist als eigenes Skript im Paket und Pages-Workflow verdrahtet", () => {
  assert.equal(packageJson.scripts["test:bracket-sign-visual"], "node scripts/render-bracket-sign-states.mjs");
  assert.equal((files.workflow.match(/npm run test:bracket-sign-visual/g) ?? []).length, 1);
});
