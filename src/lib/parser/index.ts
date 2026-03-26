import { RawTab } from "@/lib/google-sheets/fetcher"
import { SheetData, TabData, DayEntry } from "@/types"
import { detectBlocks } from "./detect-blocks"
import { parseBlock } from "./parse-block"
import { applyStateMachine } from "./state-machine"

export function parseSheetData(tabs: RawTab[]): SheetData {
  const parsedTabs: TabData[] = []
  let allEntries: DayEntry[] = []

  for (const tab of tabs) {
    const boundaries = detectBlocks(tab.rows)
    const blocks = boundaries.map((b, i) => parseBlock(tab.rows, b, i))

    // Collect all raw entries from this tab
    const tabEntries = blocks.flatMap((b) => b.entries)

    // Apply state machine per tab (state resets per tab)
    const resolvedEntries = applyStateMachine(tabEntries)

    // Replace block entries with resolved versions
    const entryMap = new Map<string, DayEntry>()
    for (const e of resolvedEntries) {
      entryMap.set(`${e.personName}::${e.date}`, e)
    }

    const resolvedBlocks = blocks.map((block) => ({
      ...block,
      entries: block.entries.map(
        (e) => entryMap.get(`${e.personName}::${e.date}`) ?? e
      ),
    }))

    parsedTabs.push({ tabName: tab.tabName, blocks: resolvedBlocks })
    allEntries = allEntries.concat(resolvedEntries)
  }

  return {
    fetchedAt: new Date().toISOString(),
    tabs: parsedTabs,
    allEntries,
  }
}
