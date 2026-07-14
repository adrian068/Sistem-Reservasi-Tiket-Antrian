import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  FALLBACK_LAYANANS,
  shouldUseFallbackForDbError,
} from "@/lib/api-fallback-data"

export async function GET() {
  try {
    const layanans = await prisma.layanan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    if (layanans.length === 0) {
      return NextResponse.json({
        success: true,
        data: [...FALLBACK_LAYANANS],
        fallback: true,
      })
    }

    const serializedLayanans = layanans.map((layanan) => ({
      ...layanan,
      id: layanan.id.toString(),
    }))

    return NextResponse.json({
      success: true,
      data: serializedLayanans,
    })
  } catch (error) {
    console.error("Error fetching layanans:", error)

    if (shouldUseFallbackForDbError(error)) {
      console.warn("[api/layanans] Database tidak terhubung — memakai data cadangan.")
      return NextResponse.json({
        success: true,
        data: [...FALLBACK_LAYANANS],
        fallback: true,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, color } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 },
      )
    }

    const layanan = await prisma.layanan.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
        isActive: true,
      },
    })

    const serializedLayanan = {
      ...layanan,
      id: layanan.id.toString(),
    }

    return NextResponse.json({
      success: true,
      data: serializedLayanan,
      message: "Layanan berhasil ditambahkan",
    })
  } catch (error) {
    console.error("Error creating layanan:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
