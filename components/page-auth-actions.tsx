"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutDashboard, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/use-logout"
import { isAdminUser, isSuperAdminUser } from "@/lib/auth-shared"

type SessionUser = {
  nama: string
  email: string
  peran: string
}

type PageAuthActionsProps = {
  loginRedirect?: string
}

export function PageAuthActions({ loginRedirect = "/reservasi" }: PageAuthActionsProps) {
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
    const confirmed = window.confirm("Keluar dari SIREDI?")
    if (!confirmed) return
    const ok = await logout()
    if (!ok) alert("Gagal keluar. Silakan coba lagi.")
  }

  if (loading) return null

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md h-9"
      >
        <Link href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}>
          <LogIn className="w-4 h-4 mr-1.5" />
          Masuk
        </Link>
      </Button>
    )
  }

  const firstName = user.nama.split(" ")[0] || user.nama

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-card border border-white/30 shadow-sm"
        title={user.email}
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground max-w-[100px] sm:max-w-[140px] truncate">
          {firstName}
        </span>
      </div>
      {isSuperAdminUser(user) && (
        <>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 bg-white/95 text-blue-800 border-white/40 hover:bg-white hidden sm:inline-flex"
          >
            <Link href="/admin/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Admin
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 bg-violet-600/95 text-white border-violet-400 hover:bg-violet-700"
          >
            <Link href="/admin/super/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Super Admin
            </Link>
          </Button>
        </>
      )}
      {isAdminUser(user) && !isSuperAdminUser(user) && (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 bg-white/95 text-blue-800 border-white/40 hover:bg-white"
        >
          <Link href="/admin/dashboard">
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            Admin
          </Link>
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="h-9 bg-white/95 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="w-4 h-4 mr-1.5" />
        {isLoggingOut ? "Keluar..." : "Keluar"}
      </Button>
    </div>
  )
}
