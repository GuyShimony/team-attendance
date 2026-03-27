"use client"

import { Fragment, useMemo, useState } from "react"
import { DayEntry } from "@/types"

interface HeatmapGridProps {
  allEntries: DayEntry[]
}

type CellStatus = "at_work" | "off" | "released" | "none"
type SortKey = "name" | "percent" | "days"
type CellSize = "sm" | "md" | "lg"

const CELL_PX: Record<CellSize, number> = { sm: 14, md: 18, lg: 24 }

const CELL_COLOR: Record<CellStatus, string> = {
  at_work:  "bg-green-500 hover:bg-green-400",
  off:      "bg-red-200 dark:bg-red-900 hover:bg-red-300",
  released: "bg-yellow-300 dark:bg-yellow-700 hover:bg-yellow-400",
  none:     "bg-gray-100 dark:bg-gray-800",
}

const DAY_SHORT = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ",    "04": "אפריל",
  "05": "מאי",   "06": "יוני",   "07": "יולי",   "08": "אוגוסט",
  "09": "ספטמבר","10": "אוקטובר","11": "נובמבר", "12": "דצמבר",
}
function hebrewMonth(ym: string) {
  const [year, m] = ym.split("-")
  return `${HEBREW_MONTHS[m] ?? ym} ${year}`
}

export function HeatmapGrid({ allEntries }: HeatmapGridProps) {
  const [sortKey, setSortKey]       = useState<SortKey>("name")
  const [cellSize, setCellSize]     = useState<CellSize>("md")
  const [monthIndex, setMonthIndex] = useState<number | null>(null) // null = all

  const { allMonths, personList, cellStatus, daySummary, personStats } = useMemo(() => {
    const personSet  = new Set<string>()
    const dateSet    = new Set<string>()
    const statusMap  = new Map<string, CellStatus>()
    const statsAcc   = new Map<string, { worked: number; total: number }>()

    for (const e of allEntries) {
      personSet.add(e.personName)
      dateSet.add(e.date)
      const cs: CellStatus =
        e.status === "released" ? "released" :
        e.isAtWork              ? "at_work"  : "off"
      statusMap.set(`${e.personName}::${e.date}`, cs)

      if (e.status !== "released") {
        if (!statsAcc.has(e.personName)) statsAcc.set(e.personName, { worked: 0, total: 0 })
        const s = statsAcc.get(e.personName)!
        s.total++
        if (e.isAtWork) s.worked++
      }
    }

    const allDates = [...dateSet].sort()

    // Group dates by month
    const monthMap = new Map<string, string[]>()
    for (const d of allDates) {
      const m = d.slice(0, 7)
      if (!monthMap.has(m)) monthMap.set(m, [])
      monthMap.get(m)!.push(d)
    }
    const allMonths = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b))

    const personStats = new Map<string, { worked: number; total: number; percent: number }>()
    for (const [name, { worked, total }] of statsAcc) {
      personStats.set(name, { worked, total, percent: total > 0 ? Math.round(worked / total * 100) : 0 })
    }

    const cellStatus = (person: string, date: string): CellStatus =>
      statusMap.get(`${person}::${date}`) ?? "none"

    // Day summary: count at-work per date
    const daySummary = new Map<string, number>()
    for (const d of allDates) {
      let count = 0
      for (const p of personSet) {
        if (cellStatus(p, d) === "at_work") count++
      }
      daySummary.set(d, count)
    }

    const personList = [...personSet]

    return { allMonths, personList, cellStatus, daySummary, personStats }
  }, [allEntries])

  // Sort persons
  const sortedPersons = useMemo(() => {
    return [...personList].sort((a, b) => {
      if (sortKey === "name")    return a.localeCompare(b, "he")
      if (sortKey === "percent") return (personStats.get(b)?.percent ?? 0) - (personStats.get(a)?.percent ?? 0)
      if (sortKey === "days")    return (personStats.get(b)?.worked  ?? 0) - (personStats.get(a)?.worked  ?? 0)
      return 0
    })
  }, [personList, sortKey, personStats])

  // Month filter
  const visibleMonths = monthIndex === null ? allMonths : [allMonths[monthIndex]].filter(Boolean) as typeof allMonths

  const px = CELL_PX[cellSize]

  if (personList.length === 0) return <p className="text-sm text-gray-400">אין נתונים</p>

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month nav */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          <button
            onClick={() => setMonthIndex(null)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${monthIndex === null ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >כל החודשים</button>
          {allMonths.map(([ym], i) => (
            <button
              key={ym}
              onClick={() => setMonthIndex(i === monthIndex ? null : i)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${monthIndex === i ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              {HEBREW_MONTHS[ym.slice(5)] ?? ym}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          {([["name","שם"],["percent","%"],["days","ימים"]] as [SortKey,string][]).map(([k,label]) => (
            <button key={k} onClick={() => setSortKey(k)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${sortKey === k ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Cell size */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          {([["sm","S"],["md","M"],["lg","L"]] as [CellSize,string][]).map(([k,label]) => (
            <button key={k} onClick={() => setCellSize(k)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${cellSize === k ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="border-collapse text-xs" style={{ direction: "ltr" }}>
            <thead>
              {/* Month headers */}
              <tr>
                <th className="sticky left-0 z-20 bg-white dark:bg-gray-900 min-w-[130px] border-b border-gray-200 dark:border-gray-700" />
                <th className="w-12 border-b border-gray-200 dark:border-gray-700" />
                {visibleMonths.map(([ym, dates]) => (
                  <th key={ym} colSpan={dates.length}
                    className="text-center text-gray-500 dark:text-gray-400 font-medium px-1 pb-1 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                    {hebrewMonth(ym)}
                  </th>
                ))}
              </tr>
              {/* Date row */}
              <tr>
                <th className="sticky left-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-right pr-3 text-gray-400 font-normal py-1">שם</th>
                <th className="border-b border-gray-200 dark:border-gray-700 border-l border-gray-100 dark:border-gray-800 text-gray-400 font-normal px-1 w-10">%</th>
                {visibleMonths.map(([ym, dates]) =>
                  dates.map((date, i) => {
                    const [, , day] = date.split("-")
                    const dow = new Date(date).getDay()
                    const isSat = dow === 6
                    return (
                      <th key={date}
                        title={`${day}/${ym.slice(5)} ${DAY_SHORT[dow]}`}
                        style={{ width: px, minWidth: px }}
                        className={`pb-1 font-normal text-center border-b border-gray-200 dark:border-gray-700 ${isSat ? "border-r border-gray-300 dark:border-gray-600 text-blue-400" : "text-gray-400 dark:text-gray-600"} ${i === 0 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}>
                        {cellSize !== "sm" ? parseInt(day) : ""}
                      </th>
                    )
                  })
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPersons.map((person) => {
                const ps = personStats.get(person)
                const pct = ps?.percent ?? 0
                return (
                  <tr key={person} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 pr-3 pl-2 py-0.5 text-right text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap border-b border-gray-100 dark:border-gray-800" style={{ direction: "rtl" }}>
                      {person}
                    </td>
                    <td className="px-1 py-0.5 text-center border-b border-gray-100 dark:border-gray-800 border-l border-gray-100 dark:border-gray-800 font-medium tabular-nums"
                      style={{ color: pct >= 60 ? "#16a34a" : pct >= 30 ? "#ca8a04" : "#dc2626" }}>
                      {pct}
                    </td>
                    {visibleMonths.map(([ym, dates]) =>
                      dates.map((date, i) => {
                        const cs = cellStatus(person, date)
                        const dow = new Date(date).getDay()
                        const isSat = dow === 6
                        const [, , day] = date.split("-")
                        return (
                          <td key={date}
                            title={`${person} – ${day}/${ym.slice(5)} (${DAY_SHORT[dow]})`}
                            className={`p-0 border-b border-gray-100 dark:border-gray-800 ${i === 0 ? "border-l border-gray-200 dark:border-gray-700" : ""} ${isSat ? "border-r border-gray-300 dark:border-gray-600" : ""}`}>
                            <div style={{ width: px, height: px }}
                              className={`rounded-sm mx-auto cursor-default transition-colors ${CELL_COLOR[cs]}`} />
                          </td>
                        )
                      })
                    )}
                  </tr>
                )
              })}
              {/* Summary row */}
              <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 pr-3 pl-2 py-1 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap" style={{ direction: "rtl" }}>
                  סה״כ בעבודה
                </td>
                <td className="border-l border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800" />
                {visibleMonths.map(([ym, dates]) =>
                  dates.map((date, i) => {
                    const count = daySummary.get(date) ?? 0
                    const isSat = new Date(date).getDay() === 6
                    return (
                      <td key={date}
                        className={`p-0 bg-gray-50 dark:bg-gray-800 text-center text-[9px] font-medium ${count > 0 ? "text-gray-600 dark:text-gray-400" : "text-gray-300 dark:text-gray-700"} ${i === 0 ? "border-l border-gray-200 dark:border-gray-700" : ""} ${isSat ? "border-r border-gray-300 dark:border-gray-600" : ""}`}>
                        {count > 0 ? count : ""}
                      </td>
                    )
                  })
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <LegendItem color="bg-green-500"                 label="בעבודה" />
          <LegendItem color="bg-red-200 dark:bg-red-900"  label="לא בעבודה" />
          <LegendItem color="bg-yellow-300 dark:bg-yellow-700" label="משוחרר" />
          <LegendItem color="bg-gray-100 dark:bg-gray-800" label="אין נתון" />
          <span className="mr-auto text-gray-400 dark:text-gray-600">% = אחוז נוכחות</span>
        </div>
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
