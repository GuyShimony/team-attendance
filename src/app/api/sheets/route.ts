export const dynamic = "force-dynamic"

import { getCachedSheetData } from "@/lib/cache"

export async function GET() {
  try {
    const data = await getCachedSheetData()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching sheet data:", error)
    return Response.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    )
  }
}
