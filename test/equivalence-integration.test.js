import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  home: await read("index.html"), homeCss: await read("home.css"), worker: await read("sw.js"),
  pages: await read("scripts/pages-runtime-files.mjs"), smoke: await read("scripts/smoke.mjs"), workflow: await read(".github/workflows/pages.yml"),
};
const packageJson = JSON.parse(await read("package.json"));
const runtimeFiles = ["aequivalenzumformungen.html", "equivalence.css", "src/equivalence-app.js", "src/equivalence-math.js", "src/equivalence-state.js", "src/equivalence-animation.js"];

test("Startseite integriert K4.1 genau einmal als erste Kapitel-4-Karte", () => {
  const chapter = files.home.match(/<section\s+id="gleichungen-ungleichungen"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((files.home.match(/href="\.\/aequivalenzumformungen\.html"/g) ?? []).length, 1);
  assert.match(chapter, /4\. Gleichungen · Ungleichungen/);
  assert.match(chapter, /Warum bleibt eine Gleichung wahr, wenn ich auf beiden Seiten dasselbe tue\?/);
  assert.match(chapter, /<span class="module-subtitle">Äquivalenzumformungen<\/span>/);
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length,34);
});

test("Kapitel-4-Raster bleibt mit vier Karten responsiv und gleichwertig", () => {
  assert.match(files.homeCss, /\.chapter-equations \.module-grid\s*\{[^}]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(files.homeCss, /@media \(max-width: 720px\)[\s\S]*\.chapter-equations \.module-grid/);
});

test("aktueller Cache enthält weiterhin die sechs K4.1-Laufzeitdateien", () => {
  assert.match(files.worker, /mathe-unterrichts-app-v39/);
  for (const file of runtimeFiles) assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  assert.doesNotMatch(files.worker, /render-equivalence-states|aequivalenzumformungen-(?:design|static\.test)/);
});

test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal", () => {
  for (const file of runtimeFiles) {
    const pattern = new RegExp(file.replaceAll(".", "\\."), "g");
    assert.equal((files.pages.match(pattern) ?? []).length, 1, `Pages: ${file}`);
    assert.equal((files.smoke.match(pattern) ?? []).length, 1, `Smoke: ${file}`);
  }
});

test("Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet", () => {
  assert.equal(packageJson.scripts["test:equivalence-visual"], "node scripts/render-equivalence-states.mjs");
  assert.equal((files.workflow.match(/npm run test:equivalence-visual/g) ?? []).length, 1);
});
