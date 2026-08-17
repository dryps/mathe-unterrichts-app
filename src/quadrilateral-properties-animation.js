export const PROPERTIES_TRANSFORM_DURATION = 1100;
export const PROPERTIES_TARGET_CONFIG = Object.freeze({ rotation: 28, shiftX: 55, slant: -50 });

function roundedTransformValue(value) {
  const rounded = Math.round(value);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function quadrilateralTransformFrame(elapsed) {
  if (!Number.isFinite(elapsed)) throw new RangeError("Zeit der Animation muss endlich sein.");
  if (elapsed < 0) throw new RangeError("Zeit der Animation darf nicht negativ sein.");
  const raw = Math.max(0, Math.min(1, elapsed / PROPERTIES_TRANSFORM_DURATION));
  const progress = raw * raw * (3 - 2 * raw);
  return Object.freeze({
    progress,
    complete: raw === 1,
    config: Object.freeze({
      rotation: roundedTransformValue(PROPERTIES_TARGET_CONFIG.rotation * progress),
      shiftX: roundedTransformValue(PROPERTIES_TARGET_CONFIG.shiftX * progress),
      slant: roundedTransformValue(PROPERTIES_TARGET_CONFIG.slant * progress),
    }),
  });
}
