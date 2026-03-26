import { DayEntry } from "@/types"
import { isArriving, isLeaving } from "./normalize"

/**
 * Resolve isAtWork for every entry using an interval state machine.
 *
 * Rules (per person, sorted chronologically across ALL tabs):
 *  - מגיע / מגיעה in cell → worker arrives; this day AND all following days
 *    are at work until the next יוצא/יוצאת.
 *  - יוצא / יוצאת in cell → worker leaves; this day is NOT counted.
 *    All following days are not at work until the next מגיע.
 *  - Any other cell (empty or other text) → inherit current state.
 */
export function applyStateMachine(entries: DayEntry[]): DayEntry[] {
  // Group by person
  const byPerson = new Map<string, DayEntry[]>()
  for (const e of entries) {
    if (!byPerson.has(e.personName)) byPerson.set(e.personName, [])
    byPerson.get(e.personName)!.push(e)
  }

  const result: DayEntry[] = []

  for (const personEntries of byPerson.values()) {
    // Sort chronologically (ISO dates compare correctly as strings)
    const sorted = [...personEntries].sort((a, b) => a.date.localeCompare(b.date))

    let atWork = false  // initial state: not at work

    for (const entry of sorted) {
      const cell = entry.rawCell

      if (isArriving(cell)) {
        atWork = true                  // arrival day counts as at work
      } else if (isLeaving(cell)) {
        atWork = false                 // departure day does NOT count
      }
      // else: inherit atWork unchanged

      result.push({
        ...entry,
        status: atWork ? "at_work" : "off",
        isAtWork: atWork,
      })
    }
  }

  return result
}
