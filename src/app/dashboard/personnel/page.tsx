export const dynamic = "force-dynamic"

import { getCachedSheetData } from "@/lib/cache"
import { PersonnelClient } from "@/components/personnel/PersonnelClient"

export default async function PersonnelPage() {
  const data = await getCachedSheetData()
  return <PersonnelClient allEntries={data.allEntries} />
}
