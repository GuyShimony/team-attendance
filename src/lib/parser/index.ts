import { RawTab } from "@/lib/google-sheets/fetcher"
import { SheetData, TabData, DayEntry } from "@/types"
import { detectBlocks } from "./detect-blocks"
import { parseBlock } from "./parse-block"

export function parseSheetData(tabs: RawTab[]): SheetData {
  const parsedTabs: TabData[] = []
  const allEntries: DayEntry[] = []

  for (const tab of tabs) {
    const boundaries = detectBlocks(tab.rows)
    const blocks = boundaries.map((b, i) => parseBlock(tab.rows, b, i))
    parsedTabs.push({ tabName: tab.tabName, blocks })
    allEntries.push(...blocks.flatMap((b) => b.entries))
  }

  return {
    fetchedAt: new Date().toISOString(),
    tabs: parsedTabs,
    allEntries,
  }
}
