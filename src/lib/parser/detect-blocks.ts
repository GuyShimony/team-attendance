import { isHebrewDayName } from "./normalize"

export interface BlockBoundary {
  headerRowIndex: number
  dateRowIndex: number
  endRowIndex: number
}

const DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{4}$/

export function detectBlocks(rows: (string | null)[][]): BlockBoundary[] {
  const headerRows: number[] = []

  for (let i = 0; i + 1 < rows.length; i++) {
    const dayCount = rows[i].filter((c) => c !== null && isHebrewDayName(c)).length
    if (dayCount < 1) continue
    // The row immediately after must contain at least one DD/MM/YYYY date
    const nextRowHasDate = rows[i + 1].some((c) => c !== null && DATE_RE.test(c.trim()))
    if (nextRowHasDate) headerRows.push(i)
  }

  return headerRows.map((headerRowIndex, idx) => ({
    headerRowIndex,
    dateRowIndex: headerRowIndex + 1,
    endRowIndex:
      idx + 1 < headerRows.length ? headerRows[idx + 1] : rows.length,
  }))
}
