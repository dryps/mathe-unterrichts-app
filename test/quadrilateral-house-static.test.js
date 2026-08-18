import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Leitfrage, Untertitel, Eigenschaftswege und Aha sind wortgetreu vorhanden", async () => {
  const html = await readFile(new URL("haus-der-vierecke.html", root), "utf8");
  assert.match(html, /Warum ist jedes Quadrat auch ein Rechteck und eine Raute\?/);
  assert.match(html, /Haus der Vierecke/);
  assert.match(html, /Parallelogramm \+ rechte Winkel → Rechteck\./);
  assert.match(html, /Parallelogramm \+ vier gleiche Seiten → Raute\./);
  assert.match(html, /Beides → Quadrat\./);
  assert.match(html, /Spezielle Figuren behalten die Eigenschaften ihrer Oberbegriffe\./);
});

test("Hausknoten, Erkundung und Aha sind anfangs semantisch verborgen", async () => {
  const html = await readFile(new URL("haus-der-vierecke.html", root), "utf8");
  for (const id of ["house-parallelogram", "house-rectangle", "house-rhombus", "house-square", "house-explore", "house-conclusion"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*hidden`));
  }
  assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org)/);
});
