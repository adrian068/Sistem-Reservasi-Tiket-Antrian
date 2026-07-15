"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"
import { AdminModeSwitch } from "@/components/admin-mode-switch"

type SuperAdminShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function SuperAdminShell({ title, subtitle, children }: SuperAdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-brand-light/30 dark:bg-slate-950">
      <SuperAdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-brand-border-light/50 dark:border-brand-header-dark/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex shrink-0"
              onClick={() => setSidebarCollapsed((c) => !c)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AdminModeSwitch className="hidden sm:block" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
