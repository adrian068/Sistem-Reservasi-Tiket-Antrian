"use client"

import { Button } from "@/components/ui/button"
import { School, LogOut, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { buildAdminNavigation } from "@/lib/admin-navigation"
import { AdminModeSwitch } from "@/components/admin-mode-switch"

interface AdminSidebarProps {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function AdminSidebar({ sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigationItems = buildAdminNavigation(pathname ?? "")

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
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

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

        <div className="p-4 border-b border-sidebar-border">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <School className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-xl font-bold">SIREDI Admin</span>}
          </div>
        </div>

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
    </>
  )
}
