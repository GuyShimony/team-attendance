import { batchGetSheetValues, getSheetMetadata } from "./client"

export interface RawTab {
  tabName: string
  rows: (string | null)[][]
}

export async function fetchAllTabs(): Promise<RawTab[]> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID")

  const sheets = await getSheetMetadata(spreadsheetId)
  const tabNames = sheets
    .map((s) => s.properties?.title)
    .filter((t): t is string => Boolean(t))

  if (tabNames.length === 0) return []

  const ranges = tabNames.map((name) => `'${name}'`)
  const values = await batchGetSheetValues(spreadsheetId, ranges)

  return tabNames.map((tabName, i) => ({
    tabName,
    rows: (values[i] ?? []).map((row) =>
      row.map((cell) => (cell === "" ? null : cell))
    ),
  }))
}
