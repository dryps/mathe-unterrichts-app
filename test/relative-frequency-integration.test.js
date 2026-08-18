import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [home, css, worker, runtime, smoke, workflow, pkg] = await Promise.all([
  read("../index.html"), read("../home.css"), read("../sw.js"),
  read("../scripts/pages-runtime-files.mjs"), read("../scripts/smoke.mjs"),
  read("../.github/workflows/pages.yml"), read("../package.json"),
]);
const files = ["relative-haeufigkeit.html", "relative-frequency.css", "src/relative-frequency-app.js", "src/relative-frequency-animation.js", "src/relative-frequency-math.js", "src/relative-frequency-state.js"];

test("K8.4 ist genau einmal als vierte Karte integriert und schließt 40 Module ab", () => {
  const chapter = home.match(/<section id="wahrscheinlichkeit"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((home.match(/href="\.\/relative-haeufigkeit\.html"/g) ?? []).length, 1);
  assert.ok(chapter.indexOf("./laplace-wahrscheinlichkeit.html") < chapter.indexOf("./relative-haeufigkeit.html"));
  assert.equal((home.match(/class="module-card"/g) ?? []).length, 40);
  assert.equal((home.match(/class="chapter(?:\s|")/g) ?? []).length, 8);
});

test("K8-Raster bleibt mobil einspaltig, am Tablet zweispaltig und breit vierspaltig", () => {
  assert.match(css, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(4, minmax\(0, 1fr\)\)/s);
  const mobile = css.match(/@media \(max-width: 720px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const tablet = css.match(/@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?(?=\n@media|$)/)?.[0] ?? "";
  const landscape = css.match(/@media \(orientation: landscape\)[\s\S]*$/)?.[0] ?? "";
  assert.match(mobile, /\.chapter-probability \.module-grid\s*\{[^}]*1fr/s);
  assert.match(tablet, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(landscape, /\.chapter-probability \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
});

test("Cache v45, Pages, Smoke und Workflow enthalten genau die sechs K8.4-Laufzeitdateien", () => {
  assert.match(worker, /mathe-unterrichts-app-v45/);
  for (const file of files) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(worker, pattern);
    assert.match(runtime, pattern);
    assert.match(smoke, pattern);
  }
  const json = JSON.parse(pkg);
  assert.equal(json.scripts["test:relative-frequency-visual"], "node scripts/render-relative-frequency-states.mjs");
  assert.equal((workflow.match(/npm run test:relative-frequency-visual/g) ?? []).length, 1);
});
