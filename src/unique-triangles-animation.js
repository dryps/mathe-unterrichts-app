import { distance } from "./unique-triangles-geometry.js";

export const TRIANGLE_COMPARE_DURATION_MS = 1550;
export const SUMMARY_REVEAL_DURATION_MS = 1400;

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

export function rotatePoint(point, center, angleRadians) {
  const cosine = Math.cos(angleRadians);
  const sine = Math.sin(angleRadians);
  const relativeX = point.x - center.x;
  const relativeY = point.y - center.y;
  return {
    x: center.x + relativeX * cosine - relativeY * sine,
    y: center.y + relativeX * sine + relativeY * cosine,
  };
}

export function triangleCentroid(triangle) {
  return {
    x: triangle.reduce((sum, point) => sum + point.x, 0) / triangle.length,
    y: triangle.reduce((sum, point) => sum + point.y, 0) / triangle.length,
  };
}

export function comparisonAnimationFrame(
  elapsedMilliseconds,
  lowerTriangle,
  upperTriangle,
  duration = TRIANGLE_COMPARE_DURATION_MS,
) {
  if (!Number.isFinite(elapsedMilliseconds) || duration <= 0) {
    throw new RangeError("Animationszeit und Dauer müssen gültig sein.");
  }
  const linearProgress = Math.max(0, Math.min(1, elapsedMilliseconds / duration));
  const progress = easeInOutCubic(linearProgress);
  const angle = Math.PI * progress;
  const lowerCenter = triangleCentroid(lowerTriangle);
  const upperCenter = triangleCentroid(upperTriangle);
  const translation = {
    x: (upperCenter.x - lowerCenter.x) * progress,
    y: (upperCenter.y - lowerCenter.y) * progress,
  };
  const points = lowerTriangle.map((point) => {
    const rotated = rotatePoint(point, lowerCenter, angle);
    return {
      x: rotated.x + translation.x,
      y: rotated.y + translation.y,
    };
  });
  return {
    linearProgress,
    progress,
    angle,
    translation,
    points,
    complete: linearProgress >= 1,
  };
}

export function animationPreservesSideLengths(frame, original, tolerance = 1e-7) {
  const pairs = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];
  return pairs.every(
    ([first, second]) =>
      Math.abs(
        distance(frame.points[first], frame.points[second]) -
          distance(original[first], original[second]),
      ) <= tolerance,
  );
}
