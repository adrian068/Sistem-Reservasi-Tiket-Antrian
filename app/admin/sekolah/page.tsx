"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminSidebarBrand } from "@/components/admin-sidebar-brand"
import {
  School,
  FileText,
  Menu,
  X,
  Eye,
  LogOut,
  ChevronDown,
  Home,
  Newspaper,
  Calendar,
  ClipboardList,
  Edit,
  Trash2,
  Plus,
  Search,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Sekolah {
  id: string
  nama: string
  alamat?: string
  kecamatan?: string
  jenjang?: string
  akreditasi?: string
  status?: string
  telepon?: string
  email?: string
  tahunBerdiri?: string
  deskripsi?: string
  gambarUtama?: string
  foto1?: string
  foto2?: string
  createdAt: string
  updatedAt: string
}

export default function AdminSchoolsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSekolah, setSelectedSekolah] = useState<Sekolah | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingSekolah, setEditingSekolah] = useState<Sekolah | null>(null)
  const [deleteSekolah, setDeleteSekolah] = useState<Sekolah | null>(null)
  const [jenjangFilter, setJenjangFilter] = useState("Semua")
  const [kecamatanFilter, setKecamatanFilter] = useState("Semua")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    kecamatan: "",
    jenjang: "",
    akreditasi: "",
    status: "",
    telepon: "",
    email: "",
    tahunBerdiri: "",
    deskripsi: "",
    gambarUtama: "",
    foto1: "",
    foto2: "",
  })

  const [uploading, setUploading] = useState(false)
  const [previewGambarUtama, setPreviewGambarUtama] = useState<string | null>(null)
  const [previewFoto1, setPreviewFoto1] = useState<string | null>(null)
  const [previewFoto2, setPreviewFoto2] = useState<string | null>(null)

  const router = useRouter()

  const jenjangOptions = ["PAUD", "SD", "SMP"]
  const kecamatanOptions = [
    "Banjarmasin Utara",
    "Banjarmasin Tengah",
    "Banjarmasin Selatan",
    "Banjarmasin Timur",
    "Banjarmasin Barat",
  ]

  const navigationItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: Home },
    { label: "Manajemen Sekolah", href: "/admin/sekolah", icon: School, active: true },
    { label: "Manajemen Berita", href: "/admin/berita", icon: Newspaper },
    { label: "Manajemen Agenda", href: "/admin/agenda", icon: Calendar },
    { label: "Laporan Reservasi", href: "/admin/reservasi", icon: ClipboardList },
  ]

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
      } else {
        alert('Gagal logout. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Terjadi kesalahan saat logout.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    fetchSekolah()
  }, [])

  const fetchSekolah = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sekolahs")
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSekolahList(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching sekolah:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleEdit = (sekolah: Sekolah) => {
    setEditingSekolah(sekolah)
    setFormData({
      nama: sekolah.nama,
      alamat: sekolah.alamat || "",
      kecamatan: sekolah.kecamatan || "",
      jenjang: sekolah.jenjang || "",
      akreditasi: sekolah.akreditasi || "",
      status: sekolah.status || "",
      telepon: sekolah.telepon || "",
      email: sekolah.email || "",
      tahunBerdiri: sekolah.tahunBerdiri || "",
      deskripsi: sekolah.deskripsi || "",
      gambarUtama: sekolah.gambarUtama || "",
      foto1: sekolah.foto1 || "",
      foto2: sekolah.foto2 || "",
    })
    setPreviewGambarUtama(sekolah.gambarUtama || null)
    setPreviewFoto1(sekolah.foto1 || null)
    setPreviewFoto2(sekolah.foto2 || null)
    setIsEditOpen(true)
  }

  const handleDelete = (sekolah: Sekolah) => {
    setDeleteSekolah(sekolah)
    setIsDeleteOpen(true)
  }

  const handleViewDetails = async (sekolah: Sekolah) => {
    try {
      const response = await fetch(`/api/sekolahs/${sekolah.id}`)
      const result = await response.json()
      if (result.success) {
        setSelectedSekolah(result.data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      console.error("Error fetching sekolah details:", error)
    }
  }

  const confirmDelete = async () => {
    if (!deleteSekolah) return

    try {
      const response = await fetch(`/api/sekolahs/${deleteSekolah.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSekolah()
        setIsDeleteOpen(false)
        setDeleteSekolah(null)
      }
    } catch (error) {
      console.error("Error deleting sekolah:", error)
      alert("Gagal menghapus sekolah")
    }
  }

  const handleImageUpload = async (file: File, field: string) => {
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Upload response:", result)
        const imageUrl = result.data?.url || result.url

        if (!imageUrl) {
          throw new Error("URL gambar tidak ditemukan dalam response")
        }

        setFormData((prev) => ({ ...prev, [field]: imageUrl }))

        // Set preview
        if (field === "gambarUtama") setPreviewGambarUtama(imageUrl)
        else if (field === "foto1") setPreviewFoto1(imageUrl)
        else if (field === "foto2") setPreviewFoto2(imageUrl)
        
        console.log(`✅ Upload berhasil: ${imageUrl}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload gagal")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Gagal mengupload gambar"
      alert(`Upload Gagal: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dataToSend = {
      nama: formData.nama,
      alamat: formData.alamat,
      kecamatan: formData.kecamatan,
      jenjang: formData.jenjang,
      akreditasi: formData.akreditasi,
      status: formData.status,
      telepon: formData.telepon,
      email: formData.email,
      tahunBerdiri: formData.tahunBerdiri,
      deskripsi: formData.deskripsi,
      gambarUtama: formData.gambarUtama,
      foto1: formData.foto1,
      foto2: formData.foto2,
    }

    try {
      const url = editingSekolah
        ? `/api/sekolahs/${editingSekolah.id}`
        : "/api/sekolahs"
      const method = editingSekolah ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        await fetchSekolah()
        setIsAddOpen(false)
        setIsEditOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(`Gagal menyimpan: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving sekolah:", error)
      alert("Terjadi kesalahan saat menyimpan")
    }
  }

  const resetForm = () => {
    setFormData({
      nama: "",
      alamat: "",
      kecamatan: "",
      jenjang: "",
      akreditasi: "",
      status: "",
      telepon: "",
      email: "",
      tahunBerdiri: "",
      deskripsi: "",
      gambarUtama: "",
      foto1: "",
      foto2: "",
    })
    setPreviewGambarUtama(null)
    setPreviewFoto1(null)
    setPreviewFoto2(null)
    setEditingSekolah(null)
  }

  const stats = {
    total: sekolahList.length,
    paud: sekolahList.filter((s) => s.jenjang === "PAUD").length,
    sd: sekolahList.filter((s) => s.jenjang === "SD").length,
    smp: sekolahList.filter((s) => s.jenjang === "SMP").length,
  }

  const filteredSekolah = sekolahList.filter((sekolah) => {
    const matchesJenjang = jenjangFilter === "Semua" || sekolah.jenjang === jenjangFilter
    const matchesKecamatan = kecamatanFilter === "Semua" || sekolah.kecamatan === kecamatanFilter
    const matchesSearch =
      sekolah.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sekolah.alamat && sekolah.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesJenjang && matchesKecamatan && matchesSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [jenjangFilter, kecamatanFilter, searchTerm, sekolahList])

  const totalPages = Math.max(1, Math.ceil(filteredSekolah.length / itemsPerPage))
  const paginatedSekolah = filteredSekolah.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex h-screen bg-background">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } flex flex-col fixed lg:relative z-50 h-full ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <AdminSidebarBrand collapsed={sidebarCollapsed} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <li key={index}>
                  <button
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                      sidebarCollapsed ? 'justify-center' : 'space-x-3'
                    } ${
                      item.active
                        ? "bg-brand-primary text-white shadow-lg"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105 transition-all duration-200 ${
              sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
            }`}
            title={sidebarCollapsed ? (isLoggingOut ? 'Logging out...' : 'Logout') : undefined}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex hover:bg-accent hover:scale-105 transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Manajemen Sekolah</h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Kelola data sekolah di Kota Banjarmasin
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="hover:bg-accent hover:scale-105 transition-all duration-200">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-brand-primary rounded-full flex items-center justify-center">
                  <span className="text-xs lg:text-sm font-medium text-white">A</span>
                </div>
                <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Manajemen Sekolah</h1>
              <p className="text-muted-foreground">Kelola data sekolah di Kota Banjarmasin</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Sekolah</p>
                      <p className="text-3xl font-bold text-brand-accent">{stats.total}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-brand-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">PAUD</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.paud}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">SD</p>
                      <p className="text-3xl font-bold text-green-600">{stats.sd}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">SMP</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.smp}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="admin-content-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Daftar Sekolah</CardTitle>
                  <Button onClick={handleAdd} className="bg-brand-primary hover:bg-brand-accent-hover admin-button-hover">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Sekolah
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari sekolah..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={jenjangFilter} onValueChange={setJenjangFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semua">Semua Jenjang</SelectItem>
                      {jenjangOptions.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={kecamatanFilter} onValueChange={setKecamatanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semua">Semua Kecamatan</SelectItem>
                      {kecamatanOptions.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cards Grid */}
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat data...</div>
                ) : filteredSekolah.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada sekolah ditemukan</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedSekolah.map((sekolah) => (
                      <Card key={sekolah.id} className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-[1.02] overflow-hidden">
                        {/* Image Preview */}
                        <div className="relative w-full h-40 bg-gray-100">
                          {sekolah.gambarUtama ? (
                            <img
                              src={sekolah.gambarUtama}
                              alt={sekolah.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              <School className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-white">
                              {sekolah.jenjang}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="space-y-3 mb-4">
                            <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
                              {sekolah.nama}
                            </h3>
                            
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {sekolah.alamat || 'Alamat tidak tersedia'}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <School className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm text-muted-foreground truncate">
                                {sekolah.kecamatan}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {sekolah.status}
                              </Badge>
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                {sekolah.akreditasi || "-"}
                              </Badge>
                            </div>
                            {sekolah.tahunBerdiri && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Berdiri: {sekolah.tahunBerdiri}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(sekolah)}
                              className="flex-1 text-brand-accent hover:text-brand-accent-hover hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sekolah)}
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(sekolah)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {filteredSekolah.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, filteredSekolah.length)} dari {filteredSekolah.length} sekolah
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        aria-label="Halaman pertama"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        Halaman {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        aria-label="Halaman selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        aria-label="Halaman terakhir"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false)
          setIsEditOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSekolah ? "Edit Sekolah" : "Tambah Sekolah Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nama Sekolah *</Label>
                <Input
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: SDN Sungai Miai 5"
                />
              </div>

              <div>
                <Label>Jenjang *</Label>
                <Select value={formData.jenjang} onValueChange={(value) => setFormData({ ...formData, jenjang: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenjang" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenjangOptions.map((j) => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kecamatan</Label>
                <Select value={formData.kecamatan} onValueChange={(value) => setFormData({ ...formData, kecamatan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {kecamatanOptions.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Akreditasi</Label>
                <Select value={formData.akreditasi} onValueChange={(value) => setFormData({ ...formData, akreditasi: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Akreditasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Negeri">Negeri</SelectItem>
                    <SelectItem value="Swasta">Swasta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tahun Berdiri</Label>
                <Input
                  value={formData.tahunBerdiri}
                  onChange={(e) => setFormData({ ...formData, tahunBerdiri: e.target.value })}
                  placeholder="Contoh: 1985"
                />
              </div>

              <div>
                <Label>Telepon</Label>
                <Input
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  placeholder="Contoh: (0511) 3254789"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: sekolah@gmail.com"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Alamat</Label>
                <Textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap sekolah"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi sekolah..."
                  rows={4}
                />
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Gambar Sekolah</h3>
              
              {/* Gambar Utama */}
              <div>
                <Label>Gambar Utama</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "gambarUtama")
                    }}
                    className="hidden"
                    id="gambar-utama-upload"
                  />
                  <label
                    htmlFor="gambar-utama-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {previewGambarUtama ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewGambarUtama}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Gambar Utama</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Foto Galeri */}
              <div className="grid grid-cols-3 gap-4">
                {/* Foto 1 */}
                <div>
                  <Label>Foto 1</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, "foto1")
                      }}
                      className="hidden"
                      id="foto1-upload"
                    />
                    <label
                      htmlFor="foto1-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {previewFoto1 ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={previewFoto1}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>

                {/* Foto 2 */}
                <div>
                  <Label>Foto 2</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, "foto2")
                      }}
                      className="hidden"
                      id="foto2-upload"
                    />
                    <label
                      htmlFor="foto2-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {previewFoto2 ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={previewFoto2}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddOpen(false)
                setIsEditOpen(false)
                resetForm()
              }}>
                Batal
              </Button>
              <Button type="submit" disabled={uploading} className="bg-brand-primary hover:bg-brand-accent-hover">
                {uploading ? "Mengupload..." : editingSekolah ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Sekolah</DialogTitle>
          </DialogHeader>
          {selectedSekolah && (
            <div className="space-y-4">
              {selectedSekolah.gambarUtama && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedSekolah.gambarUtama}
                    alt={selectedSekolah.nama}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedSekolah.nama}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedSekolah.jenjang}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Akreditasi {selectedSekolah.akreditasi}
                  </Badge>
                  <Badge>{selectedSekolah.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kecamatan</p>
                  <p className="font-medium">{selectedSekolah.kecamatan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tahun Berdiri</p>
                  <p className="font-medium">{selectedSekolah.tahunBerdiri}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{selectedSekolah.telepon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedSekolah.email}</p>
                </div>
              </div>
              {selectedSekolah.deskripsi && (
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSekolah.deskripsi}</p>
                </div>
              )}
              {(selectedSekolah.foto1 || selectedSekolah.foto2) && (
                <div>
                  <h3 className="font-semibold mb-2">Galeri Foto:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSekolah.foto1 && (
                      <div className="relative h-32">
                        <Image
                          src={selectedSekolah.foto1}
                          alt="Foto 1"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    {selectedSekolah.foto2 && (
                      <div className="relative h-32">
                        <Image
                          src={selectedSekolah.foto2}
                          alt="Foto 2"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sekolah</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus <strong>{deleteSekolah?.nama}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

