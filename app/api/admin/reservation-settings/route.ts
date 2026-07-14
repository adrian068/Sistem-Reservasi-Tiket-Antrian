import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireLoketAdminSession } from '@/lib/require-loket-admin'
import {
  getReservationSettings,
  saveReservationSettings,
  type ReservationGateMode,
} from '@/lib/reservation-settings-store'
import { resolveReservationStatus } from '@/lib/reservation-status'

const updateSchema = z.object({
  mode: z.enum(['auto', 'open', 'closed']),
  pesanTutup: z.string().max(500).optional(),
  pesanBuka: z.string().max(500).optional(),
})

export async function GET() {
  const admin = await requireLoketAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
  }

  try {
    const settings = await getReservationSettings()
    const effective = resolveReservationStatus(settings)

    return NextResponse.json({
      success: true,
      settings,
      effective,
    })
  } catch (error) {
    console.error('Get reservation settings error:', error)
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireLoketAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const settings = await saveReservationSettings({
      mode: data.mode as ReservationGateMode,
      pesanTutup: data.pesanTutup,
      pesanBuka: data.pesanBuka,
      updatedBy: admin.email,
    })

    const effective = resolveReservationStatus(settings)

    return NextResponse.json({
      success: true,
      message: 'Pengaturan reservasi berhasil disimpan',
      settings,
      effective,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Update reservation settings error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}
