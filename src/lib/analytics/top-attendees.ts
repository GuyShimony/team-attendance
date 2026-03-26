import { DayEntry } from "@/types"

export interface AttendeeRank {
  personName: string
  workingDays: number
}

export function getTopAttendees(
  allEntries: DayEntry[],
  limit = 5
): AttendeeRank[] {
  const counts = new Map<string, number>()

  for (const e of allEntries) {
    if (e.isAtWork) {
      counts.set(e.personName, (counts.get(e.personName) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([personName, workingDays]) => ({ personName, workingDays }))
    .sort((a, b) => b.workingDays - a.workingDays)
    .slice(0, limit)
}
