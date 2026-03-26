import { RawCell } from "@/lib/google-sheets/fetcher"
import { isHebrewDayName } from "./normalize"

export interface BlockBoundary {
  headerRowIndex: number
  dateRowIndex: number
  endRowIndex: number
}

export function detectBlocks(rows: RawCell[][]): BlockBoundary[] {
  const headerRows: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const dayNameCount = rows[i].filter(
      (cell) => cell.value !== null && isHebrewDayName(cell.value)
    ).length
    if (dayNameCount >= 5) headerRows.push(i)
  }

  return headerRows.map((headerRowIndex, idx) => ({
    headerRowIndex,
    dateRowIndex: headerRowIndex + 1,
    endRowIndex:
      idx + 1 < headerRows.length ? headerRows[idx + 1] : rows.length,
  }))
}
