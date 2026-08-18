import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PAGES_RUNTIME_FILES } from "../scripts/pages-runtime-files.mjs";

const root = new URL("../", import.meta.url);
const htmlFiles = [
  "index.html",
  "zahlengerade.html",
  "ordnung.html",
  "betrag.html",
  "addition-negativ.html",
  "subtraktion-negativ.html",
  "multiplikation-negativ.html",
  "terme-variablen.html",
  "gleichartige-terme.html",
  "terme-multiplizieren.html",
  "terme-dividieren.html",
  "plus-minus-klammern.html",
  "ausmultiplizieren.html",
  "aequivalenzumformungen.html",
  "terme-beide-seiten.html",
  "ungleichungen-negativ.html",
  "loesungsmengen.html",
  "eigenschaften-statt-optik.html",
  "haus-der-vierecke.html",
  "viereck-winkelsumme.html",
  "eindeutige-vierecke.html",
  "zuordnungen-darstellen.html",
  "proportionale-zuordnungen.html",
  "proportionaler-dreisatz.html",
  "antiproportionale-zuordnungen.html",
  "modellwahl.html",
  "prozent-als-anteil.html",
  "absolut-relativ.html",
  "grundwert-prozentwert-prozentsatz.html",
  "winkelsumme.html",
  "dreiecksungleichung.html",
  "dreiecksflaeche.html",
  "mittelsenkrechten.html",
  "winkelhalbierende.html",
  "eindeutige-dreiecke.html",
];
const moduleFiles = htmlFiles.slice(1);

const read = (path) => readFile(new URL(path, root), "utf8");

test("Pages-Artefakt ist eine explizite Freigabeliste ohne interne Dateien", () => {
  assert.equal(new Set(PAGES_RUNTIME_FILES).size, PAGES_RUNTIME_FILES.length);
  for (const path of PAGES_RUNTIME_FILES) {
    assert.doesNotMatch(path, /^(?:test|scripts|docs|\.github)\//);
    assert.doesNotMatch(path, /(?:^|\/)README|\.map$/);
  }
  for (const file of htmlFiles) assert.equal(PAGES_RUNTIME_FILES.includes(file), true, file);
});

test("alle vierunddreißig direkten Modulpfade und ihre Rücklinks bleiben projektpfadrelativ", async () => {
  assert.equal(moduleFiles.length,34);
  for (const file of moduleFiles) {
    const html = await read(file);
    assert.match(html, /class="module-back-link" href="\.\/#(?:rationale-zahlen|dreiecke|rechnen-mit-termen|gleichungen-ungleichungen|vierecke|zuordnungen|prozentrechnung)"/);
    assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
  }
});

test("Manifest und iPad-Metadaten sind vollständig", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.name, "Mathe im Unterricht");
  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "any");

  for (const file of htmlFiles) {
    const html = await read(file);
    assert.match(html, /viewport-fit=cover/);
    assert.match(html, /apple-mobile-web-app-capable" content="yes"/);
    assert.match(html, /apple-mobile-web-app-title" content="Mathe im Unterricht"/);
    assert.match(html, /apple-touch-icon" sizes="180x180" href="\.\/icon-180\.png"/);
  }
});

test("Suchmaschinensperre ist auf jeder Seite und in robots.txt vorhanden", async () => {
  for (const file of [...htmlFiles, "404.html"]) {
    assert.match(
      await read(file),
      /name="robots" content="noindex, nofollow, noarchive, nosnippet"/,
    );
  }
  assert.equal(await read("robots.txt"), "User-agent: *\nDisallow: /\n");
});

test("jeder Einstieg registriert den Worker explizit im Projekt-Scope ohne HTTP-Cache", async () => {
  const scripts = [
    "src/shell.js",
    "src/number-line-app.js",
    "src/order-number-line-app.js",
    "src/absolute-value-app.js",
    "src/addition-negative-app.js",
    "src/subtraction-negative-app.js",
    "src/multiplication-negative-app.js",
    "src/terms-variables-app.js",
    "src/like-terms-app.js",
    "src/term-multiplication-app.js",
    "src/term-division-app.js",
    "src/bracket-sign-app.js",
    "src/distribution-app.js",
    "src/equivalence-app.js",
    "src/both-sides-app.js",
    "src/negative-inequality-app.js",
    "src/solution-set-app.js",
    "src/quadrilateral-properties-app.js",
    "src/quadrilateral-house-app.js",
    "src/quadrilateral-angle-sum-app.js",
    "src/unique-quadrilateral-app.js",
    "src/assignment-representations-app.js",
    "src/proportional-comparison-app.js",
    "src/proportional-rule-three-app.js",
    "src/inverse-assignment-app.js",
    "src/model-choice-app.js",
    "src/percentage-share-app.js",
    "src/absolute-relative-app.js",
    "src/percentage-roles-app.js",
    "src/app.js",
    "src/triangle-inequality-app.js",
    "src/triangle-area-app.js",
    "src/circumcircle-app.js",
    "src/incircle-app.js",
    "src/unique-triangles-app.js",
  ];
  for (const file of scripts) {
    const source = await read(file);
    assert.match(source, /register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
  }
});

test("Service Worker schützt Update, Redirects, Fehlerseiten und Navigation", async () => {
  const worker = await read("sw.js");
  assert.match(worker, /mathe-unterrichts-app-v39/);
  assert.match(worker, /cache: "reload"/);
  assert.match(worker, /redirect: "error"/);
  assert.match(worker, /!response\.ok \|\| response\.redirected/);
  assert.match(worker, /event\.request\.mode === "navigate"/);
  assert.match(worker, /NAVIGATION_FALLBACK/);
  assert.match(worker, /names\.filter\(\(name\) => name !== CACHE_NAME\)/);
});

test("Workflow reagiert nur auf main oder manuell und besitzt minimale Rechte", async () => {
  const workflow = await read(".github/workflows/pages.yml");
  assert.match(workflow, /push:\n    branches:\n      - main/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request|schedule:/);
  assert.match(workflow, /permissions:\n  contents: read\n  pages: write\n  id-token: write/);
  assert.doesNotMatch(workflow, /secrets\./);
  for (const action of [
    "actions/checkout@v6",
    "actions/setup-node@v6",
    "actions/configure-pages@v5",
    "actions/upload-pages-artifact@v4",
    "actions/deploy-pages@v4",
  ]) {
    assert.match(workflow, new RegExp(action.replace("/", "\\/")));
  }
  assert.match(workflow, /npm run test:terms-visual/);
  assert.match(workflow, /npm run test:like-terms-visual/);
  assert.match(workflow, /npm run test:term-multiplication-visual/);
  assert.match(workflow, /npm run test:equivalence-visual/);
  assert.match(workflow, /npm run test:both-sides-visual/);
  assert.match(workflow, /npm run test:negative-inequality-visual/);
  assert.match(workflow, /npm run test:solution-set-visual/);
  assert.match(workflow, /npm run test:quadrilateral-properties-visual/);
  assert.match(workflow, /npm run test:quadrilateral-house-visual/);
  assert.match(workflow, /npm run test:quadrilateral-angle-sum-visual/);
  assert.match(workflow, /npm run test:unique-quadrilateral-visual/);
  assert.match(workflow, /npm run test:assignment-representations-visual/);
  assert.match(workflow, /npm run test:proportional-comparison-visual/);
  assert.match(workflow, /npm run test:proportional-rule-three-visual/);
  assert.match(workflow, /npm run test:inverse-assignment-visual/);
});
