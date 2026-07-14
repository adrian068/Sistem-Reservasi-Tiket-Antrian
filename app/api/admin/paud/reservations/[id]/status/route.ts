import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updatePaudReservationStatus } from '@/lib/paud-admin-service'
import { requirePaudAdmin } from '@/lib/require-paud-admin'

const bodySchema = z.object({
  status: z.enum(['WAITING', 'CALLED', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requirePaudAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status } = bodySchema.parse(body)

    const updated = await updatePaudReservationStatus(params.id, status)
    if (!updated) {
      return NextResponse.json(
        { error: 'Reservasi PAUD tidak ditemukan' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('PATCH paud reservation status error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui status' }, { status: 500 })
  }
}
