import { DayEntry } from "@/types"

export interface SaturdayStats {
  totalSaturdayDays: number
  workedSaturdayDays: number
  teamSaturdayPercent: number
}

export function getSaturdayStats(allEntries: DayEntry[]): SaturdayStats {
  const saturdayEntries = allEntries.filter((e) => e.dayOfWeek === 6)

  const totalSaturdayDays = saturdayEntries.length
  const workedSaturdayDays = saturdayEntries.filter((e) => e.isAtWork).length

  const teamSaturdayPercent =
    totalSaturdayDays > 0
      ? Math.round((workedSaturdayDays / totalSaturdayDays) * 100)
      : 0

  return {
    totalSaturdayDays,
    workedSaturdayDays,
    teamSaturdayPercent,
  }
}
