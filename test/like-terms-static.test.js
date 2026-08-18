import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../gleichartige-terme.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../like-terms.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/like-terms-app.js", import.meta.url), "utf8"),
  math: await readFile(new URL("../src/like-terms-math.js", import.meta.url), "utf8"),
  state: await readFile(new URL("../src/like-terms-state.js", import.meta.url), "utf8"),
  animation: await readFile(new URL("../src/like-terms-animation.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  pagesRuntime: await readFile(new URL("../scripts/pages-runtime-files.mjs", import.meta.url), "utf8"),
  smoke: await readFile(new URL("../scripts/smoke.mjs", import.meta.url), "utf8"),
  workflow: await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
};
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("Irritation zeigt beide Terme und ausschließlich eine offene Frage", () => {
  assert.match(files.html, /3x \+ 2x/);
  assert.match(files.html, /3x \+ 2/);
  assert.match(files.html, /Warum kann ich nur einen dieser Terme weiter zusammenfassen\?/);
  assert.doesNotMatch(files.html, /Richtig|Falsch|Antwort auswählen|type="radio"/);
});

test("algebraische Bausteine unterscheiden x-Rechtecke und Einer-Quadrate", () => {
  assert.match(files.app, /className = `algebra-block \$\{kind === "x" \? "x-block" : "unit-block"\}`/);
  assert.match(files.css, /\.x-block\s*\{[\s\S]*inline-size:/);
  assert.match(files.css, /\.unit-block\s*\{[\s\S]*aspect-ratio:\s*1/);
  assert.doesNotMatch(Object.values(files).join("\n"), /Äpfel|Birnen|Obst|Geld|Euro/);
});

test("alle Erkenntnissätze und der direkte Vergleich sind vorhanden", () => {
  for (const sentence of [
    "Beide Gruppen bestehen aus derselben Art Baustein.",
    "Gleichartige Terme lassen sich zusammenfassen.",
    "x-Bausteine und Einer sind nicht gleichartig.",
    "Zusammenfassen bedeutet: gleiche Arten zählen.",
    "Nur Gleichartiges kann zusammengefasst werden.",
    "x-Bausteine mit x-Bausteinen, Einer mit Einern.",
  ]) {
    assert.match(Object.values(files).join("\n"), new RegExp(sentence.replace(".", "\\.")));
  }
  assert.match(files.html, /id="like-terms-comparison"/);
  assert.match(files.html, /id="compare-like-blocks"/);
  assert.match(files.html, /id="compare-x-blocks"/);
  assert.match(files.html, /id="compare-one-blocks"/);
});

test("freie Erkundung verwendet genau zwei native Regler von eins bis vier", () => {
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 2);
  assert.equal((files.html.match(/min="1" max="4" step="1"/g) ?? []).length, 2);
  assert.match(files.html, /for="first-coefficient"/);
  assert.match(files.html, /for="second-coefficient"/);
  assert.match(files.app, /addEventListener\("input"/);
  assert.doesNotMatch(files.html, /Einer statt x|type="checkbox"|Umschalter/);
});

test("jeder Controller-Selektor ist mit dem echten HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("(#[a-z0-9-]+)"\)/g)].map(
    ([, selector]) => selector,
  );
  assert.ok(selectors.length > 20);
  for (const selector of selectors) {
    assert.match(files.html, new RegExp(`id="${selector.slice(1)}"`));
  }
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, zwei Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /← Rechnen mit Termen/);
  assert.match(files.html, /id="like-terms-next"/);
  assert.match(files.html, /id="like-terms-reset"/);
  assert.match(files.html, /aria-live="polite"/);
});

test("Mathematik, Zustand und Animation bleiben frei von DOM und Speicherung", () => {
  for (const source of [files.math, files.state, files.animation]) {
    assert.doesNotMatch(source, /document|querySelector|localStorage|sessionStorage|indexedDB/);
  }
  assert.doesNotMatch(
    [files.html, files.css, files.app, files.math, files.state, files.animation].join("\n"),
    /document\.cookie|analytics|telemetry|fetch\(/i,
  );
});

test("Responsive Regeln schützen kleine Breite, Hochformat, Querformat und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width:\s*760px\)/);
  assert.match(files.css, /@media \(max-width:\s*420px\)/);
  assert.match(files.css, /@media \(max-width:\s*340px\)/);
  assert.match(files.css, /@media \(orientation:\s*portrait\)/);
  assert.match(files.css, /@media \(orientation:\s*landscape\)/);
  assert.match(files.css, /@media \(min-width:\s*1500px\)/);
  assert.match(files.css, /overflow-x:\s*clip/);
  assert.match(files.css, /min-width:\s*0/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("acht x-Bausteine bleiben bei 320 und 341 Pixeln schmal und länglich", () => {
  assert.match(
    files.css,
    /@media \(max-width:\s*420px\)[\s\S]*?\.x-block\s*\{[\s\S]*?inline-size:\s*2rem;[\s\S]*?block-size:\s*1\.6rem;/,
  );
  assert.match(
    files.css,
    /@media \(max-width:\s*420px\)[\s\S]*?\.unit-block\s*\{[\s\S]*?inline-size:\s*1\.55rem;[\s\S]*?block-size:\s*1\.55rem;/,
  );
  assert.match(
    files.css,
    /@media \(max-width:\s*340px\)[\s\S]*?\.x-block\s*\{[\s\S]*?inline-size:\s*1\.75rem;[\s\S]*?block-size:\s*1\.45rem;/,
  );
  assert.match(
    files.css,
    /@media \(max-width:\s*340px\)[\s\S]*?\.unit-block\s*\{[\s\S]*?inline-size:\s*1\.4rem;[\s\S]*?block-size:\s*1\.4rem;/,
  );
});

test("iPad-Hochformat stapelt die beiden Vierergruppen vor dem Überlauf", () => {
  assert.match(
    files.css,
    /@media \(max-width:\s*820px\)[\s\S]*?\.explore-summands\s*\{[\s\S]*?flex-direction:\s*column;/,
  );
});

test("Modul bleibt lokal und behandelt weder Termwert noch spätere Algebra", () => {
  const runtime = [files.html, files.css, files.app, files.math, files.state, files.animation].join("\n");
  assert.doesNotMatch(runtime, /(?:src|href)=["'`]https?:\/\//);
  assert.doesNotMatch(
    runtime,
    /x²|x\^2|xy|negativen Koeffizienten|setze x|(?:^|[^0-9A-Za-z])x\s*=\s*\d/i,
  );
  assert.match(files.html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(files.html, /apple-mobile-web-app-capable" content="yes"/);
  assert.match(files.html, /apple-touch-icon" sizes="180x180" href="\.\/icon-180\.png"/);
  assert.match(files.app, /register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});

test("Produktionsgates enthalten ausschließlich die sechs Laufzeitdateien und den Renderer", () => {
  for (const file of [
    "gleichartige-terme.html",
    "like-terms.css",
    "src/like-terms-app.js",
    "src/like-terms-math.js",
    "src/like-terms-state.js",
    "src/like-terms-animation.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
    assert.match(files.pagesRuntime, new RegExp(file.replaceAll(".", "\\.")));
    assert.match(files.smoke, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v44/);
  assert.equal(
    packageJson.scripts["test:like-terms-visual"],
    "node scripts/render-like-terms-states.mjs",
  );
  assert.match(files.workflow, /npm run test:like-terms-visual/);
  assert.doesNotMatch(files.worker, /like-terms-(?:design|static\.test)|render-like-terms-states/);
  assert.doesNotMatch(files.pagesRuntime, /like-terms-(?:design|static\.test)|render-like-terms-states/);
});
