import { PersonStats } from "@/types"

interface StatTileProps {
  label: string
  value: string | number
  trend?: number   // positive = up, negative = down, 0/undefined = no trend
  color?: string
}

function StatTile({ label, value, trend, color = "text-gray-900 dark:text-gray-100" }: StatTileProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className={`mb-1 text-xs font-semibold ${trend > 0 ? "text-green-500" : "text-red-400"}`}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}
          </span>
        )}
      </div>
    </div>
  )
}

export function PersonStatsGrid({ stats }: { stats: PersonStats }) {
  // Compute month-over-month trend for working days
  const months = Object.entries(stats.monthlyWorkDays).sort(([a], [b]) => a.localeCompare(b))
  const trend = months.length >= 2
    ? months[months.length - 1][1] - months[months.length - 2][1]
    : undefined

  const workColor =
    stats.workPercent >= 60 ? "text-green-600 dark:text-green-400" :
    stats.workPercent >= 30 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400"

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatTile label="ימי עבודה"    value={stats.workingDays}           trend={trend} />
      <StatTile label="ימי היעדרות"  value={stats.offDays} />
      <StatTile label="נוכחות כללית" value={`${stats.workPercent}%`}     color={workColor} />
      <StatTile label="נוכחות בשבת"  value={`${stats.saturdayPercent}%`} />
      <StatTile label="הגעות"        value={stats.arrivals} />
    </div>
  )
}
