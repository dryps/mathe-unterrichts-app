import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const files={home:await read("index.html"),homeCss:await read("home.css"),worker:await read("sw.js"),pages:await read("scripts/pages-runtime-files.mjs"),smoke:await read("scripts/smoke.mjs"),workflow:await read(".github/workflows/pages.yml")};
const packageJson=JSON.parse(await read("package.json"));
const runtimeFiles=["ausmultiplizieren.html","distribution.css","src/distribution-app.js","src/distribution-math.js","src/distribution-state.js","src/distribution-animation.js"];

test("Startseite integriert K3.6 genau einmal als sechste K3-Karte",()=>{const chapter=files.home.match(/<section\s+id="rechnen-mit-termen"[\s\S]*?<\/section>/)?.[0];assert.ok(chapter);assert.equal((chapter.match(/class="module-card"/g)??[]).length,6);assert.equal((files.home.match(/href="\.\/ausmultiplizieren\.html"/g)??[]).length,1);assert.match(files.home,/Warum muss beim Ausmultiplizieren jeder Term in der Klammer getroffen werden\?/);assert.match(files.home,/<span class="module-subtitle">Ausmultiplizieren<\/span>/);assert.equal((files.home.match(/class="module-card"/g)??[]).length,34);});
test("K3-Raster ordnet sechs Karten als drei plus drei an",()=>{assert.match(files.homeCss,/\.chapter-terms \.module-grid\s*{[^}]*repeat\(6,/s);assert.match(files.homeCss,/\.chapter-terms \.module-card\s*{[^}]*grid-column:\s*span 2/s);assert.doesNotMatch(files.homeCss,/\.chapter-terms \.module-card:nth-child/);});
test("Cache enthält die sechs K3.6-Laufzeitdateien",()=>{assert.match(files.worker,/mathe-unterrichts-app-v39/);for(const file of runtimeFiles)assert.match(files.worker,new RegExp(file.replaceAll(".","\\.")));assert.doesNotMatch(files.worker,/render-distribution-states|distribution-(?:design|static\.test)/);});
test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal",()=>{for(const file of runtimeFiles){const pattern=new RegExp(file.replaceAll(".","\\."),"g");assert.equal((files.pages.match(pattern)??[]).length,1);assert.equal((files.smoke.match(pattern)??[]).length,1);}});
test("Renderer ist im Paket und Pages-Workflow verdrahtet",()=>{assert.equal(packageJson.scripts["test:distribution-visual"],"node scripts/render-distribution-states.mjs");assert.equal((files.workflow.match(/npm run test:distribution-visual/g)??[]).length,1);});
