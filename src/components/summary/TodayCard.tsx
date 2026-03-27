import { TodayStatus } from "@/types"

interface TodayCardProps {
  today: TodayStatus
}

export function TodayCard({ today }: TodayCardProps) {
  const total = today.atWork.length + today.off.length + today.unknown.length
  const isWeekendOrHoliday = total === 0

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">נוכחות היום</h2>
        {total > 0 && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {today.atWork.length}/{total} בעבודה
          </span>
        )}
      </div>

      {isWeekendOrHoliday ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="text-3xl mb-2">🏖️</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">אין נתוני נוכחות להיום</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">שבת / חג / אין נתוני גיליון</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ChipSection title="במקום עבודה" names={today.atWork} chipClass="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800" emptyText="אין נוכחים" />
          <ChipSection title="לא בעבודה" names={today.off} chipClass="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700" emptyText="אין נעדרים" />
          {today.unknown.length > 0 && (
            <ChipSection title="לא ידוע" names={today.unknown} chipClass="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800" />
          )}
        </div>
      )}
    </div>
  )
}

function ChipSection({ title, names, chipClass, emptyText }: {
  title: string
  names: string[]
  chipClass: string
  emptyText?: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {names.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {names.map((name) => (
            <span key={name} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chipClass}`}>
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
