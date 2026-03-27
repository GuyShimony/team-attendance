import { DayEntry, PersonStats } from "@/types"

export function getPersonStats(
  allEntries: DayEntry[],
  personName: string
): PersonStats {
  const entries = allEntries.filter((e) => e.personName === personName)

  let workingDays = 0
  let offDays = 0
  let saturdayWorkDays = 0
  let saturdayTotalDays = 0
  let arrivals = 0
  const monthlyWorkDays: Record<string, number> = {}

  for (const e of entries) {
    if (e.status === "released") continue  // excluded from all counts

    if (e.isAtWork) {
      workingDays++
      const month = e.date.slice(0, 7)  // "YYYY-MM"
      monthlyWorkDays[month] = (monthlyWorkDays[month] ?? 0) + 1
    } else {
      offDays++
    }

    if (e.dayOfWeek === 6) {  // Saturday
      saturdayTotalDays++
      if (e.isAtWork) saturdayWorkDays++
    }

    if (e.status === "arriving") arrivals++
  }

  const saturdayPercent =
    saturdayTotalDays > 0
      ? Math.round((saturdayWorkDays / saturdayTotalDays) * 100)
      : 0

  const totalDays = workingDays + offDays

  return {
    personName,
    workingDays,
    offDays,
    workPercent: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0,
    saturdayPercent,
    arrivals,
    monthlyWorkDays,
  }
}

export function getAllPersonNames(allEntries: DayEntry[]): string[] {
  return [...new Set(allEntries.map((e) => e.personName))].sort()
}
