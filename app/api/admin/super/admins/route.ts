import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { registerUser, requireSuperAdmin } from '@/lib/auth'
import { ensureBidangPetugasSeeded } from '@/lib/bidang-presence-store'
import { listLocalAdminUsers, loginUsernameFromEmail } from '@/lib/local-users-store'
import { prisma } from '@/lib/prisma'
import { shouldUseFallbackForDbError } from '@/lib/api-fallback-data'
import { SUPER_ADMIN_EMAIL } from '@/lib/auth-shared'
import { BIDANG_CONFIG, BIDANG_SLUGS, getBidangConfig, isBidangSlug } from '@/lib/bidang-config'

const createAdminSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid').optional(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  adminType: z.enum(['loket', 'bidang']).default('loket'),
  bidangSlug: z.enum(BIDANG_SLUGS).optional(),
})

function buildEmail(username: string, email?: string): string {
  if (email?.trim()) return email.trim().toLowerCase()
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
  return `${clean}@siredi.local`
}

function formatPeranLabel(peran: string, bidangSlug?: string | null) {
  if (peran === 'SUPER_ADMIN') return 'Admin'
  if (peran === 'ADMIN') return 'Petugas Loket'
  if (peran === 'ADMIN_PAUD') {
    const cfg = bidangSlug ? getBidangConfig(bidangSlug) : null
    return cfg ? `Petugas Bidang ${cfg.shortLabel}` : 'Petugas Bidang'
  }
  return peran
}

function mapAdminRow(row: {
  id: string
  nama: string
  email: string
  peran: string
  bidangSlug?: string | null
  source: 'local' | 'database'
  createdAt: string
  aktif?: boolean
}) {
  const loginUsername = loginUsernameFromEmail(row.email)
  return {
    id: row.id,
    nama: row.nama,
    email: row.email,
    username: loginUsername,
    loginUsername,
    peran: row.peran,
    peranLabel: formatPeranLabel(row.peran, row.bidangSlug),
    bidangSlug: row.bidangSlug ?? null,
    bidangLabel: row.bidangSlug ? getBidangConfig(row.bidangSlug)?.label ?? row.bidangSlug : null,
    editable: row.peran === 'ADMIN_PAUD',
    manageable: row.peran !== 'SUPER_ADMIN',
    aktif: row.aktif !== false,
    source: row.source,
    createdAt: row.createdAt,
  }
}

function dedupeAdminsByEmail<T extends { email: string; source: 'local' | 'database' }>(
  rows: T[],
): T[] {
  const map = new Map<string, T>()
  for (const row of rows) {
    if (row.source === 'local') {
      if (!map.has(row.email.toLowerCase())) {
        map.set(row.email.toLowerCase(), row)
      }
    }
  }
  for (const row of rows) {
    if (row.source === 'database') {
      map.set(row.email.toLowerCase(), row)
    }
  }
  return Array.from(map.values())
}

export async function GET() {
  try {
    await requireSuperAdmin()

    const localAdmins = await listLocalAdminUsers()
    const localRows = localAdmins.map((u) =>
      mapAdminRow({
        id: `local-${u.id}`,
        nama: u.nama,
        email: u.email,
        peran: u.peran,
        bidangSlug: u.bidangSlug ?? null,
        source: 'local',
        createdAt: u.createdAt,
        aktif: u.aktif,
      }),
    )

    let dbRows: typeof localRows = []
    try {
      const penggunas = await prisma.pengguna.findMany({
        where: { peran: { in: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_PAUD'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nama: true,
          email: true,
          peran: true,
          bidangSlug: true,
          aktif: true,
          createdAt: true,
        },
      })
      dbRows = penggunas.map((p) =>
        mapAdminRow({
          id: p.id.toString(),
          nama: p.nama,
          email: p.email,
          peran: p.peran,
          bidangSlug: p.bidangSlug,
          source: 'database',
          createdAt: p.createdAt.toISOString(),
          aktif: p.aktif,
        }),
      )
    } catch (error) {
      if (!shouldUseFallbackForDbError(error)) throw error
    }

    const merged = dedupeAdminsByEmail([...localRows, ...dbRows]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return NextResponse.json({
      success: true,
      data: merged,
      bidangOptions: BIDANG_SLUGS.map((slug) => ({
        slug,
        label: BIDANG_CONFIG[slug].label,
        defaultNama: BIDANG_CONFIG[slug].defaultAdminNama,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
    }
    return NextResponse.json({ error: 'Gagal memuat daftar petugas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()
    const data = createAdminSchema.parse(body)

    const email = buildEmail(data.username, data.email)
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email/username ini reserved untuk super admin' },
        { status: 400 },
      )
    }

    if (data.adminType === 'bidang') {
      if (!data.bidangSlug || !isBidangSlug(data.bidangSlug)) {
        return NextResponse.json({ error: 'Pilih bidang untuk petugas bidang' }, { status: 400 })
      }

      const result = await registerUser(
        data.nama,
        email,
        data.password,
        'ADMIN_PAUD',
        data.bidangSlug,
      )
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      await ensureBidangPetugasSeeded(data.bidangSlug)

      const loginUsername = loginUsernameFromEmail(result.user.email)
      return NextResponse.json({
        success: true,
        message: `Petugas bidang berhasil dibuat. Login dengan username "${loginUsername}" dan kata sandi yang Anda buat.`,
        data: {
          nama: result.user.nama,
          email: result.user.email,
          username: loginUsername,
          loginUsername,
          peran: result.user.peran,
          peranLabel: formatPeranLabel(result.user.peran, result.user.bidangSlug),
          bidangSlug: result.user.bidangSlug,
          bidangLabel: getBidangConfig(data.bidangSlug)?.label,
        },
      })
    }

    const result = await registerUser(data.nama, email, data.password, 'ADMIN')
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const loginUsername = loginUsernameFromEmail(result.user.email)
    return NextResponse.json({
      success: true,
      message: `Petugas loket berhasil dibuat. Login dengan username "${loginUsername}" dan kata sandi yang Anda buat.`,
      data: {
        nama: result.user.nama,
        email: result.user.email,
        username: loginUsername,
        loginUsername,
        peran: result.user.peran,
        peranLabel: formatPeranLabel(result.user.peran),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Error'
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
    }
    console.error('Create admin error:', error)
    return NextResponse.json({ error: 'Gagal membuat petugas' }, { status: 500 })
  }
}
