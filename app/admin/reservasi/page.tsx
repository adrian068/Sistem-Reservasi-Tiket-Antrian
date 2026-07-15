"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  School,
  FileText,
  Menu,
  X,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  ChevronDown,
  Home,
  Calendar,
  XCircle,
  Phone,
  User,
  Calendar as CalendarIcon,
  Trash2,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Monitor,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { ReservationTimeSettings } from "@/components/admin/reservation-time-settings"
import { BidangPresencePanel } from "@/components/admin/bidang-presence-panel"
import { buildAdminNavigation } from "@/lib/admin-navigation"
import { AdminModeSwitch } from "@/components/admin-mode-switch"
import { AdminSidebarBrand } from "@/components/admin-sidebar-brand"
import { getTimeSlotsForDateString } from "@/lib/time-slots"

interface Layanan {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

interface Reservation {
  id: string
  queueNumber: string
  service: string
  idLayanan?: string
  layanan?: Layanan | null
  name: string
  phone: string
  nik?: string
  purpose: string
  date: string
  timeSlot: string
  status: string
  createdAt: string
  estimatedCallTime?: string
}

const SERVICE_NAME_MAP: Record<string, string> = {
  'ptk (pendidik dan tenaga kependidikan)': 'ptk',
  'ptk': 'ptk',
  'sd umum': 'sd',
  'sd': 'sd',
  'smp umum': 'smp',
  'smp': 'smp',
  'paud': 'paud',
}

const getServiceKey = (reservation: Reservation) => {
  if (reservation.layanan?.name) {
    const key = SERVICE_NAME_MAP[reservation.layanan.name.trim().toLowerCase()]
    if (key) return key
  }
  if (reservation.service) {
    const key = SERVICE_NAME_MAP[reservation.service.trim().toLowerCase()]
    if (key) return key
  }
  return reservation.service?.trim().toLowerCase() || ''
}

export default function AdminReservationsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [deleteReservation, setDeleteReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const router = useRouter()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setShowNotifications(false)
      }
      if (!target.closest('.user-menu-dropdown') && !target.closest('.user-menu-button')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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


  // Fetch reservations from API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations')
        if (response.ok) {
          const data = await response.json()
          setReservations(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const navigationItems = buildAdminNavigation("/admin/reservasi")

  // Filter reservations based on selected filters
  const filteredReservations = reservations.filter(reservation => {
    const statusMatch = statusFilter === "all" || reservation.status === statusFilter
    const serviceKey = getServiceKey(reservation)
    const serviceMatch = serviceFilter === "all" || serviceKey === serviceFilter
    const searchMatch =
      searchTerm.trim() === "" ||
      reservation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.queueNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && serviceMatch && searchMatch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, serviceFilter, searchTerm, reservations])

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / itemsPerPage))
  const paginatedReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Calculate statistics
  const stats = {
    total: reservations.length,
    completed: reservations.filter(r => r.status === "completed").length,
    waiting: reservations.filter(r => r.status === "waiting").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  }

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDetailOpen(true)
  }

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      // Find the reservation to get all its data
      const reservation = reservations.find(r => r.id === reservationId)
      if (!reservation) {
        alert('Reservasi tidak ditemukan')
        return
      }

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reservation.name,
          phone: reservation.phone,
          nik: reservation.nik || '',
          purpose: reservation.purpose,
          service: reservation.service,
          date: reservation.date,
          timeSlot: reservation.timeSlot,
          status: newStatus.toUpperCase(),
          idLayanan: reservation.idLayanan || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Refresh data from server to get updated info
        const refreshResponse = await fetch('/api/reservations')
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setReservations(refreshData.data || [])
        } else {
          // Fallback: Update local state
          setReservations(prev => 
            prev.map(res => 
              res.id === reservationId 
                ? { ...res, status: newStatus.toLowerCase() }
                : res
            )
          )
        }
        
        // Update selected reservation if detail is open
        if (selectedReservation?.id === reservationId) {
          setSelectedReservation({
            ...selectedReservation,
            status: newStatus.toLowerCase()
          })
        }
        
        // Show success message with better formatting
        const statusMessages: { [key: string]: string } = {
          'called': 'Dipanggil',
          'completed': 'Selesai',
          'cancelled': 'Dibatalkan',
          'waiting': 'Menunggu'
        }
        
        alert(`✅ Status berhasil diubah menjadi "${statusMessages[newStatus.toLowerCase()] || newStatus}"`)
        
        // Close detail dialog after update
        setIsDetailOpen(false)
      } else {
        const error = await response.json()
        alert(`❌ Gagal mengubah status: ${error.error || error.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Terjadi kesalahan saat mengubah status')
    }
  }

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation({ ...reservation })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingReservation) return

    try {
      const response = await fetch(`/api/reservations/${editingReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingReservation.name,
          phone: editingReservation.phone,
          nik: editingReservation.nik,
          purpose: editingReservation.purpose,
          service: editingReservation.service,
          date: editingReservation.date,
          timeSlot: editingReservation.timeSlot,
          status: editingReservation.status.toUpperCase(),
        }),
      })

      if (response.ok) {
        // Update local state
        setReservations(prev => 
          prev.map(res => 
            res.id === editingReservation.id 
              ? { ...editingReservation, status: editingReservation.status.toLowerCase() }
              : res
          )
        )
        setIsEditOpen(false)
        setEditingReservation(null)
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  const handleDeleteReservation = (reservation: Reservation) => {
    setDeleteReservation(reservation)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteReservation) return

    try {
      const response = await fetch(`/api/reservations/${deleteReservation.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setReservations(prev => 
          prev.filter(res => res.id !== deleteReservation.id)
        )
        setIsDeleteOpen(false)
        setDeleteReservation(null)
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
    }
  }

  const getServiceName = (reservation: Reservation) => {
    // Prioritize layanan relation if available
    if (reservation.layanan && reservation.layanan.name) {
      return reservation.layanan.name
    }
    // Fallback to service field with static mapping
    const serviceNames: Record<string, string> = {
      ptk: "PTK (Pendidik dan Tenaga Kependidikan)",
      sd: "SD Umum",
      smp: "SMP Umum",
      paud: "PAUD",
    }
    return serviceNames[reservation.service] || reservation.service
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "called":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Selesai"
      case "waiting":
        return "Menunggu"
      case "called":
        return "Dipanggil"
      case "cancelled":
        return "Dibatalkan"
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

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <AdminModeSwitch collapsed={sidebarCollapsed} />
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
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Laporan Reservasi</h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Kelola dan tindak lanjuti reservasi layanan dari masyarakat
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4 relative">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu Button */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-accent hover:scale-105 transition-all duration-200 user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-medium text-white">A</span>
                  </div>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                </Button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 user-menu-dropdown">
                    <div className="p-4 border-b border-border">
                      <p className="font-semibold">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@simdik.com</p>
                    </div>
                    <div className="p-2">
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-md text-sm"
                        onClick={() => {
                          router.push('/admin/profile')
                          setShowUserMenu(false)
                        }}
                      >
                        Profile Saya
                      </button>
                      <div className="border-t border-border my-2"></div>
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-md text-sm text-red-600"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-6 space-y-4 lg:space-y-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Laporan Reservasi</h1>
            <p className="text-muted-foreground mt-2">
              Kelola dan tindak lanjuti reservasi layanan dari masyarakat
            </p>
          </div>

          <div className="mb-8">
            <ReservationTimeSettings />
          </div>

          <BidangPresencePanel bidangSlug="paud" compact className="mb-8" />

          {/* Reservation Statistics with Quick Call */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* PTK Service Card */}
            <Card className="admin-stats-card admin-card-interactive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-brand-accent mb-1">PTK</p>
                      <p className="text-2xl font-bold text-brand-accent">
                        {reservations.filter(r => getServiceKey(r) === 'ptk' && r.status === 'waiting').length}
                      </p>
                      <p className="text-xs text-gray-500">Menunggu</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg admin-icon-hover">
                      <User className="w-6 h-6 text-brand-accent" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-brand-primary hover:bg-brand-accent-hover text-white"
                    onClick={() => {
                      const nextWaiting = reservations
                        .filter(r => getServiceKey(r) === 'ptk' && r.status === 'waiting')
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
                      if (nextWaiting) {
                        handleStatusUpdate(nextWaiting.id, 'called')
                      } else {
                        alert('Tidak ada antrian PTK yang menunggu')
                      }
                    }}
                    disabled={reservations.filter(r => getServiceKey(r) === 'ptk' && r.status === 'waiting').length === 0}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Panggil Antrian
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SD Service Card */}
            <Card className="admin-stats-card admin-card-interactive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-green-600 mb-1">SD Umum</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reservations.filter(r => getServiceKey(r) === 'sd' && r.status === 'waiting').length}
                      </p>
                      <p className="text-xs text-gray-500">Menunggu</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const nextWaiting = reservations
                        .filter(r => getServiceKey(r) === 'sd' && r.status === 'waiting')
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
                      if (nextWaiting) {
                        handleStatusUpdate(nextWaiting.id, 'called')
                      } else {
                        alert('Tidak ada antrian SD yang menunggu')
                      }
                    }}
                    disabled={reservations.filter(r => getServiceKey(r) === 'sd' && r.status === 'waiting').length === 0}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Panggil Antrian
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SMP Service Card */}
            <Card className="admin-stats-card admin-card-interactive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-yellow-600 mb-1">SMP Umum</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reservations.filter(r => getServiceKey(r) === 'smp' && r.status === 'waiting').length}
                      </p>
                      <p className="text-xs text-gray-500">Menunggu</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => {
                      const nextWaiting = reservations
                        .filter(r => getServiceKey(r) === 'smp' && r.status === 'waiting')
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
                      if (nextWaiting) {
                        handleStatusUpdate(nextWaiting.id, 'called')
                      } else {
                        alert('Tidak ada antrian SMP yang menunggu')
                      }
                    }}
                    disabled={reservations.filter(r => getServiceKey(r) === 'smp' && r.status === 'waiting').length === 0}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Panggil Antrian
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PAUD Service Card */}
            <Card className="admin-stats-card admin-card-interactive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-purple-600 mb-1">PAUD</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {reservations.filter(r => getServiceKey(r) === 'paud' && r.status === 'waiting').length}
                      </p>
                      <p className="text-xs text-gray-500">Menunggu</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg admin-icon-hover">
                      <School className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      const nextWaiting = reservations
                        .filter(r => getServiceKey(r) === 'paud' && r.status === 'waiting')
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
                      if (nextWaiting) {
                        handleStatusUpdate(nextWaiting.id, 'called')
                      } else {
                        alert('Tidak ada antrian PAUD yang menunggu')
                      }
                    }}
                    disabled={reservations.filter(r => getServiceKey(r) === 'paud' && r.status === 'waiting').length === 0}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Panggil Antrian
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Display Antrian Button */}
          <div className="mb-6">
            <Button
              onClick={() => window.open('/admin/reservasi/display', '_blank', 'width=1920,height=1080,fullscreen=yes')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <Monitor className="w-5 h-5 mr-2" />
              Tampilkan Antrian ke Layar Monitor
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search-reservation">Cari Reservasi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search-reservation"
                  placeholder="Cari nama, tiket, atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Filter Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="waiting">Menunggu</SelectItem>
                  <SelectItem value="called">Dipanggil</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-filter">Filter Layanan</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger id="service-filter" className="w-full">
                  <SelectValue placeholder="Pilih layanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Layanan</SelectItem>
                  <SelectItem value="ptk">PTK</SelectItem>
                  <SelectItem value="sd">SD Umum</SelectItem>
                  <SelectItem value="smp">SMP Umum</SelectItem>
                  <SelectItem value="paud">PAUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reservations Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Daftar Reservasi</h2>
              <span className="text-sm text-muted-foreground">
                {filteredReservations.length} reservasi
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                  <div className="text-muted-foreground">Memuat data...</div>
                </div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada reservasi ditemukan</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedReservations.map((reservation) => (
                    <Card 
                      key={reservation.id} 
                      className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6">
                        {/* Header: Ticket Number & Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">No. Tiket</p>
                            <p className="text-2xl font-bold text-brand-accent dark:text-brand-light">
                              {reservation.queueNumber}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-semibold",
                              getStatusColor(reservation.status)
                            )}
                          >
                            {getStatusText(reservation.status)}
                          </Badge>
                        </div>

                        {/* User Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {reservation.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {reservation.phone}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {getServiceName(reservation)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {reservation.date} • {reservation.timeSlot}
                            </p>
                          </div>
                        </div>

                        {/* Purpose */}
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Tujuan Kunjungan:</p>
                          <p className="text-sm text-foreground line-clamp-2">
                            {reservation.purpose}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-brand-accent hover:text-brand-accent-hover hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={() => handleViewDetails(reservation)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {filteredReservations.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">
                          Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                          {Math.min(currentPage * itemsPerPage, filteredReservations.length)} dari {filteredReservations.length} reservasi
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
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">No. Tiket</Label>
                  <p className="text-lg font-semibold text-brand-accent">{selectedReservation.queueNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getStatusColor(selectedReservation.status)
                      )}
                    >
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                  <p className="text-sm">{selectedReservation.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nomor HP</Label>
                  <p className="text-sm">{selectedReservation.phone}</p>
                </div>
              </div>

              {selectedReservation.nik && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">NIK</Label>
                  <p className="text-sm">{selectedReservation.nik}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Layanan</Label>
                <p className="text-sm">{getServiceName(selectedReservation)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tanggal</Label>
                  <p className="text-sm">{selectedReservation.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Waktu</Label>
                  <p className="text-sm">{selectedReservation.timeSlot}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tujuan Kunjungan</Label>
                <p className="text-sm">{selectedReservation.purpose}</p>
              </div>

              {selectedReservation.estimatedCallTime && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimasi Panggilan</Label>
                  <p className="text-sm">{selectedReservation.estimatedCallTime}</p>
                </div>
              )}

              {/* Status Update Actions */}
              {selectedReservation.status === "waiting" && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Update Status</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "called")}
                      className="bg-brand-primary hover:bg-brand-accent-hover text-white"
                    >
                      Panggil
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "completed")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Selesai
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "cancelled")}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Batalkan
                    </Button>
                  </div>
                </div>
              )}

              {selectedReservation.status === "called" && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Update Status</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "completed")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Selesai
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "cancelled")}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Batalkan
                    </Button>
                  </div>
                </div>
              )}

              {(selectedReservation.status === "completed" || selectedReservation.status === "cancelled") && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Ubah Status</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedReservation.id, "waiting")}
                      variant="outline"
                      className="border-blue-200 hover:border-blue-400"
                    >
                      Kembalikan ke Menunggu
                    </Button>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservasi</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nama Lengkap</Label>
                  <Input
                    id="edit-name"
                    value={editingReservation.name}
                    onChange={(e) => setEditingReservation({ ...editingReservation, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Nomor HP</Label>
                  <Input
                    id="edit-phone"
                    value={editingReservation.phone}
                    onChange={(e) => setEditingReservation({ ...editingReservation, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-nik">NIK (Opsional)</Label>
                <Input
                  id="edit-nik"
                  value={editingReservation.nik || ''}
                  onChange={(e) => setEditingReservation({ ...editingReservation, nik: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-service">Layanan</Label>
                <Select
                  value={editingReservation.service}
                  onValueChange={(value) => setEditingReservation({ ...editingReservation, service: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ptk">PTK (Pendidik dan Tenaga Kependidikan)</SelectItem>
                    <SelectItem value="sd">SD Umum</SelectItem>
                    <SelectItem value="smp">SMP Umum</SelectItem>
                    <SelectItem value="paud">PAUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Tanggal</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingReservation.date}
                    onChange={(e) => setEditingReservation({ ...editingReservation, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Waktu</Label>
                  <Select
                    value={editingReservation.timeSlot}
                    onValueChange={(value) => setEditingReservation({ ...editingReservation, timeSlot: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {(() => {
                        const slots = getTimeSlotsForDateString(editingReservation.date)
                        const hasCurrent = slots.some((s) => s.id === editingReservation.timeSlot)
                        return (
                          <>
                            {!hasCurrent && editingReservation.timeSlot && (
                              <SelectItem value={editingReservation.timeSlot}>
                                {editingReservation.timeSlot}
                              </SelectItem>
                            )}
                            {slots.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id}>
                                {slot.time}
                              </SelectItem>
                            ))}
                          </>
                        )
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-purpose">Tujuan Kunjungan</Label>
                <Textarea
                  id="edit-purpose"
                  value={editingReservation.purpose}
                  onChange={(e) => setEditingReservation({ ...editingReservation, purpose: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingReservation.status}
                  onValueChange={(value) => setEditingReservation({ ...editingReservation, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting">Menunggu</SelectItem>
                    <SelectItem value="called">Dipanggil</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          {deleteReservation && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus reservasi ini?
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="font-medium">{deleteReservation.queueNumber}</p>
                <p className="text-sm text-muted-foreground">{deleteReservation.name}</p>
                <p className="text-sm text-muted-foreground">{getServiceName(deleteReservation)}</p>
              </div>
              <p className="text-sm text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
