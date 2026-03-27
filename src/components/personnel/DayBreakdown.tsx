"use client"

import { DayEntry } from "@/types"

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

interface DayBreakdownProps {
  entries: DayEntry[]
  selectedMonth: string
}

export function DayBreakdown({ entries, selectedMonth }: DayBreakdownProps) {
  const rows = entries
    .filter((e) => e.date.startsWith(selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (rows.length === 0) return <p className="text-sm text-gray-400">אין נתונים לחודש זה</p>

  const workCount     = rows.filter((r) => r.isAtWork).length
  const releasedCount = rows.filter((r) => r.status === "released").length

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          פירוט ימים — {selectedMonth}
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {releasedCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">{releasedCount} משוחרר</span>
          )}
          <span className="text-blue-600 dark:text-blue-400 font-medium">{workCount} ימי עבודה</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs">
              <th className="text-right px-4 py-2 font-medium">תאריך</th>
              <th className="text-right px-4 py-2 font-medium">יום</th>
              <th className="text-right px-4 py-2 font-medium">תא בגיליון</th>
              <th className="text-right px-4 py-2 font-medium">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => {
              const [year, month, day] = entry.date.split("-")
              const displayDate = `${day}/${month}/${year}`
              const dayName = DAY_NAMES[entry.dayOfWeek] ?? ""
              const isSat = entry.dayOfWeek === 6
              const isReleased = entry.status === "released"
              const isTransition =
                entry.rawCell?.includes("מגיע") ||
                entry.rawCell?.includes("מגיעה") ||
                entry.rawCell?.includes("יוצא") ||
                entry.rawCell?.includes("יוצאת")

              let rowBg = "bg-white dark:bg-gray-900"
              if (isReleased)   rowBg = "bg-amber-50 dark:bg-amber-950/30"
              else if (isSat)   rowBg = "bg-blue-50/40 dark:bg-blue-950/20"
              else if (entry.isAtWork) rowBg = "bg-green-50/40 dark:bg-green-950/20"

              return (
                <tr key={entry.date} className={`border-b border-gray-50 dark:border-gray-800 ${rowBg}`}>
                  <td className={`px-4 py-2 font-mono ${isSat ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                    {displayDate}
                  </td>
                  <td className={`px-4 py-2 ${isSat ? "text-blue-500 dark:text-blue-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                    {dayName}
                  </td>
                  <td className="px-4 py-2">
                    {entry.rawCell ? (
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        isReleased   ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" :
                        isTransition ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300" :
                                       "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        {entry.rawCell}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isReleased ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        משוחרר
                      </span>
                    ) : entry.isAtWork ? (
                      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        בעבודה
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">לא בעבודה</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
