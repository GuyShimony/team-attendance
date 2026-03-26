import { RawTab } from "@/lib/google-sheets/fetcher"
import { SheetData, TabData, DayEntry } from "@/types"
import { detectBlocks } from "./detect-blocks"
import { parseBlock } from "./parse-block"
import { applyStateMachine } from "./state-machine"

export function parseSheetData(tabs: RawTab[]): SheetData {
  // 1. Parse every tab into raw entries (status = "unknown", isAtWork = false)
  const parsedTabsRaw: { tabName: string; blocks: ReturnType<typeof parseBlock>[] }[] = []
  const allRawEntries: DayEntry[] = []

  for (const tab of tabs) {
    const boundaries = detectBlocks(tab.rows)
    const blocks = boundaries.map((b, i) => parseBlock(tab.rows, b, i))
    parsedTabsRaw.push({ tabName: tab.tabName, blocks })
    allRawEntries.push(...blocks.flatMap((b) => b.entries))
  }

  // 2. Run state machine ONCE across every tab in chronological order.
  //    A worker who arrives in February and leaves in March is correctly
  //    counted as at_work across the tab boundary.
  const resolvedEntries = applyStateMachine(allRawEntries)

  const entryMap = new Map<string, DayEntry>()
  for (const e of resolvedEntries) {
    entryMap.set(`${e.personName}::${e.date}`, e)
  }

  // 3. Re-attach resolved entries back into the tab/block structure.
  const parsedTabs: TabData[] = parsedTabsRaw.map(({ tabName, blocks }) => ({
    tabName,
    blocks: blocks.map((block) => ({
      ...block,
      entries: block.entries.map((e) => entryMap.get(`${e.personName}::${e.date}`) ?? e),
    })),
  }))

  return {
    fetchedAt: new Date().toISOString(),
    tabs: parsedTabs,
    allEntries: resolvedEntries,
  }
}
