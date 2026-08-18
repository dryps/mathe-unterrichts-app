import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root=new URL("../",import.meta.url);const read=(path)=>readFile(new URL(path,root),"utf8");
const files={home:await read("index.html"),worker:await read("sw.js"),runtime:await read("scripts/pages-runtime-files.mjs"),smoke:await read("scripts/smoke.mjs"),workflow:await read(".github/workflows/pages.yml")};
const packageJson=JSON.parse(await read("package.json"));
const runtimeFiles=["eindeutige-vierecke.html","unique-quadrilateral.css","src/unique-quadrilateral-app.js","src/unique-quadrilateral-animation.js","src/unique-quadrilateral-math.js","src/unique-quadrilateral-state.js"];

test("Startseite integriert K5.4 genau einmal als vierte Kapitel-5-Karte",()=>{const chapter=files.home.match(/<section\s+id="vierecke"[\s\S]*?<\/section>/)?.[0];assert.ok(chapter);assert.equal((chapter.match(/class="module-card"/g)??[]).length,4);assert.equal((files.home.match(/href="\.\/eindeutige-vierecke\.html"/g)??[]).length,1);assert.match(chapter,/Warum legen manche Angaben ein Viereck eindeutig fest – und andere nicht\?/);assert.match(chapter,/<span class="module-subtitle">Vierecke konstruieren<\/span>/);assert.equal((files.home.match(/class="module-card"/g)??[]).length,27);});

test("Cache v32, Pages und Smoke enthalten exakt die sechs neuen Laufzeitdateien",()=>{assert.match(files.worker,/mathe-unterrichts-app-v32/);assert.doesNotMatch(files.worker,/mathe-unterrichts-app-v30/);for(const file of runtimeFiles){const pattern=new RegExp(file.replaceAll(".","\\."));assert.match(files.worker,pattern);assert.match(files.runtime,pattern);assert.match(files.smoke,pattern);}assert.doesNotMatch(files.worker,/render-unique-quadrilateral-states|unique-quadrilateral-(?:design|static\.test)/);});

test("K5.4-Renderer ist im Paket und Pages-Workflow genau einmal verdrahtet",()=>{assert.equal(packageJson.scripts["test:unique-quadrilateral-visual"],"node scripts/render-unique-quadrilateral-states.mjs");assert.equal((files.workflow.match(/npm run test:unique-quadrilateral-visual/g)??[]).length,1);});
