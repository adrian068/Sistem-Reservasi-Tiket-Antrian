"use client"

import { Button } from "@/components/ui/button"
import { LogOut, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { buildSuperAdminNavigation } from "@/lib/super-admin-navigation"
import { AdminModeSwitch } from "@/components/admin-mode-switch"
import { AdminSidebarBrand } from "@/components/admin-sidebar-brand"

interface SuperAdminSidebarProps {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function SuperAdminSidebar({
  sidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SuperAdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigationItems = buildSuperAdminNavigation(pathname ?? "")

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) router.push("/login")
      else alert("Gagal logout. Silakan coba lagi.")
    } catch {
      alert("Terjadi kesalahan saat logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`bg-brand-header text-white transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } flex flex-col fixed lg:relative z-50 h-full border-r border-brand-header-dark ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-brand-header-dark">
          <div
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <AdminSidebarBrand collapsed={sidebarCollapsed} variant="light" />
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-brand-primary text-white shadow-md"
                        : "text-blue-100 hover:bg-white/10"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-brand-header-dark space-y-3">
          <AdminModeSwitch collapsed={sidebarCollapsed} variant="super" />
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full text-red-300 hover:text-red-200 hover:bg-red-500/20 ${
              sidebarCollapsed ? "px-0 justify-center" : "justify-start"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && (
              <span className="ml-2">{isLoggingOut ? "Keluar..." : "Keluar"}</span>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
