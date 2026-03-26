export const dynamic = "force-dynamic"

import { getCachedSheetData } from "@/lib/cache"

// GET /api/debug?person=גיא
// Returns all parsed entries for a person, sorted by date, with raw cell values.
// Also returns a list of all detected person names (with hex codes to catch Unicode issues).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const person = searchParams.get("person")

  const data = await getCachedSheetData()

  // All distinct person names with their hex representation
  const names = [...new Set(data.allEntries.map((e) => e.personName))].sort()
  const namesWithHex = names.map((n) => ({
    name: n,
    hex: Buffer.from(n, "utf8").toString("hex"),
  }))

  if (!person) {
    return Response.json({ names: namesWithHex })
  }

  const entries = data.allEntries
    .filter((e) => e.personName === person)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      dayOfWeek: e.dayOfWeek,
      rawCell: e.rawCell,
      status: e.status,
      isAtWork: e.isAtWork,
    }))

  return Response.json({ person, count: entries.length, entries })
}
