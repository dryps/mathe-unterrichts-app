import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("das Modul enthält die freigegebenen Texte und lokale Grenzen", async () => {
  const html = await readFile(new URL("loesungsmengen.html", root), "utf8");
  assert.match(html, /Warum beschreibt eine Ungleichung einen ganzen Bereich statt nur einen Wert\?/);
  assert.match(html, /Lösungsmengen/);
  assert.match(html, /2x &lt; 6/);
  assert.match(html, /Ungleichungen beschreiben häufig Mengen von Lösungen\./);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org)/);
});

test("Antwortbereich und Ergebnis sind im Ausgangszustand semantisch verborgen", async () => {
  const html = await readFile(new URL("loesungsmengen.html", root), "utf8");
  assert.match(html, /id="solution-boundary"[^>]*hidden/);
  assert.match(html, /id="solution-line-stage"[^>]*hidden/);
  assert.match(html, /id="solution-conclusion"[^>]*hidden/);
  assert.match(html, /type="range"[^>]*min="-2"[^>]*max="6"/);
});
