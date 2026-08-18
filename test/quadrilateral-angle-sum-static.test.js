import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css] = await Promise.all([
  read("../viereck-winkelsumme.html").catch(() => ""),
  read("../quadrilateral-angle-sum.css").catch(() => ""),
]);

test("Frage, Untertitel und freigegebene Kernformulierungen sind exakt vorhanden", () => {
  assert.match(html, /Warum sind es im Viereck immer 360°\?/);
  assert.match(html, /Winkelsumme im Viereck/);
  assert.match(html, /180° \+ 180° = 360°/);
  assert.match(html, /Einzelwinkel ändern sich, Summe bleibt\./);
});

test("die Seite enthält semantische, zunächst verborgene Reveal-Gruppen", () => {
  assert.match(html, /id="quadrilateral-diagonal"[^>]*hidden/);
  assert.match(html, /id="quadrilateral-triangles"[^>]*hidden/);
  assert.match(html, /id="quadrilateral-angle-labels"[^>]*hidden/);
  assert.match(html, /id="quadrilateral-equation"[^>]*hidden/);
  assert.match(html, /id="quadrilateral-explore"[^>]*hidden/);
  assert.match(html, /id="quadrilateral-conclusion"[^>]*hidden/);
});

test("Datenschutz, lokale Laufzeit, Navigation und iPad-Regeln sind vorhanden", () => {
  assert.match(html, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.match(html, /href="\.\/#vierecke"/);
  assert.match(html, /src="\.\/src\/quadrilateral-angle-sum-app\.js"/);
  assert.doesNotMatch(html + css, /https?:\/\//);
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(css, /@media\(min-width:721px\) and \(max-width:1040px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});
