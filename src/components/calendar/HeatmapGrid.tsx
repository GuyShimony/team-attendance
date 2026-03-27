"use client"

import { Fragment, useMemo } from "react"
import { DayEntry } from "@/types"

interface HeatmapGridProps {
  allEntries: DayEntry[]
}

type CellStatus = "at_work" | "off" | "released" | "none"

const CELL_COLOR: Record<CellStatus, string> = {
  at_work:  "bg-green-500 hover:bg-green-400",
  off:      "bg-red-200  hover:bg-red-300",
  released: "bg-yellow-300 hover:bg-yellow-400",
  none:     "bg-gray-100",
}

const DAY_NAMES = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

export function HeatmapGrid({ allEntries }: HeatmapGridProps) {
  const { persons, months, personStats, cellStatus } = useMemo(() => {
    const personSet = new Set<string>()
    const dateSet   = new Set<string>()
    const statusMap = new Map<string, CellStatus>()

    for (const e of allEntries) {
      personSet.add(e.personName)
      dateSet.add(e.date)
      const cs: CellStatus =
        e.status === "released" ? "released" :
        e.isAtWork              ? "at_work"  : "off"
      statusMap.set(`${e.personName}::${e.date}`, cs)
    }

    const persons = [...personSet].sort()
    const allDates = [...dateSet].sort()

    // Group dates by month
    const monthMap = new Map<string, string[]>()
    for (const d of allDates) {
      const m = d.slice(0, 7)
      if (!monthMap.has(m)) monthMap.set(m, [])
      monthMap.get(m)!.push(d)
    }
    const months = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b))

    // Per-person stats
    const personStats = new Map<string, { worked: number; total: number }>()
    for (const person of persons) {
      let worked = 0, total = 0
      for (const d of allDates) {
        const cs = statusMap.get(`${person}::${d}`)
        if (!cs || cs === "none") continue
        if (cs === "released") continue
        total++
        if (cs === "at_work") worked++
      }
      personStats.set(person, { worked, total })
    }

    const cellStatus = (person: string, date: string): CellStatus =>
      statusMap.get(`${person}::${date}`) ?? "none"

    return { persons, months, personStats, cellStatus }
  }, [allEntries])

  if (persons.length === 0) {
    return <p className="text-sm text-gray-400">אין נתונים</p>
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-auto">
        <table className="border-collapse text-xs" style={{ direction: "ltr" }}>
          <thead>
            {/* Month headers */}
            <tr>
              <th className="sticky left-0 z-20 bg-white min-w-[140px] border-b border-gray-200" />
              <th className="w-10 border-b border-gray-200" />
              {months.map(([month, dates]) => (
                <th
                  key={month}
                  colSpan={dates.length}
                  className="text-center text-gray-500 font-medium px-1 pb-1 border-b border-gray-200 whitespace-nowrap"
                >
                  {formatMonth(month)}
                </th>
              ))}
            </tr>
            {/* Date cells */}
            <tr>
              <th className="sticky left-0 z-20 bg-white border-b border-gray-200 text-right pr-3 text-gray-400 font-normal py-1">
                שם
              </th>
              <th className="border-b border-gray-200 border-l border-gray-100 text-gray-400 font-normal px-1 whitespace-nowrap w-10">
                %
              </th>
              {months.map(([month, dates]) =>
                dates.map((date, i) => {
                  const [, , day] = date.split("-")
                  const dow = new Date(date).getDay()
                  const isSat = dow === 6
                  return (
                    <th
                      key={date}
                      title={`${day}/${month.slice(5)} ${DAY_NAMES[dow]}`}
                      className={`pb-1 font-normal text-center w-5 border-b border-gray-200 ${
                        isSat ? "border-r border-gray-300" : ""
                      } ${i === 0 ? "border-l border-gray-200" : ""} ${
                        isSat ? "text-blue-400" : "text-gray-400"
                      }`}
                    >
                      {parseInt(day)}
                    </th>
                  )
                })
              )}
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => {
              const stats = personStats.get(person)!
              const pct = stats.total > 0 ? Math.round((stats.worked / stats.total) * 100) : 0
              return (
                <tr key={person} className="hover:bg-gray-50 group">
                  {/* Name */}
                  <td
                    className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 pr-3 pl-2 py-0.5 text-right text-gray-700 font-medium whitespace-nowrap border-b border-gray-100"
                    style={{ direction: "rtl" }}
                  >
                    {person}
                  </td>
                  {/* Work % */}
                  <td className="px-1 py-0.5 text-center border-b border-gray-100 border-l border-gray-100 font-medium tabular-nums" style={{
                    color: pct >= 60 ? "#16a34a" : pct >= 30 ? "#ca8a04" : "#dc2626"
                  }}>
                    {pct}
                  </td>
                  {/* Cells */}
                  {months.map(([month, dates]) =>
                    dates.map((date, i) => {
                      const cs = cellStatus(person, date)
                      const dow = new Date(date).getDay()
                      const isSat = dow === 6
                      const [, , day] = date.split("-")
                      return (
                        <td
                          key={date}
                          title={`${person} – ${day}/${month.slice(5)} (${DAY_NAMES[dow]})`}
                          className={`p-0 border-b border-gray-100 ${i === 0 ? "border-l border-gray-200" : ""} ${isSat ? "border-r border-gray-300" : ""}`}
                        >
                          <div className={`w-5 h-5 rounded-sm mx-auto cursor-default transition-colors ${CELL_COLOR[cs]}`} />
                        </td>
                      )
                    })
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        <LegendItem color="bg-green-500"   label="בעבודה" />
        <LegendItem color="bg-red-200"     label="לא בעבודה" />
        <LegendItem color="bg-yellow-300"  label="משוחרר" />
        <LegendItem color="bg-gray-100"    label="אין נתון" />
        <span className="mr-auto text-gray-400">% = אחוז נוכחות כללי</span>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3.5 w-3.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-")
  const names = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]
  return `${names[parseInt(month) - 1]} ${year}`
}
