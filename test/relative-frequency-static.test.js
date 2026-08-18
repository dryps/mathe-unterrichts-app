import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css, app] = await Promise.all([
  read("../relative-haeufigkeit.html").catch(() => ""),
  read("../relative-frequency.css").catch(() => ""),
  read("../src/relative-frequency-app.js").catch(() => ""),
]);

test("Frage, Untertitel und verbindlicher Aha sind wortgetreu", () => {
  assert.match(html, /Warum bedeutet Wahrscheinlichkeit 1\/6 nicht, dass genau jeder sechste Wurf eine Sechs ist\?/);
  assert.match(html, /<p class="subtitle">Relative Häufigkeit<\/p>/);
  assert.match(html, /Wahrscheinlichkeit beschreibt langfristiges Verhalten, keinen festen Einzelrhythmus\./);
});

test("vier Checkpoints, Erkundung und Schluss sind initial echt hidden", () => {
  for (const id of ["rh-chart-card", "rh-row-10", "rh-row-100", "rh-row-1000", "rh-row-10000", "rh-explore", "rh-conclusion"]) {
    assert.match(html, new RegExp(`id="${id}"[\\s\\S]{0,140}?hidden`));
  }
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

test("Graph erklärt Verzehnfachungsstufen und trennt Referenzlinie von Messwerten", () => {
  assert.match(html, /class="chart-scroll"/);
  assert.match(html, /Seitlich wischen für alle vier Stufen/);
  assert.match(html, /jeweils zehnmal so viele Würfe/);
  assert.match(html, /1\/6 ≈ 16,7 %/);
  assert.match(html, /class="reference-line"/);
  assert.match(html, /class="rh-line"/);
  assert.equal((html.match(/class="rh-point"/g) ?? []).length, 4);
  assert.match(css, /\.chart-scroll\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.rh-chart\s*\{[^}]*width:\s*520px/s);
});

test("Controller synchronisiert Tabelle, Graph, Regler und zugänglichen Namen", () => {
  assert.match(app, /slider\.setAttribute\("aria-valuetext", model\.sliderValueText\)/);
  assert.match(app, /slider\.setAttribute\("aria-label", `Versuchsreihe erkunden: \$\{model\.sliderValueText\}`\)/);
  assert.match(app, /chart\.setAttribute\("aria-label", model\.chartAriaLabel\)/);
  assert.match(app, /point\.toggleAttribute\("hidden", !checkpoint\.visible\)/);
  assert.match(app, /point\.classList\.toggle\("is-selected"/);
});

test("Modul bleibt lokal, responsiv und frei von behaupteter Monotonie", () => {
  assert.match(html, /class="module-back-link" href="\.\/#wahrscheinlichkeit"/);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.doesNotMatch(`${html}\n${app}`, /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|https?:\/\//);
  assert.doesNotMatch(html, /immer näher|stetig|monoton/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(min-width: 721px\) and \(max-width: 1040px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(app, /register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});
