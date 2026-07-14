import { NextResponse } from 'next/server'
import { resolveReservationStatus } from '@/lib/reservation-status'
import { getReservationSettings } from '@/lib/reservation-settings-store'

export async function GET() {
  try {
    const settings = await getReservationSettings()
    const status = resolveReservationStatus(settings)

    return NextResponse.json({
      success: true,
      data: status,
      settings: {
        mode: settings.mode,
        updatedAt: settings.updatedAt,
      },
    })
  } catch (error) {
    console.error('Reservation status error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat status reservasi' },
      { status: 500 },
    )
  }
}
