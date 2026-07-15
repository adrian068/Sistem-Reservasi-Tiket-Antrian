"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Lock, Unlock, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type GateMode = "auto" | "open" | "closed"

type EffectiveStatus = {
  isOpen: boolean
  message: string
  mode: GateMode
  source: string
}

export function ReservationGateSettings() {
  const [mode, setMode] = useState<GateMode>("auto")
  const [pesanTutup, setPesanTutup] = useState("")
  const [pesanBuka, setPesanBuka] = useState("")
  const [effective, setEffective] = useState<EffectiveStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin/reservation-settings")
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal memuat pengaturan")
        return
      }
      setMode(data.settings.mode)
      setPesanTutup(data.settings.pesanTutup || "")
      setPesanBuka(data.settings.pesanBuka || "")
      setEffective(data.effective)
    } catch {
      setError("Gagal memuat pengaturan reservasi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/reservation-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, pesanTutup, pesanBuka }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan")
        return
      }
      setEffective(data.effective)
      setSuccess("Pengaturan berhasil disimpan.")
    } catch {
      setError("Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const modeOptions: {
    value: GateMode
    label: string
    desc: string
    icon: typeof Clock
  }[] = [
    {
      value: "auto",
      label: "Otomatis (jadwal)",
      desc: "Mengikuti jam operasional Senin–Jumat",
      icon: Clock,
    },
    {
      value: "open",
      label: "Buka paksa",
      desc: "Reservasi selalu bisa diakses",
      icon: Unlock,
    },
    {
      value: "closed",
      label: "Tutup paksa",
      desc: "Reservasi ditutup untuk pengunjung",
      icon: Lock,
    },
  ]

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-900/50">
      <CardHeader>
        <CardTitle className="text-lg">Status Buka/Tutup Reservasi</CardTitle>
        <CardDescription>
          Atur apakah halaman reservasi publik sedang dibuka atau ditutup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat pengaturan...
          </div>
        ) : (
          <>
            {effective && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm",
                  effective.isOpen
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200"
                    : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200",
                )}
              >
                <strong>Status saat ini:</strong> {effective.message}
                <span className="block text-xs mt-1 opacity-80">
                  ({effective.source === "admin" ? "Aturan admin" : "Jadwal otomatis"})
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {modeOptions.map((opt) => {
                const Icon = opt.icon
                const active = mode === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      active
                        ? "border-brand-primary bg-blue-50 dark:bg-blue-950/40"
                        : "border-border hover:border-blue-300",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 mb-2",
                        active ? "text-brand-accent" : "text-muted-foreground",
                      )}
                    />
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                  </button>
                )
              })}
            </div>

            {mode === "closed" && (
              <div className="space-y-2">
                <Label htmlFor="pesanTutup">Pesan saat tutup</Label>
                <Textarea
                  id="pesanTutup"
                  value={pesanTutup}
                  onChange={(e) => setPesanTutup(e.target.value)}
                  rows={2}
                  placeholder="Reservasi ditutup sementara oleh admin."
                />
              </div>
            )}

            {mode === "open" && (
              <div className="space-y-2">
                <Label htmlFor="pesanBuka">Pesan saat buka</Label>
                <Textarea
                  id="pesanBuka"
                  value={pesanBuka}
                  onChange={(e) => setPesanBuka(e.target.value)}
                  rows={2}
                  placeholder="Reservasi dibuka oleh admin."
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            )}

            <Button onClick={handleSave} disabled={saving} className="bg-brand-primary hover:bg-brand-accent-hover">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Pengaturan"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
