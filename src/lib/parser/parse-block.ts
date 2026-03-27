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

  const entries: DayEntry[] = []

  for (let rowIdx = dateRowIndex + 1; rowIdx < endRowIndex; rowIdx++) {
    const row = rows[rowIdx] ?? []
    if (row.every((c) => !c)) continue

    // Person name = column A only. Skip rows with no name or the header title.
    const nameValue = row[0]
    if (!nameValue || nameValue.trim() === "" || nameValue.trim() === "שם") continue
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
