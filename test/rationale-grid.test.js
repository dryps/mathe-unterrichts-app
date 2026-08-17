import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../home.css", import.meta.url), "utf8");

function mediaBlock(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Media Query fehlt: ${marker}`);
  const end = source.indexOf("\n@media", start + marker.length);
  return source.slice(start, end === -1 ? source.length : end);
}

const mobileCss = mediaBlock(css, "@media (max-width: 720px)");
const portraitCss = mediaBlock(css, "@media (min-width: 721px) and (max-width: 1040px)");
const landscapeCss = mediaBlock(
  css,
  "@media (orientation: landscape) and (min-width: 900px) and (max-width: 1500px)",
);
const classroomLandscapeCss = mediaBlock(
  css,
  "@media (orientation: landscape) and (min-width: 1501px)",
);

test("Kapitel 1 enthält genau sechs Karten ohne leeres Rasterelement", () => {
  const chapter = html.match(
    /<section[^>]*class="chapter chapter-rationale"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 6);
  assert.equal((chapter.match(/class="module-status"/g) ?? []).length, 6);
});

test("Kapitel 1 ordnet im Hochformat sechs gleich breite Karten als zwei plus zwei plus zwei", () => {
  assert.match(
    css,
    /\.chapter-rationale \.module-grid\s*\{[\s\S]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    css,
    /\.chapter-rationale \.module-card\s*\{\s*grid-column: span 2/,
  );
  assert.doesNotMatch(css, /\.chapter-rationale \.module-card:nth-child\(5\)\s*\{/);
  assert.match(mobileCss, /\.chapter-rationale \.module-grid\s*\{\s*grid-template-columns: 1fr/);
  assert.match(mobileCss, /\.chapter-rationale \.module-card\s*\{\s*grid-column: auto/);
  assert.match(portraitCss, /\.chapter-rationale \.module-grid\s*\{[\s\S]*repeat\(4, minmax\(0, 1fr\)\)/);
});

test("Kapitel 1 ordnet im Querformat drei plus drei ohne implizite Spalten", () => {
  assert.match(landscapeCss, /\.chapter-rationale \.module-grid\s*\{[\s\S]*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(landscapeCss, /\.chapter-rationale \.module-card\s*\{\s*grid-column: span 2/);
  assert.doesNotMatch(landscapeCss, /\.chapter-rationale \.module-card:nth-child/);
  assert.doesNotMatch(
    landscapeCss,
    /\.chapter-rationale \.module-card\s*\{[^}]*grid-column:\s*span 3/,
  );
});

test("Kapitel 2 behält sein Sechsspaltenmodell und die drei Zweispaltenkarten je Reihe", () => {
  assert.match(landscapeCss, /\.module-grid\s*\{[\s\S]*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(landscapeCss, /\.module-card\s*\{[\s\S]*grid-column: span 2/);
  for (const [card, column] of [[4, 1], [5, 3], [6, 5]]) {
    assert.match(
      landscapeCss,
      new RegExp(`\\.module-card:nth-child\\(${card}\\)\\s*\\{\\s*grid-column: ${column} \\/ span 2`),
    );
  }
});

test("breiter Klassenraumbildschirm ordnet Kapitel 1 als drei plus drei", () => {
  assert.match(classroomLandscapeCss, /\.chapter-rationale \.module-grid\s*\{[\s\S]*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(classroomLandscapeCss, /\.chapter-rationale \.module-card\s*\{\s*grid-column: span 2/);
  assert.doesNotMatch(classroomLandscapeCss, /\.chapter-rationale \.module-card:nth-child/);
  assert.doesNotMatch(classroomLandscapeCss, /#dreiecke|\.chapter:not\(\.chapter-rationale\)/);
});

test("Kapitel 3 enthält genau vier gleichwertige, responsive Modulkarten", () => {
  const chapter = html.match(
    /<section[^>]*id="rechnen-mit-termen"[^>]*class="chapter chapter-terms"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(chapter);
  assert.equal((chapter.match(/class="module-card"/g) ?? []).length, 4);
  assert.equal((chapter.match(/class="module-status"/g) ?? []).length, 4);
  assert.match(css, /\.chapter-terms \.module-grid\s*\{\s*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(mobileCss, /\.chapter-terms \.module-grid\s*\{\s*grid-template-columns: 1fr/);
  assert.match(portraitCss, /\.chapter-terms \.module-grid\s*\{[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(landscapeCss, /\.chapter-terms \.module-grid\s*\{\s*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(landscapeCss, /\.chapter-terms \.module-card\s*\{\s*grid-column: auto/);
});
