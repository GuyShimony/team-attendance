"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard/summary", label: "סיכום יומי" },
  { href: "/dashboard/personnel", label: "פרסונל" },
  { href: "/dashboard/calendar", label: "לוח שנה" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 border-l border-gray-200 bg-white px-4 py-6">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900">נוכחות צוות</h1>
        <p className="text-xs text-gray-500">יציאות מכמ</p>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
