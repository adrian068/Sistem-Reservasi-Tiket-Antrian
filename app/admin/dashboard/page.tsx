"use client"

// Dashboard Admin with real-time data from database
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  School,
  FileText,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  ChevronDown,
  Home,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buildAdminNavigation } from "@/lib/admin-navigation"
import { AdminModeSwitch } from "@/components/admin-mode-switch"

import { ThemeToggle } from "@/components/theme-toggle"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showReportDetail, setShowReportDetail] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // State untuk data dari database
  const [totalReservations, setTotalReservations] = useState(0)
  const [totalSchools, setTotalSchools] = useState(0)
  const [totalNews, setTotalNews] = useState(0)
  const [totalAgenda, setTotalAgenda] = useState(0)
  const [reservationsByStatus, setReservationsByStatus] = useState({ completed: 0, waiting: 0, cancelled: 0 })
  const [reservationsByMonth, setReservationsByMonth] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [serviceProgress, setServiceProgress] = useState<any[]>([])
  const [recentReservations, setRecentReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  // Fetch data dari database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch Reservations
        let reservations: any[] = []
        try {
          const resReservations = await fetch('/api/reservations')
          const reservationsData = await resReservations.json()
          reservations = reservationsData.data || []
          console.log('📊 Reservations fetched:', reservations.length)
        } catch (err) {
          console.error('❌ Error fetching reservations:', err)
        }
        
        // Fetch Schools
        let schools: any[] = []
        try {
          const resSchools = await fetch('/api/sekolahs')
          const schoolsData = await resSchools.json()
          schools = schoolsData.data || []
          console.log('🏫 Schools fetched:', schools.length)
        } catch (err) {
          console.error('❌ Error fetching schools:', err)
        }
        
        // Fetch News
        let news: any[] = []
        try {
          const resNews = await fetch('/api/news?status=all')
          const newsData = await resNews.json()
          // API news returns array directly, not wrapped in object
          news = Array.isArray(newsData) ? newsData : (newsData.data || newsData.beritas || [])
          console.log('📰 News fetched:', news.length)
        } catch (err) {
          console.error('❌ Error fetching news:', err)
        }
        
        // Fetch Agenda
        let agenda: any[] = []
        try {
          const resAgenda = await fetch('/api/agendas')
          const agendaData = await resAgenda.json()
          agenda = agendaData.data || agendaData.agendas || []
          console.log('📅 Agenda fetched:', agenda.length)
        } catch (err) {
          console.error('❌ Error fetching agenda:', err)
        }
        
        // Set total counts
        setTotalReservations(reservations.length)
        setTotalSchools(schools.length)
        setTotalNews(news.length)
        setTotalAgenda(agenda.length)
        
        // Calculate reservations by status
        const completed = reservations.filter((r: any) => r.status === 'completed').length
        const waiting = reservations.filter((r: any) => r.status === 'waiting').length
        const cancelled = reservations.filter((r: any) => r.status === 'cancelled').length
        setReservationsByStatus({ completed, waiting, cancelled })
        
        // Calculate reservations by month (current year)
        const currentYear = new Date().getFullYear()
        const monthCounts = Array(12).fill(0)
        reservations.forEach((reservation: any) => {
          const date = new Date(reservation.createdAt || reservation.date)
          if (date.getFullYear() === currentYear) {
            monthCounts[date.getMonth()]++
          }
        })
        setReservationsByMonth(monthCounts)
        
        // Calculate service progress (percentage of total reservations per service)
        // Only show 4 main categories: PTK, SD, SMP, PAUD
        const serviceCategories = {
          'PTK (Pendidik dan Tenaga Kependidikan)': 0,
          'SD Umum': 0,
          'SMP Umum': 0,
          'PAUD': 0
        }
        
        reservations.forEach((reservation: any) => {
          const serviceName = reservation.layanan?.name || reservation.service || ''
          
          if (serviceName.includes('PTK')) {
            serviceCategories['PTK (Pendidik dan Tenaga Kependidikan)']++
          } else if (serviceName.includes('SD')) {
            serviceCategories['SD Umum']++
          } else if (serviceName.includes('SMP')) {
            serviceCategories['SMP Umum']++
          } else if (serviceName.includes('PAUD')) {
            serviceCategories['PAUD']++
          }
        })
        
        const totalRes = reservations.length || 1
        const progressData = [
          {
            name: 'PTK (Pendidik dan Tenaga Kependidikan)',
            progress: Math.round((serviceCategories['PTK (Pendidik dan Tenaga Kependidikan)'] / totalRes) * 100),
            count: serviceCategories['PTK (Pendidik dan Tenaga Kependidikan)'],
            color: 'bg-blue-500'
          },
          {
            name: 'SD Umum',
            progress: Math.round((serviceCategories['SD Umum'] / totalRes) * 100),
            count: serviceCategories['SD Umum'],
            color: 'bg-green-500'
          },
          {
            name: 'SMP Umum',
            progress: Math.round((serviceCategories['SMP Umum'] / totalRes) * 100),
            count: serviceCategories['SMP Umum'],
            color: 'bg-yellow-500'
          },
          {
            name: 'PAUD',
            progress: Math.round((serviceCategories['PAUD'] / totalRes) * 100),
            count: serviceCategories['PAUD'],
            color: 'bg-purple-500'
          }
        ]
        
        setServiceProgress(progressData)
        
        // Set recent reservations (latest 5, sorted by createdAt)
        const sortedReservations = [...reservations]
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.date).getTime()
            const dateB = new Date(b.createdAt || b.date).getTime()
            return dateB - dateA // Most recent first
          })
          .slice(0, 5)
        setRecentReservations(sortedReservations)
        console.log('📋 Recent reservations:', sortedReservations.length)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-dropdown') && !target.closest('.user-menu-button')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Data untuk Bar Chart - Total Data Sistem (dari database)
  const chartData = {
    labels: ['Reservasi', 'Sekolah', 'Berita', 'Agenda'],
    datasets: [
      {
        label: 'Total Data',
        data: [totalReservations, totalSchools, totalNews, totalAgenda],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  }

  // Data untuk Line Chart - Laporan Reservasi Bulanan (dari database)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Reservasi',
        data: reservationsByMonth,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  }

  // Data untuk Doughnut Chart - Status Reservasi (dari database)
  const doughnutChartData = {
    labels: ['Selesai', 'Menunggu', 'Dibatalkan'],
    datasets: [
      {
        data: [reservationsByStatus.completed, reservationsByStatus.waiting, reservationsByStatus.cancelled],
        backgroundColor: [
          'rgb(34, 197, 94)',   // green
          'rgb(59, 130, 246)',  // blue
          'rgb(252, 165, 165)', // light red (not pekat)
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(248, 113, 113)', // softer border for canceled
        ],
        borderWidth: 2,
      },
    ],
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
          }
        }
      },
      title: {
        display: false,
      },
    },
    cutout: '70%',
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Redirect to login page
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


  const handleViewReportDetail = (report: any) => {
    setSelectedReport(report)
    setShowReportDetail(true)
  }

  const handleCloseReportDetail = () => {
    setShowReportDetail(false)
    setSelectedReport(null)
  }

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true)
      
      // Find reservation data
      const reservation = recentReservations.find(r => r.id === reservationId)
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
          purpose: reservation.notes || reservation.purpose || '',
          service: reservation.service || reservation.layanan?.name || '',
          date: reservation.date,
          timeSlot: reservation.time || reservation.timeSlot || '',
          status: newStatus.toUpperCase(),
          idLayanan: reservation.idLayanan || reservation.layanan?.id || null,
        }),
      })

      if (response.ok) {
        // Refresh dashboard data
        const refreshResponse = await fetch('/api/reservations')
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const reservations = refreshData.data || []
          setTotalReservations(reservations.length)
          
          // Update status counts
          const completed = reservations.filter((r: any) => r.status === 'completed').length
          const waiting = reservations.filter((r: any) => r.status === 'waiting').length
          const cancelled = reservations.filter((r: any) => r.status === 'cancelled').length
          setReservationsByStatus({ completed, waiting, cancelled })
          
          // Update recent reservations
          const sortedReservations = [...reservations]
            .sort((a: any, b: any) => {
              const dateA = new Date(a.createdAt || a.date).getTime()
              const dateB = new Date(b.createdAt || b.date).getTime()
              return dateB - dateA
            })
            .slice(0, 5)
          setRecentReservations(sortedReservations)
        }
        
        alert(`Status berhasil diubah menjadi ${newStatus === 'completed' ? 'Selesai' : newStatus === 'waiting' ? 'Menunggu' : newStatus === 'called' ? 'Dipanggil' : 'Dibatalkan'}`)
        handleCloseReportDetail()
      } else {
        alert('Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Terjadi kesalahan saat mengubah status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const navigationItems = buildAdminNavigation("/admin/dashboard")

  const statsData = [
    {
      title: "Total Reservasi",
      value: totalReservations.toString(),
      icon: FileText,
      color: "red",
      bgColor: "bg-red-100",
    },
    {
      title: "Reservasi Menunggu",
      value: reservationsByStatus.waiting.toString(),
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Reservasi Selesai",
      value: reservationsByStatus.completed.toString(),
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-100",
    },
    {
      title: "Reservasi Dibatalkan",
      value: reservationsByStatus.cancelled.toString(),
      icon: AlertCircle,
      color: "purple",
      bgColor: "bg-pink-100",
    },
  ]

  // Transform recent reservations to reports format
  const reportsData = recentReservations.map((reservation: any) => {
    // Map status to Indonesian
    let statusText = 'Baru'
    let statusColor = 'bg-blue-600 text-white'
    
    if (reservation.status === 'completed') {
      statusText = 'Selesai'
      statusColor = 'bg-green-600 text-white'
    } else if (reservation.status === 'waiting') {
      statusText = 'Menunggu'
      statusColor = 'bg-yellow-600 text-white'
    } else if (reservation.status === 'cancelled') {
      statusText = 'Dibatalkan'
      statusColor = 'bg-red-200 text-red-800'
    }
    
    return {
      id: reservation.id,
      nomorTiket: reservation.queueNumber || reservation.id,
      reporter: reservation.name || reservation.institutionName || 'N/A',
      category: reservation.layanan?.name || reservation.service || 'Reservasi',
      status: statusText,
      statusColor: statusColor,
      title: `Reservasi ${reservation.layanan?.name || reservation.service || ''}`,
      description: reservation.notes || 'Tidak ada catatan',
      date: new Date(reservation.createdAt || reservation.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: reservation.time || new Date(reservation.createdAt || reservation.date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      contact: reservation.email || reservation.phone || 'N/A',
      reservationDate: reservation.date ? new Date(reservation.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : 'N/A'
    }
  })

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data dashboard...</p>
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
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <School className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-xl font-bold">SIREDI Admin</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
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
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                      item.active
                        ? "bg-blue-600 text-white shadow-lg"
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
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105 transition-all duration-200`}
            title={sidebarCollapsed ? 'Logout' : undefined}
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
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Dashboard</h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Ringkasan data dan statistik sistem pendidikan
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
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
                      >
                        Logout
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
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Ringkasan data dan statistik sistem pendidikan</p>
          </div>
          

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              const colorMap: Record<string, { text: string; bg: string }> = {
                blue: { text: "text-blue-600", bg: "bg-blue-100" },
                green: { text: "text-green-600", bg: "bg-green-100" },
                yellow: { text: "text-yellow-600", bg: "bg-yellow-100" },
                red: { text: "text-red-600", bg: "bg-red-100" },
                purple: { text: "text-purple-600", bg: "bg-purple-100" },
              }
              const colors = colorMap[stat.color] || { text: "text-gray-600", bg: "bg-gray-100" }

              return (
                <Card key={index} className="admin-stats-card admin-card-interactive">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <p className={`text-2xl lg:text-3xl font-bold ${colors.text}`}>{stat.value}</p>
                      </div>
                      <div className={`${colors.bg} p-3 rounded-lg admin-icon-hover`}>
                        <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${colors.text}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Grid - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Line Chart - Laporan Reservasi Bulanan */}
            <Card className="bg-card text-foreground">
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Laporan Reservasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Reports Table - Laporan Masuk Terbaru */}
            <Card className="bg-card text-foreground">
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Laporan Masuk Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tiket</TableHead>
                      <TableHead>Pelapor</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Belum ada laporan masuk
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportsData.slice(0, 5).map((report) => {
                        let statusColor = ""
                        switch (report.status) {
                          case "Baru":
                            statusColor = "bg-blue-600 text-white"
                            break
                          case "Diproses":
                            statusColor = "bg-yellow-600 text-white"
                            break
                          case "Selesai":
                            statusColor = "bg-green-600 text-white"
                            break
                          case "Ditolak":
                            statusColor = "bg-red-600 text-white"
                            break
                          case "Menunggu":
                            statusColor = "bg-yellow-600 text-white"
                            break
                          case "Dibatalkan":
                            statusColor = "bg-red-200 text-red-800"
                            break
                          default:
                            statusColor = "bg-gray-600 text-white"
                        }
                        return (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.nomorTiket}</TableCell>
                            <TableCell>{report.reporter}</TableCell>
                            <TableCell>{report.category}</TableCell>
                            <TableCell>
                              <Badge className={statusColor}>{report.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewReportDetail(report)}
                              >
                                Lihat Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Progress and Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Progress Bars - Layanan */}
            <Card className="bg-card text-foreground">
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Progress Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceProgress.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada data reservasi layanan
                  </div>
                ) : (
                  serviceProgress.map((service, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{service.name}</span>
                        <span className="text-sm font-semibold">
                          {service.progress}% ({service.count} reservasi)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`${service.color} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${service.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Total Data Sistem */}
            <Card className="bg-card text-foreground">
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Total Data Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[240px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal Detail Laporan */}
      {showReportDetail && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detail Laporan</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCloseReportDetail}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No. Tiket</p>
                  <p className="text-lg font-semibold">{selectedReport.nomorTiket}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={selectedReport.statusColor}>{selectedReport.status}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Judul Laporan</p>
                <p className="text-lg font-semibold">{selectedReport.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama/Instansi</p>
                  <p className="font-medium">{selectedReport.reporter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kontak</p>
                  <p className="font-medium">{selectedReport.contact}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategori Layanan</p>
                  <p className="font-medium">{selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</p>
                  <p className="font-medium">{selectedReport.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Reservasi</p>
                  <p className="font-medium">{selectedReport.reservationDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waktu</p>
                  <p className="font-medium">{selectedReport.time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                <p className="text-base mt-2 bg-accent/50 p-4 rounded-lg">{selectedReport.description}</p>
              </div>

              {/* Status Update Actions */}
              {selectedReport.status === "Menunggu" && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleStatusUpdate(selectedReport.id, "called")}
                      disabled={updatingStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updatingStatus ? 'Memproses...' : 'Panggil'}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReport.id, "completed")}
                      disabled={updatingStatus}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updatingStatus ? 'Memproses...' : 'Selesai'}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReport.id, "cancelled")}
                      disabled={updatingStatus}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {updatingStatus ? 'Memproses...' : 'Batalkan'}
                    </Button>
                  </div>
                </div>
              )}

              {selectedReport.status === "Dipanggil" && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleStatusUpdate(selectedReport.id, "completed")}
                      disabled={updatingStatus}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updatingStatus ? 'Memproses...' : 'Selesai'}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedReport.id, "cancelled")}
                      disabled={updatingStatus}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {updatingStatus ? 'Memproses...' : 'Batalkan'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCloseReportDetail}
                disabled={updatingStatus}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
