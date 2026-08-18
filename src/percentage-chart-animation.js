export const PERCENTAGE_CHART_REVEAL_DURATION=800;
export function percentageChartRevealFrame(elapsed){if(!Number.isFinite(elapsed))throw new RangeError("Die Animationszeit muss endlich sein.");const opacity=Math.max(0,Math.min(1,elapsed/PERCENTAGE_CHART_REVEAL_DURATION));return Object.freeze({opacity,complete:opacity>=1});}
