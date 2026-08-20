const DATE_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDateInputParts(value: string): { year: number; month: number; day: number } | null {
  const match = DATE_INPUT_RE.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || !month || !day) return null

  return { year, month, day }
}

/** Parse `<input type="date">` (`YYYY-MM-DD`) to local start of day. */
export function dateInputToStartOfDay(value: string): Date | undefined {
  const parts = parseDateInputParts(value)
  if (!parts) return undefined

  const date = new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Parse `<input type="date">` (`YYYY-MM-DD`) to local end of day (inclusive). */
export function dateInputToEndOfDay(value: string): Date | undefined {
  const parts = parseDateInputParts(value)
  if (!parts) return undefined

  const date = new Date(parts.year, parts.month - 1, parts.day, 23, 59, 59, 999)
  return Number.isNaN(date.getTime()) ? undefined : date
}
