import { Calendar, Home, type LucideIcon } from "lucide-react"

export type AdminNavItem = {
  icon: LucideIcon
  label: string
  href: string
  active: boolean
}

/** Menu admin — khusus reservasi (tanpa sekolah/berita/agenda). */
export function buildAdminNavigation(activePath: string): AdminNavItem[] {
  const items = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Calendar, label: "Laporan Reservasi", href: "/admin/reservasi" },
  ] as const

  return items.map((item) => ({
    ...item,
    active:
      activePath === item.href ||
      (item.href === "/admin/reservasi" && activePath.startsWith("/admin/reservasi")),
  }))
}
