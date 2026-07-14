import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getSlotCapacityForBidangSlug,
  listAllBidangCapacity,
  updateBidangSlotCapacity,
} from '@/lib/slot-capacity'
import {
  requireBidangCapacityEditor,
  requireBidangCapacityReader,
} from '@/lib/require-loket-admin'

export async function GET(request: NextRequest) {
  const user = await requireBidangCapacityReader()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const slug = request.nextUrl.searchParams.get('slug')
    if (slug) {
      const data = await getSlotCapacityForBidangSlug(slug)
      return NextResponse.json({ success: true, data })
    }

    let rows = await listAllBidangCapacity()

    if (String(user.peran).toUpperCase() === 'ADMIN_PAUD') {
      const userSlug = user.bidangSlug ?? 'paud'
      rows = rows.filter((r) => r.slug === userSlug)
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('GET bidang-capacity error:', error)
    return NextResponse.json({ error: 'Gagal memuat kapasitas bidang' }, { status: 500 })
  }
}

const patchSchema = z.object({
  slug: z.string().min(1),
  kapasitasSlot: z.number().int().min(1).max(20),
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, kapasitasSlot } = patchSchema.parse(body)

    const user = await requireBidangCapacityEditor(slug)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await updateBidangSlotCapacity(slug, kapasitasSlot)
    return NextResponse.json({
      success: true,
      message: `Kapasitas ${slug}: ${data.capacity} tamu paralel per slot waktu`,
      data,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('PATCH bidang-capacity error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan kapasitas' }, { status: 500 })
  }
}
