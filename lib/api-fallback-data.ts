/**
 * Data cadangan bila koneksi database (Prisma/Supabase) gagal.
 */

const d = (isoDate: string) => new Date(isoDate)

export const FALLBACK_LAYANANS = [
  {
    id: '1',
    name: 'PTK (Pendidik dan Tenaga Kependidikan)',
    description: 'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan',
    icon: 'Users',
    color: 'bg-blue-500',
    isActive: true,
    createdAt: d('2026-01-01T08:00:00.000Z').toISOString(),
    updatedAt: d('2026-01-01T08:00:00.000Z').toISOString(),
  },
  {
    id: '2',
    name: 'SD Umum',
    description: 'Layanan untuk Sekolah Dasar',
    icon: 'School',
    color: 'bg-green-500',
    isActive: true,
    createdAt: d('2026-01-01T08:00:00.000Z').toISOString(),
    updatedAt: d('2026-01-01T08:00:00.000Z').toISOString(),
  },
  {
    id: '3',
    name: 'SMP Umum',
    description: 'Layanan untuk Sekolah Menengah Pertama',
    icon: 'GraduationCap',
    color: 'bg-purple-500',
    isActive: true,
    createdAt: d('2026-01-01T08:00:00.000Z').toISOString(),
    updatedAt: d('2026-01-01T08:00:00.000Z').toISOString(),
  },
  {
    id: '4',
    name: 'PAUD',
    description: 'Layanan untuk Pendidikan Anak Usia Dini',
    icon: 'Baby',
    color: 'bg-orange-500',
    isActive: true,
    createdAt: d('2026-01-01T08:00:00.000Z').toISOString(),
    updatedAt: d('2026-01-01T08:00:00.000Z').toISOString(),
  },
] as const

export function shouldUseFallbackForDbError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
    return true
  }
  const msg = error instanceof Error ? error.message : String(error)
  return (
    /Tenant or user not found|Can't reach database server|P1001|P1000|FATAL|ECONNREFUSED|ETIMEDOUT/i.test(
      msg,
    ) ||
    msg.includes('ENOTFOUND') ||
    msg.includes('Connection terminated')
  )
}
