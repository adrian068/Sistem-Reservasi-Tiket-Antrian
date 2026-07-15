"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutDashboard, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/use-logout"
import { getAdminHomePath, isAdminUser, isSuperAdminUser } from "@/lib/auth-shared"
import { cn } from "@/lib/utils"

type SessionUser = {
  nama: string
  email: string
  peran: string
}

type SiteUserMenuProps = {
  variant?: "header" | "mobile"
  onNavigate?: () => void
}

export function SiteUserMenu({ variant = "header", onNavigate }: SiteUserMenuProps) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { logout, isLoggingOut } = useLogout()

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (!res.ok) {
          if (!cancelled) setUser(null)
          return
        }
        const data = await res.json()
        if (!cancelled && data.user) setUser(data.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Keluar dari SIREDI?\n\nAnda akan kembali ke halaman login.",
    )
    if (!confirmed) return

    const ok = await logout()
    if (!ok) {
      alert("Gagal keluar. Silakan coba lagi.")
      return
    }
    onNavigate?.()
  }

  if (loading || !user) return null

  const firstName = user.nama.split(" ")[0] || user.nama
  const showAdminPanel = isAdminUser(user)
  const adminHref = getAdminHomePath(user)
  const adminLabel = isSuperAdminUser(user) ? "Super Admin" : "Admin"

  if (variant === "mobile") {
    return (
      <div className="pt-4 mt-4 border-t border-gray-300 dark:border-border space-y-2">
        <p className="px-4 text-xs text-muted-foreground">Masuk sebagai</p>
        <p className="px-4 text-sm font-medium text-foreground truncate">{user.nama}</p>
        {showAdminPanel && isSuperAdminUser(user) && (
          <>
            <Link
              href="/admin/dashboard"
              onClick={onNavigate}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
            <Link
              href="/admin/super/dashboard"
              onClick={onNavigate}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-brand-accent hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Super Admin
            </Link>
          </>
        )}
        {showAdminPanel && !isSuperAdminUser(user) && (
          <Link
            href={adminHref}
            onClick={onNavigate}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            {adminLabel}
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-card border border-gray-200 dark:border-border",
        )}
        title={user.email}
      >
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
          {firstName}
        </span>
      </div>

      {showAdminPanel && isSuperAdminUser(user) && (
        <>
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href="/admin/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Admin
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 border-violet-300 text-violet-700 hover:bg-violet-50"
          >
            <Link href="/admin/super/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Super Admin
            </Link>
          </Button>
        </>
      )}
      {showAdminPanel && !isSuperAdminUser(user) && (
        <Button variant="outline" size="sm" asChild className="h-9">
          <Link href={adminHref}>
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            {adminLabel}
          </Link>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/30"
      >
        <LogOut className="w-4 h-4 mr-1.5" />
        {isLoggingOut ? "Keluar..." : "Keluar"}
      </Button>
    </div>
  )
}
