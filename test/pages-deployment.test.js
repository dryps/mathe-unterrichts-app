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

test("alle sechzehn direkten Modulpfade und ihre Rücklinks bleiben projektpfadrelativ", async () => {
  assert.equal(moduleFiles.length, 16);
  for (const file of moduleFiles) {
    const html = await read(file);
    assert.match(html, /class="module-back-link" href="\.\/#(?:rationale-zahlen|dreiecke|rechnen-mit-termen)"/);
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
  assert.match(worker, /mathe-unterrichts-app-v21/);
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
});
