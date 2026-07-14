import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { listAllReservations } from '@/lib/reservations-service'
import { listLocalAdminUsers } from '@/lib/local-users-store'
import { prisma } from '@/lib/prisma'
import { shouldUseFallbackForDbError } from '@/lib/api-fallback-data'

export async function GET() {
  try {
    await requireSuperAdmin()

    let reservationsCount = 0
    let dbAdminsCount = 0

    try {
      const { data } = await listAllReservations()
      reservationsCount = data.length
    } catch {
      reservationsCount = 0
    }

    try {
      dbAdminsCount = await prisma.pengguna.count({
        where: { peran: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      })
    } catch (error) {
      if (!shouldUseFallbackForDbError(error)) throw error
    }

    const localAdmins = await listLocalAdminUsers()
    const localAdminCount = localAdmins.filter((u) => u.peran === 'ADMIN').length

    return NextResponse.json({
      success: true,
      data: {
        reservations: reservationsCount,
        admins: dbAdminsCount + localAdminCount,
        users: localAdmins.length,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
    }
    console.error('Super admin overview error:', error)
    return NextResponse.json({ error: 'Gagal memuat ringkasan' }, { status: 500 })
  }
}
