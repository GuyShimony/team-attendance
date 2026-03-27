import { Sidebar } from "@/components/layout/Sidebar"
import { getCachedSheetData } from "@/lib/cache"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await getCachedSheetData()
  const workerCount = new Set(data.allEntries.map((e) => e.personName)).size

  return (
    <div className="flex min-h-screen flex-row-reverse">
      <Sidebar workerCount={workerCount} fetchedAt={data.fetchedAt} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
