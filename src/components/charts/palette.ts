export const DATA_PALETTE = [
  "#6805F2", // vivid purple
  "#2E4BF2", // indigo-blue
  "#056CF2", // cobalt
  "#3D8BF2", // sky blue
  "#7A5AF8", // soft purple
  "#5E7FF2", // cool royal
  "#4AA3FF", // azure
  "#8A7CFF", // periwinkle
] as const;

const COOL_PIE_LIGHT = "#3D8BF2";
const COOL_PIE_DARK = "#6805F2";
const COOL_PIE_STOPS = [
  COOL_PIE_DARK,
  "#4B24F0",
  "#2E4BF2",
  "#056CF2",
  COOL_PIE_LIGHT,
] as const;
const COOL_PIE_GAMMA = 0.82;
const COOL_BAR_LIGHT = COOL_PIE_LIGHT;
const COOL_BAR_DARK = COOL_PIE_DARK;

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
    return COOL_PIE_LIGHT;
  }

  if (stops.length === 1) {
    return stops[0] ?? COOL_PIE_LIGHT;
  }

  const mix = clamp01(t);
  const scaledIndex = mix * (stops.length - 1);
  const startIndex = Math.floor(scaledIndex);
  const endIndex = Math.min(startIndex + 1, stops.length - 1);
  const localMix = scaledIndex - startIndex;
  const from = stops[startIndex] ?? COOL_PIE_LIGHT;
  const to = stops[endIndex] ?? COOL_PIE_LIGHT;

  return interpolateHex(from, to, localMix);
}

export function getOrangeBarShade(value: number, minValue: number, maxValue: number): string {
  if (!Number.isFinite(value)) {
    return COOL_BAR_LIGHT;
  }

  const safeMin = Number.isFinite(minValue) ? minValue : 0;
  const safeMax = Number.isFinite(maxValue) ? maxValue : safeMin;

  if (safeMax <= safeMin) {
    return safeMax > 0 ? COOL_BAR_DARK : COOL_BAR_LIGHT;
  }

  const clampedValue = Math.min(Math.max(value, safeMin), safeMax);
  const normalizedValue = (clampedValue - safeMin) / (safeMax - safeMin);
  const contrastBoostedRatio = Math.pow(normalizedValue, COOL_PIE_GAMMA);

  return interpolateStops(COOL_PIE_STOPS, 1 - contrastBoostedRatio);
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
    return [COOL_PIE_DARK];
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const ratio = index / (safeCount - 1);
    const contrastBoostedRatio = Math.pow(ratio, COOL_PIE_GAMMA);
    return interpolateStops(COOL_PIE_STOPS, contrastBoostedRatio);
  });
}

export function getOrangePieShades(count: number): string[] {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) {
    return [];
  }

  if (safeCount === 1) {
    return [COOL_PIE_DARK];
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const ratio = index / (safeCount - 1);
    const contrastBoostedRatio = Math.pow(ratio, COOL_PIE_GAMMA);
    return interpolateStops(COOL_PIE_STOPS, contrastBoostedRatio);
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
  const colors = Array.from({ length: values.length }, () => COOL_PIE_LIGHT);

  descendingByValue.forEach((entry, rank) => {
    colors[entry.index] = rankedShades[rank] ?? COOL_PIE_LIGHT;
  });

  return colors;
}
