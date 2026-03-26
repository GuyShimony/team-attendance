import { TodayStatus } from "@/types"

interface TodayCardProps {
  today: TodayStatus
}

export function TodayCard({ today }: TodayCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">נוכחות היום</h2>

      <div className="space-y-4">
        <Section
          title="במקום עבודה"
          names={today.atWork}
          dotColor="bg-green-500"
          emptyText="אין נוכחים"
        />
        <Section
          title="לא בעבודה"
          names={today.off}
          dotColor="bg-gray-300"
          emptyText="אין נעדרים"
        />
        {today.unknown.length > 0 && (
          <Section
            title="לא ידוע"
            names={today.unknown}
            dotColor="bg-yellow-400"
          />
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  names,
  dotColor,
  emptyText,
}: {
  title: string
  names: string[]
  dotColor: string
  emptyText?: string
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-500">{title}</p>
      {names.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {names.map((name) => (
            <li key={name} className="flex items-center gap-2 text-sm text-gray-800">
              <span className={`h-2 w-2 rounded-full ${dotColor}`} />
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
