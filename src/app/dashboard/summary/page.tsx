export const dynamic = "force-dynamic"

import { getCachedSheetData, getCachedTodayData } from "@/lib/cache"
import { getTodayStatus } from "@/lib/analytics/today"
import { getTopAttendees } from "@/lib/analytics/top-attendees"
import { TodayCard } from "@/components/summary/TodayCard"
import { TopAttendeesCard } from "@/components/summary/TopAttendeesCard"
import { DateCheckerCard } from "@/components/summary/DateCheckerCard"

function formatDateHebrew(iso: string) {
  if (!iso) return ""
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

export default async function SummaryPage() {
  const [todayData, allData] = await Promise.all([
    getCachedTodayData(),
    getCachedSheetData(),
  ])

  const todayStatus = getTodayStatus(todayData.allEntries)
  const topAttendees = getTopAttendees(allData.allEntries)

  const lastDataDate = allData.allEntries.reduce(
    (max, e) => (e.date > max ? e.date : max),
    ""
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">סיכום יומי</h1>
        {lastDataDate && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <span>📋</span>
            <span>נתונים זמינים עד <span className="font-medium text-gray-500 dark:text-gray-400">{formatDateHebrew(lastDataDate)}</span></span>
          </p>
        )}
      </div>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <TodayCard today={todayStatus} />
        <TopAttendeesCard attendees={topAttendees} />
        <div className="lg:col-span-2">
          <DateCheckerCard allEntries={allData.allEntries} lastDataDate={lastDataDate} />
        </div>
      </div>
    </div>
  )
}
