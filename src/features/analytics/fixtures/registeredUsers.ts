import type { RegisteredUsersByYearRow } from "../types";

/**
 * Estimated CellarTracker registered-user counts at milestone years.
 *
 * These are best-effort approximations of year-end registered accounts —
 * not audited figures — anchored to public milestones and interpolated
 * between them:
 *  - 2000: CellarTracker did not exist yet (founded 2003, public launch 2004).
 *  - 2005: ~6,000 registered users reported in April 2005, growing
 *    ~10%/month; compounded to roughly 13,000 by year-end.
 *  - 2010: back-cast from ~288,000 registered users in January 2014.
 *  - 2015: interpolated between the 2014 figure and ~750,000 around 2021.
 *  - 2020: interpolated along the same growth path (also a pandemic-era spike).
 *  - 2025: 2026 sources put CellarTracker near ~1.0–1.1M registered users.
 *
 * `confidence` reflects how well each year is sourced rather than interpolated.
 */
export const CELLARTRACKER_REGISTERED_USERS_BY_YEAR: RegisteredUsersByYearRow[] = [
  { year: 2000, registeredUsers: 0, confidence: "high" },
  { year: 2005, registeredUsers: 13_000, confidence: "medium" },
  { year: 2010, registeredUsers: 175_000, confidence: "low" },
  { year: 2015, registeredUsers: 370_000, confidence: "medium" },
  { year: 2020, registeredUsers: 650_000, confidence: "medium" },
  { year: 2025, registeredUsers: 1_000_000, confidence: "medium" },
];
