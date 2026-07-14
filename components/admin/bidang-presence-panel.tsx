"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getBidangConfig, type BidangSlug } from "@/lib/bidang-config"
import { Building2, Loader2, Pencil, RefreshCw, UserCheck, Users } from "lucide-react"

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

type BidangPresencePanelProps = {
  bidangSlug?: BidangSlug
  editable?: boolean
  compact?: boolean
  className?: string
}

export function BidangPresencePanel({
  bidangSlug = "paud",
  editable = false,
  compact = false,
  className,
}: BidangPresencePanelProps) {
  const config = getBidangConfig(bidangSlug)
  const [bidang, setBidang] = useState<BidangPresence | null>(null)
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNama, setEditNama] = useState("")
  const [editJabatan, setEditJabatan] = useState("")
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/bidang-presence?slug=${bidangSlug}`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal memuat kehadiran bidang")
        return
      }
      setBidang(data.bidang)
      setRingkasan(data.ringkasan)
      setCanEdit(Boolean(data.canEdit))
    } catch {
      setError("Gagal memuat kehadiran bidang")
    } finally {
      setLoading(false)
    }
  }, [bidangSlug])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const patchStatus = async (
    petugasId: string,
    field: "hadir" | "diRuangan",
    value: boolean,
  ) => {
    if (!canEdit && !editable) return
    setUpdatingId(petugasId)
    setError("")
    try {
      const res = await fetch("/api/admin/bidang-presence", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidangSlug,
          petugasId,
          [field]: value,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui status")
        return
      }
      setBidang(data.bidang)
      setRingkasan(data.ringkasan)
    } catch {
      setError("Gagal memperbarui status")
    } finally {
      setUpdatingId(null)
    }
  }

  const startEdit = (petugas: PetugasPresence) => {
    setEditingId(petugas.id)
    setEditNama(petugas.nama)
    setEditJabatan(petugas.jabatan)
    setError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditNama("")
    setEditJabatan("")
  }

  const saveProfile = async (petugasId: string) => {
    if (!canEdit && !editable) return
    setUpdatingId(petugasId)
    setError("")
    try {
      const res = await fetch("/api/admin/bidang-presence", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidangSlug,
          petugasId,
          nama: editNama.trim(),
          jabatan: editJabatan.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan nama petugas")
        return
      }
      setBidang(data.bidang)
      setRingkasan(data.ringkasan)
      cancelEdit()
    } catch {
      setError("Gagal menyimpan nama petugas")
    } finally {
      setUpdatingId(null)
    }
  }

  const showControls = editable || canEdit
  const bidangLabel = bidang?.nama ?? config?.label ?? bidangSlug

  return (
    <Card className={cn("shadow-lg border-0", className)}>
      <CardHeader className={cn("pb-3", compact && "py-4")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-base" : "text-lg")}>
              <Building2 className="w-5 h-5 text-orange-600" />
              Kehadiran Ruang {bidang?.nama ?? "PAUD"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {showControls
                ? "Konfirmasi petugas hadir dan berada di ruangan layanan"
                : "Status petugas dinas di ruang bidang (diperbarui admin bidang)"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
        {ringkasan && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {ringkasan.hadir}/{ringkasan.total} hadir
            </Badge>
            <Badge
              className={cn(
                "gap-1",
                ringkasan.diRuangan > 0
                  ? "bg-green-600 hover:bg-green-600"
                  : "bg-muted text-muted-foreground hover:bg-muted",
              )}
            >
              <UserCheck className="w-3 h-3" />
              {ringkasan.diRuangan}/{ringkasan.total} di ruangan
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        {loading && !bidang ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="space-y-3">
            {bidang?.petugas.map((petugas) => (
              <div
                key={petugas.id}
                className="rounded-lg border border-border p-3 bg-muted/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {petugas.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">{petugas.jabatan}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="Hadir" active={petugas.hadir} variant="blue" />
                    <StatusBadge label="Di ruangan" active={petugas.diRuangan} variant="green" />
                  </div>
                </div>
                {showControls && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/60">
                    <ToggleButton
                      label={petugas.hadir ? "Tandai tidak hadir" : "Tandai hadir"}
                      active={petugas.hadir}
                      tone="blue"
                      disabled={updatingId === petugas.id}
                      onClick={() => patchStatus(petugas.id, "hadir", !petugas.hadir)}
                    />
                    <ToggleButton
                      label={petugas.diRuangan ? "Keluar ruangan" : "Di dalam ruangan"}
                      active={petugas.diRuangan}
                      tone="green"
                      disabled={updatingId === petugas.id}
                      onClick={() =>
                        patchStatus(petugas.id, "diRuangan", !petugas.diRuangan)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
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

function ToggleButton({
  label,
  active,
  tone,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  tone: "blue" | "green"
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-xs",
        active &&
          (tone === "blue"
            ? "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950"
            : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950"),
      )}
    >
      {label}
    </Button>
  )
}
