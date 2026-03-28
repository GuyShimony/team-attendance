"use client"

import { useMemo, useState } from "react"
import type { DayEntry, TodayStatus } from "@/types"

interface DateCheckerCardProps {
  allEntries: DayEntry[]
  lastDataDate: string  // ISO "YYYY-MM-DD"
}

function getStatusForDate(allEntries: DayEntry[], date: string): TodayStatus & { hasData: boolean } {
  const dayEntries = allEntries.filter((e) => e.date === date)
  if (dayEntries.length === 0) return { atWork: [], off: [], unknown: [], hasData: false }

  const byPerson = new Map<string, DayEntry>()
  for (const e of dayEntries) byPerson.set(e.personName, e)

  const atWork: string[] = []
  const off: string[] = []
  const unknown: string[] = []

  for (const [name, entry] of byPerson) {
    if (entry.isAtWork) atWork.push(name)
    else if (entry.status === "unknown") unknown.push(name)
    else off.push(name)
  }

  return { atWork: atWork.sort(), off: off.sort(), unknown: unknown.sort(), hasData: true }
}

function formatDateHebrew(iso: string) {
  if (!iso) return ""
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

export function DateCheckerCard({ allEntries, lastDataDate }: DateCheckerCardProps) {
  const [selectedDate, setSelectedDate] = useState(lastDataDate)

  const status = useMemo(() => getStatusForDate(allEntries, selectedDate), [allEntries, selectedDate])

  const total = status.atWork.length + status.off.length + status.unknown.length

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">בדיקת נוכחות לתאריך</h2>
        {status.hasData && total > 0 && (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {status.atWork.length}/{total} בעבודה
          </span>
        )}
      </div>

      {/* Date picker */}
      <div className="mb-5">
        <input
          type="date"
          value={selectedDate}
          max={lastDataDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors"
          style={{ direction: "ltr" }}
        />
      </div>

      {/* Results */}
      {!selectedDate ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <span className="text-2xl mb-2">📅</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">בחר תאריך לבדיקה</p>
        </div>
      ) : !status.hasData ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <span className="text-2xl mb-2">🔍</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">אין נתונים לתאריך {formatDateHebrew(selectedDate)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">ייתכן שבת, חג, או טרם הוזן</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-slide-down">
          <ChipSection
            title="במקום עבודה"
            names={status.atWork}
            chipClass="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
            emptyText="אין נוכחים"
          />
          <ChipSection
            title="לא בעבודה"
            names={status.off}
            chipClass="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            emptyText="אין נעדרים"
          />
          {status.unknown.length > 0 && (
            <ChipSection
              title="לא ידוע"
              names={status.unknown}
              chipClass="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
            />
          )}
        </div>
      )}
    </div>
  )
}

function ChipSection({ title, names, chipClass, emptyText }: {
  title: string
  names: string[]
  chipClass: string
  emptyText?: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {names.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {names.map((name) => (
            <span key={name} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chipClass}`}>
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
