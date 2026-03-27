const HEBREW_DAY_NAMES = new Set([
  "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת",
])

export function isHebrewDayName(cell: string): boolean {
  return HEBREW_DAY_NAMES.has(cell.trim().normalize("NFC"))
}

/** Split a cell into normalised words for flexible keyword matching. */
function words(text: string): string[] {
  return text.trim().normalize("NFC").split(/\s+/)
}

export function isArriving(cell: string | null): boolean {
  if (!cell) return false
  const w = words(cell)
  return w.includes("מגיע") || w.includes("מגיעה")
}

export function isLeaving(cell: string | null): boolean {
  if (!cell) return false
  const w = words(cell)
  return w.includes("יוצא") || w.includes("יוצאת")
}

export function isReleased(cell: string | null): boolean {
  if (!cell) return false
  return words(cell).includes("משוחרר")
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  ראשון: 0, שני: 1, שלישי: 2, רביעי: 3, חמישי: 4, שישי: 5, שבת: 6,
}

export function hebrewDayToIndex(dayName: string): number {
  return DAY_NAME_TO_INDEX[dayName.trim().normalize("NFC")] ?? -1
}

export { HEBREW_DAY_NAMES }
