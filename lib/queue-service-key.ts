export const SERVICE_KEYS = ["ptk", "sd", "smp", "paud"] as const

export type ServiceKey = (typeof SERVICE_KEYS)[number]

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  ptk: "PTK",
  sd: "SD",
  smp: "SMP",
  paud: "PAUD",
}

export const SERVICE_LABELS_LONG: Record<ServiceKey, string> = {
  ptk: "PTK (Pendidik dan Tenaga Kependidikan)",
  sd: "SD Umum",
  smp: "SMP Umum",
  paud: "PAUD",
}

/** Nama layanan resmi — dipakai saat menyimpan reservasi agar routing bidang konsisten. */
export const CANONICAL_SERVICE_NAMES: Record<ServiceKey, string> = {
  ptk: "PTK (Pendidik dan Tenaga Kependidikan)",
  sd: "SD Umum",
  smp: "SMP Umum",
  paud: "PAUD",
}

const SERVICE_NAME_MAP: Record<string, ServiceKey> = {
  "ptk (pendidik dan tenaga kependidikan)": "ptk",
  "ptk (pendidik & tenaga kependidikan)": "ptk",
  ptk: "ptk",
  "sd umum": "sd",
  sd: "sd",
  "smp umum": "smp",
  smp: "smp",
  paud: "paud",
}

function normalizeServiceText(value: string): string {
  return value.trim().toLowerCase().replace(/\s*&\s*/g, " dan ")
}

function lookupServiceKey(value: string): ServiceKey | null {
  const normalized = normalizeServiceText(value)
  const exact = SERVICE_NAME_MAP[normalized]
  if (exact) return exact
  if (SERVICE_KEYS.includes(normalized as ServiceKey)) {
    return normalized as ServiceKey
  }

  if (normalized.includes("smp")) return "smp"
  if (normalized.includes("sd umum") || normalized === "sd") return "sd"
  if (normalized.includes("ptk")) return "ptk"
  if (normalized.includes("paud")) return "paud"

  return null
}

export function getServiceKey(input: {
  service?: string | null
  layanan?: { name?: string | null } | null
}): ServiceKey | null {
  if (input.layanan?.name) {
    const key = lookupServiceKey(input.layanan.name)
    if (key) return key
  }
  if (input.service) {
    return lookupServiceKey(input.service)
  }
  return null
}

export function getBidangSlugForServiceKey(serviceKey: ServiceKey): string {
  const map: Record<ServiceKey, string> = {
    paud: "paud",
    ptk: "ptk",
    sd: "sd-umum",
    smp: "smp-umum",
  }
  return map[serviceKey]
}

export function todayLocalYmd(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
