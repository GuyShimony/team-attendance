export const dynamic = "force-dynamic"

import { getCachedSheetData } from "@/lib/cache"
import { HeatmapGrid } from "@/components/calendar/HeatmapGrid"

export default async function CalendarPage() {
  const data = await getCachedSheetData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">לוח שנה</h1>
      <HeatmapGrid allEntries={data.allEntries} />
    </div>
  )
}
