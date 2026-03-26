import { WorkStatus } from "@/types"

const HEBREW_DAY_NAMES = new Set([
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
])

export function isHebrewDayName(cell: string): boolean {
  return HEBREW_DAY_NAMES.has(cell.trim().normalize("NFC"))
}

export function normalizeStatus(raw: string | null): WorkStatus | null {
  if (!raw) return null
  const normalized = raw.trim().normalize("NFC")

  if (normalized === "מגיע" || normalized === "מגיעה") return "arriving"
  if (normalized === "יוצא" || normalized === "יוצאת") return "leaving"
  if (normalized === "בסוללה אחרת") return "other_battery"
  if (normalized === "כוננות") return "standby"
  if (normalized === "") return null

  // Non-empty but unrecognized
  return "unknown"
}

// Day name → day-of-week index (0=Sun … 6=Sat)
const DAY_NAME_TO_INDEX: Record<string, number> = {
  ראשון: 0,
  שני: 1,
  שלישי: 2,
  רביעי: 3,
  חמישי: 4,
  שישי: 5,
  שבת: 6,
}

export function hebrewDayToIndex(dayName: string): number {
  return DAY_NAME_TO_INDEX[dayName.trim().normalize("NFC")] ?? -1
}

export { HEBREW_DAY_NAMES }
