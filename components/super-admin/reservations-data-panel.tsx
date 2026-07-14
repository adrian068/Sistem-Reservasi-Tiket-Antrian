"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Eye,
  FileText,
  Loader2,
  Phone,
  Search,
  User,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ReservationTimeSettings } from "@/components/admin/reservation-time-settings"

type Reservation = {
  id: string
  queueNumber: string
  service: string
  name: string
  phone: string
  nik?: string
  purpose: string
  date: string
  timeSlot: string
  status: string
  createdAt: string
  layanan?: { name: string } | null
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    waiting: "Menunggu",
    called: "Dipanggil",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  }
  return map[status.toLowerCase()] ?? status
}

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s === "completed") return "bg-green-100 text-green-800"
  if (s === "waiting") return "bg-yellow-100 text-yellow-800"
  if (s === "called") return "bg-blue-100 text-blue-800"
  if (s === "cancelled") return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

export function ReservationsDataPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selected, setSelected] = useState<Reservation | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/reservations")
      const json = await res.json()
      if (res.ok && json.success) setReservations(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = reservations.filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter
    const serviceKey = (r.layanan?.name || r.service || "").toLowerCase()
    const serviceOk =
      serviceFilter === "all" ||
      serviceKey.includes(serviceFilter) ||
      r.service.toLowerCase().includes(serviceFilter)
    const q = searchTerm.trim().toLowerCase()
    const searchOk =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.queueNumber.toLowerCase().includes(q) ||
      r.phone.includes(q)
    return statusOk && serviceOk && searchOk
  })

  const stats = {
    total: reservations.length,
    waiting: reservations.filter((r) => r.status === "waiting").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-violet-600" },
          { label: "Menunggu", value: stats.waiting, color: "text-amber-600" },
          { label: "Selesai", value: stats.completed, color: "text-green-600" },
          { label: "Batal", value: stats.cancelled, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="pengaturan" className="scroll-mt-6">
        <h3 className="text-lg font-semibold mb-3">Pengaturan Reservasi & Kapasitas Slot</h3>
        <ReservationTimeSettings />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Data Reservasi</h3>
          <p className="text-sm text-muted-foreground">
            {filtered.length} dari {reservations.length} reservasi
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reservasi">Operasional lengkap (panel Admin)</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="super-search">Cari</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="super-search"
              placeholder="Nama, tiket, telepon..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="waiting">Menunggu</SelectItem>
              <SelectItem value="called">Dipanggil</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Layanan</Label>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="ptk">PTK</SelectItem>
              <SelectItem value="sd">SD</SelectItem>
              <SelectItem value="smp">SMP</SelectItem>
              <SelectItem value="paud">PAUD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Tidak ada data reservasi
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Tiket</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-violet-700">
                      {r.queueNumber}
                    </TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm">
                      {r.layanan?.name || r.service}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {r.date}
                      <br />
                      <span className="text-muted-foreground">{r.timeSlot}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(r.status)}>
                        {statusLabel(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(r)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Reservasi {selected?.queueNumber}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{selected.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selected.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {selected.date} — {selected.timeSlot}
                </span>
              </div>
              <p>
                <span className="text-muted-foreground">Layanan: </span>
                {selected.layanan?.name || selected.service}
              </p>
              <p>
                <span className="text-muted-foreground">Status: </span>
                {statusLabel(selected.status)}
              </p>
              <p>
                <span className="text-muted-foreground">Tujuan: </span>
                {selected.purpose}
              </p>
              {selected.nik && (
                <p>
                  <span className="text-muted-foreground">NIK: </span>
                  {selected.nik}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
