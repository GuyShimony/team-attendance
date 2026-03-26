import { WorkStatus } from "@/types"

const HEBREW_DAY_NAMES = new Set([
  "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת",
])

export function isHebrewDayName(cell: string): boolean {
  return HEBREW_DAY_NAMES.has(cell.trim().normalize("NFC"))
}

export function isLeaving(text: string | null): boolean {
  if (!text) return false
  const n = text.trim().normalize("NFC")
  return n === "יוצא" || n === "יוצאת"
}

export function normalizeStatus(raw: string | null): WorkStatus | null {
  if (!raw) return null
  const n = raw.trim().normalize("NFC")
  if (n === "מגיע" || n === "מגיעה") return "arriving"
  if (n === "יוצא"  || n === "יוצאת")  return "leaving"
  if (n === "בסוללה אחרת")             return "other_battery"
  if (n === "כוננות")                  return "standby"
  if (n === "") return null
  return "unknown"
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  ראשון: 0, שני: 1, שלישי: 2, רביעי: 3, חמישי: 4, שישי: 5, שבת: 6,
}

export function hebrewDayToIndex(dayName: string): number {
  return DAY_NAME_TO_INDEX[dayName.trim().normalize("NFC")] ?? -1
}

export { HEBREW_DAY_NAMES }
