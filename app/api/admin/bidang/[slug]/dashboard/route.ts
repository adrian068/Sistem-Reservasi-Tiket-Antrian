import { NextRequest, NextResponse } from 'next/server'
import { getBidangDashboardData } from '@/lib/bidang-admin-service'
import { getBidangConfig, isBidangSlug } from '@/lib/bidang-config'
import { requireBidangDashboardReader } from '@/lib/require-bidang-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  if (!isBidangSlug(params.slug)) {
    return NextResponse.json({ error: 'Bidang tidak valid' }, { status: 404 })
  }

  const user = await requireBidangDashboardReader(params.slug)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const date = request.nextUrl.searchParams.get('date') ?? undefined
    const data = await getBidangDashboardData(params.slug, date ?? undefined)
    const config = getBidangConfig(params.slug)
    return NextResponse.json(
      {
        success: true,
        data: {
          ...data,
          bidangLabel: config?.label ?? params.slug,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error('GET bidang dashboard error:', error)
    return NextResponse.json({ error: 'Gagal memuat dashboard bidang' }, { status: 500 })
  }
}
