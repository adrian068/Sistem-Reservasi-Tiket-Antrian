import { NextResponse } from "next/server"
import { listAllReservations } from "@/lib/reservations-service"
import {
  SERVICE_KEYS,
  SERVICE_LABELS_LONG,
  getServiceKey,
  todayLocalYmd,
  type ServiceKey,
} from "@/lib/queue-service-key"

type QueueReservation = {
  id: string
  queueNumber: string
  name: string
  service?: string
  layanan?: { name?: string | null } | null
  date: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    const { data } = await listAllReservations()
    const today = todayLocalYmd()

    const activeToday = (data as QueueReservation[]).filter(
      (r) =>
        r.date === today &&
        !["cancelled", "completed"].includes(r.status.toLowerCase()),
    )

    const services = SERVICE_KEYS.map((key) => {
      const forService = activeToday.filter((r) => getServiceKey(r) === key)

      const called = forService
        .filter((r) => r.status.toLowerCase() === "called")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )

      const waiting = forService
        .filter((r) => r.status.toLowerCase() === "waiting")
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((r, index) => ({
          queueNumber: r.queueNumber,
          position: index + 1,
        }))

      const currentlyServing = called[0]
        ? {
            queueNumber: called[0].queueNumber,
            name: called[0].name,
          }
        : null

      const recentlyCalled = called.slice(1, 4).map((r) => r.queueNumber)

      return {
        key,
        label: SERVICE_LABELS_LONG[key as ServiceKey],
        currentlyServing,
        recentlyCalled,
        waiting,
        waitingCount: waiting.length,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        updatedAt: new Date().toISOString(),
        services,
      },
    })
  } catch (error) {
    console.error("Error fetching live queue:", error)
    return NextResponse.json(
      { success: false, error: "Gagal memuat antrian" },
      { status: 500 },
    )
  }
}
