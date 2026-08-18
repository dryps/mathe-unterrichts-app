import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [home, css, worker, runtime, smoke, workflow, pkg] = await Promise.all([
  read("../index.html"), read("../home.css"), read("../sw.js"),
  read("../scripts/pages-runtime-files.mjs"), read("../scripts/smoke.mjs"),
  read("../.github/workflows/pages.yml"), read("../package.json"),
]);
const files = ["laplace-wahrscheinlichkeit.html", "laplace.css", "src/laplace-app.js", "src/laplace-animation.js", "src/laplace-math.js", "src/laplace-state.js"];

test("K8.3 ist genau einmal als dritte Karte des achten Kapitels integriert", () => {
  const chapter = home.match(/<section id="wahrscheinlichkeit"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 3);
  assert.equal((home.match(/href="\.\/laplace-wahrscheinlichkeit\.html"/g) ?? []).length, 1);
  assert.ok(chapter.indexOf("./ergebnisraum.html") < chapter.indexOf("./laplace-wahrscheinlichkeit.html"));
  assert.equal((home.match(/class="module-card"/g) ?? []).length, 39);
  assert.equal((home.match(/class="chapter(?:\s|")/g) ?? []).length, 8);
});

test("K8-Raster bleibt mobil einspaltig, am Tablet 2+1 und breit dreispaltig", () => {
  assert.match(css, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/s);
  const mobile = css.match(/@media \(max-width: 720px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const tablet = css.match(/@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const landscape = css.match(/@media \(orientation: landscape\)[\s\S]*$/)?.[0] ?? "";
  assert.match(mobile, /\.chapter-probability \.module-grid\s*\{[^}]*1fr/s);
  assert.match(tablet, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(tablet, /\.chapter-probability \.module-card:nth-child\(3\)\s*\{[^}]*grid-column:\s*span 2/s);
  assert.match(landscape, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(landscape, /\.chapter-probability \.module-card:nth-child\(3\)\s*\{[^}]*grid-column:\s*auto/s);
});

test("Cache v44, Pages, Smoke und Workflow enthalten genau die sechs K8.3-Laufzeitdateien", () => {
  assert.match(worker, /mathe-unterrichts-app-v44/);
  for (const file of files) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(worker, pattern);
    assert.match(runtime, pattern);
    assert.match(smoke, pattern);
  }
  const json = JSON.parse(pkg);
  assert.equal(json.scripts["test:laplace-visual"], "node scripts/render-laplace-states.mjs");
  assert.equal((workflow.match(/npm run test:laplace-visual/g) ?? []).length, 1);
});
