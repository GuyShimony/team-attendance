import { DayEntry, WeekBlock } from "@/types"
import { BlockBoundary } from "./detect-blocks"
import { parseHebrewDate } from "./date-utils"
import { hebrewDayToIndex } from "./normalize"

export function parseBlock(
  rows: (string | null)[][],
  boundary: BlockBoundary,
  weekIndex: number
): WeekBlock {
  const { headerRowIndex, dateRowIndex, endRowIndex } = boundary

  const headerRow = rows[headerRowIndex] ?? []
  const dateRow   = rows[dateRowIndex]   ?? []

  // Columns that contain a Hebrew day name in the header row
  const dayCols: { colIndex: number; dayOfWeek: number; date: string | null }[] = []
  for (let col = 0; col < headerRow.length; col++) {
    const cell = headerRow[col]
    if (!cell) continue
    const dow = hebrewDayToIndex(cell)
    if (dow === -1) continue
    dayCols.push({ colIndex: col, dayOfWeek: dow, date: parseHebrewDate(dateRow[col] ?? null) })
  }

  const dayColSet = new Set(dayCols.map((d) => d.colIndex))
  const entries: DayEntry[] = []

  for (let rowIdx = dateRowIndex + 1; rowIdx < endRowIndex; rowIdx++) {
    const row = rows[rowIdx] ?? []
    if (row.every((c) => !c)) continue

    // Person name = first non-empty cell that is NOT in a day column.
    // This prevents a status cell (e.g. "מגיע") from being mistaken for the name.
    const nameValue = row
      .map((c, i) => ({ c, i }))
      .find(({ c, i }) => !dayColSet.has(i) && c !== null && c.trim() !== "")
      ?.c ?? null

    if (!nameValue) continue
    const personName = nameValue.trim().normalize("NFC")

    for (const { colIndex, dayOfWeek, date } of dayCols) {
      if (!date) continue
      const rawCell = row[colIndex] ?? null

      // isAtWork and status are resolved later by the state machine;
      // store the raw cell text so the machine can read מגיע / יוצא.
      entries.push({
        personName,
        date,
        dayOfWeek,
        rawCell,
        status: "unknown",
        isAtWork: false,
      })
    }
  }

  const validDates = dayCols.map((d) => d.date).filter((d): d is string => d !== null).sort()

  return {
    weekIndex,
    startDate: validDates[0] ?? "",
    endDate: validDates[validDates.length - 1] ?? "",
    entries,
  }
}
