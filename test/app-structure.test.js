import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  home: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  homeCss: await readFile(new URL("../home.css", import.meta.url), "utf8"),
  navigationCss: await readFile(new URL("../navigation.css", import.meta.url), "utf8"),
  shell: await readFile(new URL("../src/shell.js", import.meta.url), "utf8"),
  angles: await readFile(new URL("../winkelsumme.html", import.meta.url), "utf8"),
  inequality: await readFile(new URL("../dreiecksungleichung.html", import.meta.url), "utf8"),
  area: await readFile(new URL("../dreiecksflaeche.html", import.meta.url), "utf8"),
  circumcircle: await readFile(
    new URL("../mittelsenkrechten.html", import.meta.url),
    "utf8",
  ),
  incircle: await readFile(
    new URL("../winkelhalbierende.html", import.meta.url),
    "utf8",
  ),
  unique: await readFile(
    new URL("../eindeutige-dreiecke.html", import.meta.url),
    "utf8",
  ),
  numberLine: await readFile(
    new URL("../zahlengerade.html", import.meta.url),
    "utf8",
  ),
  order: await readFile(new URL("../ordnung.html", import.meta.url), "utf8"),
  absolute: await readFile(new URL("../betrag.html", import.meta.url), "utf8"),
  addition: await readFile(new URL("../addition-negativ.html", import.meta.url), "utf8"),
  subtraction: await readFile(new URL("../subtraktion-negativ.html", import.meta.url), "utf8"),
  multiplication: await readFile(new URL("../multiplikation-negativ.html", import.meta.url), "utf8"),
  terms: await readFile(new URL("../terme-variablen.html", import.meta.url), "utf8"),
  termsApp: await readFile(new URL("../src/terms-variables-app.js", import.meta.url), "utf8"),
  likeTerms: await readFile(new URL("../gleichartige-terme.html", import.meta.url), "utf8"),
  likeTermsApp: await readFile(new URL("../src/like-terms-app.js", import.meta.url), "utf8"),
  termMultiplication: await readFile(new URL("../terme-multiplizieren.html", import.meta.url), "utf8"),
  termMultiplicationApp: await readFile(new URL("../src/term-multiplication-app.js", import.meta.url), "utf8"),
  termDivision: await readFile(new URL("../terme-dividieren.html", import.meta.url), "utf8"),
  termDivisionApp: await readFile(new URL("../src/term-division-app.js", import.meta.url), "utf8"),
  bracketSign: await readFile(new URL("../plus-minus-klammern.html", import.meta.url), "utf8"),
  bracketSignApp: await readFile(new URL("../src/bracket-sign-app.js", import.meta.url), "utf8"),
  distribution: await readFile(new URL("../ausmultiplizieren.html", import.meta.url), "utf8"),
  distributionApp: await readFile(new URL("../src/distribution-app.js", import.meta.url), "utf8"),
  equivalence: await readFile(new URL("../aequivalenzumformungen.html", import.meta.url), "utf8"),
  equivalenceApp: await readFile(new URL("../src/equivalence-app.js", import.meta.url), "utf8"),
  bothSides: await readFile(new URL("../terme-beide-seiten.html", import.meta.url), "utf8"),
  bothSidesApp: await readFile(new URL("../src/both-sides-app.js", import.meta.url), "utf8"),
  negativeInequality: await readFile(new URL("../ungleichungen-negativ.html", import.meta.url), "utf8"),
  negativeInequalityApp: await readFile(new URL("../src/negative-inequality-app.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  manifest: await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"),
};

function mediaBlock(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Media Query fehlt: ${marker}`);
  const end = source.indexOf("\n@media", start + marker.length);
  return source.slice(start, end === -1 ? source.length : end);
}

const portraitTabletCss = mediaBlock(
  files.homeCss,
  "@media (min-width: 721px) and (max-width: 1040px)",
);
const landscapeTabletCss = mediaBlock(
  files.homeCss,
  "@media (orientation: landscape) and (min-width: 900px) and (max-width: 1500px)",
);

test("Startseite zeigt Klasse 7 mit den vier produktiven Kapiteln", () => {
  assert.match(files.home, /<h1>Mathe im Unterricht<\/h1>/);
  assert.match(files.home, /Interaktive Aha-Momente/);
  assert.match(files.home, /<p class="grade-label">Klasse 7<\/p>/);
  assert.equal((files.home.match(/class="chapter(?:\s|")/g) ?? []).length, 4);
  assert.match(files.home, /id="rationale-zahlen"/);
  assert.match(files.home, /<h2 id="rationale-title">1\. Rationale Zahlen<\/h2>/);
  assert.match(files.home, /<h2 id="chapter-title">2\. Dreiecke<\/h2>/);
  assert.match(files.home, /id="rechnen-mit-termen"/);
  assert.match(files.home, /<h2 id="terms-title">3\. Rechnen mit Termen<\/h2>/);
  assert.match(files.home, /id="gleichungen-ungleichungen"/);
  assert.match(files.home, /<h2 id="equations-title">4\. Gleichungen · Ungleichungen<\/h2>/);
  assert.doesNotMatch(files.home, /Private Unterrichts-App|>Kapitel</);
  assert.doesNotMatch(files.home, /Klasse 8|Klasse 9|Klassenauswahl/);
  assert.doesNotMatch(files.home, /<ul|<ol/);
});

test("Kapitel 1 bis 3 enthalten je sechs Module und Kapitel 4 enthält K4.1 bis K4.3", () => {
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 21);
  assert.match(files.home, /href="\.\/zahlengerade\.html"/);
  assert.match(files.home, /Warum liegen negative Zahlen links von der Null\?/);
  assert.match(files.home, /<span class="module-subtitle">Zahlengerade<\/span>/);
  assert.match(files.home, /href="\.\/ordnung\.html"/);
  assert.match(files.home, /Warum ist −8 kleiner als −3\?/);
  assert.match(files.home, /<span class="module-subtitle">Ordnung<\/span>/);
  assert.match(files.home, /href="\.\/betrag\.html"/);
  assert.match(files.home, /Warum wird beim Betrag das Vorzeichen unwichtig\?/);
  assert.match(files.home, /<span class="module-subtitle">Abstand zur Null<\/span>/);
  assert.match(files.home, /href="\.\/addition-negativ\.html"/);
  assert.match(files.home, /Warum ist 3 \+ \(−5\) nicht 8\?/);
  assert.match(files.home, /<span class="module-subtitle">Addition negativer Zahlen<\/span>/);
  assert.match(files.home, /href="\.\/subtraktion-negativ\.html"/);
  assert.match(files.home, /Warum ist 4 − \(−2\) dasselbe wie 4 \+ 2\?/);
  assert.match(files.home, /<span class="module-subtitle">Subtraktion negativer Zahlen<\/span>/);
  assert.match(files.home, /href="\.\/multiplikation-negativ\.html"/);
  assert.match(files.home, /Warum wird aus Minus mal Minus Plus\?/);
  assert.match(files.home, /<span class="module-subtitle">Multiplikation negativer Zahlen<\/span>/);
  assert.match(files.home, /href="\.\/winkelsumme\.html"/);
  assert.match(files.home, /Warum bleiben es immer 180°\?/);
  assert.match(files.home, /<span class="module-subtitle">Winkelsumme<\/span>/);
  assert.match(files.home, /href="\.\/dreiecksungleichung\.html"/);
  assert.match(files.home, /Wann kann überhaupt ein Dreieck entstehen\?/);
  assert.match(files.home, /<span class="module-subtitle">Dreiecksungleichung<\/span>/);
  assert.match(files.home, /href="\.\/dreiecksflaeche\.html"/);
  assert.match(files.home, /Warum wird bei der Dreiecksfläche durch 2 geteilt\?/);
  assert.match(files.home, /<span class="module-subtitle">Flächeninhalt<\/span>/);
  assert.match(files.home, /href="\.\/mittelsenkrechten\.html"/);
  assert.match(files.home, /Warum treffen sich die Mittelsenkrechten genau dort\?/);
  assert.match(
    files.home,
    /<span class="module-subtitle">Mittelsenkrechten und Umkreis<\/span>/,
  );
  assert.match(files.home, /href="\.\/winkelhalbierende\.html"/);
  assert.match(files.home, /Warum treffen sich die Winkelhalbierenden genau dort\?/);
  assert.match(
    files.home,
    /<span class="module-subtitle">Winkelhalbierende und Inkreis<\/span>/,
  );
  assert.match(files.home, /href="\.\/eindeutige-dreiecke\.html"/);
  assert.match(files.home, /Warum reichen manche Angaben aus – und andere nicht\?/);
  assert.match(
    files.home,
    /<span class="module-subtitle">Eindeutige Dreiecke<\/span>/,
  );
  assert.match(files.home, /href="\.\/terme-variablen\.html"/);
  assert.match(files.home, /Wie kann sich x ändern, obwohl der Term derselbe bleibt\?/);
  assert.match(files.home, /<span class="module-subtitle">Variablen und Terme<\/span>/);
  assert.match(files.home, /href="\.\/gleichartige-terme\.html"/);
  assert.match(files.home, /Warum darf ich 3x \+ 2x zu 5x machen – aber 3x \+ 2 nicht\?/);
  assert.match(files.home, /<span class="module-subtitle">Gleichartige Terme<\/span>/);
  assert.match(files.home, /href="\.\/terme-multiplizieren\.html"/);
  assert.match(files.home, /Warum ist x · x = x² – und nicht 2x\?/);
  assert.match(files.home, /<span class="module-subtitle">Terme multiplizieren<\/span>/);
  assert.match(files.home, /href="\.\/terme-dividieren\.html"/);
  assert.match(files.home, /Warum bleibt beim Teilen eines Terms genau das übrig, was nicht weggeteilt wurde\?/);
  assert.match(files.home, /<span class="module-subtitle">Terme dividieren<\/span>/);
  assert.match(files.home, /href="\.\/plus-minus-klammern\.html"/);
  assert.match(files.home, /Warum ändern sich bei einer Minusklammer alle Vorzeichen\?/);
  assert.match(files.home, /href="\.\/ausmultiplizieren\.html"/);
  assert.match(files.home, /href="\.\/aequivalenzumformungen\.html"/);
  assert.match(files.home, /Warum bleibt eine Gleichung wahr, wenn ich auf beiden Seiten dasselbe tue\?/);
  assert.match(files.home, /Warum ist „rüberbringen“ eigentlich keine neue Rechenregel\?/);
  assert.match(files.home, /Warum dreht sich bei einer negativen Zahl das Ungleichheitszeichen um\?/);
  assert.equal((files.home.match(/class="module-status"/g) ?? []).length, 21);
  assert.equal((files.home.match(/fertig/g) ?? []).length, 21);
});

test("Alle Dreiecksmodule behalten ausschließlich ihren bisherigen Rückweg", () => {
  for (const module of [
    files.angles,
    files.inequality,
    files.area,
    files.circumcircle,
    files.incircle,
    files.unique,
  ]) {
    assert.equal((module.match(/class="module-navigation"/g) ?? []).length, 1);
    assert.match(module, /class="module-back-link" href="\.\/#dreiecke">← Dreiecke<\/a>/);
    assert.doesNotMatch(module, /Suche|Einstellungen|Favoriten|Statistik|Anmelden/);
  }
});

test("Alle Module aus Kapitel 1 führen ausschließlich zu Rationale Zahlen zurück", () => {
  for (const module of [files.numberLine, files.order, files.absolute, files.addition, files.subtraction, files.multiplication]) {
    assert.equal((module.match(/class="module-navigation"/g) ?? []).length, 1);
    assert.match(
      module,
      /class="module-back-link" href="\.\/#rationale-zahlen">← Rationale Zahlen<\/a>/,
    );
    assert.doesNotMatch(
      module,
      /Suche|Einstellungen|Favoriten|Statistik|Anmelden/,
    );
  }
});

test("Alle sechs Kapitel-3-Module führen ausschließlich zu Rechnen mit Termen zurück", () => {
  for (const module of [files.terms, files.likeTerms, files.termMultiplication, files.termDivision, files.bracketSign, files.distribution]) {
    assert.equal((module.match(/class="module-navigation"/g) ?? []).length, 1);
    assert.match(
      module,
      /class="module-back-link" href="\.\/#rechnen-mit-termen">← Rechnen mit Termen<\/a>/,
    );
    assert.doesNotMatch(module, /Suche|Einstellungen|Favoriten|Statistik|Anmelden/);
  }
});

test("Kapitel-4-Module führen ausschließlich zu Gleichungen · Ungleichungen zurück", () => {
  for (const module of [files.equivalence, files.bothSides, files.negativeInequality]) {
    assert.equal((module.match(/class="module-navigation"/g) ?? []).length, 1);
    assert.match(module, /class="module-back-link" href="\.\/#gleichungen-ungleichungen">← Gleichungen · Ungleichungen<\/a>/);
    assert.doesNotMatch(module, /Suche|Einstellungen|Favoriten|Statistik|Anmelden/);
  }
});

test("Startseite ist für iPad, Querformat und Klassenraumbildschirm ausgelegt", () => {
  assert.match(files.homeCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(files.homeCss, /@media \(max-width: 720px\)/);
  assert.match(files.homeCss, /@media \(orientation: landscape\)/);
  assert.match(files.homeCss, /width: min\(100%, 1280px\)/);
  assert.match(files.homeCss, /min-height: clamp\(220px, 28vw, 330px\)/);
  assert.match(
    portraitTabletCss,
    /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(files.homeCss, /\.grade-label/);
  assert.match(files.navigationCss, /min-height: 46px/);
  assert.match(files.homeCss, /\.chapter-terms \.module-grid\s*\{\s*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(landscapeTabletCss, /\.chapter-terms \.module-grid\s*\{\s*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(landscapeTabletCss, /\.chapter-terms \.module-card\s*\{\s*grid-column: span 2/);
  assert.equal(JSON.parse(files.manifest).display, "standalone");
  assert.equal(JSON.parse(files.manifest).start_url, "./");
});

test("iPad-Querformat ordnet sechs Karten symmetrisch in zwei Dreierreihen an", () => {
  assert.match(
    landscapeTabletCss,
    /grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/,
  );
  assert.match(landscapeTabletCss, /grid-auto-rows: 1fr/);
  assert.match(landscapeTabletCss, /\.module-card\s*\{[\s\S]*grid-column: span 2/);
  assert.match(
    landscapeTabletCss,
    /\.module-card:nth-child\(4\)\s*\{\s*grid-column: 1 \/ span 2/,
  );
  assert.match(
    landscapeTabletCss,
    /\.module-card:nth-child\(5\)\s*\{\s*grid-column: 3 \/ span 2/,
  );
  assert.match(
    landscapeTabletCss,
    /\.module-card:nth-child\(6\)\s*\{\s*grid-column: 5 \/ span 2/,
  );
});

test("iPad-Querformat ordnet sechs Karten aus Kapitel 1 als drei plus drei an", () => {
  assert.match(
    landscapeTabletCss,
    /\.chapter-rationale \.module-grid\s*\{[\s\S]*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)[\s\S]*grid-auto-rows: 1fr/,
  );
  assert.match(
    landscapeTabletCss,
    /\.chapter-rationale \.module-card\s*\{\s*grid-column: span 2/,
  );
  assert.doesNotMatch(landscapeTabletCss, /\.chapter-rationale \.module-card:nth-child/);
});

test("iPad-Querformat verdichtet Karten und Kopf ohne Texte abzuschneiden", () => {
  assert.match(
    landscapeTabletCss,
    /padding-top: max\(24px, env\(safe-area-inset-top\)\)/,
  );
  assert.match(landscapeTabletCss, /\.home-header\s*\{[\s\S]*margin-bottom: 20px/);
  assert.match(
    landscapeTabletCss,
    /h1\s*\{\s*font-size: clamp\(2\.1rem, 4vw, 3\.4rem\)/,
  );
  assert.match(
    landscapeTabletCss,
    /min-height: clamp\(218px, 22vh, 232px\)/,
  );
  assert.match(
    landscapeTabletCss,
    /padding: clamp\(16px, 1\.7vw, 24px\)/,
  );
  assert.match(
    landscapeTabletCss,
    /\.module-status\s*\{[\s\S]*margin-bottom: clamp\(11px, 1\.4vw, 16px\)/,
  );
  assert.match(
    landscapeTabletCss,
    /\.module-title\s*\{[\s\S]*max-width: none[\s\S]*font-size: clamp\(1\.2rem, 1\.9vw, 1\.7rem\)/,
  );
  assert.match(
    landscapeTabletCss,
    /\.module-subtitle\s*\{[\s\S]*font-size: clamp\(0\.94rem, 1\.35vw, 1\.12rem\)/,
  );
  assert.doesNotMatch(
    landscapeTabletCss,
    /text-overflow|line-clamp|white-space:\s*nowrap|overflow:\s*hidden/,
  );
});

test("Gemeinsamer Offline-Cache enthält Übersicht, Navigation und beide Kapitel", () => {
  for (const file of [
    "index.html",
    "home.css",
    "navigation.css",
    "src/shell.js",
    "winkelsumme.html",
    "styles.css",
    "src/app.js",
    "src/geometry.js",
    "dreiecksungleichung.html",
    "triangle-inequality.css",
    "src/triangle-inequality-app.js",
    "src/triangle-inequality-geometry.js",
    "dreiecksflaeche.html",
    "triangle-area.css",
    "src/triangle-area-app.js",
    "src/triangle-area-animation.js",
    "src/triangle-area-geometry.js",
    "src/triangle-area-state.js",
    "mittelsenkrechten.html",
    "circumcircle.css",
    "src/circumcircle-app.js",
    "src/circumcircle-geometry.js",
    "src/circumcircle-state.js",
    "winkelhalbierende.html",
    "incircle.css",
    "src/incircle-app.js",
    "src/incircle-geometry.js",
    "src/incircle-state.js",
    "eindeutige-dreiecke.html",
    "unique-triangles.css",
    "src/unique-triangles-app.js",
    "src/unique-triangles-animation.js",
    "src/unique-triangles-geometry.js",
    "src/unique-triangles-state.js",
    "zahlengerade.html",
    "number-line.css",
    "src/number-line-app.js",
    "src/number-line-animation.js",
    "src/number-line-geometry.js",
    "src/number-line-state.js",
    "ordnung.html",
    "order-number-line.css",
    "src/order-number-line-app.js",
    "src/order-number-line-animation.js",
    "src/order-number-line-geometry.js",
    "src/order-number-line-state.js",
    "betrag.html",
    "absolute-value.css",
    "src/absolute-value-app.js",
    "src/absolute-value-animation.js",
    "src/absolute-value-geometry.js",
    "src/absolute-value-state.js",
    "addition-negativ.html",
    "addition-negative.css",
    "src/addition-negative-app.js",
    "src/addition-negative-animation.js",
    "src/addition-negative-geometry.js",
    "src/addition-negative-state.js",
    "subtraktion-negativ.html",
    "subtraction-negative.css",
    "src/subtraction-negative-app.js",
    "src/subtraction-negative-animation.js",
    "src/subtraction-negative-geometry.js",
    "src/subtraction-negative-state.js",
    "multiplikation-negativ.html",
    "multiplication-negative.css",
    "src/multiplication-negative-app.js",
    "src/multiplication-negative-animation.js",
    "src/multiplication-negative-geometry.js",
    "src/multiplication-negative-state.js",
    "terme-variablen.html",
    "terms-variables.css",
    "src/terms-variables-app.js",
    "src/terms-variables-math.js",
    "src/terms-variables-state.js",
    "gleichartige-terme.html",
    "like-terms.css",
    "src/like-terms-app.js",
    "src/like-terms-math.js",
    "src/like-terms-state.js",
    "src/like-terms-animation.js",
    "terme-multiplizieren.html",
    "term-multiplication.css",
    "src/term-multiplication-app.js",
    "src/term-multiplication-math.js",
    "src/term-multiplication-state.js",
    "src/term-multiplication-animation.js",
    "terme-dividieren.html",
    "term-division.css",
    "src/term-division-app.js",
    "src/term-division-math.js",
    "src/term-division-state.js",
    "src/term-division-animation.js",
    "plus-minus-klammern.html",
    "bracket-sign.css",
    "src/bracket-sign-app.js",
    "src/bracket-sign-math.js",
    "src/bracket-sign-state.js",
    "src/bracket-sign-animation.js",
    "ausmultiplizieren.html",
    "distribution.css",
    "src/distribution-app.js",
    "src/distribution-math.js",
    "src/distribution-state.js",
    "src/distribution-animation.js",
    "aequivalenzumformungen.html",
    "equivalence.css",
    "src/equivalence-app.js",
    "src/equivalence-math.js",
    "src/equivalence-state.js",
    "src/equivalence-animation.js",
    "terme-beide-seiten.html",
    "both-sides.css",
    "src/both-sides-app.js",
    "src/both-sides-math.js",
    "src/both-sides-state.js",
    "src/both-sides-animation.js",
    "ungleichungen-negativ.html",
    "negative-inequality.css",
    "src/negative-inequality-app.js",
    "src/negative-inequality-math.js",
    "src/negative-inequality-state.js",
    "src/negative-inequality-animation.js",
    "manifest.webmanifest",
    "icon.svg",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.shell, /serviceWorker\.register/);
  assert.match(files.worker, /mathe-unterrichts-app-v26/);
});

test("App-Struktur führt keine Speicherung oder externen Laufzeitaufrufe ein", () => {
  const runtime = [
    files.home,
    files.homeCss,
    files.navigationCss,
    files.shell,
    files.angles,
    files.inequality,
    files.area,
    files.circumcircle,
    files.incircle,
    files.unique,
    files.numberLine,
    files.order,
    files.absolute,
    files.addition,
    files.subtraction,
    files.multiplication,
    files.terms,
    files.termsApp,
    files.likeTerms,
    files.likeTermsApp,
    files.termMultiplication,
    files.termMultiplicationApp,
    files.termDivision,
    files.termDivisionApp,
    files.equivalence,
    files.equivalenceApp,
    files.bothSides,
    files.bothSidesApp,
    files.negativeInequality,
    files.negativeInequalityApp,
    files.worker,
  ].join("\n");
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
