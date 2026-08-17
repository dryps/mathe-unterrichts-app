export const DIRECTION_REVERSAL_DURATION_MS = 1200;
export const SUBTRACTION_MOVEMENT_DURATION_MS = 1500;

export function easeInOutCubic(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  return clamped < 0.5
    ? 4 * clamped ** 3
    : 1 - ((-2 * clamped + 2) ** 3) / 2;
}

function normalizedProgress(elapsed, duration) {
  if (!Number.isFinite(elapsed)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }
  return easeInOutCubic(Math.max(0, Math.min(duration, elapsed)) / duration);
}

export function directionReversalFrame(elapsed, movement) {
  const progress = normalizedProgress(elapsed, DIRECTION_REVERSAL_DURATION_MS);
  return Object.freeze({
    progress,
    angle: progress * 180,
    vectorLength: movement.vectorLength,
    stepCount: movement.originalStepCount,
    complete: elapsed >= DIRECTION_REVERSAL_DURATION_MS,
  });
}

export function subtractionMovementFrame(elapsed, movement) {
  const progress = normalizedProgress(elapsed, SUBTRACTION_MOVEMENT_DURATION_MS);
  return Object.freeze({
    progress,
    x: movement.startX + (movement.effectiveEndX - movement.startX) * progress,
    visibleSteps: Math.min(
      movement.effectiveStepCount,
      Math.floor(progress * movement.effectiveStepCount + 1e-9),
    ),
    complete: elapsed >= SUBTRACTION_MOVEMENT_DURATION_MS,
  });
}
