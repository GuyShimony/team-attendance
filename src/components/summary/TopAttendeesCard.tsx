import { AttendeeRank } from "@/lib/analytics/top-attendees"

export function TopAttendeesCard({ attendees }: { attendees: AttendeeRank[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">נוכחות גבוהה</h2>
      {attendees.length === 0 ? (
        <p className="text-sm text-gray-400">אין נתונים</p>
      ) : (
        <ol className="space-y-2">
          {attendees.map((a, i) => (
            <li key={a.personName} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-800">{a.personName}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {a.workingDays} ימים
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
