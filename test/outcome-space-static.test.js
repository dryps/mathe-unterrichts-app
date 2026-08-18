import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css, app] = await Promise.all([read("../ergebnisraum.html").catch(() => ""), read("../outcome-space.css").catch(() => ""), read("../src/outcome-space-app.js").catch(() => "")]);

test("Frage, Untertitel und kanonischer Aha sind wortgetreu", () => {
  for (const text of ["Warum muss der Ergebnisraum vollständig sein, bevor ich eine Wahrscheinlichkeit berechne?", "Ergebnisraum", "Der Nenner basiert auf allen möglichen elementaren Ergebnissen.", "Der Nenner einer Laplace-Wahrscheinlichkeit basiert auf dem vollständigen Ergebnisraum.", "Man darf mögliche Ergebnisse nicht vergessen."]) assert.ok(html.includes(text), text);
});

test("alle Folgerungen und die Sechs sind initial echt hidden", () => {
  for (const id of ["os-wrong", "os-missing", "os-six", "os-correct", "os-conclusion"]) assert.match(html, new RegExp(`id="${id}"[^>]*hidden`));
  assert.match(css, /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/);
});

test("Controller ersetzt den leeren Platz erst im vollständigen Zustand", () => {
  assert.match(app, /placeholder\.hidden=model\.showSix/);
  assert.match(app, /six\.hidden=!model\.showSix/);
  assert.match(app, /card\.classList\.toggle\("is-favorable", model\.favorableResults\.includes\(value\)\)/);
  assert.match(app, /lab\.setAttribute\("aria-label", model\.labAriaLabel\)/);
});

test("Modul bleibt lokal, responsiv, offline und ohne K8.3-Vorgriff", () => {
  assert.match(html, /lokal · ohne Speicherung/);
  assert.match(html, /href="\.\/#wahrscheinlichkeit"/);
  assert.doesNotMatch(html + app, /(localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|https?:\/\/)/);
  assert.doesNotMatch(html + app, /Glücksrad|Simulation|Baumdiagramm|zweistufig/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /@media\s*\(min-width:\s*721px\)\s*and\s*\(max-width:\s*1040px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(app, /serviceWorker\.register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});
