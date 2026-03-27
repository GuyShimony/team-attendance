import { DayEntry } from "@/types"
import { isArriving, isLeaving, isReleased } from "./normalize"

/**
 * Resolve isAtWork for every entry using an interval state machine.
 *
 * State: "excluded" | "at_work" | "off"
 *
 * Initial state:
 *  - "excluded" by default
 *  - "at_work" if the first non-released transition is יוצא (worker arrived
 *    before our data begins)
 *
 * Transitions:
 *  - מגיע/מגיעה  → state = "at_work"  (arrival day counts as at work)
 *  - יוצא/יוצאת  → state = "off"      (departure day does NOT count)
 *  - משוחרר      → state = "excluded" (day excluded; resets state)
 *  - empty/other → inherit state unchanged
 *
 * "excluded" days (whether explicit משוחרר or implicitly before/after an
 * active period) are emitted with status="released", isAtWork=false, and are
 * skipped by all stats calculations.
 */
export function applyStateMachine(entries: DayEntry[]): DayEntry[] {
  const byPerson = new Map<string, DayEntry[]>()
  for (const e of entries) {
    if (!byPerson.has(e.personName)) byPerson.set(e.personName, [])
    byPerson.get(e.personName)!.push(e)
  }

  const result: DayEntry[] = []

  for (const personEntries of byPerson.values()) {
    const sorted = [...personEntries].sort((a, b) => a.date.localeCompare(b.date))

    // Initial state: excluded, unless the first non-released transition is
    // יוצא — meaning the worker was already at work before data started.
    const firstTransition = sorted.find(
      (e) => !isReleased(e.rawCell) && (isArriving(e.rawCell) || isLeaving(e.rawCell))
    )
    type State = "excluded" | "at_work" | "off"
    let state: State =
      firstTransition && isLeaving(firstTransition.rawCell) ? "at_work" : "excluded"

    for (const entry of sorted) {
      const cell = entry.rawCell

      if (isReleased(cell)) {
        // Explicit release: exclude day and reset state to excluded
        result.push({ ...entry, status: "released", isAtWork: false })
        state = "excluded"
        continue
      }

      if (isArriving(cell)) {
        state = "at_work"
      } else if (isLeaving(cell)) {
        state = "off"
      }
      // else: inherit state unchanged

      if (state === "excluded") {
        // Implicitly excluded (no active period anchor)
        result.push({ ...entry, status: "released", isAtWork: false })
      } else {
        result.push({
          ...entry,
          status: state === "at_work" ? "at_work" : "off",
          isAtWork: state === "at_work",
        })
      }
    }
  }

  return result
}
