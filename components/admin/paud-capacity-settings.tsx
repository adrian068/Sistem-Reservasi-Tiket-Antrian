"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Loader2, Users } from "lucide-react"

type CapacityInfo = {
  capacity: number
  petugasTotal: number
  petugasHadir: number
  kapasitasSlot: number | null
}

export function PaudCapacitySettings({
  onUpdated,
}: {
  onUpdated?: () => void
}) {
  const [info, setInfo] = useState<CapacityInfo | null>(null)
  const [value, setValue] = useState(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const res = await fetch("/api/admin/paud/capacity", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memuat kapasitas")
        return
      }
      setInfo(json.data)
      setValue(json.data.capacity)
    } catch {
      setError("Gagal memuat kapasitas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/paud/capacity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kapasitasSlot: value }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan")
        return
      }
      setInfo(json.data)
      setSuccess(json.message || "Kapasitas disimpan")
      onUpdated?.()
    } catch {
      setError("Gagal menyimpan kapasitas")
    } finally {
      setSaving(false)
    }
  }

  const presets = [1, 2, 3, 4, 5]

  return (
    <Card className="shadow-lg border-orange-200/60 dark:border-orange-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Kapasitas Tamu per Slot Waktu
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Sesuaikan dengan jumlah petugas di bidang. Contoh: 5 petugas → slot jam
          11:00 bisa menerima 5 reservasi sekaligus.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat...
          </div>
        ) : (
          <>
            {info && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="font-medium">{info.capacity} tamu</span> paralel per
                slot ·{" "}
                <span className="text-muted-foreground">
                  {info.petugasTotal} petugas terdaftar
                  {info.petugasHadir > 0 && ` · ${info.petugasHadir} hadir hari ini`}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="kapasitas-slot">Jumlah tamu maksimal (slot yang sama)</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue(n)}
                    className={cn(
                      "h-10 w-10 rounded-lg border-2 font-semibold transition-colors",
                      value === n
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        : "border-border hover:border-orange-300",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <input
                  id="kapasitas-slot"
                  type="number"
                  min={1}
                  max={20}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value) || 1)}
                  className="h-10 w-16 rounded-lg border border-input bg-background px-2 text-center text-sm"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button
              onClick={save}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Kapasitas"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
