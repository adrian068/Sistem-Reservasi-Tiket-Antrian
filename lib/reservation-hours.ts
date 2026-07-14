/**
 * Utility functions untuk mengecek status buka/tutup reservasi berdasarkan waktu real-time
 */

import { isTimeSlotInOperatingHours, parseSlotStartTime } from "@/lib/time-slots"

export interface ReservationStatus {
  isOpen: boolean
  message: string
  nextOpenTime?: string
}

export const RESERVATION_TIMEZONE = "Asia/Makassar"

/**
 * Mendapatkan waktu lokal Indonesia Tengah (WITA - UTC+8)
 * Menggunakan timezone Asia/Makassar untuk akurasi
 */
export function getLocalTimeIndonesia(): {
  day: number
  hour: number
  minute: number
  date: Date
  ymd: string
} {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RESERVATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10)
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10)
  const dayNum = parseInt(parts.find((p) => p.type === "day")?.value || "0", 10)
  const month = parseInt(parts.find((p) => p.type === "month")?.value || "0", 10)
  const year = parseInt(parts.find((p) => p.type === "year")?.value || "0", 10)

  const date = new Date(year, month - 1, dayNum, hour, minute)
  const day = date.getDay()
  const ymd = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`

  return {
    day,
    hour,
    minute,
    date,
    ymd,
  }
}

/** Menit sejak 00:00 WITA */
export function getWitaNowMinutes(): number {
  const t = getLocalTimeIndonesia()
  return t.hour * 60 + t.minute
}

/** YYYY-MM-DD hari ini menurut WITA */
export function getWitaTodayYmd(): string {
  return getLocalTimeIndonesia().ymd
}

/** Bandingkan tanggal kalender (Date picker) dengan hari ini WITA */
export function isSameCalendarDayAsWitaToday(selectedDate: Date): boolean {
  const y = selectedDate.getFullYear()
  const m = String(selectedDate.getMonth() + 1).padStart(2, "0")
  const d = String(selectedDate.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}` === getWitaTodayYmd()
}

/**
 * Mengecek apakah reservasi sedang buka atau tutup berdasarkan waktu saat ini
 * Aturan:
 * - Senin-Kamis: Buka 08:00 - 16:00, Tutup 16:00 - 08:00 (hari berikutnya)
 * - Jumat: Buka 08:00 - 10:00, Tutup setelah 10:00
 * - Sabtu-Minggu: Selalu tutup
 */
export function checkReservationStatus(): ReservationStatus {
  // Gunakan waktu lokal Indonesia Tengah (WITA - UTC+8)
  const localTime = getLocalTimeIndonesia()
  const currentDay = localTime.day // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const currentHour = localTime.hour
  const currentMinute = localTime.minute
  const currentTime = currentHour * 60 + currentMinute // Total menit sejak 00:00
  const now = localTime.date

  // Sabtu (6) dan Minggu (0) - selalu tutup
  if (currentDay === 0 || currentDay === 6) {
    const nextMonday = new Date(now)
    const daysUntilMonday = currentDay === 0 ? 1 : 2
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    nextMonday.setHours(8, 0, 0, 0)
    
    return {
      isOpen: false,
      message: "Reservasi tutup pada hari Sabtu dan Minggu",
      nextOpenTime: nextMonday.toLocaleString('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  // Jumat (5) - buka 08:00 - 10:00
  if (currentDay === 5) {
    const openTime = 8 * 60 // 08:00 dalam menit
    const closeTime = 10 * 60 // 10:00 dalam menit

    if (currentTime >= openTime && currentTime < closeTime) {
      return {
        isOpen: true,
        message: "Reservasi buka (Jumat: 08:00 - 10:00)",
      }
    } else {
      // Setelah jam 10:00, tutup sampai Senin 08:00
      const nextMonday = new Date(now)
      nextMonday.setDate(now.getDate() + 3) // Jumat + 3 hari = Senin
      nextMonday.setHours(8, 0, 0, 0)
      
      return {
        isOpen: false,
        message: "Reservasi tutup. Jumat hanya buka 08:00 - 10:00",
        nextOpenTime: nextMonday.toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    }
  }

  // Senin-Kamis (1-4) - buka 08:00 - 16:00
  const openTime = 8 * 60 // 08:00 dalam menit
  const closeTime = 16 * 60 // 16:00 dalam menit

  if (currentTime >= openTime && currentTime < closeTime) {
    return {
      isOpen: true,
      message: "Reservasi buka (Senin-Kamis: 08:00 - 16:00)",
    }
  } else {
    // Sebelum jam 08:00 atau setelah jam 16:00
    let nextOpenTime: Date
    
    if (currentTime < openTime) {
      // Masih hari yang sama, buka jam 08:00
      nextOpenTime = new Date(now)
      nextOpenTime.setHours(8, 0, 0, 0)
    } else {
      // Setelah jam 16:00, buka besok jam 08:00
      nextOpenTime = new Date(now)
      nextOpenTime.setDate(now.getDate() + 1)
      nextOpenTime.setHours(8, 0, 0, 0)
    }
    
    return {
      isOpen: false,
      message: "Reservasi tutup. Buka kembali jam 08:00",
      nextOpenTime: nextOpenTime.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }
}

/**
 * Mengecek apakah waktu tertentu valid untuk reservasi
 */
export function isValidReservationTime(date: Date, timeSlot: string): boolean {
  return isTimeSlotInOperatingHours(date.getDay(), timeSlot)
}

/**
 * Mengecek apakah slot waktu sudah lewat (untuk hari yang sama)
 * Slot dianggap lewat jika:
 * 1. Tanggal yang dipilih adalah hari ini
 * 2. Waktu saat ini >= waktu awal slot (bukan akhir slot)
 * 3. ATAU sudah lewat jam operasional
 * 
 * Logika baru: Jika hari ini dan slot sudah lewat ATAU sudah lewat jam operasional,
 * maka HARUS pilih tanggal besok atau selanjutnya.
 * 
 * @param selectedDate Tanggal yang dipilih
 * @param timeSlot Slot waktu dalam format "HH:MM" (waktu awal slot)
 * @returns true jika slot waktu sudah lewat dan tidak bisa booking untuk hari ini
 */
export function isTimeSlotPassed(selectedDate: Date, timeSlot: string): boolean {
  if (!isSameCalendarDayAsWitaToday(selectedDate)) {
    return false
  }

  const localTime = getLocalTimeIndonesia()
  const currentDay = localTime.day
  const currentTime = localTime.hour * 60 + localTime.minute

  let closeTime: number
  if (currentDay === 5) {
    closeTime = 10 * 60
  } else if (currentDay >= 1 && currentDay <= 4) {
    closeTime = 16 * 60
  } else {
    return true
  }

  if (currentTime >= closeTime) {
    return true
  }

  const start = parseSlotStartTime(timeSlot)
  const [slotHour, slotMinute] = start.split(":").map(Number)
  const slotStartTime = slotHour * 60 + (slotMinute || 0)

  return currentTime >= slotStartTime
}

export function getSlotRemaining(slot: { capacity: number; booked: number }): number {
  return Math.max(0, slot.capacity - slot.booked)
}

export function isSlotSelectable(
  slot: { id: string; capacity: number; booked: number },
  selectedDate?: Date,
): boolean {
  if (getSlotRemaining(slot) <= 0) return false
  if (selectedDate && isTimeSlotPassed(selectedDate, slot.id)) return false
  return true
}

