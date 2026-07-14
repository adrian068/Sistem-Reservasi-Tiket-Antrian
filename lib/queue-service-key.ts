export const SERVICE_KEYS = ["ptk", "sd", "smp", "paud"] as const

export type ServiceKey = (typeof SERVICE_KEYS)[number]

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  ptk: "PTK",
  sd: "SD",
  smp: "SMP",
  paud: "PAUD",
}

export const SERVICE_LABELS_LONG: Record<ServiceKey, string> = {
  ptk: "PTK (Pendidik & Tenaga Kependidikan)",
  sd: "SD Umum",
  smp: "SMP Umum",
  paud: "PAUD",
}

const SERVICE_NAME_MAP: Record<string, ServiceKey> = {
  "ptk (pendidik dan tenaga kependidikan)": "ptk",
  ptk: "ptk",
  "sd umum": "sd",
  sd: "sd",
  "smp umum": "smp",
  smp: "smp",
  paud: "paud",
}

export function getServiceKey(input: {
  service?: string | null
  layanan?: { name?: string | null } | null
}): ServiceKey | null {
  if (input.layanan?.name) {
    const key = SERVICE_NAME_MAP[input.layanan.name.trim().toLowerCase()]
    if (key) return key
  }
  if (input.service) {
    const normalized = input.service.trim().toLowerCase()
    const key = SERVICE_NAME_MAP[normalized]
    if (key) return key
    if (SERVICE_KEYS.includes(normalized as ServiceKey)) {
      return normalized as ServiceKey
    }
  }
  return null
}

export function todayLocalYmd(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
