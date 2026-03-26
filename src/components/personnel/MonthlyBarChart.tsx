"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface MonthlyBarChartProps {
  monthlyWorkDays: Record<string, number>
}

export function MonthlyBarChart({ monthlyWorkDays }: MonthlyBarChartProps) {
  const data = Object.entries(monthlyWorkDays)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, days]) => ({
      month: month.slice(0, 7),  // "YYYY-MM"
      days,
    }))

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">אין נתונים</p>
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">ימי עבודה לפי חודש</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
