import type { LucideIcon } from "lucide-react"
import { Users, School, GraduationCap, Baby } from "lucide-react"
import { FALLBACK_LAYANANS } from "./api-fallback-data"

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  School,
  GraduationCap,
  Baby,
}

export type LayananDisplay = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
}

export function layanansToDisplay(
  items: Array<{
    id: string
    name: string
    description?: string | null
    icon?: string | null
    color?: string | null
  }>,
): LayananDisplay[] {
  return items.map((layanan) => ({
    id: layanan.id,
    name: layanan.name,
    description: layanan.description || "Layanan pendidikan",
    icon: ICON_MAP[layanan.icon || "School"] || School,
    color: layanan.color || "bg-blue-500",
  }))
}

export function getDefaultLayananDisplay(): LayananDisplay[] {
  return layanansToDisplay([...FALLBACK_LAYANANS])
}
