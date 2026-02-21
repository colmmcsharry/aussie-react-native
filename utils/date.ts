/**
 * Returns timestamp for sorting (newest first).
 * Handles ISO and "July 5, 2025" style (Hermes can't parse the latter).
 */
const MONTH_NAMES: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
  may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7,
  september: 8, sept: 8, sep: 8, october: 9, oct: 9, november: 10, nov: 10,
  december: 11, dec: 11,
};

export function getSortableTimestamp(dateStr: string | undefined): number {
  if (!dateStr || !dateStr.trim()) return 0;
  const trimmed = dateStr.trim();
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.getTime();
  // "July 5, 2025" (Month Day, Year)
  const monthFirst = trimmed.match(/^(\w+)\s+(\d{1,2}),\s*(\d{4})$/i);
  if (monthFirst) {
    const month = MONTH_NAMES[monthFirst[1].toLowerCase()];
    const day = parseInt(monthFirst[2], 10);
    const year = parseInt(monthFirst[3], 10);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
  }
  // "5 July 2025", "14 Feb 2026" (Day Month Year) – Gist format
  const dayFirst = trimmed.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
  if (dayFirst) {
    const day = parseInt(dayFirst[1], 10);
    const month = MONTH_NAMES[dayFirst[2].toLowerCase()];
    const year = parseInt(dayFirst[3], 10);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
  }
  return 0;
}

/**
 * Deterministic "item of the day" based on calendar date.
 * Same date = same item for everyone. Uses same seed logic as slang of the day.
 */
export function getItemOfTheDay<T>(items: T[], date: Date): T | null {
  if (items.length === 0) return null;
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const seed = y * 10000 + m * 100 + d;
  const index = Math.abs((seed * 2654435761) >>> 0) % items.length;
  return items[index] ?? null;
}
