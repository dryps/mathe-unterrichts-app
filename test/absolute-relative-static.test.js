import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [html,css,app]=await Promise.all([
  read("../absolut-relativ.html").catch(()=>""),
  read("../absolute-relative.css").catch(()=>""),
  read("../src/absolute-relative-app.js").catch(()=>""),
]);

test("Frage, Untertitel, Beispiel, Vergleiche und Aha sind wortgetreu",()=>{
  assert.match(html,/Wie kann die kleinere Anzahl trotzdem der größere Anteil sein\?/);
  assert.match(html,/Absolut und relativ/);
  assert.match(html,/6 von 50/);
  assert.match(html,/5 von 40/);
  assert.match(html,/6 &gt; 5/);
  assert.match(html,/12 % &lt; 12,5 %/);
  assert.match(html,/Absolute Anzahl und relativer Anteil beantworten unterschiedliche Fragen\./);
});

test("alle Folgerungen und die Erkundung sind initial echt hidden",()=>{
  for(const id of ["ar-absolute","ar-normalize","ar-relative","ar-explore","ar-conclusion"]) assert.match(html,new RegExp(`id="${id}"[^>]*hidden`));
  assert.match(css,/\[hidden\]\{display:none!important\}/);
});

test("Normalisierung zeigt dieselbe Bezugsgröße ohne den relativen Vergleich vorwegzunehmen",()=>{
  assert.match(html,/Gemeinsame Bezugsgröße: 200/);
  assert.match(html,/aria-label="Gruppe A normalisiert: 24 von 200\."/);
  assert.match(html,/aria-label="Gruppe B normalisiert: 25 von 200\."/);
  const normalize=html.match(/id="ar-normalize"[\s\S]*?<\/section>/)?.[0];
  assert.ok(normalize);
  assert.doesNotMatch(normalize,/Prozent/);
  assert.match(html,/id="ar-relative"[^>]*hidden[\s\S]*?12 % &lt; 12,5 %/);
});

test("Controller synchronisiert die freie Erkundung aus einem Modell",()=>{
  assert.match(app,/scaleInput\.setAttribute\("aria-label",model\.sliderAriaLabel\)/);
  assert.match(app,/scaleInput\.setAttribute\("aria-valuetext",model\.sliderValueText\)/);
  assert.match(app,/leftExploreLabel\.textContent=model\.left\.label/);
  assert.match(app,/rightExploreLabel\.textContent=model\.right\.label/);
  assert.match(app,/leftExploreTrack\.style\.width=`\$\{model\.left\.percent\}%`/);
  assert.match(app,/rightExploreTrack\.style\.width=`\$\{model\.right\.percent\}%`/);
  assert.match(app,/scaleInput\.addEventListener\("input"/);
});

test("Reset, Kontrast, Datenschutz, Offline und Responsive sind abgesichert",()=>{
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
