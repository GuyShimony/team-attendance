import { DayEntry, TodayStatus } from "@/types"
import { todayISO } from "@/lib/parser/date-utils"

export function getTodayStatus(allEntries: DayEntry[]): TodayStatus {
  const today = todayISO()
  const todayEntries = allEntries.filter((e) => e.date === today)

  const atWork: string[] = []
  const off: string[] = []
  const unknown: string[] = []

  // Deduplicate by person (take last entry per person if duplicates)
  const byPerson = new Map<string, DayEntry>()
  for (const e of todayEntries) {
    byPerson.set(e.personName, e)
  }

  for (const [name, entry] of byPerson) {
    if (entry.isAtWork) {
      atWork.push(name)
    } else if (entry.status === "unknown") {
      unknown.push(name)
    } else {
      off.push(name)
    }
  }

  return {
    atWork: atWork.sort(),
    off: off.sort(),
    unknown: unknown.sort(),
  }
}
