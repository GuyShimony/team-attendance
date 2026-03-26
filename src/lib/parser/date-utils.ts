/**
 * Convert DD/MM/YYYY → ISO "YYYY-MM-DD"
 * Returns null if the format is unrecognized.
 */
export function parseHebrewDate(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

/**
 * Today's date in ISO "YYYY-MM-DD" (server timezone).
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
