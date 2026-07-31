export const AUTOMATIC_STEP_DURATION_MS = 520;

export const NUMBER_LINE_MOTION_PATHS = Object.freeze({
  right: Object.freeze([0, 1, 2, 3]),
  home: Object.freeze([3, 2, 1, 0]),
  negative: Object.freeze([0, -1, -2, -3]),
});

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

export function automaticMotionDuration(
  path,
  stepDuration = AUTOMATIC_STEP_DURATION_MS,
) {
  if (!Array.isArray(path) || path.length < 2 || stepDuration <= 0) {
    throw new RangeError("Bewegungspfad und Schrittdauer müssen gültig sein.");
  }
  return (path.length - 1) * stepDuration;
}

export function automaticMotionFrame(
  elapsedMilliseconds,
  path,
  stepDuration = AUTOMATIC_STEP_DURATION_MS,
) {
  if (!Number.isFinite(elapsedMilliseconds)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }
  const duration = automaticMotionDuration(path, stepDuration);
  const elapsed = Math.max(0, Math.min(duration, elapsedMilliseconds));
  if (elapsed >= duration) {
    return {
      value: path.at(-1),
      segmentIndex: path.length - 2,
      segmentProgress: 1,
      complete: true,
      duration,
    };
  }

  const segmentIndex = Math.min(
    Math.floor(elapsed / stepDuration),
    path.length - 2,
  );
  const linearProgress =
    (elapsed - segmentIndex * stepDuration) / stepDuration;
  const progress = easeInOutCubic(linearProgress);
  const start = path[segmentIndex];
  const end = path[segmentIndex + 1];

  return {
    value: start + (end - start) * progress,
    segmentIndex,
    segmentProgress: linearProgress,
    complete: false,
    duration,
  };
}
