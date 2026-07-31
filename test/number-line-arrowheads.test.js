import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const modules = [
  {
    name: "Zahlengerade",
    html: await readFile(new URL("../zahlengerade.html", import.meta.url), "utf8"),
    css: await readFile(new URL("../number-line.css", import.meta.url), "utf8"),
    axisId: "number-axis",
    leftId: "number-axis-left-arrow",
    rightId: "number-axis-right-arrow",
  },
  {
    name: "Ordnung",
    html: await readFile(new URL("../ordnung.html", import.meta.url), "utf8"),
    css: await readFile(new URL("../order-number-line.css", import.meta.url), "utf8"),
    axisId: "order-axis",
    leftId: "order-axis-left-arrow",
    rightId: "order-axis-right-arrow",
  },
];

function elementById(html, id) {
  const match = html.match(new RegExp(`<(?:line|path)\\b[^>]*\\bid="${id}"[^>]*>`));
  assert.ok(match, `Element #${id} fehlt`);
  return match[0];
}

function numberAttribute(element, name) {
  const match = element.match(new RegExp(`\\b${name}="(-?\\d+(?:\\.\\d+)?)"`));
  assert.ok(match, `Attribut ${name} fehlt in ${element}`);
  return Number(match[1]);
}

function pathPoints(element) {
  const data = element.match(/\bd="([^"]+)"/)?.[1];
  assert.ok(data, `Pfaddaten fehlen in ${element}`);
  const values = [...data.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  assert.equal(values.length, 6, `unerwartete Pfaddaten: ${data}`);
  return [
    { x: values[0], y: values[1] },
    { x: values[2], y: values[3] },
    { x: values[4], y: values[5] },
  ];
}

test("beide Zahlengeraden verwenden eigenständige geschlossene Pfeilflächen", () => {
  for (const module of modules) {
    assert.doesNotMatch(module.html, /marker-(?:start|end)="url\(#(?:order-)?line-arrow\)"/);
    assert.doesNotMatch(module.html, /id="(?:order-)?line-arrow"/);
    assert.match(elementById(module.html, module.leftId), /\bclass="[^"]*axis-arrow[^"]*"/);
    assert.match(elementById(module.html, module.rightId), /\bclass="[^"]*axis-arrow[^"]*"/);
    assert.match(elementById(module.html, module.leftId), /\bZ"/);
    assert.match(elementById(module.html, module.rightId), /\bZ"/);
  }
});

test("die Hauptlinie dringt links in keine Pfeilfläche ein", () => {
  for (const module of modules) {
    const axis = elementById(module.html, module.axisId);
    const lineStart = numberAttribute(axis, "x1");
    const axisY = numberAttribute(axis, "y1");
    const points = pathPoints(elementById(module.html, module.leftId));
    const [tip, upperBase, lowerBase] = points;

    assert.ok(tip.x < lineStart, module.name);
    assert.equal(tip.y, axisY, module.name);
    assert.equal(upperBase.x, lineStart, module.name);
    assert.equal(lowerBase.x, lineStart, module.name);
    assert.ok(points.every((point) => point.x <= lineStart), module.name);
  }
});

test("die Hauptlinie dringt rechts in keine Pfeilfläche ein", () => {
  for (const module of modules) {
    const axis = elementById(module.html, module.axisId);
    const lineEnd = numberAttribute(axis, "x2");
    const axisY = numberAttribute(axis, "y2");
    const points = pathPoints(elementById(module.html, module.rightId));
    const [tip, upperBase, lowerBase] = points;

    assert.ok(tip.x > lineEnd, module.name);
    assert.equal(tip.y, axisY, module.name);
    assert.equal(upperBase.x, lineEnd, module.name);
    assert.equal(lowerBase.x, lineEnd, module.name);
    assert.ok(points.every((point) => point.x >= lineEnd), module.name);
  }
});

test("Pfeilansätze schließen symmetrisch und lückenlos an dieselbe Achse an", () => {
  for (const module of modules) {
    const axis = elementById(module.html, module.axisId);
    const axisY = numberAttribute(axis, "y1");
    assert.equal(numberAttribute(axis, "y2"), axisY, module.name);

    for (const id of [module.leftId, module.rightId]) {
      const [, upperBase, lowerBase] = pathPoints(elementById(module.html, id));
      assert.equal(axisY - upperBase.y, lowerBase.y - axisY, module.name);
      assert.ok(upperBase.y < axisY && lowerBase.y > axisY, module.name);
    }
  }
});

test("gerade Linienabschlüsse verhindern Antialiasing-Reste in den Pfeilen", () => {
  for (const module of modules) {
    assert.match(module.css, /\.\w+-axis\s*\{[\s\S]*?stroke-linecap:\s*butt;/);
    assert.match(module.css, /\.\w+-axis-arrow\s*\{[\s\S]*?fill:\s*#64748b;/);
  }
});
