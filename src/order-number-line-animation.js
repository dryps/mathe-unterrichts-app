export const ORDER_TRANSITION_DURATION_MS = Object.freeze({
  introduction: 1800,
  comparison: 460,
  free: 460,
});

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

function intervalProgress(elapsed, start, duration) {
  return easeInOutCubic((elapsed - start) / duration);
}

export function orderTransitionDuration(kind) {
  const duration = ORDER_TRANSITION_DURATION_MS[kind];
  if (!duration) {
    throw new RangeError("Unbekannter Übergang der Ordnungsdarstellung.");
  }
  return duration;
}

export function orderTransitionFrame(elapsedMilliseconds, kind) {
  if (!Number.isFinite(elapsedMilliseconds)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }
  const duration = orderTransitionDuration(kind);
  const elapsed = Math.max(0, Math.min(duration, elapsedMilliseconds));
  const complete = elapsed >= duration;

  if (kind === "introduction") {
    const axis = intervalProgress(elapsed, 0, 360);
    const markerEight = intervalProgress(elapsed, 430, 520);
    const markerThree = intervalProgress(elapsed, 1080, 520);
    const markerEightOffsetY =
      complete || markerEight === 1 ? 0 : (1 - markerEight) * -72;
    const markerThreeOffsetY =
      complete || markerThree === 1 ? 0 : (1 - markerThree) * -72;
    return {
      kind,
      duration,
      complete,
      axisOpacity: axis,
      markerEightOpacity: markerEight,
      markerEightOffsetY,
      markerThreeOpacity: markerThree,
      markerThreeOffsetY,
      revealOpacity: 0,
    };
  }

  const reveal = intervalProgress(elapsed, 0, duration);
  return {
    kind,
    duration,
    complete,
    axisOpacity: 1,
    markerEightOpacity: 1,
    markerEightOffsetY: 0,
    markerThreeOpacity: 1,
    markerThreeOffsetY: 0,
    revealOpacity: reveal,
  };
}
