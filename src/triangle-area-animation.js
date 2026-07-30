export const COPY_ANIMATION_DURATION_MS = 1700;
export const PARALLELOGRAM_HIGHLIGHT_MS = 650;

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

export function copyAnimationFrame(
  elapsedMilliseconds,
  rotationCenter,
  duration = COPY_ANIMATION_DURATION_MS,
) {
  if (!Number.isFinite(elapsedMilliseconds) || duration <= 0) {
    throw new RangeError("Animationszeit und Dauer müssen gültig sein.");
  }

  const linearProgress = Math.max(0, Math.min(1, elapsedMilliseconds / duration));
  const progress = easeInOutCubic(linearProgress);

  return {
    linearProgress,
    progress,
    angle: 180 * progress,
    opacity: 0.42 + 0.5 * progress,
    transform: `rotate(${(180 * progress).toFixed(3)} ${rotationCenter.x.toFixed(3)} ${rotationCenter.y.toFixed(3)})`,
    complete: linearProgress >= 1,
  };
}
