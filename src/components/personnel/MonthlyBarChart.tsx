"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ",   "04": "אפריל",
  "05": "מאי",   "06": "יוני",   "07": "יולי",  "08": "אוגוסט",
  "09": "ספטמבר","10": "אוקטובר","11": "נובמבר","12": "דצמבר",
}
function hebrewMonth(ym: string) {
  return HEBREW_MONTHS[ym.slice(5)] ?? ym
}

interface MonthlyBarChartProps {
  monthlyWorkDays: Record<string, number>
  selectedMonth: string
  onMonthClick: (month: string) => void
}

export function MonthlyBarChart({ monthlyWorkDays, selectedMonth, onMonthClick }: MonthlyBarChartProps) {
  const data = Object.entries(monthlyWorkDays)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, days]) => ({ month, label: hebrewMonth(month), days }))

  if (data.length === 0) return <p className="text-sm text-gray-400">אין נתונים</p>

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">ימי עבודה לפי חודש</h3>
      <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">לחץ על עמודה לפירוט ימים</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 4, bottom: 4, left: 0 }}
          onClick={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const month = (e as any)?.activePayload?.[0]?.payload?.month
            if (month) onMonthClick(month)
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="days" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="days" position="top" style={{ fontSize: 11, fill: "#6b7280" }} />
            {data.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.month === selectedMonth ? "#1d4ed8" : "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
