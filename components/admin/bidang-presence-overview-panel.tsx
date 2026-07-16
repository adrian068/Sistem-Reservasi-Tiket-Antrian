"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BIDANG_SLUGS,
  getBidangConfig,
  type BidangSlug,
} from "@/lib/bidang-config"
import { Building2, Loader2, RefreshCw, UserCheck, Users } from "lucide-react"

type PetugasPresence = {
  id: string
  nama: string
  jabatan: string
  hadir: boolean
  diRuangan: boolean
  updatedAt: string
}

type BidangPresence = {
  slug: string
  nama: string
  petugas: PetugasPresence[]
  updatedAt: string
}

type Ringkasan = {
  total: number
  hadir: number
  diRuangan: number
}

type BidangPresenceOverviewPanelProps = {
  className?: string
  compact?: boolean
}

export function BidangPresenceOverviewPanel({
  className,
  compact = false,
}: BidangPresenceOverviewPanelProps) {
  const [bidangs, setBidangs] = useState<
    Array<BidangPresence & { ringkasan: Ringkasan }>
  >([])
  const [activeSlug, setActiveSlug] = useState<BidangSlug>("paud")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setError("")
    try {
      const res = await fetch("/api/admin/bidang-presence", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal memuat kehadiran bidang")
        return
      }
      const list = (data.bidangs ?? []) as Array<BidangPresence & { ringkasan: Ringkasan }>
      setBidangs(list)
      setActiveSlug((current) => {
        if (list.some((b) => b.slug === current)) return current
        const first = BIDANG_SLUGS.find((s) => list.some((b) => b.slug === s))
        return first ?? current
      })
    } catch {
      setError("Gagal memuat kehadiran bidang")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const activeBidang = bidangs.find((b) => b.slug === activeSlug) ?? bidangs[0]
  const activeConfig = getBidangConfig(activeSlug)

  return (
    <Card className={cn("shadow-lg border-0 overflow-hidden", className)}>
      <CardHeader className={cn("pb-3 bg-gradient-to-r from-brand-light-bg to-brand-hero dark:from-brand-header-dark/40 dark:to-brand-header/40", compact ? "py-4 px-4 sm:px-6" : "px-4 sm:px-6 py-5")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-base" : "text-lg")}>
              <Building2 className="w-5 h-5 text-brand-primary" />
              Status Petugas Bidang
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Kehadiran petugas dinas di ruang layanan PAUD, PTK, SD, dan SMP
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {BIDANG_SLUGS.map((slug) => {
            const bidang = bidangs.find((b) => b.slug === slug)
            const config = getBidangConfig(slug)
            const ringkasan = bidang?.ringkasan
            const isActive = activeSlug === slug

            return (
              <Button
                key={slug}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveSlug(slug)}
                className={cn(
                  "h-auto py-2 px-3 flex flex-col items-start gap-0.5 min-w-[5.5rem]",
                  isActive && config?.accentButton,
                  !isActive && config?.accentBorder,
                )}
              >
                <span className="font-semibold text-xs sm:text-sm">
                  {config?.shortLabel ?? slug}
                </span>
                {ringkasan ? (
                  <span className="text-[10px] opacity-90 font-normal">
                    {ringkasan.hadir}/{ringkasan.total} hadir · {ringkasan.diRuangan} di ruang
                  </span>
                ) : (
                  <span className="text-[10px] opacity-70 font-normal">—</span>
                )}
              </Button>
            )
          })}
        </div>

        {activeBidang?.ringkasan && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {activeBidang.ringkasan.hadir}/{activeBidang.ringkasan.total} hadir
            </Badge>
            <Badge
              className={cn(
                "gap-1",
                activeBidang.ringkasan.diRuangan > 0
                  ? cn(activeConfig?.accentButton, "hover:opacity-90")
                  : "bg-muted text-muted-foreground hover:bg-muted",
              )}
            >
              <UserCheck className="w-3 h-3" />
              {activeBidang.ringkasan.diRuangan}/{activeBidang.ringkasan.total} di ruangan
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("px-4 sm:px-6 pb-5", compact && "pt-0")}>
        {loading && bidangs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : activeBidang ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Kehadiran Ruang {activeBidang.nama}
            </p>
            {activeBidang.petugas.map((petugas) => (
              <div
                key={petugas.id}
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  activeConfig?.accentBorder,
                  activeConfig?.accentBg,
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{petugas.nama}</p>
                    <p className="text-xs text-muted-foreground">{petugas.jabatan}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="Hadir" active={petugas.hadir} variant="blue" />
                    <StatusBadge label="Di ruangan" active={petugas.diRuangan} variant="green" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Data kehadiran belum tersedia.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({
  label,
  active,
  variant,
}: {
  label: string
  active: boolean
  variant: "blue" | "green"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? variant === "blue"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
            : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}: {active ? "Ya" : "Tidak"}
    </span>
  )
}
