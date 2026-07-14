import { type NextRequest, NextResponse } from "next/server"
import { getTimeSlotsForDay } from "@/lib/time-slots"
import { getActiveSlotBookingCountsForLayanan } from "@/lib/reservations-service"
import { getSlotCapacityForLayanan } from "@/lib/slot-capacity"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const idLayanan = searchParams.get("idLayanan")
    const service = searchParams.get("service")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    if (!service && !idLayanan) {
      return NextResponse.json(
        { error: "Parameter layanan (service atau idLayanan) wajib diisi" },
        { status: 400 },
      )
    }

    const [y, m, d] = date.split("-").map(Number)
    const selectedDate = new Date(y, m - 1, d)
    const dayOfWeek = selectedDate.getDay()

    const timeSlotConfig = getTimeSlotsForDay(dayOfWeek)

    if (timeSlotConfig.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Layanan tidak tersedia pada hari Sabtu dan Minggu",
      })
    }

    const bookingsCount = await getActiveSlotBookingCountsForLayanan(date, {
      idLayanan,
      service: service ?? undefined,
    })

    const slotCapacity = await getSlotCapacityForLayanan({
      idLayanan,
      service: service ?? undefined,
    })

    const timeSlots = timeSlotConfig.map((slot) => ({
      id: slot.id,
      time: slot.time,
      capacity: slotCapacity,
      booked: bookingsCount[slot.id] || bookingsCount[slot.time] || 0,
      durationCategory: slot.durationCategory,
      durationLabel: slot.durationLabel,
      durationMinutes: slot.durationMinutes,
    }))

    return NextResponse.json({
      success: true,
      data: timeSlots,
    })
  } catch (error) {
    console.error("Error fetching time slots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
