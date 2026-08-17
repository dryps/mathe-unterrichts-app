export const EQUIVALENCE_TILT_DURATION = 420;

export function balanceTilt(leftValue, rightValue) {
  const difference = Number(rightValue) - Number(leftValue);
  if (!Number.isFinite(difference)) return 0;
  return Math.max(-6, Math.min(6, Math.round(difference * 1.2 * 1000) / 1000));
}

export function equivalenceTiltFrame(elapsed, fromTilt, toTilt) {
  const progress = Math.max(0, Math.min(1, Number(elapsed) / EQUIVALENCE_TILT_DURATION));
  const eased = progress * progress * (3 - 2 * progress);
  const tilt = Math.round((Number(fromTilt) + (Number(toTilt) - Number(fromTilt)) * eased) * 1000) / 1000;
  return Object.freeze({ progress, tilt, complete: progress >= 1 });
}
