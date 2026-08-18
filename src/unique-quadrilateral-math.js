const degrees = (radians) => (radians * 180) / Math.PI;
const cross = (a, b, c) => (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
const vector = (from, to) => ({ x: to.x - from.x, y: to.y - from.y });
const vectorCross = (first, second) => first.x * second.y - first.y * second.x;

export function sideLength(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function vertexAngle(points, index) {
  if (!Array.isArray(points) || points.length !== 4) throw new TypeError("Ein Viereck benötigt vier Eckpunkte.");
  if (!Number.isInteger(index) || index < 0 || index > 3) throw new RangeError("Der Eckpunktindex muss zwischen 0 und 3 liegen.");
  const vertex = points[index], previous = points[(index + 3) % 4], next = points[(index + 1) % 4];
  const first = vector(vertex, previous), second = vector(vertex, next);
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  const cosine = Math.max(-1, Math.min(1, (first.x * second.x + first.y * second.y) / denominator));
  return degrees(Math.acos(cosine));
}

function freezeModel(points, fixed) {
  return Object.freeze({ points: Object.freeze(points.map((point) => Object.freeze(point))), fixed: Boolean(fixed) });
}

export function createMovableParallelogram(shear = 0) {
  if (!Number.isFinite(shear)) throw new RangeError("Der Freiheitsgrad muss endlich sein.");
  if (shear < -120 || shear > 120) throw new RangeError("Der Freiheitsgrad muss zwischen -120 und 120 liegen.");
  const a={x:150,y:500},b={x:700,y:500},d={x:260+shear,y:150},c={x:b.x+d.x-a.x,y:b.y+d.y-a.y};
  return freezeModel([a,b,c,d], false);
}

export function createFixedParallelogram() {
  const a={x:180,y:500},b={x:780,y:500},radians=(70*Math.PI)/180;
  const d={x:a.x+400*Math.cos(radians),y:a.y-400*Math.sin(radians)};
  const c={x:b.x+d.x-a.x,y:b.y+d.y-a.y};
  return freezeModel([a,b,c,d], true);
}

export function parallelogramInvariants(points) {
  if (!Array.isArray(points) || points.length !== 4) throw new TypeError("Ein Viereck benötigt vier Eckpunkte.");
  const turns=points.map((point,index)=>cross(point,points[(index+1)%4],points[(index+2)%4]));
  const ab=vector(points[0],points[1]),bc=vector(points[1],points[2]),cd=vector(points[2],points[3]),da=vector(points[3],points[0]);
  const tolerance=1e-8;
  return Object.freeze({
    convex:turns.every((turn)=>turn>tolerance)||turns.every((turn)=>turn<-tolerance),
    oppositeSidesParallel:Math.abs(vectorCross(ab,cd))<tolerance&&Math.abs(vectorCross(bc,da))<tolerance,
    oppositeSidesEqual:Math.abs(sideLength(points[0],points[1])-sideLength(points[2],points[3]))<tolerance&&Math.abs(sideLength(points[1],points[2])-sideLength(points[3],points[0]))<tolerance,
  });
}
