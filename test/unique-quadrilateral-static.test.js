import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css] = await Promise.all([read("../eindeutige-vierecke.html").catch(() => ""), read("../unique-quadrilateral.css").catch(() => "")]);

test("Frage, Untertitel und fachliche Formulierungen sind verbindlich vorhanden", () => {
  assert.match(html, /Warum legen manche Angaben ein Viereck eindeutig fest – und andere nicht\?/);
  assert.match(html, /Vierecke konstruieren/);
  assert.match(html, /Figur bleibt beweglich\./);
  assert.match(html, /Figur wird festgelegt\./);
  assert.match(html, /Nicht die Anzahl, sondern die Unabhängigkeit der Angaben legt die Figur fest\./);
});

test("die ausgeschlossene Behauptung wird nicht als Regel verbreitet", () => {
  assert.doesNotMatch(html, /Fünf beliebige Angaben reichen immer/);
});

test("Reveal-Gruppen sind semantisch und anfangs hidden", () => {
  assert.match(html, /id="unique-parallel-markers"[^>]*hidden/);
  assert.match(html, /id="unique-equal-markers"[^>]*hidden/);
  assert.match(html, /id="unique-freedom"[^>]*hidden/);
  assert.match(html, /id="unique-independent"[^>]*hidden/);
  assert.match(html, /id="unique-conclusion"[^>]*hidden/);
});

test("Navigation, Datenschutz und responsive iPad-Regeln bleiben lokal", () => {
  assert.match(html, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.match(html, /href="\.\/#vierecke"/);
  assert.match(html, /src="\.\/src\/unique-quadrilateral-app\.js"/);
  assert.doesNotMatch(html + css, /https?:\/\//);
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(css, /@media\(min-width:721px\) and \(max-width:1040px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});
