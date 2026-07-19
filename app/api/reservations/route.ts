import { type NextRequest, NextResponse } from 'next/server'
import {
  getWitaTodayYmd,
  isValidReservationTime,
  isTimeSlotPassed,
  RESERVATION_TIMEZONE,
} from '@/lib/reservation-hours'
import { getReservationSettings } from '@/lib/reservation-settings-store'
import { resolveReservationStatus } from '@/lib/reservation-status'
import { resolveLayananForReservation } from '@/lib/layanan-resolve'
import {
  countActiveSlotBookings,
  createReservationRecord,
  generateQueueNumberForService,
  listAllReservations,
} from '@/lib/reservations-service'
import { isFallbackLayananId } from '@/lib/reservations-fallback-store'
import { getSlotCapacityForLayanan } from '@/lib/slot-capacity'

export const dynamic = 'force-dynamic'

function calculateEstimatedTime(): string {
  const estimatedTime = new Date(Date.now() + 30 * 60000)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: RESERVATION_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(estimatedTime)
  const hours = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minutes = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return `${hours}:${minutes}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, date, timeSlot, name, phone, purpose, idLayanan } = body

    if (!service || !date || !timeSlot || !name || !phone || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resolvedLayanan = await resolveLayananForReservation({ service, idLayanan })
    if (!resolvedLayanan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Layanan tidak valid. Silakan pilih PTK, PAUD, SD Umum, atau SMP Umum.',
        },
        { status: 400 },
      )
    }

    const canonicalService = resolvedLayanan.service
    const canonicalIdLayanan = resolvedLayanan.idLayanan

    const settings = await getReservationSettings()
    const gate = resolveReservationStatus(settings)
    if (settings.mode === 'closed') {
      return NextResponse.json(
        { success: false, error: gate.message },
        { status: 403 },
      )
    }

    const [y, m, d] = date.split('-').map(Number)
    const reservationDate = new Date(y, m - 1, d)

    if (date < getWitaTodayYmd()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tanggal reservasi tidak boleh di masa lalu.',
        },
        { status: 400 },
      )
    }

    if (!isValidReservationTime(reservationDate, timeSlot)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Waktu reservasi tidak valid. Pastikan memilih waktu yang sesuai dengan jadwal operasional.',
        },
        { status: 400 },
      )
    }

    if (isTimeSlotPassed(reservationDate, timeSlot)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Slot waktu untuk hari ini sudah tidak tersedia. Silakan pilih tanggal besok atau selanjutnya.',
        },
        { status: 400 },
      )
    }

    const layananIdForQueue =
      canonicalIdLayanan && !isFallbackLayananId(canonicalIdLayanan)
        ? canonicalIdLayanan
        : null

    const existingReservations = await countActiveSlotBookings(date, timeSlot, {
      idLayanan: canonicalIdLayanan,
      service: canonicalService,
    })
    const maxCapacity = await getSlotCapacityForLayanan({
      idLayanan: canonicalIdLayanan,
      service: canonicalService,
    })
    if (existingReservations >= maxCapacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Slot waktu ini sudah penuh (${maxCapacity} tamu). Silakan pilih waktu lain.`,
        },
        { status: 400 },
      )
    }

    const queueNumber = await generateQueueNumberForService(
      canonicalService,
      layananIdForQueue,
    )
    const estimatedCallTime = calculateEstimatedTime()

    const { data } = await createReservationRecord({
      service: canonicalService,
      date,
      timeSlot,
      name,
      phone,
      purpose,
      nik: body.nik || null,
      idLayanan: canonicalIdLayanan,
      queueNumber,
      estimatedCallTime,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        bidangSlug: resolvedLayanan.bidangSlug,
        serviceKey: resolvedLayanan.serviceKey,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data } = await listAllReservations()
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
