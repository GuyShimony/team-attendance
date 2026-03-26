import { DayEntry, WeekBlock } from "@/types"
import { RawCell } from "@/lib/google-sheets/fetcher"
import { BlockBoundary } from "./detect-blocks"
import { parseHebrewDate } from "./date-utils"
import { hebrewDayToIndex, isLeaving } from "./normalize"

/**
 * Determine isAtWork for a single day cell.
 *
 * Rules (in priority order):
 *  1. Cell text is יוצא/יוצאת → NOT at work (leaving day never counted)
 *  2. Cell background is green → at work
 *  3. Cell background is red   → not at work
 *  4. No color (white/default) → not at work
 */
function resolveCell(cell: RawCell): { status: string; isAtWork: boolean } {
  const text = cell.value?.trim().normalize("NFC") ?? null

  if (isLeaving(text)) return { status: "leaving", isAtWork: false }
  if (cell.isGreen)    return { status: "at_work", isAtWork: true }
  if (cell.isRed)      return { status: "off",     isAtWork: false }
  return { status: "off", isAtWork: false }
}

export function parseBlock(
  rows: RawCell[][],
  boundary: BlockBoundary,
  weekIndex: number
): WeekBlock {
  const { headerRowIndex, dateRowIndex, endRowIndex } = boundary

  const headerRow = rows[headerRowIndex] ?? []
  const dateRow   = rows[dateRowIndex]   ?? []

  // Identify which columns are day columns
  const dayCols: { colIndex: number; dayOfWeek: number; date: string | null }[] = []
  for (let col = 0; col < headerRow.length; col++) {
    const val = headerRow[col]?.value
    if (!val) continue
    const dow = hebrewDayToIndex(val)
    if (dow === -1) continue
    const isoDate = parseHebrewDate(dateRow[col]?.value ?? null)
    dayCols.push({ colIndex: col, dayOfWeek: dow, date: isoDate })
  }

  const entries: DayEntry[] = []

  for (let rowIdx = dateRowIndex + 1; rowIdx < endRowIndex; rowIdx++) {
    const row = rows[rowIdx] ?? []
    if (row.every((cell) => !cell.value)) continue

    // First non-empty text cell is the person's name
    const nameCell = row.find((c) => c.value !== null && c.value.trim() !== "")
    if (!nameCell) continue
    const personName = nameCell.value!.trim().normalize("NFC")

    for (const { colIndex, dayOfWeek, date } of dayCols) {
      if (!date) continue
      const cell = colIndex < row.length ? row[colIndex] : { value: null, isGreen: false, isRed: false }
      const { status, isAtWork } = resolveCell(cell)

      entries.push({
        personName,
        date,
        dayOfWeek,
        rawCell: cell.value ?? null,
        status: status as DayEntry["status"],
        isAtWork,
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
