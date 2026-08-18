import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [html,css,app]=await Promise.all([
  read("../grundwert-prozentwert-prozentsatz.html").catch(()=>""),
  read("../percentage-roles.css").catch(()=>""),
  read("../src/percentage-roles-app.js").catch(()=>""),
]);

test("Frage, Untertitel, drei Rollen und Aha sind wortgetreu",()=>{
  assert.match(html,/Warum sind Grundwert, Prozentwert und Prozentsatz keine drei verschiedenen Themen\?/);
  assert.match(html,/Grundwert · Prozentwert · Prozentsatz/);
  assert.match(html,/Ganzes/);
  assert.match(html,/markierter Teil/);
  assert.match(html,/Verhältnis/);
  assert.match(html,/Drei Rollen derselben Beziehung\./);
});

test("Rollen, Beziehung, Erkundung und Aha sind initial echt hidden",()=>{
  for(const id of ["pr-whole-caption","pr-part-caption","pr-whole","pr-part","pr-rate","pr-relation","pr-explore","pr-conclusion"]) assert.match(html,new RegExp(`id="${id}"[^>]*hidden`));
  assert.match(css,/\[hidden\]\{display:none!important\}/);
});

test("Controller aktualisiert Diagramm, Rollen, Formel und zugängliche Namen aus einem Modell",()=>{
  assert.match(app,/diagram\.setAttribute\("aria-label",model\.diagramAriaLabel\)/);
  assert.match(app,/roleValue\.textContent=role\.valueText/);
  assert.match(app,/equation\.textContent=model\.equation/);
  assert.match(app,/scenarioInput\.setAttribute\("aria-valuetext",model\.sliderValueText\)/);
  assert.match(app,/unknownButtons\.forEach/);
});

test("Reset, Datenschutz, Offline, Kontrast und Responsive sind abgesichert",()=>{
  assert.match(app,/animationToken \+= 1/);
  assert.match(app,/prefers-reduced-motion: reduce/);
  assert.match(app,/token!==animationToken/);
  assert.match(app,/register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
  assert.match(html,/lokal · ohne Speicherung/);
  assert.match(html,/href="\.\/#prozentrechnung"/);
  assert.doesNotMatch(html+css,/https?:\/\//);
  assert.match(css,/\.primary-button\{[^}]*background:#a65b1d[^}]*color:#fff/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/@media\(min-width:721px\) and \(max-width:1040px\)/);
});
