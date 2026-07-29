import { mkdir, writeFile } from "node:fs/promises";

import { buildConstruction } from "../src/triangle-inequality-geometry.js";

const cases = [
  { sides: [5, 6, 8], title: "Dreieck möglich", color: "#087154" },
  { sides: [3, 5, 8], title: "Kein echtes Dreieck", color: "#9a5b06" },
  { sides: [3, 4, 8], title: "Kein Dreieck möglich", color: "#a6384d" },
];

function circle(point, className, radius) {
  if (!point) return "";
  return `<circle class="${className}" cx="${point.x}" cy="${point.y}" r="${radius}"/>`;
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function renderCase(entry, index) {
  const construction = buildConstruction(entry.sides);
  const tangentLine = construction.tangentPoint
    ? `<polyline class="degenerate" points="170,420 ${construction.tangentPoint.x},${construction.tangentPoint.y} 630,420"/>`
    : "";
  const points = construction.intersections.points;

  return `
    <g transform="translate(${index * 420 + 10} 68) scale(.5)">
      <rect class="board" x="2" y="2" width="796" height="836" rx="32"/>
      <line class="base" x1="170" y1="420" x2="630" y2="420"/>
      <path class="mirror-triangle" d="${construction.mirrorTriangle}"/>
      <path class="triangle" d="${construction.upperTriangle}"/>
      ${tangentLine}
      <path class="left-arc" d="${construction.arcs.left}"/>
      <path class="right-arc" d="${construction.arcs.right}"/>
      ${circle(points[0], construction.analysis.state === "degenerate" ? "tangent" : "point", 16)}
      ${circle(points[1], "mirror-point", 13)}
      <circle class="base-point" cx="170" cy="420" r="15"/>
      <circle class="base-point" cx="630" cy="420" r="15"/>
    </g>
    <text class="case-title" x="${index * 420 + 210}" y="34" fill="${entry.color}">
      ${entry.title}
    </text>
    <text class="equation" x="${index * 420 + 210}" y="520">
      ${escapeXml(construction.analysis.equation)}
    </text>
  `;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="550" viewBox="0 0 1260 550">
  <style>
    .board { fill: #f8fafc; stroke: #dbe4ef; stroke-width: 4; }
    .base { stroke: #172033; stroke-linecap: round; stroke-width: 11; }
    .left-arc, .right-arc { fill: none; stroke-linecap: round; stroke-width: 10; }
    .left-arc { stroke: #2563eb; }
    .right-arc { stroke: #d94673; }
    .triangle { fill: #087154; fill-opacity: .1; stroke: #087154; stroke-linejoin: round; stroke-width: 9; }
    .mirror-triangle { fill: none; stroke: #7290a9; stroke-dasharray: 16 14; stroke-width: 5; opacity: .55; }
    .degenerate { fill: none; stroke: #c07812; stroke-linecap: round; stroke-width: 17; }
    .base-point { fill: #172033; stroke: white; stroke-width: 7; }
    .point { fill: #087154; stroke: white; stroke-width: 7; }
    .mirror-point { fill: #7290a9; stroke: white; stroke-width: 7; opacity: .72; }
    .tangent { fill: #c07812; stroke: white; stroke-width: 7; }
    .case-title, .equation {
      font-family: system-ui, sans-serif;
      font-weight: 850;
      text-anchor: middle;
    }
    .case-title { font-size: 24px; }
    .equation { fill: #172033; font-size: 34px; }
  </style>
  <rect width="1260" height="550" fill="#f6f7fb"/>
  ${cases.map(renderCase).join("")}
</svg>`;

await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
await writeFile(new URL("../test-results/triangle-inequality-states.svg", import.meta.url), svg);
console.log("3/3 Konstruktionszustände als SVG gerendert");
