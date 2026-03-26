import { SaturdayStats } from "@/lib/analytics/saturday-stats"

export function SaturdayCard({ stats }: { stats: SaturdayStats }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">נוכחות בשבת</h2>
      <div className="text-center">
        <p className="text-5xl font-bold text-blue-600">{stats.teamSaturdayPercent}%</p>
        <p className="mt-2 text-sm text-gray-500">
          {stats.workedSaturdayDays} מתוך {stats.totalSaturdayDays} ימי שבת
        </p>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${stats.teamSaturdayPercent}%` }}
        />
      </div>
    </div>
  )
}
