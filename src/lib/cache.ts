import { unstable_cache } from "next/cache"
import { fetchAllTabs } from "./google-sheets/fetcher"
import { parseSheetData } from "./parser"
import { SheetData } from "@/types"

export const getCachedSheetData = unstable_cache(
  async (): Promise<SheetData> => {
    const tabs = await fetchAllTabs()
    return parseSheetData(tabs)
  },
  ["sheet-data"],
  { revalidate: 300 }  // 5 minutes
)

export const getCachedTodayData = unstable_cache(
  async (): Promise<SheetData> => {
    const tabs = await fetchAllTabs()
    return parseSheetData(tabs)
  },
  ["today-data"],
  { revalidate: 60 }  // 1 minute
)
