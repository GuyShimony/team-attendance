import { DayEntry } from "@/types"

export interface AttendeeRank {
  personName: string
  workingDays: number
  totalDays: number
  workPercent: number
}

export function getTopAttendees(
  allEntries: DayEntry[],
  limit = 5
): AttendeeRank[] {
  const worked  = new Map<string, number>()
  const total   = new Map<string, number>()

  for (const e of allEntries) {
    if (e.status === "released") continue
    total.set(e.personName, (total.get(e.personName) ?? 0) + 1)
    if (e.isAtWork) worked.set(e.personName, (worked.get(e.personName) ?? 0) + 1)
  }

  return [...total.keys()]
    .map((personName) => {
      const w = worked.get(personName) ?? 0
      const t = total.get(personName) ?? 0
      return {
        personName,
        workingDays: w,
        totalDays: t,
        workPercent: t > 0 ? Math.round((w / t) * 100) : 0,
      }
    })
    .sort((a, b) => b.workingDays - a.workingDays)
    .slice(0, limit)
}
