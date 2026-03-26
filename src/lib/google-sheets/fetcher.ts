import { fetchAllSheetsWithFormatting, SheetGridRow } from "./client"
import type { sheets_v4 } from "googleapis"

export interface RawCell {
  value: string | null
  isGreen: boolean   // background color is green → at work
  isRed: boolean     // background color is red   → not at work
}

export interface RawTab {
  tabName: string
  rows: RawCell[][]
}

type ColorRGB = sheets_v4.Schema$Color

function isWhiteOrDefault(bg: ColorRGB | null | undefined): boolean {
  if (!bg) return true
  const r = bg.red ?? 1, g = bg.green ?? 1, b = bg.blue ?? 1
  return r > 0.9 && g > 0.9 && b > 0.9
}

function classifyColor(bg: ColorRGB | null | undefined): "green" | "red" | "none" {
  if (isWhiteOrDefault(bg)) return "none"
  const r = bg!.red ?? 0, g = bg!.green ?? 0, b = bg!.blue ?? 0
  if (g >= r && g >= b) return "green"
  if (r > g && r > b) return "red"
  return "none"
}

function gridRowToRawRow(row: SheetGridRow): RawCell[] {
  return (row.values ?? []).map((cell) => {
    const raw = cell.formattedValue ?? null
    const bg = cell.userEnteredFormat?.backgroundColor ?? null
    const color = classifyColor(bg)
    return {
      value: raw === "" ? null : raw,
      isGreen: color === "green",
      isRed: color === "red",
    }
  })
}

export async function fetchAllTabs(): Promise<RawTab[]> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID")

  const sheets = await fetchAllSheetsWithFormatting(spreadsheetId)

  return sheets.map(({ title, rows }) => ({
    tabName: title,
    rows: rows.map(gridRowToRawRow),
  }))
}
