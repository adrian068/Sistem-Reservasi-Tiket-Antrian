"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AgendaForm } from "@/components/agenda-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminSidebarBrand } from "@/components/admin-sidebar-brand"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  School,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Home,
  Newspaper,
  Calendar,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface Agenda {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  address?: string
  organizer: string
  capacity: number
  category: string
  registrationFee: string
  contactPerson?: string
  imageUrl?: string
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

const statusLabels = {
  SCHEDULED: 'Terjadwal',
  ONGOING: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan'
}

const statusColors = {
  SCHEDULED: 'bg-orange-100 text-orange-800',
  ONGOING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function AgendaPage() {
  const router = useRouter()
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null)
  const [viewingAgenda, setViewingAgenda] = useState<Agenda | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    organizer: "Dinas Pendidikan Kota Banjarmasin",
    capacity: 0,
    category: "Lainnya",
    registrationFee: "Gratis",
    contactPerson: "",
    imageUrl: "",
    status: "SCHEDULED" as 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED',
  })

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard", active: false },
    { icon: School, label: "Manajemen Sekolah", href: "/admin/sekolah", active: false },
    { icon: Newspaper, label: "Manajemen Berita", href: "/admin/berita", active: false },
    { icon: Calendar, label: "Manajemen Agenda", href: "/admin/agenda", active: true },
    { icon: Calendar, label: "Laporan Reservasi", href: "/admin/reservasi", active: false },
  ]

  // Fetch agendas
  const fetchAgendas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agendas')
      const result = await response.json()
      
      if (result.success) {
        setAgendas(result.data)
      } else {
        console.error('Failed to fetch agendas:', result.message)
      }
    } catch (error) {
      console.error('Error fetching agendas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgendas()
  }, [])

  // Filter agendas
  const filteredAgendas = agendas.filter(agenda => {
    const matchesSearch = agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agenda.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === "all" || agenda.status === statusFilter
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, agendas])

  const totalPages = Math.max(1, Math.ceil(filteredAgendas.length / itemsPerPage))
  const paginatedAgendas = filteredAgendas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAgenda ? `/api/agendas/${editingAgenda.id}` : '/api/agendas'
      const method = editingAgenda ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchAgendas() // Refresh the list
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingAgenda(null)
        setFormData({
          title: "",
          slug: "",
          description: "",
          date: "",
          time: "",
          location: "",
          address: "",
          organizer: "Dinas Pendidikan Kota Banjarmasin",
          capacity: 0,
          category: "Lainnya",
          registrationFee: "Gratis",
          contactPerson: "",
          imageUrl: "",
          status: "SCHEDULED",
        })
      } else {
        console.error('Failed to save agenda:', result.message)
        alert('Gagal menyimpan agenda: ' + result.message)
      }
    } catch (error) {
      console.error('Error saving agenda:', error)
      alert('Terjadi kesalahan saat menyimpan agenda')
    }
  }

  // Handle edit
  const handleEdit = (agenda: Agenda) => {
    setEditingAgenda(agenda)
    setFormData({
      title: agenda.title,
      slug: agenda.slug,
      description: agenda.description,
      date: agenda.date.split('T')[0], // Convert to YYYY-MM-DD format
      time: agenda.time,
      location: agenda.location,
      address: agenda.address || "",
      organizer: agenda.organizer,
      capacity: agenda.capacity,
      category: agenda.category,
      registrationFee: agenda.registrationFee,
      contactPerson: agenda.contactPerson || "",
      imageUrl: agenda.imageUrl || "",
      status: agenda.status,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/agendas/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchAgendas() // Refresh the list
      } else {
        console.error('Failed to delete agenda:', result.message)
        alert('Gagal menghapus agenda: ' + result.message)
      }
    } catch (error) {
      console.error('Error deleting agenda:', error)
      alert('Terjadi kesalahan saat menghapus agenda')
    }
  }

  // Handle view (fetch latest from API before showing)
  const handleView = async (id: string) => {
    try {
      setViewLoading(true)
      setIsViewDialogOpen(true)
      const response = await fetch(`/api/agendas/${id}`)
      const result = await response.json()
      if (result.success) {
        setViewingAgenda(result.data)
      } else {
        console.error('Failed to fetch agenda detail:', result.message)
        alert('Gagal memuat detail agenda: ' + result.message)
        setIsViewDialogOpen(false)
      }
    } catch (error) {
      console.error('Error fetching agenda detail:', error)
      alert('Terjadi kesalahan saat memuat detail agenda')
      setIsViewDialogOpen(false)
    } finally {
      setViewLoading(false)
    }
  }

  // Reset form
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

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      date: "",
      time: "",
      location: "",
      address: "",
      organizer: "Dinas Pendidikan Kota Banjarmasin",
      capacity: 0,
      category: "Lainnya",
      registrationFee: "Gratis",
      contactPerson: "",
      imageUrl: "",
      status: "SCHEDULED",
    })
    setEditingAgenda(null)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
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
                        if (item.label === "Manajemen Agenda") return
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
                  <h2 className="text-lg lg:text-xl font-semibold text-foreground">Manajemen Agenda</h2>
                  <p className="text-sm text-muted-foreground hidden sm:block">Kelola agenda dan kegiatan</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Button variant="ghost" size="sm" className="hover:bg-accent hover:scale-105 transition-all duration-200">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-medium text-white">A</span>
                  </div>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data agenda...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
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
                      if (item.label === "Manajemen Agenda") return
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
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Manajemen Agenda</h2>
                <p className="text-sm text-muted-foreground hidden sm:block">Kelola agenda dan kegiatan</p>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manajemen Agenda</h1>
            <p className="text-muted-foreground">Kelola agenda dan kegiatan</p>
          </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="admin-stats-card admin-card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Agenda</p>
                  <p className="text-3xl font-bold text-brand-accent">{agendas.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg admin-icon-hover">
                  <Calendar className="w-6 h-6 text-brand-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stats-card admin-card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Terjadwal</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {agendas.filter(a => a.status === 'SCHEDULED').length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg admin-icon-hover">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stats-card admin-card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Berlangsung</p>
                  <p className="text-3xl font-bold text-green-600">
                    {agendas.filter(a => a.status === 'ONGOING').length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg admin-icon-hover">
                  <AlertCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stats-card admin-card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Selesai</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {agendas.filter(a => a.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg admin-icon-hover">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="admin-content-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Daftar Agenda</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-brand-primary hover:bg-brand-accent-hover admin-button-hover"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Agenda
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Agenda Baru</DialogTitle>
                  </DialogHeader>
                  <AgendaForm 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                    initialImageUrl=""
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Input
                  placeholder="Cari berdasarkan judul atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                  <SelectItem value="ONGOING">Berlangsung</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : filteredAgendas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Tidak ada agenda ditemukan</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedAgendas.map((agenda) => (
                  <Card key={agenda.id} className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-[1.02] overflow-hidden">
                    {/* Image Preview */}
                    <div className="relative w-full h-40 bg-gray-100">
                      {agenda.imageUrl ? (
                        <img
                          src={agenda.imageUrl}
                          alt={agenda.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <Calendar className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={statusColors[agenda.status]}>
                          {statusLabels[agenda.status]}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-3 mb-4">
                        <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
                          {agenda.title}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {new Date(agenda.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">
                            {agenda.location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {agenda.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {agenda.capacity > 0 ? `${agenda.capacity} orang` : 'Unlimited'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(agenda.id)}
                          className="flex-1 text-brand-accent hover:text-brand-accent-hover hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(agenda)}
                          className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(agenda.id)}
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
            {filteredAgendas.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredAgendas.length)} dari {filteredAgendas.length} agenda
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Agenda</DialogTitle>
            </DialogHeader>
            <AgendaForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
              initialImageUrl={formData.imageUrl}
            />
          </DialogContent>
        </Dialog>
        
        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
          setIsViewDialogOpen(open)
          if (!open) setViewingAgenda(null)
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Detail Agenda</DialogTitle>
            </DialogHeader>
            {viewLoading ? (
              <div className="py-8 text-center text-gray-600">Memuat detail...</div>
            ) : viewingAgenda ? (
              <div className="space-y-6">
                {/* Image */}
                {viewingAgenda.imageUrl && (
                  <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={viewingAgenda.imageUrl} 
                      alt={viewingAgenda.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Title & Status */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{viewingAgenda.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[viewingAgenda.status]}>
                      {statusLabels[viewingAgenda.status]}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {viewingAgenda.category}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label className="text-gray-600 text-xs">📅 Tanggal</Label>
                    <div className="font-medium text-gray-900">{new Date(viewingAgenda.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">🕐 Waktu</Label>
                    <div className="font-medium text-gray-900">{viewingAgenda.time} WITA</div>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">📍 Lokasi</Label>
                    <div className="font-medium text-gray-900">{viewingAgenda.location}</div>
                  </div>
                  {viewingAgenda.address && (
                    <div>
                      <Label className="text-gray-600 text-xs">🏢 Alamat Lengkap</Label>
                      <div className="font-medium text-gray-900">{viewingAgenda.address}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600 text-xs">👥 Kapasitas</Label>
                    <div className="font-medium text-gray-900">
                      {viewingAgenda.capacity > 0 ? `${viewingAgenda.capacity} orang` : 'Tidak terbatas'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">🏛️ Penyelenggara</Label>
                    <div className="font-medium text-gray-900">{viewingAgenda.organizer}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">💰 Biaya Pendaftaran</Label>
                    <div className="font-medium text-gray-900">{viewingAgenda.registrationFee}</div>
                  </div>
                  {viewingAgenda.contactPerson && (
                    <div>
                      <Label className="text-gray-600 text-xs">📞 Kontak Person</Label>
                      <div className="font-medium text-gray-900">{viewingAgenda.contactPerson}</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-gray-600 text-sm font-semibold">Deskripsi</Label>
                  <div className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewingAgenda.description}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Slug:</span> {viewingAgenda.slug}
                    </div>
                    <div>
                      <span className="font-medium">Dibuat:</span> {new Date(viewingAgenda.createdAt).toLocaleString('id-ID')}
                    </div>
                    <div>
                      <span className="font-medium">Diperbarui:</span> {new Date(viewingAgenda.updatedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600">Data tidak tersedia</div>
            )}
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Tutup
              </Button>
              {viewingAgenda && (
                <Button 
                  type="button" 
                  className="bg-brand-primary hover:bg-brand-accent-hover" 
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingAgenda)
                  }}
                >
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </div>
  )
}

