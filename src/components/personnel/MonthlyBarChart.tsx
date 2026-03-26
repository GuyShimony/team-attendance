"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface MonthlyBarChartProps {
  monthlyWorkDays: Record<string, number>
  selectedMonth: string
  onMonthClick: (month: string) => void
}

export function MonthlyBarChart({ monthlyWorkDays, selectedMonth, onMonthClick }: MonthlyBarChartProps) {
  const data = Object.entries(monthlyWorkDays)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, days]) => ({ month, days }))

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">אין נתונים</p>
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">ימי עבודה לפי חודש</h3>
      <p className="mb-4 text-xs text-gray-400">לחץ על עמודה לפירוט ימים</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
          onClick={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const month = (e as any)?.activePayload?.[0]?.payload?.month
            if (month) onMonthClick(month)
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="days" radius={[4, 4, 0, 0]}>
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
