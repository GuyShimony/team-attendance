export const dynamic = "force-dynamic"

import { getCachedSheetData, getCachedTodayData } from "@/lib/cache"
import { getTodayStatus } from "@/lib/analytics/today"
import { getSaturdayStats } from "@/lib/analytics/saturday-stats"
import { getTopAttendees } from "@/lib/analytics/top-attendees"
import { TodayCard } from "@/components/summary/TodayCard"
import { SaturdayCard } from "@/components/summary/SaturdayCard"
import { TopAttendeesCard } from "@/components/summary/TopAttendeesCard"

export default async function SummaryPage() {
  const [todayData, allData] = await Promise.all([
    getCachedTodayData(),
    getCachedSheetData(),
  ])

  const todayStatus = getTodayStatus(todayData.allEntries)
  const saturdayStats = getSaturdayStats(allData.allEntries)
  const topAttendees = getTopAttendees(allData.allEntries)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">סיכום יומי</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <TodayCard today={todayStatus} />
        <SaturdayCard stats={saturdayStats} />
        <TopAttendeesCard attendees={topAttendees} />
      </div>
    </div>
  )
}
