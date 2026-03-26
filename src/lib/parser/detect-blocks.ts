import { isHebrewDayName } from "./normalize"

export interface BlockBoundary {
  headerRowIndex: number   // row with Hebrew day names
  dateRowIndex: number     // row immediately below with DD/MM/YYYY dates
  endRowIndex: number      // last row of this block (exclusive of next header)
}

/**
 * Scan rows and find all weekly mini-table headers.
 * A row is a header if it contains ≥5 of 7 Hebrew day names.
 */
export function detectBlocks(rows: (string | null)[][]): BlockBoundary[] {
  const headerRows: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const dayNameCount = row.filter(
      (cell) => cell !== null && isHebrewDayName(cell)
    ).length
    if (dayNameCount >= 5) {
      headerRows.push(i)
    }
  }

  return headerRows.map((headerRowIndex, idx) => ({
    headerRowIndex,
    dateRowIndex: headerRowIndex + 1,
    endRowIndex:
      idx + 1 < headerRows.length ? headerRows[idx + 1] : rows.length,
  }))
}
