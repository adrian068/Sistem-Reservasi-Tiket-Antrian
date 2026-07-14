import { Calendar, Crown, UserCog, type LucideIcon } from "lucide-react"

export type SuperAdminNavItem = {
  icon: LucideIcon
  label: string
  href: string
  active: boolean
}

/** Menu super admin — fokus reservasi & kelola admin (tanpa berita/agenda/sekolah). */
export function buildSuperAdminNavigation(activePath: string): SuperAdminNavItem[] {
  const items = [
    { icon: Crown, label: "Pusat Kendali", href: "/admin/super/dashboard" },
    { icon: UserCog, label: "Kelola Admin", href: "/admin/super/admins" },
    { icon: Calendar, label: "Reservasi", href: "/admin/super/reservasi" },
  ] as const

  return items.map((item) => ({
    ...item,
    active:
      activePath === item.href ||
      (item.href === "/admin/super/dashboard" && activePath === "/admin/super/dashboard") ||
      (item.href === "/admin/super/reservasi" && activePath.startsWith("/admin/super/reservasi")) ||
      (item.href === "/admin/super/admins" && activePath.startsWith("/admin/super/admins")),
  }))
}
