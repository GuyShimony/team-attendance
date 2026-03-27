import { AttendeeRank } from "@/lib/analytics/top-attendees"

export function TopAttendeesCard({ attendees }: { attendees: AttendeeRank[] }) {
  const max = attendees[0]?.workingDays ?? 1

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">נוכחות גבוהה</h2>
      {attendees.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600">אין נתונים</p>
      ) : (
        <ol className="space-y-3">
          {attendees.map((a, i) => (
            <li key={a.personName}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.personName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{a.workingDays} ימים</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{a.workPercent}%</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 transition-all"
                  style={{ width: `${Math.round((a.workingDays / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
