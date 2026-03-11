const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

function pluralize(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function formatRelativeTime(inputIso: string, now: Date = new Date()): string {
  const timestamp = new Date(inputIso).getTime();

  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const deltaMs = Math.max(0, now.getTime() - timestamp);

  if (deltaMs < MINUTE_MS) {
    return "just now";
  }

  if (deltaMs < HOUR_MS) {
    return pluralize(Math.floor(deltaMs / MINUTE_MS), "minute");
  }

  if (deltaMs < DAY_MS) {
    return pluralize(Math.floor(deltaMs / HOUR_MS), "hour");
  }

  if (deltaMs < WEEK_MS) {
    return pluralize(Math.floor(deltaMs / DAY_MS), "day");
  }

  if (deltaMs < YEAR_MS) {
    const months = Math.floor(deltaMs / MONTH_MS);

    if (months >= 1) {
      return pluralize(months, "month");
    }

    return pluralize(Math.floor(deltaMs / WEEK_MS), "week");
  }

  return pluralize(Math.floor(deltaMs / YEAR_MS), "year");
}
