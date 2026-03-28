"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { PersonStatsGrid } from "@/components/personnel/PersonStatsGrid"
import { MonthlyBarChart } from "@/components/personnel/MonthlyBarChart"
import { DayBreakdown } from "@/components/personnel/DayBreakdown"
import type { DayEntry, PersonStats } from "@/types"

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-rose-500", "bg-indigo-500",
  "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-lime-500",
]
function avatarColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

interface PersonnelClientProps {
  allEntries: DayEntry[]
}

export function PersonnelClient({ allEntries }: PersonnelClientProps) {
  const [selectedPerson, setSelectedPerson] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const detailRef = useRef<HTMLDivElement>(null)

  const { allWorkerStats, names } = useMemo(() => {
    const acc = new Map<string, { worked: number; total: number }>()
    for (const e of allEntries) {
      if (e.status === "released") continue
      if (!acc.has(e.personName)) acc.set(e.personName, { worked: 0, total: 0 })
      const s = acc.get(e.personName)!
      s.total++
      if (e.isAtWork) s.worked++
    }
    const allWorkerStats = new Map<string, { workingDays: number; workPercent: number }>()
    for (const [name, { worked, total }] of acc) {
      allWorkerStats.set(name, {
        workingDays: worked,
        workPercent: total > 0 ? Math.round((worked / total) * 100) : 0,
      })
    }
    const names = [...new Set(allEntries.map((e) => e.personName))].sort()
    return { allWorkerStats, names }
  }, [allEntries])

  const personData = useMemo<{ stats: PersonStats; entries: DayEntry[]; latestMonth: string } | null>(() => {
    if (!selectedPerson) return null

    const entries = allEntries
      .filter((e) => e.personName === selectedPerson)
      .sort((a, b) => a.date.localeCompare(b.date))

    let workingDays = 0, offDays = 0, saturdayWorkDays = 0, saturdayTotalDays = 0, arrivals = 0
    const monthlyWorkDays: Record<string, number> = {}

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
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
      if (e.status === "at_work" && entries[i - 1]?.status !== "at_work") arrivals++
    }

    const totalDays = workingDays + offDays
    const months = Object.keys(monthlyWorkDays).sort()
    return {
      stats: {
        personName: selectedPerson,
        workingDays,
        offDays,
        workPercent: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0,
        saturdayPercent: saturdayTotalDays > 0 ? Math.round((saturdayWorkDays / saturdayTotalDays) * 100) : 0,
        arrivals,
        monthlyWorkDays,
      },
      entries,
      latestMonth: months[months.length - 1] ?? "",
    }
  }, [allEntries, selectedPerson])

  const activeMonth = selectedMonth || personData?.latestMonth || ""

  function handlePersonSelect(name: string) {
    setSelectedPerson((prev) => (prev === name ? "" : name))
    setSelectedMonth("")
  }

  // Auto-scroll to detail panel on desktop when a person is selected
  useEffect(() => {
    if (personData && detailRef.current && window.innerWidth >= 768) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [personData])

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
              onClick={() => handlePersonSelect(name)}
              className={`group relative rounded-xl border p-4 text-right shadow-sm transition-all duration-150 hover:shadow-md ${
                isSelected
                  ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-300 dark:ring-blue-700"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              <div className={`h-10 w-10 rounded-full ${avatarColor(name)} flex items-center justify-center text-white text-sm font-bold mb-3`}>
                {name.slice(0, 2)}
              </div>
              <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-900 dark:text-gray-100"}`}>
                {name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{days} ימים</span>
                <span className={`text-xs font-bold ${pct >= 60 ? "text-green-600 dark:text-green-400" : pct >= 30 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                  {pct}%
                </span>
              </div>
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

      {/* Mobile hint */}
      {!personData && (
        <p className="md:hidden text-xs text-center text-gray-400 dark:text-gray-600 -mt-2">
          לחץ על עובד לצפייה בנתוניו
        </p>
      )}

      {/* ─── Mobile bottom sheet ─── */}
      {personData && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => handlePersonSelect(selectedPerson)}
          />
          {/* Sheet */}
          <div
            key={selectedPerson}
            className="md:hidden fixed bottom-0 inset-x-0 z-[60] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden flex flex-col"
            style={{ maxHeight: "85dvh", paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Sheet header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full ${avatarColor(selectedPerson)} flex items-center justify-center text-white text-sm font-bold`}>
                  {selectedPerson.slice(0, 2)}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{selectedPerson}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {personData.stats.workingDays} ימי עבודה · {personData.stats.workPercent}% נוכחות
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePersonSelect(selectedPerson)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-5">
              <PersonStatsGrid stats={personData.stats} />
              <MonthlyBarChart
                monthlyWorkDays={personData.stats.monthlyWorkDays}
                selectedMonth={activeMonth}
                onMonthClick={setSelectedMonth}
              />
              {activeMonth && (
                <DayBreakdown entries={personData.entries} selectedMonth={activeMonth} />
              )}
              <div className="h-2" /> {/* bottom breathing room */}
            </div>
          </div>
        </>
      )}

      {/* ─── Desktop inline detail panel ─── */}
      <div ref={detailRef} className="scroll-mt-4">
        {personData ? (
          <div key={selectedPerson} className="hidden md:block space-y-6 animate-fade-slide-down">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className={`h-10 w-10 rounded-full ${avatarColor(selectedPerson)} flex items-center justify-center text-white text-sm font-bold`}>
                {selectedPerson.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedPerson}</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {personData.stats.workingDays} ימי עבודה · {personData.stats.workPercent}% נוכחות
                </p>
              </div>
              <button
                onClick={() => handlePersonSelect(selectedPerson)}
                className="mr-auto flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="סגור"
              >
                ✕
              </button>
            </div>
            <PersonStatsGrid stats={personData.stats} />
            <MonthlyBarChart
              monthlyWorkDays={personData.stats.monthlyWorkDays}
              selectedMonth={activeMonth}
              onMonthClick={setSelectedMonth}
            />
            {activeMonth && (
              <DayBreakdown entries={personData.entries} selectedMonth={activeMonth} />
            )}
          </div>
        ) : (
          <p className="hidden md:block text-sm text-gray-400 dark:text-gray-600 text-center py-6">
            לחץ על עובד להצגת נתוניו
          </p>
        )}
      </div>
    </div>
  )
}
