/**
 * Returns timestamp for sorting (newest first).
 * Handles ISO and "July 5, 2025" style (Hermes can't parse the latter).
 */
const MONTH_NAMES: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6,
  august: 7, september: 8, october: 9, november: 10, december: 11,
};

export function getSortableTimestamp(dateStr: string | undefined): number {
  if (!dateStr || !dateStr.trim()) return 0;
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d.getTime();
  const match = dateStr.trim().match(/^(\w+)\s+(\d{1,2}),\s*(\d{4})$/i);
  if (match) {
    const month = MONTH_NAMES[match[1].toLowerCase()];
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
  }
  return 0;
}
