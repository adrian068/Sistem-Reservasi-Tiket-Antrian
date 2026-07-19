import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format kolom @db.Date Prisma ke YYYY-MM-DD (UTC midnight, tanpa geser hari). */
export function formatLocalDateYmd(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Normalizes image URLs coming from the database or uploads so they can be used safely
 * with the Next.js <Image> component.
 *
 * - Returns a placeholder when the URL is missing.
 * - Keeps absolute URLs (http/https/data) intact.
 * - Ensures relative paths always start with a leading slash so they resolve from the app root.
 */
export function resolveImageUrl(url?: string | null) {
  if (!url) {
    return "/placeholder.svg"
  }

  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()

  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:")) {
    return trimmed
  }

  if (trimmed.startsWith("/")) {
    return trimmed
  }

  return `/${trimmed.replace(/^\/+/, "")}`
}

import { getLocalTimeIndonesia } from "./reservation-hours"

// Reservation time validation helpers for WITA
export function getNowWita(): Date {
  return getLocalTimeIndonesia().date
}

export function parseTimeSlotToDateWita(dateStr: string, timeSlot: string): Date | null {
  try {
    const [start] = timeSlot.split('-')
    const [hh, mm] = start.split(':').map(Number)
    const [y, m, d] = dateStr.split('-').map(Number)
    if (Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
    return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0))
  } catch {
    return null
  }
}

export function isSameDayWita(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

export function canBook(dateStr: string, timeSlot: string, closingTime?: string): { allowed: boolean; reason?: string } {
  const now = getNowWita()
  const selectedStart = parseTimeSlotToDateWita(dateStr, timeSlot)
  if (!selectedStart) return { allowed: false, reason: 'Format waktu tidak valid' }

  // If booking for today, ensure selectedStart is still in the future
  if (isSameDayWita(selectedStart, now)) {
    if (selectedStart.getTime() <= now.getTime()) {
      return { allowed: false, reason: 'Slot waktu hari ini sudah lewat. Silakan pilih tanggal besok atau selanjutnya.' }
    }
  }

  // If closingTime provided (HH:MM), block today entirely when now > closing
  if (closingTime) {
    const [ch, cm] = closingTime.split(':').map(Number)
    const closing = new Date(now)
    closing.setHours(ch || 17, cm || 0, 0, 0)
    if (now.getTime() > closing.getTime()) {
      // After closing, disallow any booking for today
      const selected = new Date(dateStr)
      if (isSameDayWita(selected, now)) {
        return { allowed: false, reason: 'Reservasi untuk hari ini ditutup. Silakan pilih tanggal besok atau selanjutnya.' }
      }
    }
  }

  return { allowed: true }
}