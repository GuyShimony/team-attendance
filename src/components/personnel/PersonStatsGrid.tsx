import { PersonStats } from "@/types"
import { StatCard } from "@/components/ui/StatCard"

export function PersonStatsGrid({ stats }: { stats: PersonStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard label="ימי עבודה" value={stats.workingDays} />
      <StatCard label="ימי היעדרות" value={stats.offDays} />
      <StatCard label="נוכחות כללית" value={`${stats.workPercent}%`} />
      <StatCard label="נוכחות בשבת" value={`${stats.saturdayPercent}%`} />
      <StatCard label="הגעות" value={stats.arrivals} />
    </div>
  )
}
