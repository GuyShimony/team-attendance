export type WorkStatus =
  | "arriving"
  | "leaving"
  | "at_work"
  | "off"
  | "standby"
  | "other_battery"
  | "unknown"

export interface DayEntry {
  personName: string
  date: string        // ISO "YYYY-MM-DD"
  dayOfWeek: number   // 0=Sun … 6=Sat
  rawCell: string | null
  status: WorkStatus
  isAtWork: boolean
}

export interface WeekBlock {
  weekIndex: number
  startDate: string
  endDate: string
  entries: DayEntry[]
}

export interface TabData {
  tabName: string
  blocks: WeekBlock[]
}

export interface SheetData {
  fetchedAt: string
  tabs: TabData[]
  allEntries: DayEntry[]
}

export interface TodayStatus {
  atWork: string[]
  off: string[]
  unknown: string[]
}

export interface PersonStats {
  personName: string
  workingDays: number
  offDays: number
  saturdayPercent: number
  arrivals: number
  monthlyWorkDays: Record<string, number>  // "YYYY-MM" → count
}
