export type DurationCategory = "short" | "long"

export const DURATION_CATEGORIES = {
  short: {
    label: "10–15 menit",
    minutes: 15,
    title: "Pertemuan Singkat",
    description: "Untuk urusan cepat",
  },
  long: {
    label: "15–25 menit",
    minutes: 20,
    title: "Pertemuan Standar",
    description: "Untuk konsultasi lebih detail",
  },
} as const

export type TimeSlotConfig = {
  id: string
  time: string
  capacity: number
  durationCategory: DurationCategory
  durationLabel: string
  durationMinutes: number
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatTime(hour: number, minute: number) {
  return `${pad(hour)}:${pad(minute)}`
}

function addMinutes(hour: number, minute: number, delta: number) {
  const total = hour * 60 + minute + delta
  return { hour: Math.floor(total / 60), minute: total % 60 }
}

/** Ambil HH:MM dari id slot (mendukung format lama & baru). */
export function parseSlotStartTime(timeSlotId: string): string {
  return timeSlotId.split("|")[0].trim()
}

function generateMixedRange(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): TimeSlotConfig[] {
  const slots: TimeSlotConfig[] = []
  let hour = startHour
  let minute = startMinute
  const endTotal = endHour * 60 + endMinute
  let useShort = true

  while (hour * 60 + minute < endTotal) {
    const category: DurationCategory = useShort ? "short" : "long"
    const config = DURATION_CATEGORIES[category]
    const start = formatTime(hour, minute)
    const end = addMinutes(hour, minute, config.minutes)
    const endTotalMinutes = end.hour * 60 + end.minute

    if (endTotalMinutes > endTotal) {
      break
    }

    const endLabel = formatTime(end.hour, end.minute)
    slots.push({
      id: `${start}|${category}`,
      time: `${start} - ${endLabel}`,
      capacity: 1,
      durationCategory: category,
      durationLabel: config.label,
      durationMinutes: config.minutes,
    })

    hour = end.hour
    minute = end.minute
    useShort = !useShort
  }

  return slots
}

/** Slot waktu operasional per hari — bergantian singkat & standar. */
export function getTimeSlotsForDay(dayOfWeek: number): TimeSlotConfig[] {
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []
  }

  if (dayOfWeek === 5) {
    return generateMixedRange(8, 0, 10, 0)
  }

  return [
    ...generateMixedRange(8, 0, 12, 0),
    ...generateMixedRange(14, 0, 16, 0),
  ]
}

export function parseTimeSlotToMinutes(timeSlot: string): number {
  const start = parseSlotStartTime(timeSlot)
  const [h, m] = start.split(":").map(Number)
  return h * 60 + (m || 0)
}

export function isTimeSlotInOperatingHours(
  dayOfWeek: number,
  timeSlot: string,
): boolean {
  const mins = parseTimeSlotToMinutes(timeSlot)

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  if (dayOfWeek === 5) {
    return mins >= 8 * 60 && mins < 10 * 60
  }

  return (
    (mins >= 8 * 60 && mins < 12 * 60) ||
    (mins >= 14 * 60 && mins < 16 * 60)
  )
}

export function getTimeSlotsForDateString(dateYmd: string): TimeSlotConfig[] {
  const [y, m, d] = dateYmd.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return getTimeSlotsForDay(date.getDay())
}

function resolveCategory(slot: {
  durationCategory?: DurationCategory
  id?: string
}): DurationCategory | null {
  if (slot.durationCategory) return slot.durationCategory
  if (slot.id?.endsWith("|short")) return "short"
  if (slot.id?.endsWith("|long")) return "long"
  return null
}

export function groupSlotsByDuration<
  T extends { durationCategory?: DurationCategory; id?: string },
>(slots: T[]): { short: T[]; long: T[] } {
  const short: T[] = []
  const long: T[] = []
  for (const slot of slots) {
    const cat = resolveCategory(slot)
    if (cat === "short") short.push(slot)
    else if (cat === "long") long.push(slot)
    else long.push(slot)
  }
  return { short, long }
}
