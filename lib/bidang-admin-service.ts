import 'server-only'

import { prisma } from './prisma'
import { getBidangConfig, type BidangSlug } from './bidang-config'
import { getReservationSettings } from './reservation-settings-store'
import { resolveReservationStatus } from './reservation-status'
import { listAllReservations } from './reservations-service'
import { getServiceKey, todayLocalYmd, SERVICE_LABELS, type ServiceKey } from './queue-service-key'
import { getTimeSlotsForDateString, parseSlotStartTime } from './time-slots'
import { summarizeBidangPresence, getBidangPresence } from './bidang-presence-store'
import { getSlotCapacityForBidangSlug } from './slot-capacity'

export type BidangReservationRow = {
  id: string
  queueNumber: string
  name: string
  phone: string
  purpose: string
  date: string
  timeSlot: string
  slotStart: string
  status: string
  createdAt: string
  updatedAt: string
}

export type BidangSlotRow = {
  id: string
  time: string
  durationLabel: string
  booked: number
  capacity: number
  tamu: Array<{ id: string; queueNumber: string; name: string; status: string }>
}

function isReservationForService(
  r: { service?: string; layanan?: { name?: string | null } | null },
  serviceKey: ServiceKey,
): boolean {
  return getServiceKey(r) === serviceKey
}

function sortBySlotThenCreated(a: BidangReservationRow, b: BidangReservationRow) {
  const slotDiff = a.slotStart.localeCompare(b.slotStart)
  if (slotDiff !== 0) return slotDiff
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
}

export async function listBidangReservationsForDate(
  bidangSlug: BidangSlug,
  dateYmd: string,
): Promise<BidangReservationRow[]> {
  const config = getBidangConfig(bidangSlug)
  if (!config) return []

  const { data } = await listAllReservations()
  return data
    .filter((r) => r.date === dateYmd && isReservationForService(r, config.serviceKey))
    .map((r) => ({
      id: r.id,
      queueNumber: r.queueNumber,
      name: r.name,
      phone: r.phone,
      purpose: r.purpose,
      date: r.date,
      timeSlot: r.timeSlot,
      slotStart: parseSlotStartTime(r.timeSlot),
      status: r.status.toLowerCase(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
    .sort(sortBySlotThenCreated)
}

export async function getBidangDashboardData(bidangSlug: BidangSlug, dateYmd?: string) {
  const config = getBidangConfig(bidangSlug)
  if (!config) {
    throw new Error('Bidang tidak valid')
  }

  const today = dateYmd ?? todayLocalYmd()
  const [y, m, d] = today.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay()

  const reservations = await listBidangReservationsForDate(bidangSlug, today)
  const active = reservations.filter(
    (r) => !['cancelled', 'completed'].includes(r.status),
  )
  const waiting = active.filter((r) => r.status === 'waiting')
  const called = active.filter((r) => r.status === 'called')
  const completedToday = reservations.filter((r) => r.status === 'completed')

  const slotConfig = getTimeSlotsForDateString(today)
  const capacityInfo = await getSlotCapacityForBidangSlug(bidangSlug)
  const slots: BidangSlotRow[] = slotConfig.map((slot) => {
    const tamu = reservations
      .filter(
        (r) =>
          (r.timeSlot === slot.id ||
            r.timeSlot === slot.time ||
            r.slotStart === parseSlotStartTime(slot.id)) &&
          ['waiting', 'called'].includes(r.status),
      )
      .map((r) => ({
        id: r.id,
        queueNumber: r.queueNumber,
        name: r.name,
        status: r.status,
      }))

    return {
      id: slot.id,
      time: slot.time,
      durationLabel: slot.durationLabel,
      booked: tamu.length,
      capacity: capacityInfo.capacity,
      tamu,
    }
  })

  let jadwal: { jamBuka: string; jamTutup: string; keterangan: string | null; aktif: boolean } | null =
    null
  try {
    const row = await prisma.jadwalOperasional.findUnique({ where: { hari: dayOfWeek } })
    if (row) {
      jadwal = {
        jamBuka: row.jamBuka,
        jamTutup: row.jamTutup,
        keterangan: row.keterangan,
        aktif: row.aktif,
      }
    }
  } catch {
    // optional
  }

  const settings = await getReservationSettings()
  const gate = resolveReservationStatus(settings)

  const bidang = await getBidangPresence(bidangSlug)
  const ringkasanPetugas = bidang ? summarizeBidangPresence(bidang) : null

  return {
    bidangSlug,
    bidangLabel: config.label,
    serviceKey: config.serviceKey,
    date: today,
    dayOfWeek,
    jadwal,
    gate: {
      isOpen: gate.isOpen,
      message: gate.message,
      mode: settings.mode,
    },
    stats: {
      waiting: waiting.length,
      called: called.length,
      completed: completedToday.length,
      totalToday: reservations.length,
      petugasDiRuangan: ringkasanPetugas?.diRuangan ?? 0,
    },
    queue: {
      waiting,
      called,
      nextInRoom: called[0] ?? null,
    },
    slots,
    reservations,
    capacity: capacityInfo,
    updatedAt: new Date().toISOString(),
  }
}

export async function updateBidangReservationStatus(
  bidangSlug: BidangSlug,
  id: string,
  status: 'WAITING' | 'CALLED' | 'COMPLETED' | 'CANCELLED',
) {
  const config = getBidangConfig(bidangSlug)
  if (!config) return null

  const { getReservationRecord, updateReservationRecord } = await import('./reservations-service')
  const { isFallbackReservationId } = await import('./reservations-fallback-store')

  const current = await getReservationRecord(id)
  if (!current || !isReservationForService(current, config.serviceKey)) {
    return null
  }

  if (status === 'CALLED' && !isFallbackReservationId(id)) {
    try {
      const label = SERVICE_LABELS[config.serviceKey]
      await prisma.reservasi.updateMany({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'CALLED' },
            {
              OR: [
                { service: { contains: label, mode: 'insensitive' } },
                { layanan: { name: { contains: label, mode: 'insensitive' } } },
              ],
            },
          ],
        },
        data: { status: 'COMPLETED' },
      })
    } catch {
      // non-blocking
    }
  }

  return updateReservationRecord(id, {
    name: current.name,
    phone: current.phone,
    nik: current.nik,
    purpose: current.purpose,
    service: current.service,
    date: current.date,
    timeSlot: current.timeSlot,
    status,
    idLayanan: current.idLayanan,
  })
}
