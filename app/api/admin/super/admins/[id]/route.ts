import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  deleteAdminUser,
  requireSuperAdmin,
  resetAdminPassword,
  setAdminUserActive,
  updateBidangAdminUser,
} from '@/lib/auth'
import { BIDANG_SLUGS, getBidangConfig } from '@/lib/bidang-config'

const patchSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  bidangSlug: z.enum(BIDANG_SLUGS).optional(),
  aktif: z.boolean().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireSuperAdmin()
    const body = await request.json()
    const data = patchSchema.parse(body)

    if (
      data.nama === undefined &&
      data.bidangSlug === undefined &&
      data.aktif === undefined &&
      data.password === undefined
    ) {
      return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 })
    }

    if (data.password !== undefined) {
      const resetResult = await resetAdminPassword(params.id, data.password)
      if (!resetResult.ok) {
        return NextResponse.json({ error: resetResult.error }, { status: 400 })
      }
      if (
        data.nama === undefined &&
        data.bidangSlug === undefined &&
        data.aktif === undefined
      ) {
        return NextResponse.json({
          success: true,
          message:
            'Password petugas berhasil diperbarui. Gunakan username yang sama seperti di tabel Kelola Petugas.',
          data: { id: params.id },
        })
      }
    }

    if (data.aktif !== undefined) {
      const blockResult = await setAdminUserActive(params.id, data.aktif)
      if (!blockResult.ok) {
        return NextResponse.json({ error: blockResult.error }, { status: 400 })
      }
    }

    if (data.nama !== undefined || data.bidangSlug !== undefined) {
      const result = await updateBidangAdminUser(params.id, {
        nama: data.nama,
        bidangSlug: data.bidangSlug,
      })
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      const slug = result.user.bidangSlug
      return NextResponse.json({
        success: true,
        message:
          data.aktif === false
            ? 'Petugas bidang diperbarui dan diblokir.'
            : 'Petugas bidang berhasil diperbarui. Pengguna perlu login ulang agar panel mengikuti bidang baru.',
        data: {
          id: result.user.id,
          nama: result.user.nama,
          peran: result.user.peran,
          bidangSlug: slug,
          bidangLabel: slug ? getBidangConfig(slug)?.label ?? slug : null,
          panelPath: slug ? `/admin/bidang/${slug}` : null,
          aktif: data.aktif,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: data.aktif ? 'Petugas diaktifkan kembali.' : 'Petugas diblokir — tidak bisa login.',
      data: { id: params.id, aktif: data.aktif },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Error'
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
    }
    console.error('PATCH super admin user error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui petugas' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireSuperAdmin()
    const result = await deleteAdminUser(params.id)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      message: 'Petugas berhasil dihapus.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
    }
    console.error('DELETE super admin user error:', error)
    return NextResponse.json({ error: 'Gagal menghapus petugas' }, { status: 500 })
  }
}
