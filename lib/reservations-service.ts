import 'server-only'

import { prisma } from './prisma'
import { shouldUseFallbackForDbError } from './api-fallback-data'
import {
  addFallbackReservation,
  deleteFallbackReservation,
  generateFallbackQueueNumber,
  getFallbackReservation,
  isFallbackLayananId,
  isFallbackReservationId,
  listFallbackReservations,
  toApiReservation,
  updateFallbackReservation,
} from './reservations-fallback-store'
import { isSameLayanan, type LayananRef } from './layanan-match'
import { parseSlotStartTime } from './time-slots'
import { formatLocalDateYmd } from './utils'

function matchesTimeSlot(reservationSlot: string, targetSlot: string): boolean {
  if (reservationSlot === targetSlot) return true
  return parseSlotStartTime(reservationSlot) === parseSlotStartTime(targetSlot)
}

function mapDbReservation(reservation: {
  id: string
  queueNumber: string
  service: string
  idLayanan: bigint | null
  name: string
  phone: string
  nik: string | null
  purpose: string
  date: Date
  timeSlot: string
  status: string
  createdAt: Date
  updatedAt: Date
  estimatedCallTime: string | null
  layanan?: { id: bigint; name: string; description: string | null; icon: string | null; color: string | null } | null
}) {
  return {
    id: reservation.id,
    queueNumber: reservation.queueNumber,
    service: reservation.service,
    idLayanan: reservation.idLayanan ? reservation.idLayanan.toString() : null,
    layanan: reservation.layanan
      ? { ...reservation.layanan, id: reservation.layanan.id.toString() }
      : null,
    name: reservation.name,
    phone: reservation.phone,
    nik: reservation.nik,
    purpose: reservation.purpose,
    date: formatLocalDateYmd(reservation.date),
    timeSlot: reservation.timeSlot,
    status: reservation.status.toLowerCase(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    estimatedCallTime: reservation.estimatedCallTime,
  }
}

export async function listAllReservations() {
  let dbRows: ReturnType<typeof mapDbReservation>[] = []
  let dbFailed = false

  try {
    const rows = await prisma.reservasi.findMany({
      include: { layanan: true },
      orderBy: { createdAt: 'desc' },
    })
    dbRows = rows.map(mapDbReservation)
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
    dbFailed = true
    console.warn('[reservations] DB tidak terhubung — memuat file cadangan.')
  }

  const fileRows = (await listFallbackReservations()).map(toApiReservation)

  if (dbFailed) {
    return { data: fileRows, fallback: true }
  }

  const byId = new Map<string, ReturnType<typeof mapDbReservation>>()
  for (const r of fileRows) byId.set(r.id, r)
  for (const r of dbRows) byId.set(r.id, r)

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return { data: merged, fallback: fileRows.length > 0 && dbRows.length === 0 }
}

export async function createReservationRecord(input: {
  service: string
  date: string
  timeSlot: string
  name: string
  phone: string
  purpose: string
  nik?: string | null
  idLayanan?: string | null
  queueNumber: string
  estimatedCallTime: string
}) {
  const [y, m, d] = input.date.split('-').map(Number)
  const reservationDate = new Date(y, m - 1, d)

  let layananId: bigint | null = null
  if (input.idLayanan && !isFallbackLayananId(input.idLayanan)) {
    try {
      layananId = BigInt(input.idLayanan)
      await prisma.layanan.findUnique({ where: { id: layananId } })
    } catch {
      layananId = null
    }
  }

  try {
    const reservation = await prisma.reservasi.create({
      data: {
        queueNumber: input.queueNumber,
        service: input.service,
        idLayanan: layananId,
        name: input.name,
        phone: input.phone,
        nik: input.nik || null,
        purpose: input.purpose,
        date: reservationDate,
        timeSlot: input.timeSlot,
        estimatedCallTime: input.estimatedCallTime,
        status: 'WAITING',
      },
      include: { layanan: true },
    })
    return { data: mapDbReservation(reservation), fallback: false }
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error

    const saved = await addFallbackReservation({
      queueNumber: input.queueNumber,
      service: input.service,
      idLayanan: input.idLayanan ?? null,
      name: input.name,
      phone: input.phone,
      nik: input.nik ?? null,
      purpose: input.purpose,
      date: input.date,
      timeSlot: input.timeSlot,
      status: 'waiting',
      estimatedCallTime: input.estimatedCallTime,
    })
    return { data: toApiReservation(saved), fallback: true }
  }
}

export async function generateQueueNumberForService(
  service: string,
  idLayanan?: string | bigint | null,
): Promise<string> {
  const serviceCodeMap: Record<string, string> = {
    'PTK (Pendidik dan Tenaga Kependidikan)': 'PTK',
    'SD Umum': 'SD',
    'SMP Umum': 'SMP',
    PAUD: 'PAUD',
  }
  const serviceCode = serviceCodeMap[service] || service.substring(0, 3).toUpperCase()

  try {
    const maxReservation = await prisma.reservasi.findFirst({
      where: {
        OR: [
          { service },
          ...(idLayanan
            ? [{ idLayanan: typeof idLayanan === 'string' ? BigInt(idLayanan) : idLayanan }]
            : []),
        ],
        queueNumber: { startsWith: `${serviceCode}-` },
      },
      orderBy: { createdAt: 'desc' },
    })
    let next = 1
    if (maxReservation) {
      const match = maxReservation.queueNumber.match(/-(\d+)$/)
      if (match) next = parseInt(match[1], 10) + 1
    }
    return `${serviceCode}-${next.toString().padStart(2, '0')}`
  } catch {
    return generateFallbackQueueNumber(service)
  }
}

export async function countActiveSlotBookings(
  date: string,
  timeSlot: string,
  layanan: LayananRef,
): Promise<number> {
  const { data } = await listAllReservations()
  return data.filter(
    (r) =>
      r.date === date &&
      matchesTimeSlot(r.timeSlot, timeSlot) &&
      ['waiting', 'called'].includes(r.status.toLowerCase()) &&
      isSameLayanan(
        { idLayanan: r.idLayanan, service: r.service },
        layanan,
      ),
  ).length
}

export async function getActiveSlotBookingCountsForLayanan(
  date: string,
  layanan: LayananRef,
): Promise<Record<string, number>> {
  const { data } = await listAllReservations()
  const counts: Record<string, number> = {}

  for (const r of data) {
    if (
      r.date !== date ||
      !['waiting', 'called'].includes(r.status.toLowerCase()) ||
      !isSameLayanan({ idLayanan: r.idLayanan, service: r.service }, layanan)
    ) {
      continue
    }
    counts[r.timeSlot] = (counts[r.timeSlot] || 0) + 1
    const start = parseSlotStartTime(r.timeSlot)
    counts[start] = (counts[start] || 0) + 1
  }

  return counts
}

export async function updateReservationRecord(
  id: string,
  body: {
    name: string
    phone: string
    nik?: string | null
    purpose: string
    service: string
    date: string
    timeSlot: string
    status: string
    idLayanan?: string | null
  },
) {
  if (isFallbackReservationId(id)) {
    const updated = await updateFallbackReservation(id, {
      name: body.name,
      phone: body.phone,
      nik: body.nik ?? null,
      purpose: body.purpose,
      service: body.service,
      date: body.date,
      timeSlot: body.timeSlot,
      status: body.status.toLowerCase(),
      idLayanan: body.idLayanan ?? null,
    })
    return updated ? toApiReservation(updated) : null
  }

  const prismaStatus = body.status.toUpperCase() as
    | 'WAITING'
    | 'CALLED'
    | 'COMPLETED'
    | 'CANCELLED'

  let layananId: bigint | null = null
  if (body.idLayanan && !isFallbackLayananId(body.idLayanan)) {
    try {
      layananId = BigInt(body.idLayanan)
    } catch {
      layananId = null
    }
  }

  const [y, m, d] = body.date.split('-').map(Number)
  const existing = await prisma.reservasi.findUnique({ where: { id } })

  const reservation = await prisma.reservasi.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      nik: body.nik || null,
      purpose: body.purpose,
      service: body.service,
      idLayanan: layananId,
      date: new Date(y, m - 1, d),
      timeSlot: body.timeSlot,
      status: prismaStatus,
    },
    include: { layanan: true },
  })

  if (existing && existing.status !== prismaStatus) {
    try {
      await prisma.logReservasi.create({
        data: {
          idReservasi: id,
          statusLama: existing.status,
          statusBaru: prismaStatus,
        },
      })
    } catch {
      // log opsional — jangan gagalkan update utama
    }
  }

  return mapDbReservation(reservation)
}

export async function deleteReservationRecord(id: string): Promise<boolean> {
  if (isFallbackReservationId(id)) {
    return deleteFallbackReservation(id)
  }
  await prisma.reservasi.delete({ where: { id } })
  return true
}

export async function getReservationRecord(id: string) {
  if (isFallbackReservationId(id)) {
    const r = await getFallbackReservation(id)
    return r ? toApiReservation(r) : null
  }
  try {
    const r = await prisma.reservasi.findUnique({
      where: { id },
      include: { layanan: true },
    })
    return r ? mapDbReservation(r) : null
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
    const r = await getFallbackReservation(id)
    return r ? toApiReservation(r) : null
  }
}
