import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getBidangPresence,
  listBidangPresence,
  summarizeBidangPresence,
  updatePetugasPresence,
  updatePetugasProfile,
} from '@/lib/bidang-presence-store'
import {
  canEditBidangPresence,
  requireBidangPresenceEditor,
  requireBidangPresenceReader,
} from '@/lib/require-bidang-admin'

export async function GET(request: NextRequest) {
  const user = await requireBidangPresenceReader()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('slug')

  try {
    if (slug) {
      const bidang = await getBidangPresence(slug)
      if (!bidang) {
        return NextResponse.json({ error: 'Bidang tidak ditemukan' }, { status: 404 })
      }
      return NextResponse.json({
        bidang,
        ringkasan: summarizeBidangPresence(bidang),
        canEdit: canEditBidangPresence(user, slug),
      })
    }

    const bidangs = await listBidangPresence()
    return NextResponse.json({
      bidangs: bidangs.map((b) => ({
        ...b,
        ringkasan: summarizeBidangPresence(b),
      })),
      canEdit: bidangs.map((b) => ({
        slug: b.slug,
        canEdit: canEditBidangPresence(user, b.slug),
      })),
    })
  } catch (error) {
    console.error('GET bidang-presence error:', error)
    return NextResponse.json({ error: 'Gagal memuat data kehadiran' }, { status: 500 })
  }
}

const patchSchema = z.object({
  bidangSlug: z.string().min(1),
  petugasId: z.string().min(1),
  hadir: z.boolean().optional(),
  diRuangan: z.boolean().optional(),
  nama: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  jabatan: z.string().min(2, 'Jabatan minimal 2 karakter').optional(),
})

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Data tidak valid' },
      { status: 400 },
    )
  }

  const user = await requireBidangPresenceEditor(parsed.data.bidangSlug)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (
    typeof parsed.data.hadir !== 'boolean' &&
    typeof parsed.data.diRuangan !== 'boolean' &&
    parsed.data.nama === undefined &&
    parsed.data.jabatan === undefined
  ) {
    return NextResponse.json(
      { error: 'Minimal satu field (hadir / diRuangan / nama / jabatan) harus diisi' },
      { status: 400 },
    )
  }

  try {
    let bidang = null

    if (parsed.data.nama !== undefined || parsed.data.jabatan !== undefined) {
      bidang = await updatePetugasProfile({
        bidangSlug: parsed.data.bidangSlug,
        petugasId: parsed.data.petugasId,
        nama: parsed.data.nama,
        jabatan: parsed.data.jabatan,
      })
    }

    if (
      typeof parsed.data.hadir === 'boolean' ||
      typeof parsed.data.diRuangan === 'boolean'
    ) {
      bidang = await updatePetugasPresence(parsed.data)
    }

    if (!bidang) {
      return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      bidang,
      ringkasan: summarizeBidangPresence(bidang),
    })
  } catch (error) {
    console.error('PATCH bidang-presence error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui kehadiran' }, { status: 500 })
  }
}
