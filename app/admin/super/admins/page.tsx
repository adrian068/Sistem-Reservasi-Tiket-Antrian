"use client"

import { useEffect, useState } from "react"
import { Loader2, KeyRound, Pencil, Trash2, UserCog, UserPlus, UserX } from "lucide-react"
import { SuperAdminShell } from "@/components/super-admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
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
import { Badge } from "@/components/ui/badge"
import { BIDANG_SLUGS, BIDANG_CONFIG, type BidangSlug } from "@/lib/bidang-config"

type BidangOption = {
  slug: BidangSlug
  label: string
  defaultNama: string
}

type AdminRow = {
  id: string
  nama: string
  email: string
  username: string
  loginUsername?: string
  peran: string
  peranLabel: string
  bidangSlug: string | null
  bidangLabel: string | null
  editable: boolean
  manageable: boolean
  aktif: boolean
  source: string
  createdAt: string
}

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [adminType, setAdminType] = useState<"loket" | "bidang">("loket")
  const [bidangSlug, setBidangSlug] = useState<BidangSlug>("paud")
  const [nama, setNama] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [editOpen, setEditOpen] = useState(false)
  const [editRow, setEditRow] = useState<AdminRow | null>(null)
  const [editNama, setEditNama] = useState("")
  const [editBidangSlug, setEditBidangSlug] = useState<BidangSlug>("paud")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadAdmins = async () => {
    try {
      const res = await fetch("/api/admin/super/admins")
      const json = await res.json()
      if (res.ok && json.success) {
        setAdmins(json.data)
        if (Array.isArray(json.bidangOptions) && json.bidangOptions.length > 0) {
          setBidangOptions(json.bidangOptions)
        } else {
          setBidangOptions(
            BIDANG_SLUGS.map((slug) => ({
              slug,
              label: BIDANG_CONFIG[slug].label,
              defaultNama: BIDANG_CONFIG[slug].defaultAdminNama,
            })),
          )
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  useEffect(() => {
    if (adminType !== "bidang") return
    const opt = bidangOptions.find((b) => b.slug === bidangSlug)
    if (opt && (!nama || bidangOptions.some((b) => b.defaultNama === nama))) {
      setNama(opt.defaultNama)
    }
  }, [adminType, bidangSlug, bidangOptions, nama])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/super/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          username,
          email: email.trim() || undefined,
          password,
          adminType,
          bidangSlug: adminType === "bidang" ? bidangSlug : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal membuat admin")
        return
      }
      setSuccess(
        json.message ||
          (adminType === "bidang"
            ? `Admin bidang ${json.data.bidangLabel ?? bidangSlug} "${json.data.nama}" berhasil dibuat. Login: ${json.data.loginUsername ?? json.data.username}`
            : `Admin loket "${json.data.nama}" berhasil dibuat. Login: ${json.data.loginUsername ?? json.data.username}`),
      )
      setNama("")
      setUsername("")
      setEmail("")
      setPassword("")
      setAdminType("loket")
      await loadAdmins()
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (row: AdminRow) => {
    setEditRow(row)
    setEditNama(row.nama)
    setEditBidangSlug((row.bidangSlug as BidangSlug) || "paud")
    setEditError("")
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editRow) return
    setEditSaving(true)
    setEditError("")
    try {
      const res = await fetch(`/api/admin/super/admins/${encodeURIComponent(editRow.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editNama,
          bidangSlug: editBidangSlug,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setEditError(json.error || "Gagal menyimpan")
        return
      }
      setEditOpen(false)
      setSuccess(json.message || "Admin bidang diperbarui")
      await loadAdmins()
    } catch {
      setEditError("Terjadi kesalahan jaringan")
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleActive = async (row: AdminRow) => {
    const nextActive = !row.aktif
    const label = nextActive ? "mengaktifkan" : "memblokir"
    if (
      !window.confirm(
        nextActive
          ? `Aktifkan kembali akun "${row.nama}" (${row.username})?`
          : `Blokir akun "${row.nama}" (${row.username})? Pengguna tidak bisa login sampai diaktifkan lagi.`,
      )
    ) {
      return
    }

    setActionLoadingId(row.id)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/super/admins/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: nextActive }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || `Gagal ${label} admin`)
        return
      }
      setSuccess(json.message || `Berhasil ${label} admin.`)
      await loadAdmins()
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleResetPassword = async (row: AdminRow) => {
    const nextPassword = window.prompt(
      `Password baru untuk "${row.nama}" (${row.username}):\nMinimal 8 karakter.`,
    )
    if (!nextPassword) return
    if (nextPassword.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setActionLoadingId(row.id)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/super/admins/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal memperbarui password")
        return
      }
      setSuccess(
        json.message ||
          `Password "${row.username}" berhasil diperbarui. Login dengan username "${row.username}" (huruf harus sama persis).`,
      )
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (row: AdminRow) => {
    if (
      !window.confirm(
        `Hapus permanen akun "${row.nama}" (${row.username})? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return
    }

    setActionLoadingId(row.id)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/super/admins/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal menghapus admin")
        return
      }
      setSuccess(json.message || "Admin berhasil dihapus.")
      await loadAdmins()
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <SuperAdminShell
      title="Kelola Admin"
      subtitle="Buat admin loket atau admin bidang (PAUD, SD, SMP, PTK) — ubah nama & penugasan bidang"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 border-violet-200 dark:border-violet-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-violet-600" />
              Admin Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipe Admin</Label>
                <Select
                  value={adminType}
                  onValueChange={(v) => setAdminType(v as "loket" | "bidang")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loket">Admin Loket (operasional harian)</SelectItem>
                    <SelectItem value="bidang">Admin Bidang (PAUD / SD / SMP / PTK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {adminType === "bidang" && (
                <div className="space-y-2">
                  <Label>Bidang</Label>
                  <Select
                    value={bidangSlug}
                    onValueChange={(v) => setBidangSlug(v as BidangSlug)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bidangOptions.map((b) => (
                        <SelectItem key={b.slug} value={b.slug}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Tampilan</Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  placeholder={
                    adminType === "bidang"
                      ? BIDANG_CONFIG[bidangSlug].defaultAdminNama
                      : "Nama admin loket"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username (untuk login)</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="contoh: admin_paud"
                />
                <p className="text-xs text-muted-foreground">
                  Gunakan username ini saat login. Jika email diisi, login tetap bisa dengan username
                  ini.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kosongkan = username@siredi.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : adminType === "bidang" ? (
                  "Buat Admin Bidang"
                ) : (
                  "Buat Admin Loket"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="w-5 h-5 text-violet-600" />
              Daftar Admin ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Peran / Bidang</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Belum ada admin terdaftar
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.nama}</TableCell>
                          <TableCell>
                            <code className="rounded bg-violet-50 px-2 py-1 text-sm font-semibold text-violet-800">
                              {row.username}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                              <Badge
                                variant={
                                  row.peran === "SUPER_ADMIN" ? "default" : "secondary"
                                }
                                className={
                                  row.peran === "SUPER_ADMIN" ? "bg-violet-600" : undefined
                                }
                              >
                                {row.peranLabel}
                              </Badge>
                              {row.bidangLabel && (
                                <span className="text-xs text-muted-foreground">
                                  Panel: {row.bidangLabel}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.aktif ? (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-700 border-red-300">
                                Diblokir
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {row.editable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(row)}
                                  disabled={actionLoadingId === row.id}
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-1" />
                                  Ubah
                                </Button>
                              )}
                              {row.manageable && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResetPassword(row)}
                                    disabled={actionLoadingId === row.id}
                                  >
                                    {actionLoadingId === row.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                                        Reset Sandi
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleActive(row)}
                                    disabled={actionLoadingId === row.id}
                                  >
                                    {actionLoadingId === row.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : row.aktif ? (
                                      <>
                                        <UserX className="w-3.5 h-3.5 mr-1" />
                                        Blokir
                                      </>
                                    ) : (
                                      "Aktifkan"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(row)}
                                    disabled={actionLoadingId === row.id}
                                  >
                                    {actionLoadingId === row.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Hapus
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {!row.editable && !row.manageable && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Admin Bidang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Ubah nama tampilan atau pindahkan penugasan bidang (mis. PAUD → SD). Admin loket tidak
              dapat diubah dari sini.
            </p>
            {editError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {editError}
              </p>
            )}
            <div className="space-y-2">
              <Label>Nama Tampilan</Label>
              <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bidang</Label>
              <Select
                value={editBidangSlug}
                onValueChange={(v) => setEditBidangSlug(v as BidangSlug)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bidangOptions.map((b) => (
                    <SelectItem key={b.slug} value={b.slug}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Setelah diubah, admin perlu login ulang agar panel internal mengikuti bidang baru.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editSaving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminShell>
  )
}

