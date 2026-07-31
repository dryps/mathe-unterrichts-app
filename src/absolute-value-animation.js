export const ABSOLUTE_TRANSITION_DURATION_MS = Object.freeze({
  direction: 820,
  distance: 620,
  opposite: 720,
  free: 460,
});

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

export function absoluteTransitionDuration(kind) {
  const duration = ABSOLUTE_TRANSITION_DURATION_MS[kind];
  if (!duration) {
    throw new RangeError("Unbekannter Übergang der Betragsdarstellung.");
  }
  return duration;
}

export function absoluteTransitionFrame(elapsedMilliseconds, kind) {
  if (!Number.isFinite(elapsedMilliseconds)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }
  const duration = absoluteTransitionDuration(kind);
  const elapsed = Math.max(0, Math.min(duration, elapsedMilliseconds));
  const progress = easeInOutCubic(elapsed / duration);
  return {
    kind,
    duration,
    complete: elapsed >= duration,
    revealOpacity: progress,
    directionProgress: kind === "direction" ? progress : 1,
  };
}
