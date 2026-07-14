import { type NextRequest, NextResponse } from 'next/server'
import { isValidReservationTime, isTimeSlotPassed } from '@/lib/reservation-hours'
import { getReservationSettings } from '@/lib/reservation-settings-store'
import { resolveReservationStatus } from '@/lib/reservation-status'
import {
  countActiveSlotBookings,
  createReservationRecord,
  generateQueueNumberForService,
  listAllReservations,
} from '@/lib/reservations-service'
import { isFallbackLayananId } from '@/lib/reservations-fallback-store'
import { getSlotCapacityForLayanan } from '@/lib/slot-capacity'

function calculateEstimatedTime(): string {
  const estimatedTime = new Date(Date.now() + 30 * 60000)
  const hours = estimatedTime.getHours().toString().padStart(2, '0')
  const minutes = estimatedTime.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, date, timeSlot, name, phone, purpose, idLayanan } = body

    if (!service || !date || !timeSlot || !name || !phone || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    reservationDate.setHours(0, 0, 0, 0)

    if (reservationDate < today) {
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
      idLayanan && !isFallbackLayananId(idLayanan) ? idLayanan : null

    const existingReservations = await countActiveSlotBookings(date, timeSlot, {
      idLayanan: idLayanan ?? null,
      service,
    })
    const maxCapacity = await getSlotCapacityForLayanan({
      idLayanan: idLayanan ?? null,
      service,
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
      service,
      layananIdForQueue,
    )
    const estimatedCallTime = calculateEstimatedTime()

    const { data } = await createReservationRecord({
      service,
      date,
      timeSlot,
      name,
      phone,
      purpose,
      nik: body.nik || null,
      idLayanan: idLayanan ?? null,
      queueNumber,
      estimatedCallTime,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data } = await listAllReservations()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
