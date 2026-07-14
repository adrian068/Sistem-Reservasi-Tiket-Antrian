"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Crown, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSuperAdminUser } from "@/lib/auth-shared"

type SessionUser = {
  nama: string
  email: string
  peran: string
}

type AdminModeSwitchProps = {
  /** Sidebar ringkas (ikon saja) */
  collapsed?: boolean
  /** Tema sidebar super admin (gelap) vs admin biasa */
  variant?: "default" | "super"
  className?: string
}

export function AdminModeSwitch({
  collapsed = false,
  variant = "default",
  className,
}: AdminModeSwitchProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!user || !isSuperAdminUser(user)) return null

  const inSuperPanel =
    pathname?.startsWith("/admin/super") ?? false
  const inAdminPanel =
    pathname?.startsWith("/admin/dashboard") ||
    pathname?.startsWith("/admin/reservasi") ||
    pathname?.startsWith("/admin/profile")

  const isSuperTheme = variant === "super"

  const baseLink = cn(
    "flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all",
    collapsed ? "p-2.5" : "px-3 py-2 flex-1",
  )

  return (
    <div className={cn("space-y-2", className)}>
      {!collapsed && (
        <p
          className={cn(
            "text-[10px] uppercase tracking-wider font-medium px-1",
            isSuperTheme ? "text-violet-300" : "text-muted-foreground",
          )}
        >
          Pindah panel
        </p>
      )}
      <div className={cn("flex gap-1", collapsed && "flex-col")}>
        <Link
          href="/admin/dashboard"
          title="Panel Admin Biasa"
          className={cn(
            baseLink,
            inAdminPanel
              ? isSuperTheme
                ? "bg-white text-violet-900 shadow-md"
                : "bg-blue-600 text-white shadow-md"
              : isSuperTheme
                ? "bg-white/10 text-violet-100 hover:bg-white/20"
                : "bg-muted text-muted-foreground hover:bg-accent",
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Admin</span>}
        </Link>
        <Link
          href="/admin/super/dashboard"
          title="Panel Super Admin"
          className={cn(
            baseLink,
            inSuperPanel
              ? "bg-gradient-to-r from-amber-400 to-violet-500 text-white shadow-md"
              : isSuperTheme
                ? "bg-white/10 text-violet-100 hover:bg-white/20"
                : "bg-muted text-muted-foreground hover:bg-accent",
          )}
        >
          <Crown className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Super</span>}
        </Link>
      </div>
    </div>
  )
}
