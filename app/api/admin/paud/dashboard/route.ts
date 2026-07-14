import { NextRequest, NextResponse } from 'next/server'
import { getPaudDashboardData } from '@/lib/paud-admin-service'
import { requirePaudDashboardReader } from '@/lib/require-paud-admin'

export async function GET(request: NextRequest) {
  const user = await requirePaudDashboardReader()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const date = request.nextUrl.searchParams.get('date') ?? undefined
    const data = await getPaudDashboardData(date ?? undefined)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET paud dashboard error:', error)
    return NextResponse.json({ error: 'Gagal memuat dashboard PAUD' }, { status: 500 })
  }
}
