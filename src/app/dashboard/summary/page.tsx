export const dynamic = "force-dynamic"

import { getCachedSheetData, getCachedTodayData } from "@/lib/cache"
import { getTodayStatus } from "@/lib/analytics/today"
import { getTopAttendees } from "@/lib/analytics/top-attendees"
import { TodayCard } from "@/components/summary/TodayCard"
import { TopAttendeesCard } from "@/components/summary/TopAttendeesCard"

export default async function SummaryPage() {
  const [todayData, allData] = await Promise.all([
    getCachedTodayData(),
    getCachedSheetData(),
  ])

  const todayStatus = getTodayStatus(todayData.allEntries)
  const topAttendees = getTopAttendees(allData.allEntries)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">סיכום יומי</h1>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <TodayCard today={todayStatus} />
        <TopAttendeesCard attendees={topAttendees} />
      </div>
    </div>
  )
}
