import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveLayananForReservation } from '@/lib/layanan-resolve'
import { getServiceKey, SERVICE_LABELS, type ServiceKey } from '@/lib/queue-service-key'
import {
  deleteReservationRecord,
  getReservationRecord,
  updateReservationRecord,
} from '@/lib/reservations-service'
import { isFallbackLayananId, isFallbackReservationId } from '@/lib/reservations-fallback-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await getReservationRecord(params.id)
    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { name, phone, nik, purpose, service, date, timeSlot, status, idLayanan } =
      body

    if (!name || !phone || !purpose || !service || !date || !timeSlot || !status) {
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

    const normalizedStatus = String(status).toUpperCase()
    if (!['WAITING', 'CALLED', 'COMPLETED', 'CANCELLED'].includes(normalizedStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (
      canonicalIdLayanan &&
      !isFallbackLayananId(canonicalIdLayanan) &&
      !isFallbackReservationId(params.id)
    ) {
      try {
        const layananId = BigInt(canonicalIdLayanan)
        const layananExists = await prisma.layanan.findUnique({
          where: { id: layananId },
        })
        if (!layananExists) {
          return NextResponse.json(
            { success: false, error: 'Layanan tidak ditemukan' },
            { status: 400 },
          )
        }
      } catch {
        // skip invalid layanan id
      }
    }

    if (normalizedStatus === 'CALLED' && !isFallbackReservationId(params.id)) {
      try {
        const serviceKey = resolvedLayanan.serviceKey
        const label = SERVICE_LABELS[serviceKey as ServiceKey]

        await prisma.reservasi.updateMany({
          where: {
            AND: [
              { id: { not: params.id } },
              { status: 'CALLED' },
              {
                OR: [
                  { service: { contains: label, mode: 'insensitive' as const } },
                  { layanan: { name: { contains: label, mode: 'insensitive' as const } } },
                  ...(canonicalIdLayanan && !isFallbackLayananId(canonicalIdLayanan)
                    ? [{ idLayanan: BigInt(canonicalIdLayanan) }]
                    : []),
                ],
              },
            ],
          },
          data: { status: 'COMPLETED' },
        })
      } catch (autoCompleteError) {
        console.error('Error in auto-complete logic:', autoCompleteError)
      }
    }

    const data = await updateReservationRecord(params.id, {
      name,
      phone,
      nik,
      purpose,
      service: canonicalService,
      date,
      timeSlot,
      status: normalizedStatus,
      idLayanan: canonicalIdLayanan,
    })

    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const ok = await deleteReservationRecord(params.id)
    if (!ok) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      message: 'Reservation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
