import { RawTab } from "@/lib/google-sheets/fetcher"
import { SheetData, TabData, DayEntry } from "@/types"
import { detectBlocks } from "./detect-blocks"
import { parseBlock } from "./parse-block"
import { applyStateMachine } from "./state-machine"

export function parseSheetData(tabs: RawTab[]): SheetData {
  // Step 1: parse every tab into blocks, collecting raw (unresolved) entries
  const parsedTabsRaw: { tabName: string; blocks: ReturnType<typeof parseBlock>[] }[] = []
  const allRawEntries: DayEntry[] = []

  for (const tab of tabs) {
    const boundaries = detectBlocks(tab.rows)
    const blocks = boundaries.map((b, i) => parseBlock(tab.rows, b, i))
    parsedTabsRaw.push({ tabName: tab.tabName, blocks })
    allRawEntries.push(...blocks.flatMap((b) => b.entries))
  }

  // Step 2: run the state machine ONCE across ALL entries (all tabs, all dates).
  // This ensures a person who arrives in February and leaves in March is
  // correctly marked as "at_work" across the tab boundary.
  const resolvedEntries = applyStateMachine(allRawEntries)

  const entryMap = new Map<string, DayEntry>()
  for (const e of resolvedEntries) {
    entryMap.set(`${e.personName}::${e.date}`, e)
  }

  // Step 3: re-attach resolved entries back to their blocks/tabs
  const parsedTabs: TabData[] = parsedTabsRaw.map(({ tabName, blocks }) => ({
    tabName,
    blocks: blocks.map((block) => ({
      ...block,
      entries: block.entries.map(
        (e) => entryMap.get(`${e.personName}::${e.date}`) ?? e
      ),
    })),
  }))

  return {
    fetchedAt: new Date().toISOString(),
    tabs: parsedTabs,
    allEntries: resolvedEntries,
  }
}
