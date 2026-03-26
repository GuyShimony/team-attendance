import { DayEntry, WeekBlock, WorkStatus } from "@/types"
import { BlockBoundary } from "./detect-blocks"
import { parseHebrewDate } from "./date-utils"
import { normalizeStatus, hebrewDayToIndex } from "./normalize"

/**
 * Parse a single weekly mini-table block into a WeekBlock.
 *
 * Layout assumption:
 *   headerRow:  [label?, dayName1, dayName2, ...dayName7]
 *   dateRow:    [label?, date1, date2, ...date7]
 *   personRows: [personName, cell1, cell2, ...cell7]
 */
export function parseBlock(
  rows: (string | null)[][],
  boundary: BlockBoundary,
  weekIndex: number
): WeekBlock {
  const { headerRowIndex, dateRowIndex, endRowIndex } = boundary

  const headerRow = rows[headerRowIndex] ?? []
  const dateRow = rows[dateRowIndex] ?? []

  // Find which columns are day columns (have a Hebrew day name in header)
  const dayCols: { colIndex: number; dayOfWeek: number; date: string | null }[] = []

  for (let col = 0; col < headerRow.length; col++) {
    const cell = headerRow[col]
    if (!cell) continue
    const dow = hebrewDayToIndex(cell)
    if (dow === -1) continue
    const isoDate = parseHebrewDate(dateRow[col] ?? null)
    dayCols.push({ colIndex: col, dayOfWeek: dow, date: isoDate })
  }

  const entries: DayEntry[] = []

  // Person rows start after dateRow
  for (let rowIdx = dateRowIndex + 1; rowIdx < endRowIndex; rowIdx++) {
    const row = rows[rowIdx] ?? []
    if (row.every((cell) => !cell)) continue  // skip blank rows

    // First non-empty cell in the row is treated as the person's name
    // (typically col 0 or col 1)
    const nameCell = row.find((c) => c !== null && c.trim() !== "")
    if (!nameCell) continue
    const personName = nameCell.trim().normalize("NFC")

    for (const { colIndex, dayOfWeek, date } of dayCols) {
      if (!date) continue
      const rawCell = colIndex < row.length ? row[colIndex] : null
      const explicitStatus = normalizeStatus(rawCell)

      entries.push({
        personName,
        date,
        dayOfWeek,
        rawCell: rawCell ?? null,
        status: explicitStatus ?? "unknown",   // state-machine will override
        isAtWork: false,                        // state-machine will set
      })
    }
  }

  const validDates = dayCols
    .map((d) => d.date)
    .filter((d): d is string => d !== null)
    .sort()

  return {
    weekIndex,
    startDate: validDates[0] ?? "",
    endDate: validDates[validDates.length - 1] ?? "",
    entries,
  }
}
