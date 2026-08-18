import assert from "node:assert/strict";
import { lstat, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { PAGES_RUNTIME_FILES } from "./pages-runtime-files.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const normalize = (path) => path.replaceAll("\\", "/");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    const info = await lstat(path);
    assert.equal(info.isSymbolicLink(), false, `Symlink im Pages-Artefakt: ${path}`);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(normalize(relative(dist, path)));
  }
  return files;
}

const actualFiles = (await walk(dist)).sort();
const expectedFiles = [...PAGES_RUNTIME_FILES].sort();
assert.deepEqual(actualFiles, expectedFiles, "Pages-Artefakt weicht von der Freigabeliste ab");

for (const forbidden of ["test/", "scripts/", "docs/", ".github/", "README", ".map"]) {
  assert.equal(actualFiles.some((file) => file.includes(forbidden)), false, forbidden);
}

const htmlFiles = actualFiles.filter((file) => extname(file) === ".html");
for (const file of htmlFiles) {
  const html = await readFile(join(dist, file), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow, noarchive, nosnippet"/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /rel="apple-touch-icon"[^>]*href="\.\/icon-180\.png"/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/, `Root-Pfad in ${file}`);

  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (value.startsWith("#") || /^[a-z]+:/i.test(value)) continue;
    const target = value.split("#", 1)[0].replace(/^\.\//, "") || "index.html";
    assert.equal(expectedFiles.includes(target), true, `${file} verweist auf ${target}`);
  }
}

const manifest = JSON.parse(await readFile(join(dist, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.name, "Mathe im Unterricht");
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.background_color, "#f4f7fb");
assert.equal(manifest.theme_color, "#f4f7fb");
for (const icon of ["./icon-192.png", "./icon-512.png", "./icon.svg"]) {
  assert.equal(manifest.icons.some((entry) => entry.src === icon), true, icon);
}

assert.equal(
  await readFile(join(dist, "robots.txt"), "utf8"),
  "User-agent: *\nDisallow: /\n",
);

const runtimeText = (
  await Promise.all(
    actualFiles
      .filter((file) => [".html", ".css", ".js", ".webmanifest"].includes(extname(file)))
      .map((file) => readFile(join(dist, file), "utf8")),
  )
).join("\n");
assert.doesNotMatch(runtimeText, /(?:src|href)=[\"']https?:\/\//);
assert.doesNotMatch(runtimeText, /localStorage|sessionStorage|indexedDB|document\.cookie/);
assert.doesNotMatch(runtimeText, /analytics|telemetry|tracking|google-analytics/i);

const worker = await readFile(join(dist, "sw.js"), "utf8");
assert.match(worker, /mathe-unterrichts-app-v37/);
assert.match(worker, /redirect: "error"/);
assert.match(worker, /response\.redirected/);
assert.match(worker, /event\.request\.mode === "navigate"/);
assert.match(worker, /NAVIGATION_FALLBACK/);

console.log(`${actualFiles.length}/${expectedFiles.length} Pages-Dateien vollständig verifiziert`);
