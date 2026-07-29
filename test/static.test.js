import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../winkelsumme.html", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/app.js", import.meta.url), "utf8"),
  css: await readFile(new URL("../styles.css", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  manifest: await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"),
};

test("Oberfläche enthält Dreieck, drei große Ziehziele, Summe und Reset", () => {
  assert.match(files.html, /id="triangle-board"/);
  assert.equal((files.html.match(/class="drag-hit"/g) ?? []).length, 3);
  assert.match(files.html, /id="angle-equation"/);
  assert.match(files.html, /id="reset-button"/);
  assert.match(files.css, /\.drag-hit[\s\S]*pointer-events: all/);
  assert.match(files.css, /touch-action: none/);
});

test("Pointer Events decken Touch und Maus mit demselben Pfad ab", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /pointerup/);
  assert.match(files.app, /setPointerCapture/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
});

test("Hochformat, Querformat und große Anzeige besitzen responsive Regeln", () => {
  assert.match(files.html, /viewBox="0 0 1000 680"/);
  assert.match(files.css, /@media \(max-width: 700px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /font-size: clamp\(1\.75rem, 5vw, 4\.15rem\)/);
});

test("Offline-Cache umfasst alle Laufzeitdateien", () => {
  for (const file of [
    "index.html",
    "styles.css",
    "src/app.js",
    "src/geometry.js",
    "manifest.webmanifest",
    "icon.svg",
  ]) {
    assert.match(files.worker, new RegExp(file.replace(".", "\\.")));
  }
  assert.match(files.app, /serviceWorker\.register/);
  assert.equal(JSON.parse(files.manifest).display, "standalone");
});

test("Anwendung nutzt keine Speicherung, Analyse oder externen URLs", () => {
  const runtime = `${files.html}\n${files.app}\n${files.worker}`;
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});

