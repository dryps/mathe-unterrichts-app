import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root=new URL("../",import.meta.url),read=path=>readFile(new URL(path,root),"utf8");
const files={home:await read("index.html"),css:await read("home.css"),worker:await read("sw.js"),runtime:await read("scripts/pages-runtime-files.mjs"),smoke:await read("scripts/smoke.mjs"),workflow:await read(".github/workflows/pages.yml")};
const packageJson=JSON.parse(await read("package.json"));
const runtime=["grundwert-prozentwert-prozentsatz.html","percentage-roles.css","src/percentage-roles-app.js","src/percentage-roles-animation.js","src/percentage-roles-math.js","src/percentage-roles-state.js"];

test("Startseite integriert K7.3 genau einmal als dritte Kapitel-7-Karte",()=>{
  const chapter=files.home.match(/<section id="prozentrechnung"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g)??[]).length,5);
  assert.equal((files.home.match(/href="\.\/grundwert-prozentwert-prozentsatz\.html"/g)??[]).length,1);
  assert.match(chapter,/Warum sind Grundwert, Prozentwert und Prozentsatz keine drei verschiedenen Themen\?/);
  assert.equal((files.home.match(/class="module-card"/g)??[]).length,36);
  assert.equal((files.home.match(/class="chapter(?:\s|")/g)??[]).length,7);
  assert.match(files.css,/\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(5, minmax\(0, 1fr\)\)/s);
  assert.match(files.css,/@media \(min-width: 721px\) and \(max-width: 1040px\)[\s\S]*?\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  const landscape=files.css.match(/@media \(orientation: landscape\) and \(min-width: 900px\) and \(max-width: 1500px\)[\s\S]*?(?=\n@media|$)/)?.[0];
  assert.match(landscape,/\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(6, minmax\(0, 1fr\)\)/s);
  assert.match(landscape,/\.chapter-percentages \.module-card\s*\{[^}]*grid-column:\s*span 2/s);
});

test("Cache v41, Pages und Smoke enthalten die sechs K7.3-Laufzeitdateien",()=>{
  assert.match(files.worker,/mathe-unterrichts-app-v41/);
  assert.doesNotMatch(files.worker,/mathe-unterrichts-app-v38/);
  for(const file of runtime){
    const pattern=new RegExp(file.replaceAll(".","\\."));
    assert.match(files.worker,pattern);
    assert.match(files.runtime,pattern);
    assert.match(files.smoke,pattern);
  }
});

test("K7.3-Renderer ist im Paket und Workflow genau einmal verdrahtet",()=>{
  assert.equal(packageJson.scripts["test:percentage-roles-visual"],"node scripts/render-percentage-roles-states.mjs");
  assert.equal((files.workflow.match(/npm run test:percentage-roles-visual/g)??[]).length,1);
});
