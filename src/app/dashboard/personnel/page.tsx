"use client"

import { useEffect, useState } from "react"
import { PersonSelector } from "@/components/personnel/PersonSelector"
import { PersonStatsGrid } from "@/components/personnel/PersonStatsGrid"
import { MonthlyBarChart } from "@/components/personnel/MonthlyBarChart"
import { DayBreakdown } from "@/components/personnel/DayBreakdown"
import type { SheetData, PersonStats, DayEntry } from "@/types"

export default function PersonnelPage() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [selectedPerson, setSelectedPerson] = useState("")
  const [stats, setStats] = useState<PersonStats | null>(null)
  const [personEntries, setPersonEntries] = useState<DayEntry[]>([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sheets")
      .then((r) => r.json())
      .then((data: SheetData) => {
        setSheetData(data)
        setLoading(false)
      })
  }, [])

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

    let workingDays = 0
    let offDays = 0
    let saturdayWorkDays = 0
    let saturdayTotalDays = 0
    let arrivals = 0
    const monthlyWorkDays: Record<string, number> = {}

    for (const e of entries) {
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
      if (e.status === "at_work" && entries[entries.indexOf(e) - 1]?.status !== "at_work") {
        arrivals++
      }
    }

    const totalDays = workingDays + offDays

    setStats({
      personName: selectedPerson,
      workingDays,
      offDays,
      workPercent: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0,
      saturdayPercent:
        saturdayTotalDays > 0
          ? Math.round((saturdayWorkDays / saturdayTotalDays) * 100)
          : 0,
      arrivals,
      monthlyWorkDays,
    })
    setPersonEntries(entries)

    // Auto-select the most recent month that has work days
    const months = Object.keys(monthlyWorkDays).sort()
    if (months.length > 0) setSelectedMonth(months[months.length - 1])
  }, [sheetData, selectedPerson])

  const names = sheetData
    ? [...new Set(sheetData.allEntries.map((e) => e.personName))].sort()
    : []

  if (loading) return <p className="text-sm text-gray-500">טוען נתונים…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">פרסונל</h1>
      <PersonSelector names={names} selected={selectedPerson} onChange={setSelectedPerson} />

      {stats ? (
        <div className="space-y-6">
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
        <p className="text-sm text-gray-400">בחר עובד להצגת נתונים</p>
      )}
    </div>
  )
}
