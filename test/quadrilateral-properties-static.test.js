import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Leitfrage, Untertitel und Aha sind wortgetreu vorhanden", async () => {
  const html = await readFile(new URL("eigenschaften-statt-optik.html", root), "utf8");
  assert.match(html, /Warum bleibt ein Viereck dieselbe Art, obwohl ich es drehe oder anders zeichne\?/);
  assert.match(html, /Eigenschaften statt Optik/);
  assert.match(html, /Viereckstypen werden über Eigenschaften definiert, nicht über typische Bilder\./);
  assert.match(html, /lokal · ohne Speicherung/);
  assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org)/);
});

test("Eigenschaftsmarker, Steuerung und Aha sind anfangs semantisch verborgen", async () => {
  const html = await readFile(new URL("eigenschaften-statt-optik.html", root), "utf8");
  assert.match(html, /id="properties-markers"[^>]*hidden/);
  assert.match(html, /id="properties-explore"[^>]*hidden/);
  assert.match(html, /id="properties-conclusion"[^>]*hidden/);
  assert.match(html, /id="properties-rotation-control"[^>]*min="-35"[^>]*max="35"/);
  assert.match(html, /id="properties-shift-control"[^>]*min="-90"[^>]*max="90"/);
  assert.match(html, /id="properties-slant-control"[^>]*min="-70"[^>]*max="70"/);
});

test("Ausgangsfigur ist neutral und Seitenpaarfarben beginnen erst nach dem Reveal", async () => {
  const css = await readFile(new URL("quadrilateral-properties.css", root), "utf8");
  assert.match(css, /\.properties-board\[data-state="irritation"\] \.property-side\{stroke:#708198\}/);
  assert.match(css, /\.pair-one\{stroke:#286eb1\}/);
  assert.match(css, /\.pair-two\{stroke:#159067\}/);
});
