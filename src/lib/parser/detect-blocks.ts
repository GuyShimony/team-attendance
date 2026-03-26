import { isHebrewDayName } from "./normalize"

export interface BlockBoundary {
  headerRowIndex: number
  dateRowIndex: number
  endRowIndex: number
}

export function detectBlocks(rows: (string | null)[][]): BlockBoundary[] {
  const headerRows: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const count = rows[i].filter((c) => c !== null && isHebrewDayName(c)).length
    if (count >= 5) headerRows.push(i)
  }

  return headerRows.map((headerRowIndex, idx) => ({
    headerRowIndex,
    dateRowIndex: headerRowIndex + 1,
    endRowIndex:
      idx + 1 < headerRows.length ? headerRows[idx + 1] : rows.length,
  }))
}
