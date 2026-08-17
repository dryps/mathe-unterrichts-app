import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../terme-multiplizieren.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../term-multiplication.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/term-multiplication-app.js", import.meta.url), "utf8"),
  math: await readFile(new URL("../src/term-multiplication-math.js", import.meta.url), "utf8"),
  state: await readFile(new URL("../src/term-multiplication-state.js", import.meta.url), "utf8"),
  animation: await readFile(new URL("../src/term-multiplication-animation.js", import.meta.url), "utf8"),
};

const runtime = Object.values(files).join("\n");

test("Leitfrage, Untertitel und finale Erkenntnis sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum ist x · x = x² – und nicht 2x\?/);
  assert.match(files.html, /Terme multiplizieren/);
  assert.match(runtime, /2x und x² sind nicht zwei Schreibweisen für dasselbe\./);
});

test("Addition ist eindimensionale Länge, Multiplikation eine Quadratfläche", () => {
  assert.match(files.html, /x \+ x = 2x/);
  assert.match(files.html, /x · x = x²/);
  assert.match(files.html, /Zwei x-Längen/);
  assert.match(files.html, /Seitenlänge x/);
  assert.match(files.html, /id="square-formula" class="state-formula">x · x<\/p>/);
  assert.match(files.html, /id="square-shape"[\s\S]*aria-label="Quadrat mit zwei Seitenlängen x"/);
  assert.match(files.html, /id="square-area-label" class="square-area-label" hidden/);
  assert.match(files.css, /\.addition-segment/);
  assert.match(files.css, /\.square-shape\s*\{[\s\S]*aspect-ratio:\s*1/);
  assert.match(files.css, /\.square-fill/);
});

test("freie Erkundung nutzt genau einen nativen Regler von eins bis fünf", () => {
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 1);
  assert.match(files.html, /id="x-control" type="range" min="1" max="5" step="1" value="3"/);
  assert.match(files.html, /for="x-control"/);
  assert.match(files.app, /addEventListener\("input"/);
});

test("Bedienung ist auf Weiter, Zurücksetzen, Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /← Rechnen mit Termen/);
  assert.match(files.html, /id="term-multiplication-next"/);
  assert.match(files.html, /id="term-multiplication-reset"/);
  assert.match(files.html, /aria-live="polite"/);
  assert.doesNotMatch(files.html, /type="radio"|Antwort auswählen|Punktzahl/);
});

test("jeder Controller-Selektor ist mit dem echten HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("(#[a-z0-9-]+)"\)/g)].map(([, value]) => value);
  assert.ok(selectors.length >= 18);
  for (const selector of selectors) {
    assert.match(files.html, new RegExp(`id="${selector.slice(1)}"`));
  }
});

test("Mathematik, Zustand und Animation bleiben rein und lokal", () => {
  for (const source of [files.math, files.state, files.animation]) {
    assert.doesNotMatch(source, /document|querySelector|localStorage|sessionStorage|indexedDB/);
  }
  assert.doesNotMatch(runtime, /document\.cookie|analytics|telemetry|fetch\(/i);
  assert.doesNotMatch(runtime, /(?:src|href)=["'`]https?:\/\//);
  assert.match(files.app, /register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});

test("Responsive Regeln schützen 320 px, Telefon, iPad und Klassenraum", () => {
  assert.match(files.css, /overflow-x:\s*clip/);
  assert.match(files.css, /min-width:\s*0/);
  assert.match(files.css, /@media \(max-width:\s*760px\)/);
  assert.match(files.css, /@media \(max-width:\s*420px\)/);
  assert.match(files.css, /@media \(max-width:\s*340px\)/);
  assert.match(files.css, /@media \(orientation:\s*portrait\)/);
  assert.match(files.css, /@media \(orientation:\s*landscape\)/);
  assert.match(files.css, /@media \(min-width:\s*1500px\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Sonderfall x = 2 und ausgeschlossene spätere Algebra sind ausdrücklich gesichert", () => {
  assert.match(runtime, /Beide Zahlenwerte sind/);
  assert.match(runtime, /Trotzdem bleibt 2x eine Länge und x² eine Fläche/);
  assert.doesNotMatch(runtime, /Distributivgesetz|Minusklammer|Polynomdivision|Punktzahl|Highscore/);
});

test("PWA-Metadaten und ausschließlich lokale Laufzeitressourcen sind vorhanden", () => {
  assert.match(files.html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(files.html, /apple-mobile-web-app-capable" content="yes"/);
  assert.match(files.html, /apple-touch-icon" sizes="180x180" href="\.\/icon-180\.png"/);
  assert.match(files.html, /src="\.\/src\/term-multiplication-app\.js"/);
  assert.match(files.html, /href="\.\/term-multiplication\.css"/);
});
