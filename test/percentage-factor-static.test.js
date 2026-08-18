import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [html,css,app]=await Promise.all([read("../prozent-als-faktor.html").catch(()=>""),read("../percentage-factor.css").catch(()=>""),read("../src/percentage-factor-app.js").catch(()=>"")]);

test("Frage, Untertitel, Transformation und Aha sind exakt",()=>{
  assert.match(html,/Warum ist 25 % dasselbe wie 0,25\?/);
  assert.match(html,/Prozent als Faktor/);
  for(const text of ["25 %","25 / 100","1 / 4","0,25","0,25 · 80 = 20","Ein Prozentsatz lässt sich als Dezimalfaktor ausdrücken."]) assert.ok(html.includes(text),text);
  assert.match(html,/nicht 25 · 80/);
});

test("alle späteren Erkenntnisse sind initial echt verborgen",()=>{
  for(const id of ["pf-hundredth","pf-reduced","pf-decimal","pf-product","pf-warning","pf-explore","pf-conclusion"]) assert.match(html,new RegExp(`id="${id}"[^>]*hidden`));
  assert.match(css,/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

test("Modul bleibt lokal, speicherfrei, responsiv und Reduced-Motion-fähig",()=>{
  assert.match(html,/lokal · ohne Speicherung/);
  assert.doesNotMatch(html+app,/(?:localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|https?:\/\/)/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/@media\(min-width:721px\) and \(max-width:1040px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(app,/serviceWorker\.register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});
