"use client"

interface PersonSelectorProps {
  names: string[]
  selected: string
  onChange: (name: string) => void
}

export function PersonSelector({ names, selected, onChange }: PersonSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="person-select" className="text-sm font-medium text-gray-700">
        בחר עובד:
      </label>
      <select
        id="person-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- בחר --</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
