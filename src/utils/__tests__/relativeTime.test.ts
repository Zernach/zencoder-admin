import { formatRelativeTime } from "../relativeTime";

const NOW = new Date("2026-03-10T17:00:00.000Z");

describe("formatRelativeTime", () => {
  it("returns just now for less than one minute", () => {
    expect(formatRelativeTime("2026-03-10T16:59:40.000Z", NOW)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime("2026-03-10T16:34:00.000Z", NOW)).toBe("26 minutes ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime("2026-03-10T14:00:00.000Z", NOW)).toBe("3 hours ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime("2026-03-08T17:00:00.000Z", NOW)).toBe("2 days ago");
  });

  it("formats months", () => {
    expect(formatRelativeTime("2025-12-10T17:00:00.000Z", NOW)).toBe("3 months ago");
  });

  it("falls back to just now for invalid input", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBe("just now");
  });
});
