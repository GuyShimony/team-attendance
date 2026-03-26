import { DayEntry, WorkStatus } from "@/types"

/**
 * Run the presence state machine per person across all entries (sorted by date).
 *
 * Rules:
 *   - initial state = "off"
 *   - "arriving"       → state = "at_work", isAtWork = true
 *   - "leaving"        → state = "off",     isAtWork = false
 *   - "other_battery" / "standby" → isAtWork = true (no state change)
 *   - empty / null     → isAtWork = (state == "at_work")
 *   - "unknown"        → keep current state, isAtWork = (state == "at_work")
 */
export function applyStateMachine(entries: DayEntry[]): DayEntry[] {
  // Group by person
  const byPerson = new Map<string, DayEntry[]>()
  for (const e of entries) {
    if (!byPerson.has(e.personName)) byPerson.set(e.personName, [])
    byPerson.get(e.personName)!.push(e)
  }

  const result: DayEntry[] = []

  for (const [, personEntries] of byPerson) {
    // Sort chronologically
    const sorted = [...personEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    let state: "at_work" | "off" = "off"

    for (const entry of sorted) {
      const explicit = entry.rawCell
        ? entry.rawCell.trim().normalize("NFC")
        : null

      let resolvedStatus: WorkStatus = entry.status
      let isAtWork: boolean

      if (resolvedStatus === "arriving") {
        state = "at_work"
        isAtWork = true
      } else if (resolvedStatus === "leaving") {
        state = "off"
        isAtWork = false
      } else if (
        resolvedStatus === "other_battery" ||
        resolvedStatus === "standby"
      ) {
        isAtWork = true
        // don't change state
      } else {
        // empty / unknown → derive from state
        isAtWork = state === "at_work"
        if (isAtWork) {
          resolvedStatus = "at_work"
        } else {
          resolvedStatus = "off"
        }
      }

      result.push({ ...entry, status: resolvedStatus, isAtWork })
    }
  }

  return result
}
