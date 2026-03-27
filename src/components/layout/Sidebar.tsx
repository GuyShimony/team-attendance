"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const navItems = [
  { href: "/dashboard/summary",   label: "סיכום יומי",  icon: "📊" },
  { href: "/dashboard/personnel", label: "פרסונל",      icon: "👥" },
  { href: "/dashboard/calendar",  label: "לוח שנה",     icon: "📅" },
]

interface SidebarProps {
  workerCount?: number
  fetchedAt?: string
}

export function Sidebar({ workerCount, fetchedAt }: SidebarProps) {
  const pathname = usePathname()

  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    : null

  return (
    <aside className="w-52 shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col px-4 py-6">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">נוכחות צוות</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">יציאות מכמ</p>
        {workerCount !== undefined && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
            {workerCount} עובדים
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
        {lastUpdated && (
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            עודכן: {lastUpdated}
          </p>
        )}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
