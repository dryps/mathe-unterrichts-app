import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css, app] = await Promise.all([
  read("../laplace-wahrscheinlichkeit.html").catch(() => ""),
  read("../laplace.css").catch(() => ""),
  read("../src/laplace-app.js").catch(() => ""),
]);

test("Frage, Untertitel und verbindlicher Aha sind wortgetreu", () => {
  assert.match(html, /Warum funktioniert „günstig durch möglich“ nur bei gleich wahrscheinlichen Ergebnissen\?/);
  assert.match(html, /<p class="subtitle">Laplace-Wahrscheinlichkeit<\/p>/);
  assert.match(html, /Reines Zählen funktioniert nur bei gleich wahrscheinlichen Elementarereignissen\./);
  assert.match(html, /Nur dann gilt P\(E\) = Anzahl günstiger Ergebnisse \/ Anzahl möglicher Ergebnisse\./);
});

test("Zählung, Feldgrößen, Wahrscheinlichkeiten, Erkundung und Schluss sind initial echt hidden", () => {
  for (const id of ["lp-count", "lp-areas", "lp-probability", "lp-explore", "lp-conclusion"]) {
    assert.match(html, new RegExp(`id="${id}"[\\s\\S]{0,120}?hidden`));
  }
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(html, /id="lp-equal-heading">vier beschriftete Ergebnisse<\/h2>/);
  assert.match(html, /id="lp-unequal-heading">vier beschriftete Ergebnisse<\/h2>/);
  assert.doesNotMatch(html, /class="pointer"/);
});

test("Controller synchronisiert Auswahl, Radnamen und Markierungen aus einem Modell", () => {
  assert.match(app, /slider\.setAttribute\("aria-valuetext", model\.sliderValueText\)/);
  assert.match(app, /slider\.setAttribute\("aria-label", `Ergebnis vergleichen: \$\{model\.sliderValueText\}`\)/);
  assert.match(app, /equalWheel\.setAttribute\("aria-label", model\.equalAriaLabel\)/);
  assert.match(app, /unequalWheel\.setAttribute\("aria-label", model\.unequalAriaLabel\)/);
  assert.match(app, /equalHeading\.textContent = model\.equalHeading/);
  assert.match(app, /unequalHeading\.textContent = model\.unequalHeading/);
  assert.match(app, /model\.displayUnequalSegments/);
  assert.match(app, /segment\.classList\.toggle\("is-selected", Number\(segment\.dataset\.result\) === model\.selectedResult\)/);
});

test("Modul bleibt lokal, responsiv, offline und ohne K8.4-Vorgriff", () => {
  assert.match(html, /class="module-back-link" href="\.\/#wahrscheinlichkeit"/);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.doesNotMatch(`${html}\n${app}`, /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|https?:\/\//);
  assert.doesNotMatch(`${html}\n${app}`, /10\.000 Würfe|relative Häufigkeit|Simulation/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(min-width: 721px\) and \(max-width: 1040px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(app, /register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});
