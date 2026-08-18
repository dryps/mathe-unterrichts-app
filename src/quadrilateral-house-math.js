const center = Object.freeze({ x: 360, y: 210 });

const subtract = (to, from) => Object.freeze({ x: to.x - from.x, y: to.y - from.y });
const length = (vector) => Math.hypot(vector.x, vector.y);
const cross = (a, b) => a.x * b.y - a.y * b.x;
const dot = (a, b) => a.x * b.x + a.y * b.y;

export function quadrilateralType(rightAngles, equalSides) {
  if (rightAngles && equalSides) return "Quadrat";
  if (rightAngles) return "Rechteck";
  if (equalSides) return "Raute";
  return "Parallelogramm";
}

export function createHouseQuadrilateral({ rightAngles = false, equalSides = false } = {}) {
  const hasRightAngles = Boolean(rightAngles);
  const hasEqualSides = Boolean(equalSides);
  let u; let v;
  if (hasRightAngles && hasEqualSides) {
    u = { x: 220, y: 0 }; v = { x: 0, y: -220 };
  } else if (hasRightAngles) {
    u = { x: 300, y: 0 }; v = { x: 0, y: -180 };
  } else if (hasEqualSides) {
    const side = 240; const shift = 100;
    u = { x: side, y: 0 }; v = { x: shift, y: -Math.sqrt(side ** 2 - shift ** 2) };
  } else {
    u = { x: 260, y: 0 }; v = { x: 100, y: -180 };
  }
  const points = Object.freeze([
    { x: center.x - u.x / 2 - v.x / 2, y: center.y - u.y / 2 - v.y / 2 },
    { x: center.x + u.x / 2 - v.x / 2, y: center.y + u.y / 2 - v.y / 2 },
    { x: center.x + u.x / 2 + v.x / 2, y: center.y + u.y / 2 + v.y / 2 },
    { x: center.x - u.x / 2 + v.x / 2, y: center.y - u.y / 2 + v.y / 2 },
  ].map((point) => Object.freeze(point)));
  const sideVectors = Object.freeze(points.map((point, index) => subtract(points[(index + 1) % 4], point)));
  const sideLengths = Object.freeze(sideVectors.map(length));
  const oppositeSidesParallel = Math.abs(cross(sideVectors[0], sideVectors[2])) < 1e-9 && Math.abs(cross(sideVectors[1], sideVectors[3])) < 1e-9;
  const oppositeSidesEqual = Math.abs(sideLengths[0] - sideLengths[2]) < 1e-9 && Math.abs(sideLengths[1] - sideLengths[3]) < 1e-9;
  const fourRightAngles = sideVectors.every((vector, index) => Math.abs(dot(vector, sideVectors[(index + 1) % 4])) < 1e-9);
  const fourEqualSides = sideLengths.every((value) => Math.abs(value - sideLengths[0]) < 1e-9);
  return Object.freeze({
    type: quadrilateralType(hasRightAngles, hasEqualSides), points, sideVectors, sideLengths,
    isRectangle: hasRightAngles, isRhombus: hasEqualSides,
    properties: Object.freeze({ rightAngles: hasRightAngles, equalSides: hasEqualSides }),
    invariants: Object.freeze({ oppositeSidesParallel, oppositeSidesEqual, fourRightAngles, fourEqualSides }),
  });
}
