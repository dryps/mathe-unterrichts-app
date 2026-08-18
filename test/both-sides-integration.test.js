import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const files={home:await read("index.html"),homeCss:await read("home.css"),worker:await read("sw.js"),pages:await read("scripts/pages-runtime-files.mjs"),smoke:await read("scripts/smoke.mjs"),workflow:await read(".github/workflows/pages.yml")};
const packageJson=JSON.parse(await read("package.json"));
const runtimeFiles=["terme-beide-seiten.html","both-sides.css","src/both-sides-app.js","src/both-sides-math.js","src/both-sides-state.js","src/both-sides-animation.js"];

test("Startseite behält K4.2 genau einmal als zweite Kapitel-4-Karte",()=>{const chapter=files.home.match(/<section\s+id="gleichungen-ungleichungen"[\s\S]*?<\/section>/)?.[0];assert.ok(chapter);assert.equal((chapter.match(/class="module-card"/g)??[]).length,4);assert.equal((files.home.match(/href="\.\/terme-beide-seiten\.html"/g)??[]).length,1);assert.match(chapter,/Warum ist „rüberbringen“ eigentlich keine neue Rechenregel\?/);assert.match(chapter,/<span class="module-subtitle">Terme auf beiden Seiten<\/span>/);assert.equal((files.home.match(/class="module-card"/g)??[]).length,39);});
test("Kapitel-4-Raster ordnet vier Karten responsiv gleichwertig",()=>{assert.match(files.homeCss,/\.chapter-equations \.module-grid\s*\{[^}]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);assert.match(files.homeCss,/@media \(max-width: 720px\)[\s\S]*\.chapter-equations \.module-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);});
test("Cache v44 enthält weiterhin die sechs K4.2-Laufzeitdateien",()=>{assert.match(files.worker,/mathe-unterrichts-app-v44/);assert.doesNotMatch(files.worker,/mathe-unterrichts-app-v25/);for(const file of runtimeFiles)assert.match(files.worker,new RegExp(file.replaceAll(".","\\.")));assert.doesNotMatch(files.worker,/render-both-sides-states|terme-beide-seiten-(?:design|static\.test)/);});
test("Pages und Smoke führen alle sechs Laufzeitdateien genau einmal",()=>{for(const file of runtimeFiles){const pattern=new RegExp(file.replaceAll(".","\\."),"g");assert.equal((files.pages.match(pattern)??[]).length,1);assert.equal((files.smoke.match(pattern)??[]).length,1);}});
test("Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet",()=>{assert.equal(packageJson.scripts["test:both-sides-visual"],"node scripts/render-both-sides-states.mjs");assert.equal((files.workflow.match(/npm run test:both-sides-visual/g)??[]).length,1);});
