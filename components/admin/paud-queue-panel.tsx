"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BellRing,
  CheckCircle2,
  Clock3,
  Loader2,
  Phone,
  RefreshCw,
  User,
  Users,
  XCircle,
} from "lucide-react"

type PaudReservation = {
  id: string
  queueNumber: string
  name: string
  phone: string
  purpose: string
  timeSlot: string
  slotStart: string
  status: string
}

type DashboardData = {
  date: string
  gate: { isOpen: boolean; message: string; mode: string }
  stats: {
    waiting: number
    called: number
    completed: number
    totalToday: number
  }
  queue: {
    waiting: PaudReservation[]
    called: PaudReservation[]
    nextInRoom: PaudReservation | null
  }
  updatedAt: string
}

const STATUS_LABEL: Record<string, string> = {
  waiting: "Menunggu",
  called: "Di ruangan",
  completed: "Selesai",
  cancelled: "Batal",
}

export function PaudQueuePanel({ editable = true }: { editable?: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setError("")
    try {
      const res = await fetch("/api/admin/paud/dashboard", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memuat antrian")
        return
      }
      setData(json.data)
    } catch {
      setError("Gagal memuat antrian PAUD")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const updateStatus = async (
    id: string,
    status: "WAITING" | "CALLED" | "COMPLETED" | "CANCELLED",
  ) => {
    if (!editable) return
    setUpdatingId(id)
    setError("")
    try {
      const res = await fetch(`/api/admin/paud/reservations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memperbarui status")
        return
      }
      await fetchData()
    } catch {
      setError("Gagal memperbarui status")
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card className="shadow-lg border-orange-200/60 dark:border-orange-900/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Tamu PAUD — Siap Bertemu
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data ? formatDate(data.date) : "Memuat..."} · Kelola siapa yang
              dipanggil masuk ruangan
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>

        {data && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">{data.stats.waiting} menunggu</Badge>
            <Badge className="bg-green-600 hover:bg-green-600">
              {data.stats.called} di ruangan
            </Badge>
            <Badge variant="outline">{data.stats.completed} selesai</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && !data ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat antrian...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            {data.queue.nextInRoom && (
              <div className="rounded-xl border-2 border-green-500/50 bg-green-50 dark:bg-green-950/30 p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm font-medium mb-2">
                  <BellRing className="w-4 h-4" />
                  Sedang dilayani di ruangan
                </div>
                <QueueCard
                  reservation={data.queue.nextInRoom}
                  highlight
                  editable={editable}
                  updatingId={updatingId}
                  onStatusChange={updateStatus}
                />
              </div>
            )}

            {data.queue.called.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Dipanggil sebelumnya
                </p>
                {data.queue.called.slice(1).map((r) => (
                  <QueueCard
                    key={r.id}
                    reservation={r}
                    editable={editable}
                    updatingId={updatingId}
                    onStatusChange={updateStatus}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Menunggu giliran ({data.queue.waiting.length})
              </p>
              {data.queue.waiting.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center rounded-lg bg-muted/40">
                  Belum ada tamu yang menunggu hari ini.
                </p>
              ) : (
                data.queue.waiting.map((r) => (
                  <QueueCard
                    key={r.id}
                    reservation={r}
                    editable={editable}
                    updatingId={updatingId}
                    onStatusChange={updateStatus}
                  />
                ))
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function QueueCard({
  reservation,
  highlight = false,
  editable,
  updatingId,
  onStatusChange,
}: {
  reservation: PaudReservation
  highlight?: boolean
  editable: boolean
  updatingId: string | null
  onStatusChange: (
    id: string,
    status: "WAITING" | "CALLED" | "COMPLETED" | "CANCELLED",
  ) => void
}) {
  const busy = updatingId === reservation.id
  const status = reservation.status.toLowerCase()

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        highlight ? "border-green-300 bg-white dark:bg-background" : "border-border bg-muted/30",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-orange-600">{reservation.queueNumber}</span>
            <Badge variant="outline" className="text-xs">
              {STATUS_LABEL[status] ?? status}
            </Badge>
          </div>
          <p className="font-medium flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {reservation.name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3 h-3 shrink-0" />
            {reservation.phone}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock3 className="w-3 h-3 shrink-0" />
            Slot: {reservation.timeSlot.replace("|", " · ")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {reservation.purpose}
          </p>
        </div>

        {editable && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {status === "waiting" && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={busy}
                onClick={() => onStatusChange(reservation.id, "CALLED")}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <BellRing className="w-4 h-4 mr-1" />
                    Panggil ke ruangan
                  </>
                )}
              </Button>
            )}
            {status === "called" && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-700"
                disabled={busy}
                onClick={() => onStatusChange(reservation.id, "COMPLETED")}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Selesai
              </Button>
            )}
            {(status === "waiting" || status === "called") && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onStatusChange(reservation.id, "CANCELLED")}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Batal
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
