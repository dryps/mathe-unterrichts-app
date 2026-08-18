import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [home,css,worker,runtime,smoke,workflow,pkg]=await Promise.all([read("../index.html"),read("../home.css"),read("../sw.js"),read("../scripts/pages-runtime-files.mjs"),read("../scripts/smoke.mjs"),read("../.github/workflows/pages.yml"),read("../package.json")]);
const files=["prozent-als-faktor.html","percentage-factor.css","src/percentage-factor-app.js","src/percentage-factor-animation.js","src/percentage-factor-math.js","src/percentage-factor-state.js"];

test("K7.4 ist genau einmal als vierte K7-Karte integriert",()=>{
  assert.equal((home.match(/href="\.\/prozent-als-faktor\.html"/g)??[]).length,1);
  const chapter=home.match(/<section id="prozentrechnung"[\s\S]*?<\/section>/)?.[0]??"";
  assert.equal((chapter.match(/class="module-card"/g)??[]).length,5);
  assert.equal((home.match(/class="module-card"/g)??[]).length,37);
});

test("K7-Raster bleibt nach fünf Karten ausgewogen",()=>{
  assert.match(css,/\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(5, minmax\(0, 1fr\)\)/s);
  assert.match(css,/@media \(max-width: 720px\)[\s\S]*?\.chapter-percentages \.module-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css,/@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  const landscape=css.match(/@media \(orientation: landscape\) and \(min-width: 900px\) and \(max-width: 1500px\)[\s\S]*/)?.[0]??"";
  assert.match(landscape,/\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(6, minmax\(0, 1fr\)\)/s);
  assert.match(landscape,/\.chapter-percentages \.module-card:nth-child\(n\)\s*\{[^}]*grid-column:\s*span 2/s);
});

test("Cache v42, Pages, Smoke und Workflow enthalten das vollständige Modul",()=>{
  assert.match(worker,/mathe-unterrichts-app-v42/);
  for(const file of files){const pattern=new RegExp(file.replaceAll(".","\\."));assert.match(worker,pattern);assert.match(runtime,pattern);assert.match(smoke,pattern);}
  const packageJson=JSON.parse(pkg);
  assert.equal(packageJson.scripts["test:percentage-factor-visual"],"node scripts/render-percentage-factor-states.mjs");
  assert.equal((workflow.match(/npm run test:percentage-factor-visual/g)??[]).length,1);
});
