"use client"

import { useEffect, useMemo, useState } from "react"
import { PersonStatsGrid } from "@/components/personnel/PersonStatsGrid"
import { MonthlyBarChart } from "@/components/personnel/MonthlyBarChart"
import { DayBreakdown } from "@/components/personnel/DayBreakdown"
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/Skeleton"
import type { SheetData, PersonStats, DayEntry } from "@/types"

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-rose-500", "bg-indigo-500",
  "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-lime-500",
]
function avatarColor(name: string) {
  let h = 0
  for (const c of name) h = h * 31 + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export default function PersonnelPage() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [selectedPerson, setSelectedPerson] = useState("")
  const [stats, setStats] = useState<PersonStats | null>(null)
  const [personEntries, setPersonEntries] = useState<DayEntry[]>([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    fetch("/api/sheets")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: SheetData) => {
        setSheetData(data)
        setLoading(false)
      })
      .catch(() => {
        setFetchError(true)
        setLoading(false)
      })
  }, [])

  // Quick stats for all workers (for the card grid)
  const allWorkerStats = useMemo(() => {
    if (!sheetData) return new Map<string, { workingDays: number; workPercent: number }>()
    const acc = new Map<string, { worked: number; total: number }>()
    for (const e of sheetData.allEntries) {
      if (e.status === "released") continue
      if (!acc.has(e.personName)) acc.set(e.personName, { worked: 0, total: 0 })
      const s = acc.get(e.personName)!
      s.total++
      if (e.isAtWork) s.worked++
    }
    const result = new Map<string, { workingDays: number; workPercent: number }>()
    for (const [name, { worked, total }] of acc) {
      result.set(name, {
        workingDays: worked,
        workPercent: total > 0 ? Math.round((worked / total) * 100) : 0,
      })
    }
    return result
  }, [sheetData])

  const names = useMemo(
    () => sheetData ? [...new Set(sheetData.allEntries.map((e) => e.personName))].sort() : [],
    [sheetData]
  )

  // Compute full stats when a person is selected
  useEffect(() => {
    if (!sheetData || !selectedPerson) {
      setStats(null)
      setPersonEntries([])
      setSelectedMonth("")
      return
    }

    const entries = sheetData.allEntries
      .filter((e) => e.personName === selectedPerson)
      .sort((a, b) => a.date.localeCompare(b.date))

    let workingDays = 0, offDays = 0, saturdayWorkDays = 0, saturdayTotalDays = 0, arrivals = 0
    const monthlyWorkDays: Record<string, number> = {}

    for (const e of entries) {
      if (e.status === "released") continue
      if (e.isAtWork) {
        workingDays++
        const month = e.date.slice(0, 7)
        monthlyWorkDays[month] = (monthlyWorkDays[month] ?? 0) + 1
      } else {
        offDays++
      }
      if (e.dayOfWeek === 6) {
        saturdayTotalDays++
        if (e.isAtWork) saturdayWorkDays++
      }
      if (e.status === "at_work" && entries[entries.indexOf(e) - 1]?.status !== "at_work") arrivals++
    }

    const totalDays = workingDays + offDays
    setStats({
      personName: selectedPerson,
      workingDays,
      offDays,
      workPercent: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0,
      saturdayPercent: saturdayTotalDays > 0 ? Math.round((saturdayWorkDays / saturdayTotalDays) * 100) : 0,
      arrivals,
      monthlyWorkDays,
    })
    setPersonEntries(entries)
    const months = Object.keys(monthlyWorkDays).sort()
    if (months.length > 0) setSelectedMonth(months[months.length - 1])
  }, [sheetData, selectedPerson])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">שגיאה בטעינת הנתונים</p>
        <button
          onClick={() => { setFetchError(false); setLoading(true); fetch("/api/sheets").then((r) => r.json()).then((d: SheetData) => { setSheetData(d); setLoading(false) }).catch(() => { setFetchError(true); setLoading(false) }) }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          נסה שנית
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">פרסונל</h1>

      {/* Worker card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {names.map((name) => {
          const s = allWorkerStats.get(name)
          const pct = s?.workPercent ?? 0
          const days = s?.workingDays ?? 0
          const isSelected = name === selectedPerson
          return (
            <button
              key={name}
              onClick={() => setSelectedPerson(isSelected ? "" : name)}
              className={`group relative rounded-xl border p-4 text-right shadow-sm transition-all duration-150 hover:shadow-md ${
                isSelected
                  ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-300 dark:ring-blue-700"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              {/* Avatar */}
              <div className={`h-10 w-10 rounded-full ${avatarColor(name)} flex items-center justify-center text-white text-sm font-bold mb-3`}>
                {name.slice(0, 2)}
              </div>
              {/* Name */}
              <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-900 dark:text-gray-100"}`}>
                {name}
              </p>
              {/* Stats row */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{days} ימים</span>
                <span className={`text-xs font-bold ${pct >= 60 ? "text-green-600 dark:text-green-400" : pct >= 30 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                  {pct}%
                </span>
              </div>
              {/* Mini bar */}
              <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-1 rounded-full transition-all ${pct >= 60 ? "bg-green-400" : pct >= 30 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isSelected && (
                <span className="absolute top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[9px]">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {stats ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full ${avatarColor(selectedPerson)} flex items-center justify-center text-white text-xs font-bold`}>
              {selectedPerson.slice(0, 2)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedPerson}</h2>
          </div>
          <PersonStatsGrid stats={stats} />
          <MonthlyBarChart
            monthlyWorkDays={stats.monthlyWorkDays}
            selectedMonth={selectedMonth}
            onMonthClick={setSelectedMonth}
          />
          {selectedMonth && (
            <DayBreakdown entries={personEntries} selectedMonth={selectedMonth} />
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">לחץ על עובד להצגת נתונים</p>
      )}
    </div>
  )
}
