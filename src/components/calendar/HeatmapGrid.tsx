"use client"

import { DayEntry } from "@/types"
import { useMemo } from "react"

interface HeatmapGridProps {
  allEntries: DayEntry[]
}

export function HeatmapGrid({ allEntries }: HeatmapGridProps) {
  const { persons, dates, grid } = useMemo(() => {
    const personSet = new Set<string>()
    const dateSet = new Set<string>()
    const entryMap = new Map<string, boolean>()

    for (const e of allEntries) {
      personSet.add(e.personName)
      dateSet.add(e.date)
      entryMap.set(`${e.personName}::${e.date}`, e.isAtWork)
    }

    const persons = [...personSet].sort()
    // RTL: most recent on the right → sort ascending (left=old, right=new)
    const dates = [...dateSet].sort()

    const grid = persons.map((person) =>
      dates.map((date) => entryMap.get(`${person}::${date}`) ?? null)
    )

    return { persons, dates, grid }
  }, [allEntries])

  if (persons.length === 0) {
    return <p className="text-sm text-gray-400">אין נתונים</p>
  }

  return (
    <div className="overflow-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `160px repeat(${dates.length}, 18px)`,
          gap: "2px",
        }}
      >
        {/* Header row — dates */}
        <div />
        {dates.map((date) => (
          <div
            key={date}
            title={date}
            className="h-4 w-4 text-[8px] text-gray-400 overflow-hidden"
          >
            {date.slice(8)}
          </div>
        ))}

        {/* Person rows */}
        {persons.map((person, pi) => (
          <>
            <div
              key={person}
              className="truncate text-xs text-gray-700 leading-[18px]"
            >
              {person}
            </div>
            {grid[pi].map((isAtWork, di) => (
              <div
                key={`${person}-${dates[di]}`}
                title={`${person} – ${dates[di]}`}
                className={`h-4 w-4 rounded-sm ${
                  isAtWork === null
                    ? "bg-gray-100"
                    : isAtWork
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <LegendItem color="bg-green-500" label="בעבודה" />
        <LegendItem color="bg-gray-200" label="לא בעבודה" />
        <LegendItem color="bg-gray-100" label="לא ידוע" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`h-3 w-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}
