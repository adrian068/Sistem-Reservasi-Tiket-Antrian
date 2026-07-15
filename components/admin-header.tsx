"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, ChevronDown, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminHeaderProps {
  title: string
  subtitle?: string
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export function AdminHeader({
  title,
  subtitle,
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileMenuOpen,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
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

  return (
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
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4 relative">
          {/* Notification Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent hover:scale-105 transition-all duration-200 relative notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 notification-dropdown">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Notifikasi</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-accent cursor-pointer border-b border-border">
                    <p className="text-sm font-medium">Laporan Baru Masuk</p>
                    <p className="text-xs text-muted-foreground mt-1">Ahmad Fauzi melaporkan kerusakan atap</p>
                    <p className="text-xs text-muted-foreground mt-1">5 menit yang lalu</p>
                  </div>
                  <div className="p-4 hover:bg-accent cursor-pointer border-b border-border">
                    <p className="text-sm font-medium">Data Sekolah Diupdate</p>
                    <p className="text-xs text-muted-foreground mt-1">SDN Sungai Miai 5 memperbarui data</p>
                    <p className="text-xs text-muted-foreground mt-1">1 jam yang lalu</p>
                  </div>
                  <div className="p-4 hover:bg-accent cursor-pointer">
                    <p className="text-sm font-medium">Sistem Maintenance</p>
                    <p className="text-xs text-muted-foreground mt-1">Maintenance terjadwal besok pukul 02:00</p>
                    <p className="text-xs text-muted-foreground mt-1">3 jam yang lalu</p>
                  </div>
                </div>
                <div className="p-3 border-t border-border text-center">
                  <button className="text-sm text-brand-accent hover:underline">Lihat Semua Notifikasi</button>
                </div>
              </div>
            )}
          </div>

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
  )
}
