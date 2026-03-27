import { DayEntry } from "@/types"
import { isArriving, isLeaving, isReleased } from "./normalize"

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

    // If the first explicit transition we see is יוצא, the person was already
    // at work before our data starts — so begin in at_work state.
    const firstTransition = sorted.find((e) => isArriving(e.rawCell) || isLeaving(e.rawCell))
    let atWork = firstTransition ? isLeaving(firstTransition.rawCell) : false

    for (const entry of sorted) {
      const cell = entry.rawCell

      if (isArriving(cell)) {
        atWork = true   // arrival day counts as at work
      } else if (isLeaving(cell)) {
        atWork = false  // departure day does NOT count
      }
      // else: inherit atWork unchanged

      // משוחרר: excluded from all counts; state carries through unchanged
      if (isReleased(cell)) {
        result.push({ ...entry, status: "released", isAtWork: false })
      } else {
        result.push({
          ...entry,
          status: atWork ? "at_work" : "off",
          isAtWork: atWork,
        })
      }
    }
  }

  return result
}
