import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  home: await read("index.html"),
  worker: await read("sw.js"),
  pagesRuntime: await read("scripts/pages-runtime-files.mjs"),
  smoke: await read("scripts/smoke.mjs"),
  workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));

const runtimeFiles = [
  "terme-multiplizieren.html",
  "term-multiplication.css",
  "src/term-multiplication-app.js",
  "src/term-multiplication-math.js",
  "src/term-multiplication-state.js",
  "src/term-multiplication-animation.js",
];

test("Startseite behält K3.3 genau einmal als dritte K3-Karte", () => {
  const chapter = files.home.match(
    /<section\s+id="rechnen-mit-termen"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 6);
  assert.equal((files.home.match(/href="\.\/terme-multiplizieren\.html"/g) ?? []).length, 1);
  assert.match(files.home, /Warum ist x · x = x² – und nicht 2x\?/);
  assert.match(files.home, /<span class="module-subtitle">Terme multiplizieren<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 24);
});

test("Cache v21 enthält weiterhin alle sechs K3.3-Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v29/);
  assert.doesNotMatch(files.worker, /mathe-unterrichts-app-v18/);
  for (const file of runtimeFiles) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(files.worker, /render-term-multiplication-states|term-multiplication-(?:design|static\.test)/);
});

test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal", () => {
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."), "g");
    assert.equal((files.pagesRuntime.match(pattern) ?? []).length, 1, `Pages: ${file}`);
    assert.equal((files.smoke.match(pattern) ?? []).length, 1, `Smoke: ${file}`);
  }
  assert.doesNotMatch(files.pagesRuntime, /render-term-multiplication-states|term-multiplication-(?:design|static\.test)/);
});

test("Renderer ist als eigenes Skript im Paket und im Pages-Workflow verdrahtet", () => {
  assert.equal(
    packageJson.scripts["test:term-multiplication-visual"],
    "node scripts/render-term-multiplication-states.mjs",
  );
  assert.equal(
    (files.workflow.match(/npm run test:term-multiplication-visual/g) ?? []).length,
    1,
  );
});
