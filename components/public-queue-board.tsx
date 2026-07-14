"use client"

import { useEffect, useState } from "react"
import { Radio, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type WaitingItem = {
  queueNumber: string
  position: number
}

type ServiceQueue = {
  key: string
  label: string
  currentlyServing: { queueNumber: string; name: string } | null
  recentlyCalled: string[]
  waiting: WaitingItem[]
  waitingCount: number
}

type LiveQueueData = {
  date: string
  updatedAt: string
  services: ServiceQueue[]
}

const SERVICE_ACCENT: Record<string, string> = {
  ptk: "border-blue-400/50 bg-blue-500/10",
  sd: "border-emerald-400/50 bg-emerald-500/10",
  smp: "border-amber-400/50 bg-amber-500/10",
  paud: "border-violet-400/50 bg-violet-500/10",
}

const SERVICE_NUMBER: Record<string, string> = {
  ptk: "text-blue-200",
  sd: "text-emerald-200",
  smp: "text-amber-200",
  paud: "text-violet-200",
}

interface PublicQueueBoardProps {
  compact?: boolean
  className?: string
}

export function PublicQueueBoard({ compact = false, className }: PublicQueueBoardProps) {
  const [queueData, setQueueData] = useState<LiveQueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/queue/live")
        const json = await res.json()
        if (res.ok && json.success) {
          setQueueData(json.data)
          setError(false)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchQueue()
    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  const hasActivity =
    queueData?.services.some(
      (s) => s.currentlyServing || s.waitingCount > 0,
    ) ?? false

  return (
    <div
      className={cn(
        "rounded-xl border border-white/25 bg-white/10 backdrop-blur-md text-left",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">
            Antrian Hari Ini
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs text-blue-100/80 shrink-0">Live</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 sm:h-28 rounded-lg bg-white/5 animate-pulse border border-white/10"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs sm:text-sm text-blue-100/80 text-center py-4">
          Antrian sementara tidak dapat dimuat.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {queueData?.services.map((service) => (
              <div
                key={service.key}
                className={cn(
                  "rounded-lg border p-2.5 sm:p-3",
                  SERVICE_ACCENT[service.key] ?? "border-white/20 bg-white/5",
                )}
              >
                <p className="text-[10px] sm:text-xs font-medium text-white/90 truncate mb-1.5">
                  {service.label.split("(")[0].trim()}
                </p>

                <p className="text-[10px] text-blue-100/70 mb-0.5">Sedang dilayani</p>
                {service.currentlyServing ? (
                  <p
                    className={cn(
                      "text-lg sm:text-xl font-black leading-none tracking-tight animate-pulse",
                      SERVICE_NUMBER[service.key] ?? "text-white",
                    )}
                  >
                    {service.currentlyServing.queueNumber}
                  </p>
                ) : (
                  <p className="text-lg sm:text-xl font-bold text-white/30 leading-none">—</p>
                )}

                <div className="mt-2 pt-2 border-t border-white/15">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] text-blue-100/70 flex items-center gap-0.5">
                      <Users className="w-3 h-3" />
                      Menunggu
                    </span>
                    <span className="text-[10px] font-semibold text-white">
                      {service.waitingCount} orang
                    </span>
                  </div>
                  {service.waiting.length > 0 ? (
                    <ul className="space-y-0.5">
                      {service.waiting.slice(0, compact ? 2 : 3).map((item) => (
                        <li
                          key={item.queueNumber}
                          className="flex items-center justify-between text-[10px] sm:text-xs text-white/90"
                        >
                          <span className="text-blue-100/60">#{item.position}</span>
                          <span className="font-mono font-medium">{item.queueNumber}</span>
                        </li>
                      ))}
                      {service.waitingCount > (compact ? 2 : 3) && (
                        <li className="text-[10px] text-blue-100/60 text-right">
                          +{service.waitingCount - (compact ? 2 : 3)} antrian lagi
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-[10px] text-blue-100/50">Tidak ada antrian</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!hasActivity && (
            <p className="mt-3 text-center text-xs text-blue-100/70 flex items-center justify-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Belum ada antrian aktif hari ini
            </p>
          )}
        </>
      )}

      <p className="mt-3 text-[10px] sm:text-xs text-blue-100/60 text-center leading-snug">
        Perhatikan nomor Anda — urutan menunggu diperbarui otomatis setiap 5 detik
      </p>
    </div>
  )
}
