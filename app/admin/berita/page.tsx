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
  Download,
  Filter,
  LogOut,
  ChevronDown,
  Home,
  Newspaper,
  Calendar,
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

interface Berita {
  id: string
  judul: string
  slug: string
  ringkasan?: string
  konten: string
  kategori: string
  status: string
  tanggalTerbit?: string
  gambarUtama?: string
  views: number
  tags?: string
  unggulan: boolean
  idPenggunas?: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminNewsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [beritaList, setBeritaList] = useState<Berita[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingBerita, setEditingBerita] = useState<Berita | null>(null)
  const [deleteBerita, setDeleteBerita] = useState<Berita | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [kategoriFilter, setKategoriFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [formData, setFormData] = useState({
    judul: "",
    slug: "",
    ringkasan: "",
    konten: "",
    kategori: "PENGUMUMAN",
    status: "DRAFT",
    tanggalTerbit: new Date().toISOString().split('T')[0],
    gambarUtama: "",
    tags: "",
    unggulan: false,
  })

  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const router = useRouter()

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

  // Fetch berita from API
  useEffect(() => {
    fetchBerita()
  }, [])

  const fetchBerita = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news?status=all')
      if (response.ok) {
        const data = await response.json()
        setBeritaList(data || [])
      }
    } catch (error) {
      console.error('Error fetching berita:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard", active: false },
    { icon: School, label: "Manajemen Sekolah", href: "/admin/sekolah", active: false },
    { icon: Newspaper, label: "Manajemen Berita", href: "/admin/berita", active: true },
    { icon: Calendar, label: "Manajemen Agenda", href: "/admin/agenda", active: false },
    { icon: Calendar, label: "Laporan Reservasi", href: "/admin/reservasi", active: false },
  ]

  const kategoriOptions = [
    "PENGUMUMAN",
    "KEGIATAN", 
    "PENDAFTARAN",
    "KEUANGAN",
    "KERJASAMA",
    "BEASISWA"
  ]

  // Filter berita
  const filteredBerita = beritaList.filter(berita => {
    const statusMatch = statusFilter === "all" || berita.status === statusFilter
    const kategoriMatch = kategoriFilter === "all" || berita.kategori === kategoriFilter
    const searchMatch = berita.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (berita.ringkasan && berita.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()))
    return statusMatch && kategoriMatch && searchMatch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, kategoriFilter, searchTerm, beritaList])

  const totalPages = Math.max(1, Math.ceil(filteredBerita.length / itemsPerPage))
  const paginatedBerita = filteredBerita.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Calculate statistics
  const stats = {
    total: beritaList.length,
    published: beritaList.filter(b => b.status === "PUBLISHED").length,
    draft: beritaList.filter(b => b.status === "DRAFT").length,
    archived: beritaList.filter(b => b.status === "ARCHIVED").length,
  }

  const handleViewDetails = (berita: Berita) => {
    setSelectedBerita(berita)
    setIsDetailOpen(true)
  }

  const handleAdd = () => {
    setFormData({
      judul: "",
      slug: "",
      ringkasan: "",
      konten: "",
      kategori: "PENGUMUMAN",
      status: "DRAFT",
      tanggalTerbit: new Date().toISOString().split('T')[0],
      gambarUtama: "",
      tags: "",
      unggulan: false,
    })
    setPreviewUrl(null)
    setIsAddOpen(true)
  }

  const handleEdit = (berita: Berita) => {
    setEditingBerita(berita)
    setFormData({
      judul: berita.judul,
      slug: berita.slug,
      ringkasan: berita.ringkasan || "",
      konten: berita.konten,
      kategori: berita.kategori,
      status: berita.status,
      tanggalTerbit: berita.tanggalTerbit ? new Date(berita.tanggalTerbit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      gambarUtama: berita.gambarUtama || "",
      tags: berita.tags || "",
      unggulan: berita.unggulan,
    })
    setPreviewUrl(berita.gambarUtama || null)
    setIsEditOpen(true)
  }

  const handleDelete = (berita: Berita) => {
    setDeleteBerita(berita)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingBerita ? `/api/news/${editingBerita.id}` : '/api/news'
      const method = editingBerita ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchBerita()
        setIsAddOpen(false)
        setIsEditOpen(false)
        setEditingBerita(null)
        alert(editingBerita ? 'Berita berhasil diperbarui!' : 'Berita berhasil ditambahkan!')
      } else {
        const error = await response.json()
        alert(`Gagal menyimpan berita: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving berita:', error)
      alert('Terjadi kesalahan saat menyimpan berita')
    }
  }

  const confirmDelete = async () => {
    if (!deleteBerita) return

    try {
      const response = await fetch(`/api/news/${deleteBerita.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBerita()
        setIsDeleteOpen(false)
        setDeleteBerita(null)
        alert('Berita berhasil dihapus!')
      } else {
        alert('Gagal menghapus berita')
      }
    } catch (error) {
      console.error('Error deleting berita:', error)
      alert('Terjadi kesalahan saat menghapus berita')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "ARCHIVED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Published"
      case "DRAFT":
        return "Draft"
      case "ARCHIVED":
        return "Archived"
      default:
        return status
    }
  }

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
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Manajemen Berita</h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Kelola berita dan publikasi
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
              <h1 className="text-3xl font-bold text-foreground">Manajemen Berita</h1>
              <p className="text-muted-foreground">Kelola berita dan publikasi</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Berita</p>
                      <p className="text-3xl font-bold text-brand-accent">{stats.total}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg admin-icon-hover">
                      <Newspaper className="w-6 h-6 text-brand-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Published</p>
                      <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg admin-icon-hover">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Draft</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.draft}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg admin-icon-hover">
                      <Edit className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-stats-card admin-card-interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Archived</p>
                      <p className="text-3xl font-bold text-red-600">{stats.archived}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg admin-icon-hover">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="admin-content-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Daftar Berita</CardTitle>
                  <Button onClick={handleAdd} className="bg-brand-primary hover:bg-brand-accent-hover admin-button-hover">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Berita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari berita..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {kategoriOptions.map((kat) => (
                        <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cards Grid */}
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat data...</div>
                ) : filteredBerita.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Tidak ada berita ditemukan</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedBerita.map((berita) => (
                      <Card key={berita.id} className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-[1.02] overflow-hidden">
                        {/* Image Preview */}
                        <div className="relative w-full h-40 bg-gray-100">
                          {berita.gambarUtama ? (
                            <img
                              src={berita.gambarUtama}
                              alt={berita.judul}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              <Newspaper className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className={getStatusColor(berita.status)}>
                              {getStatusLabel(berita.status)}
                            </Badge>
                          </div>
                          {berita.unggulan && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-500 text-white">
                                Unggulan
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="space-y-3 mb-4">
                            <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
                              {berita.judul}
                            </h3>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                              {berita.ringkasan || 'Tidak ada ringkasan'}
                            </p>
                          </div>
                          
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {berita.kategori}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="w-3 h-3" />
                                {berita.views}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(berita.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(berita)}
                              className="flex-1 text-brand-accent hover:text-brand-accent-hover hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(berita)}
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(berita)}
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
                {filteredBerita.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, filteredBerita.length)} dari {filteredBerita.length} berita
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

      {/* View Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Berita</DialogTitle>
          </DialogHeader>
          {selectedBerita && (
            <div className="space-y-4 text-foreground">
              {selectedBerita.gambarUtama && (
                <img
                  src={selectedBerita.gambarUtama}
                  alt={selectedBerita.judul}
                  className="w-full h-64 object-cover rounded"
                />
              )}
              <div>
                <Badge className={getStatusColor(selectedBerita.status)}>
                  {getStatusLabel(selectedBerita.status)}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {selectedBerita.kategori}
                </Badge>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedBerita.judul}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedBerita.createdAt).toLocaleDateString('id-ID')} | {selectedBerita.views} views
                </p>
              </div>
              {selectedBerita.ringkasan && (
                <div>
                  <h3 className="font-semibold mb-2">Ringkasan:</h3>
                  <p className="text-muted-foreground">{selectedBerita.ringkasan}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Konten:</h3>
                <div className="text-muted-foreground whitespace-pre-wrap">{selectedBerita.konten}</div>
              </div>
              {selectedBerita.tags && (
                <div>
                  <h3 className="font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBerita.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false)
          setIsEditOpen(false)
          setEditingBerita(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBerita ? 'Edit Berita' : 'Tambah Berita Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="judul">Judul *</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Kosongkan untuk otomatis"
                />
              </div>

              <div>
                <Label htmlFor="kategori">Kategori *</Label>
                <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map((kat) => (
                      <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tanggalTerbit">Tanggal Terbit</Label>
                <Input
                  id="tanggalTerbit"
                  type="date"
                  value={formData.tanggalTerbit}
                  onChange={(e) => setFormData({ ...formData, tanggalTerbit: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="ringkasan">Ringkasan</Label>
                <Textarea
                  id="ringkasan"
                  value={formData.ringkasan}
                  onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                  rows={3}
                  placeholder="Ringkasan singkat berita"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="konten">Konten *</Label>
                <Textarea
                  id="konten"
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  rows={8}
                  required
                  placeholder="Isi konten berita"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="pendidikan, banjarmasin, sekolah"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="gambarUtama">Upload Gambar</Label>
                <div className="space-y-4">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFormData({ ...formData, gambarUtama: "" })
                          setPreviewUrl(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <Label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? "Uploading..." : "Pilih Gambar"}
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUploading(true)
                              try {
                                const uploadFormData = new FormData()
                                uploadFormData.append('file', file)

                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: uploadFormData,
                                })

                                const result = await response.json()

                                if (result.success) {
                                  setFormData({ ...formData, gambarUtama: result.data.url })
                                  setPreviewUrl(result.data.url)
                                } else {
                                  alert(result.message || 'Gagal mengupload file')
                                }
                              } catch (error) {
                                console.error('Upload error:', error)
                                alert('Gagal mengupload file')
                              } finally {
                                setUploading(false)
                              }
                            }
                          }}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.unggulan}
                    onChange={(e) => setFormData({ ...formData, unggulan: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Jadikan berita unggulan</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false)
                  setIsEditOpen(false)
                  setEditingBerita(null)
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-accent-hover">
                {editingBerita ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus berita "<strong>{deleteBerita?.judul}</strong>"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
