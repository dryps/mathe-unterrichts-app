export const BRACKET_SIGN_ACTION_DURATION = 1000;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

export function bracketSignActionFrame(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    throw new RangeError("Animationszeit muss endlich und nicht negativ sein.");
  }
  const progress = clamp01(elapsed / BRACKET_SIGN_ACTION_DURATION);
  const reach = smoothstep(progress);
  const flip = smoothstep(clamp01((progress - 0.35) / 0.65));
  return Object.freeze({
    progress,
    reach,
    flip,
    complete: progress === 1,
  });
}
