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
  "ergebnis-und-ereignis.html", "random-event.css", "src/random-event-app.js",
  "src/random-event-animation.js", "src/random-event-math.js", "src/random-event-state.js",
];

test("K8.1 ist genau einmal als erste Karte des achten Kapitels integriert", () => {
  const chapter = home.match(/<section id="wahrscheinlichkeit"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((home.match(/class="chapter(?:\s|")/g) ?? []).length, 8);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 2);
  assert.equal((home.match(/href="\.\/ergebnis-und-ereignis\.html"/g) ?? []).length, 1);
  assert.equal((home.match(/class="module-card"/g) ?? []).length, 38);
  assert.match(chapter, /8\. Wahrscheinlichkeit/);
});

test("das neue Kapitel bleibt bei Telefon, Tablet und Desktop ohne konkurrierendes Raster", () => {
  assert.match(css, /\.chapter-probability \.module-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.chapter-probability \.module-grid\s*\{[^}]*1fr/s);
  assert.match(css, /@media \(orientation: landscape\)[\s\S]*\.chapter-probability \.module-card\s*\{[^}]*grid-column:\s*auto/s);
});

test("Cache v43, Pages, Smoke und Workflow enthalten genau die sechs K8.1-Laufzeitdateien", () => {
  assert.match(worker, /mathe-unterrichts-app-v43/);
  for (const file of files) {
    const pattern = new RegExp(file.replaceAll(".", "\\."));
    assert.match(worker, pattern);
    assert.match(runtime, pattern);
    assert.match(smoke, pattern);
  }
  const json = JSON.parse(pkg);
  assert.equal(json.scripts["test:random-event-visual"], "node scripts/render-random-event-states.mjs");
  assert.equal((workflow.match(/npm run test:random-event-visual/g) ?? []).length, 1);
});
