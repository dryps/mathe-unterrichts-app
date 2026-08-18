import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [home, css, worker, runtime, smoke, workflow, pkg] = await Promise.all([
  read("../index.html"), read("../home.css"), read("../sw.js"),
  read("../scripts/pages-runtime-files.mjs"), read("../scripts/smoke.mjs"),
  read("../.github/workflows/pages.yml"), read("../package.json"),
]);
const files = [
  "ergebnisraum.html", "outcome-space.css", "src/outcome-space-app.js",
  "src/outcome-space-animation.js", "src/outcome-space-math.js", "src/outcome-space-state.js",
];

test("K8.2 ist genau einmal als zweite Karte des achten Kapitels integriert", () => {
  const chapter = home.match(/<section id="wahrscheinlichkeit"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((home.match(/class="chapter(?:\s|")/g) ?? []).length, 8);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 2);
  assert.equal((home.match(/href="\.\/ergebnisraum\.html"/g) ?? []).length, 1);
  assert.ok(chapter.indexOf("./ergebnis-und-ereignis.html") < chapter.indexOf("./ergebnisraum.html"));
  assert.equal((home.match(/class="module-card"/g) ?? []).length, 38);
});

test("K8-Raster bleibt mobil einspaltig und zeigt ab Tablet zwei Karten", () => {
  assert.match(css, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  const mobile = css.match(/@media \(max-width: 720px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const tablet = css.match(/@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const landscape = css.match(/@media \(orientation: landscape\)[\s\S]*$/)?.[0] ?? "";
  assert.match(mobile, /\.chapter-probability \.module-grid\s*\{[^}]*1fr/s);
  assert.match(tablet, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(landscape, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(landscape, /\.chapter-probability \.module-card\s*\{[^}]*grid-column:\s*auto/s);
});

test("Cache v43, Pages, Smoke und Workflow enthalten genau die sechs K8.2-Laufzeitdateien", () => {
  assert.match(worker, /mathe-unterrichts-app-v43/);
  for (const file of files) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(worker, pattern);
    assert.match(runtime, pattern);
    assert.match(smoke, pattern);
  }
  const json = JSON.parse(pkg);
  assert.equal(json.scripts["test:outcome-space-visual"], "node scripts/render-outcome-space-states.mjs");
  assert.equal((workflow.match(/npm run test:outcome-space-visual/g) ?? []).length, 1);
});
