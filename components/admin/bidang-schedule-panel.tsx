"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getBidangConfig, type BidangSlug } from "@/lib/bidang-config"
import { getWitaNowMinutes, isTimeSlotPassed } from "@/lib/reservation-hours"
import { parseSlotStartTime } from "@/lib/time-slots"
import { useTimeSlotSync } from "@/hooks/use-time-slot-sync"
import { CalendarClock, Clock, Loader2, RefreshCw, Unlock } from "lucide-react"

type SlotRow = {
  id: string
  time: string
  durationLabel: string
  booked: number
  capacity: number
  tamu: Array<{ queueNumber: string; name: string; status: string }>
}

type ScheduleData = {
  date: string
  dayOfWeek: number
  jadwal: {
    jamBuka: string
    jamTutup: string
    keterangan: string | null
    aktif: boolean
  } | null
  gate: { isOpen: boolean; message: string; mode: string }
  slots: SlotRow[]
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export function BidangSchedulePanel({ bidangSlug }: { bidangSlug: BidangSlug }) {
  const config = getBidangConfig(bidangSlug)!
  const [data, setData] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [, setClockTick] = useState(0)

  const fetchData = useCallback(async () => {
    setError("")
    try {
      const res = await fetch(`/api/admin/bidang/${bidangSlug}/dashboard`, {
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memuat jadwal")
        return
      }
      setData(json.data)
    } catch {
      setError("Gagal memuat jadwal")
    } finally {
      setLoading(false)
    }
  }, [bidangSlug])

  useEffect(() => {
    fetchData()
    const clock = setInterval(() => setClockTick((t) => t + 1), 60000)
    return () => clearInterval(clock)
  }, [fetchData])

  useTimeSlotSync({
    enabled: true,
    onRefresh: fetchData,
  })

  const currentMinutes = getWitaNowMinutes()
  const todayForSlots = data?.date
    ? (() => {
        const [y, m, d] = data.date.split("-").map(Number)
        return new Date(y, m - 1, d)
      })()
    : new Date()

  function slotIsNow(slot: SlotRow): boolean {
    const start = parseSlotStartTime(slot.id)
    const [h, m] = start.split(":").map(Number)
    const startMin = h * 60 + (m || 0)
    const endPart = slot.time.split(" - ")[1]
    if (!endPart) return false
    const [eh, em] = endPart.split(":").map(Number)
    const endMin = eh * 60 + (em || 0)
    return currentMinutes >= startMin && currentMinutes < endMin
  }

  return (
    <Card className={cn("shadow-lg border-0", config.accentBorder)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarClock className={cn("w-5 h-5", config.accentText)} />
              Jadwal & Slot Waktu
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Jam operasional dan tamu per slot hari ini — {config.label}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true)
              void fetchData()
            }}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && !data ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat jadwal...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            <div
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm",
                data.gate.isOpen
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200"
                  : "bg-muted border-border text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2 font-medium">
                <Unlock className="w-4 h-4 shrink-0" />
                Reservasi publik: {data.gate.isOpen ? "Buka" : "Tutup"}
              </div>
              <p className="text-xs mt-1 opacity-90">{data.gate.message}</p>
            </div>

            {data.jadwal ? (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  config.accentBorder,
                  config.accentBg,
                )}
              >
                <p className="text-sm font-medium text-foreground">
                  {DAY_NAMES[data.dayOfWeek]}
                  {data.jadwal.keterangan ? ` · ${data.jadwal.keterangan}` : ""}
                </p>
                {data.jadwal.aktif ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {data.jadwal.jamBuka} — {data.jadwal.jamTutup} WITA
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-0.5">Tidak operasional</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Jadwal hari ini belum diatur.</p>
            )}

            {data.slots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada slot waktu (libur / di luar hari kerja).
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {data.slots.map((slot) => {
                  const isNow = slotIsNow(slot)
                  const remaining = Math.max(0, slot.capacity - slot.booked)
                  const isPassed = isTimeSlotPassed(todayForSlots, slot.id)
                  const isFull = remaining <= 0

                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "rounded-lg border p-3 text-sm",
                        isNow
                          ? cn(config.accentBorder, config.accentBg)
                          : isPassed
                            ? "border-border bg-muted/30 opacity-60"
                            : isFull
                              ? "border-red-200 bg-red-50/40 dark:bg-red-950/20"
                              : "border-border bg-muted/20",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{slot.time}</p>
                          <p className="text-xs text-muted-foreground">{slot.durationLabel}</p>
                          {!isPassed && !isFull && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {remaining} dari {slot.capacity} tersisa
                            </p>
                          )}
                          {isPassed && (
                            <p className="text-xs text-red-500 mt-0.5 font-medium">Sudah lewat</p>
                          )}
                          {!isPassed && isFull && (
                            <p className="text-xs text-red-500 mt-0.5 font-medium">Penuh</p>
                          )}
                        </div>
                        <div className="text-right">
                          {isNow && (
                            <Badge className={cn(config.accentButton, "hover:opacity-90 mb-1")}>
                              Sekarang
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs sm:text-sm font-semibold px-2.5 py-1 min-w-[4.75rem] justify-center",
                              isFull && !isPassed && "bg-red-100 text-red-700",
                            )}
                          >
                            {slot.booked}/{slot.capacity} tamu
                          </Badge>
                        </div>
                      </div>
                      {slot.tamu.length > 0 && (
                        <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                          {slot.tamu.map((t) => (
                            <li
                              key={t.queueNumber}
                              className="text-xs flex items-center justify-between gap-2"
                            >
                              <span>
                                <strong className={config.accentText}>{t.queueNumber}</strong>{" "}
                                {t.name}
                              </span>
                              <span className="text-muted-foreground capitalize">{t.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
