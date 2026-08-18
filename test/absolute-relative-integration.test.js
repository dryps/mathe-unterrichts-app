import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root=new URL("../",import.meta.url),read=path=>readFile(new URL(path,root),"utf8");
const files={home:await read("index.html"),css:await read("home.css"),worker:await read("sw.js"),runtime:await read("scripts/pages-runtime-files.mjs"),smoke:await read("scripts/smoke.mjs"),workflow:await read(".github/workflows/pages.yml")};
const packageJson=JSON.parse(await read("package.json"));
const runtime=["absolut-relativ.html","absolute-relative.css","src/absolute-relative-app.js","src/absolute-relative-animation.js","src/absolute-relative-math.js","src/absolute-relative-state.js"];

test("Startseite integriert K7.2 genau einmal als zweite Kapitel-7-Karte",()=>{
  const chapter=files.home.match(/<section id="prozentrechnung"[\s\S]*?<\/section>/)?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g)??[]).length,2);
  assert.equal((files.home.match(/href="\.\/absolut-relativ\.html"/g)??[]).length,1);
  assert.match(chapter,/Wie kann die kleinere Anzahl trotzdem der größere Anteil sein\?/);
  assert.equal((files.home.match(/class="module-card"/g)??[]).length,33);
  assert.equal((files.home.match(/class="chapter(?:\s|")/g)??[]).length,7);
  assert.match(files.css,/\.chapter-percentages \.module-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(files.css,/\.chapter-percentages \.module-card\s*\{[^}]*grid-column:\s*auto/s);
});

test("Cache v38, Pages und Smoke enthalten die sechs K7.2-Laufzeitdateien",()=>{
  assert.match(files.worker,/mathe-unterrichts-app-v38/);
  assert.doesNotMatch(files.worker,/mathe-unterrichts-app-v37/);
  for(const file of runtime){
    const pattern=new RegExp(file.replaceAll(".","\\."));
    assert.match(files.worker,pattern);
    assert.match(files.runtime,pattern);
    assert.match(files.smoke,pattern);
  }
});

test("K7.2-Renderer ist im Paket und Workflow genau einmal verdrahtet",()=>{
  assert.equal(packageJson.scripts["test:absolute-relative-visual"],"node scripts/render-absolute-relative-states.mjs");
  assert.equal((files.workflow.match(/npm run test:absolute-relative-visual/g)??[]).length,1);
});
