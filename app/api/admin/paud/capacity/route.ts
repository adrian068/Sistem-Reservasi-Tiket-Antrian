import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getSlotCapacityForBidangSlug,
  updateBidangSlotCapacity,
} from '@/lib/slot-capacity'
import {
  requireBidangCapacityEditor,
  requireBidangCapacityReader,
} from '@/lib/require-loket-admin'

const PAUD_SLUG = 'paud'

export async function GET() {
  const user = await requireBidangCapacityReader()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const info = await getSlotCapacityForBidangSlug(PAUD_SLUG)
    return NextResponse.json({ success: true, data: info })
  } catch (error) {
    console.error('GET paud capacity error:', error)
    return NextResponse.json({ error: 'Gagal memuat kapasitas' }, { status: 500 })
  }
}

const patchSchema = z.object({
  kapasitasSlot: z.number().int().min(1).max(20),
})

export async function PATCH(request: NextRequest) {
  const user = await requireBidangCapacityEditor(PAUD_SLUG)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { kapasitasSlot } = patchSchema.parse(body)
    const info = await updateBidangSlotCapacity(PAUD_SLUG, kapasitasSlot)
    return NextResponse.json({
      success: true,
      message: `Kapasitas slot diatur: ${info.capacity} tamu paralel per waktu`,
      data: info,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('PATCH paud capacity error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan kapasitas' }, { status: 500 })
  }
}
