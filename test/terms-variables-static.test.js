import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../terme-variablen.html", import.meta.url), "utf8");
const css = await readFile(new URL("../terms-variables.css", import.meta.url), "utf8");

test("Leitfrage, Untertitel und Irritation nennen ausschließlich den festen Term", () => {
  assert.match(html, /<title>Wie kann sich x ändern, obwohl der Term derselbe bleibt\?<\/title>/);
  assert.match(html, /<h1>Wie kann sich x ändern, obwohl der Term derselbe bleibt\?<\/h1>/);
  assert.match(html, /<p class="terms-subtitle">Variablen und Terme<\/p>/);
  assert.match(html, /id="terms-expression"[^>]*>2x \+ 3<\/p>/);
  assert.match(html, /Ist das eine Zahl – oder beschreibt der Term etwas\?/);
  assert.doesNotMatch(html, /x ist eine unbekannte Zahl/i);
});

test("die algebraische Struktur besteht statisch aus genau zwei x- und drei Einer-Bausteinen", () => {
  assert.equal((html.match(/data-term-block="x"/g) ?? []).length, 2);
  assert.equal((html.match(/data-term-block="unit"/g) ?? []).length, 3);
  assert.match(html, /id="terms-x-block-value-a"/);
  assert.match(html, /id="terms-x-block-value-b"/);
  assert.match(html, /Der Term besteht aus zweimal x und drei Einern\./);
  assert.match(css, /\.terms-x-block[\s\S]*min-height:/);
  assert.match(css, /\.terms-unit-block[\s\S]*aspect-ratio:\s*1/);
});

test("Einsetzung, Vergleich und Abschluss sind semantisch vorhanden aber anfangs verborgen", () => {
  assert.match(html, /id="terms-substituted"[^>]*>2 · 1 \+ 3 = 5<\/p>/);
  assert.match(html, /id="terms-expanded"[^>]*>1 \+ 1 \+ 3 = 5<\/p>/);
  assert.equal((html.match(/data-comparison-x="[123]"/g) ?? []).length, 3);
  assert.equal((html.match(/class="comparison-expression">2x \+ 3<\/span>/g) ?? []).length, 3);
  assert.match(html, /id="terms-comparison"[^>]*hidden/);
  assert.match(html, /id="terms-exploration"[^>]*hidden/);
  assert.match(html, /id="terms-conclusion"[^>]*hidden/);
  assert.match(
    html,
    /2x \+ 3 bleibt derselbe Term\. Wenn x sich ändert, ändert sich sein Wert\./,
  );
});

test("Bedienung bleibt auf Weiter, Reset, Rücklink und den nativen x-Regler begrenzt", () => {
  assert.equal((html.match(/<button/g) ?? []).length, 2);
  assert.match(html, /id="terms-next"[^>]*>Weiter<\/button>/);
  assert.match(html, /id="terms-reset"[^>]*>Zurücksetzen<\/button>/);
  assert.match(html, /href="\.\/#rechnen-mit-termen"[^>]*>← Rechnen mit Termen<\/a>/);
  assert.match(
    html,
    /id="terms-x-slider"[\s\S]*type="range"[\s\S]*min="0"[\s\S]*max="5"[\s\S]*step="1"[\s\S]*value="3"/,
  );
  assert.doesNotMatch(html, /type="number"|Quiz|Aufgabe|Bewertung|Koeffizient verändern/);
});

test("Zugänglichkeit beschreibt Status, Slider und reduzierte Bewegung", () => {
  assert.match(html, /id="terms-board"[\s\S]*aria-labelledby=/);
  assert.match(html, /id="terms-x-slider"[\s\S]*aria-valuetext=/);
  assert.match(html, /id="terms-live"[\s\S]*aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("Zustand vier erhält eine ruhige rein präsentative Wertanimation", () => {
  assert.match(css, /\[data-state="changing"\][\s\S]*animation:\s*terms-value-change/);
  assert.match(css, /@keyframes terms-value-change/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*animation-duration:\s*0\.01ms/);
});

test("responsive Regeln schützen Hochformat, Querformat, kleine Breite und Klassenraum", () => {
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(max-width:\s*520px\)/);
  assert.match(css, /@media \(orientation:\s*landscape\)/);
  assert.match(css, /@media \(min-width:\s*1500px\)/);
  assert.match(css, /min-width:\s*0/);
  assert.match(css, /max-width:\s*100%/);
  assert.doesNotMatch(css, /overflow:\s*visible/);
});

test("Modul bleibt standalone, lokal und frei von ausgeschlossenen Metaphern", () => {
  const runtime = `${html}\n${css}`;
  assert.doesNotMatch(runtime, /<canvas|Zahlengerade|Waage|Schulden|Temperatur|Aufzug/i);
  assert.doesNotMatch(runtime, /(?:src|href)=["'`]https?:\/\//);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.match(html, /src="\.\/src\/terms-variables-app\.js"/);
  assert.doesNotMatch(html, /serviceWorker|sw\.js/);
});
