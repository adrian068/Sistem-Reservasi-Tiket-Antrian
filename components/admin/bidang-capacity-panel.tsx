"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Clock3, Loader2, Users } from "lucide-react"

type BidangRow = {
  slug: string
  nama: string
  capacity: number
  petugasTotal: number
  petugasHadir: number
  kapasitasSlot: number | null
}

const SLUG_LABEL: Record<string, string> = {
  ptk: "PTK",
  "sd-umum": "SD",
  "smp-umum": "SMP",
  paud: "PAUD",
}

const SLUG_ACCENT: Record<string, string> = {
  ptk: "border-blue-200 dark:border-blue-900",
  "sd-umum": "border-green-200 dark:border-green-900",
  "smp-umum": "border-purple-200 dark:border-purple-900",
  paud: "border-orange-200 dark:border-orange-900",
}

type BidangCapacityPanelProps = {
  /** Hanya tampilkan satu bidang (mis. halaman admin PAUD) */
  slugOnly?: string
  onUpdated?: () => void
  className?: string
}

export function BidangCapacityPanel({
  slugOnly,
  onUpdated,
  className,
}: BidangCapacityPanelProps) {
  const [rows, setRows] = useState<BidangRow[]>([])
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const url = slugOnly
        ? `/api/admin/bidang-capacity?slug=${slugOnly}`
        : "/api/admin/bidang-capacity"
      const res = await fetch(url, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memuat kapasitas")
        return
      }

      const list: BidangRow[] = slugOnly
        ? [{ slug: slugOnly, nama: SLUG_LABEL[slugOnly] ?? slugOnly, ...json.data }]
        : json.data

      setRows(list)
      const next: Record<string, number> = {}
      for (const r of list) {
        next[r.slug] = r.capacity
      }
      setDraft(next)
    } catch {
      setError("Gagal memuat kapasitas bidang")
    } finally {
      setLoading(false)
    }
  }, [slugOnly])

  useEffect(() => {
    load()
  }, [load])

  const save = async (slug: string) => {
    setSavingSlug(slug)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/bidang-capacity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kapasitasSlot: draft[slug] ?? 1 }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan")
        return
      }
      setSuccess(json.message || "Kapasitas disimpan")
      await load()
      onUpdated?.()
    } catch {
      setError("Gagal menyimpan kapasitas")
    } finally {
      setSavingSlug(null)
    }
  }

  const presets = [1, 2, 3, 4, 5]

  return (
    <Card className={cn("shadow-lg border-0", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-blue-600" />
          Kapasitas Tamu per Slot Waktu
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Atur berapa tamu bisa memilih <strong>waktu yang sama</strong> per bidang.
          Contoh: PAUD 5 petugas → slot 11:00 bisa 5 reservasi sekaligus.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat pengaturan...
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-4",
                slugOnly ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
              )}
            >
              {rows.map((row) => (
                <div
                  key={row.slug}
                  className={cn(
                    "rounded-xl border-2 p-4 bg-muted/20",
                    SLUG_ACCENT[row.slug] ?? "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {SLUG_LABEL[row.slug] ?? row.nama}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        {row.petugasTotal} petugas
                        {row.petugasHadir > 0 && ` · ${row.petugasHadir} hadir`}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-background border rounded-full px-2 py-0.5">
                      {row.capacity}/slot
                    </span>
                  </div>

                  <Label className="text-xs text-muted-foreground">
                    Tamu paralel (slot sama)
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-3">
                    {presets.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, [row.slug]: n }))
                        }
                        className={cn(
                          "h-9 w-9 rounded-md border text-sm font-semibold transition-colors",
                          draft[row.slug] === n
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950"
                            : "border-border hover:border-blue-300",
                        )}
                      >
                        {n}
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={draft[row.slug] ?? row.capacity}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          [row.slug]: Number(e.target.value) || 1,
                        }))
                      }
                      className="h-9 w-14 rounded-md border border-input bg-background px-1 text-center text-sm"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={savingSlug === row.slug}
                    onClick={() => save(row.slug)}
                  >
                    {savingSlug === row.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Simpan ${SLUG_LABEL[row.slug] ?? row.slug}`
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
