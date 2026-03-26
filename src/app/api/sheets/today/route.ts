export const dynamic = "force-dynamic"

import { getCachedTodayData } from "@/lib/cache"
import { getTodayStatus } from "@/lib/analytics/today"

export async function GET() {
  try {
    const data = await getCachedTodayData()
    const todayStatus = getTodayStatus(data.allEntries)
    return Response.json(todayStatus)
  } catch (error) {
    console.error("Error fetching today data:", error)
    return Response.json(
      { error: "Failed to fetch today data" },
      { status: 500 }
    )
  }
}
