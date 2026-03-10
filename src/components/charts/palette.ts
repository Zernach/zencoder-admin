export const DATA_PALETTE = [
  "#f64a00", // accent orange
  "#ff8c57", // warm orange
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
] as const;

const ORANGE_PIE_LIGHT = "#d65a00";
const ORANGE_PIE_DARK = "#741111";
const ORANGE_PIE_STOPS = [
  ORANGE_PIE_DARK,
  "#9a1612",
  "#c61f0c",
  ORANGE_PIE_LIGHT,
] as const;
const ORANGE_PIE_GAMMA = 0.82;
const ORANGE_BAR_LIGHT = ORANGE_PIE_LIGHT;
const ORANGE_BAR_DARK = ORANGE_PIE_DARK;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function parseHexChannel(hex: string, start: number): number {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

function interpolateChannel(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t);
}

function toHex(channel: number): string {
  return channel.toString(16).padStart(2, "0");
}

function interpolateHex(fromHex: string, toHexValue: string, t: number): string {
  const mix = clamp01(t);
  const fromR = parseHexChannel(fromHex, 1);
  const fromG = parseHexChannel(fromHex, 3);
  const fromB = parseHexChannel(fromHex, 5);
  const toR = parseHexChannel(toHexValue, 1);
  const toG = parseHexChannel(toHexValue, 3);
  const toB = parseHexChannel(toHexValue, 5);

  return `#${toHex(interpolateChannel(fromR, toR, mix))}${toHex(interpolateChannel(fromG, toG, mix))}${toHex(interpolateChannel(fromB, toB, mix))}`;
}

function interpolateStops(stops: readonly string[], t: number): string {
  if (stops.length === 0) {
    return ORANGE_PIE_LIGHT;
  }

  if (stops.length === 1) {
    return stops[0] ?? ORANGE_PIE_LIGHT;
  }

  const mix = clamp01(t);
  const scaledIndex = mix * (stops.length - 1);
  const startIndex = Math.floor(scaledIndex);
  const endIndex = Math.min(startIndex + 1, stops.length - 1);
  const localMix = scaledIndex - startIndex;
  const from = stops[startIndex] ?? ORANGE_PIE_LIGHT;
  const to = stops[endIndex] ?? ORANGE_PIE_LIGHT;

  return interpolateHex(from, to, localMix);
}

export function getOrangeBarShade(value: number, minValue: number, maxValue: number): string {
  if (!Number.isFinite(value)) {
    return ORANGE_BAR_LIGHT;
  }

  const safeMin = Number.isFinite(minValue) ? minValue : 0;
  const safeMax = Number.isFinite(maxValue) ? maxValue : safeMin;

  if (safeMax <= safeMin) {
    return safeMax > 0 ? ORANGE_BAR_DARK : ORANGE_BAR_LIGHT;
  }

  const clampedValue = Math.min(Math.max(value, safeMin), safeMax);
  const normalizedValue = (clampedValue - safeMin) / (safeMax - safeMin);
  const contrastBoostedRatio = Math.pow(normalizedValue, ORANGE_PIE_GAMMA);

  return interpolateStops(ORANGE_PIE_STOPS, 1 - contrastBoostedRatio);
}

/**
 * Generate N equally-spaced distinct shades for bar charts.
 * Each bar gets a visually distinct color with equal color distance between bars.
 */
export function getOrangeBarShadesStepped(count: number): string[] {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) {
    return [];
  }

  if (safeCount === 1) {
    return [ORANGE_PIE_DARK];
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const ratio = index / (safeCount - 1);
    const contrastBoostedRatio = Math.pow(ratio, ORANGE_PIE_GAMMA);
    return interpolateStops(ORANGE_PIE_STOPS, contrastBoostedRatio);
  });
}

export function getOrangePieShades(count: number): string[] {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) {
    return [];
  }

  if (safeCount === 1) {
    return [ORANGE_PIE_DARK];
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const ratio = index / (safeCount - 1);
    const contrastBoostedRatio = Math.pow(ratio, ORANGE_PIE_GAMMA);
    return interpolateStops(ORANGE_PIE_STOPS, contrastBoostedRatio);
  });
}

export function getOrangePieColorsByValue(values: readonly number[]): string[] {
  if (values.length === 0) {
    return [];
  }

  const rankedValues = values.map((value, index) => ({
    index,
    value: Number.isFinite(value) ? Math.max(0, value) : 0,
  }));

  const descendingByValue = [...rankedValues].sort(
    (left, right) => right.value - left.value || left.index - right.index,
  );
  const rankedShades = getOrangePieShades(descendingByValue.length);
  const colors = Array.from({ length: values.length }, () => ORANGE_PIE_LIGHT);

  descendingByValue.forEach((entry, rank) => {
    colors[entry.index] = rankedShades[rank] ?? ORANGE_PIE_LIGHT;
  });

  return colors;
}
