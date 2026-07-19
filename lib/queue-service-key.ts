import { FALLBACK_LAYANANS } from "./api-fallback-data"

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

const FALLBACK_LAYANAN_KEY_BY_ID: Record<string, ServiceKey> = Object.fromEntries(
  FALLBACK_LAYANANS.flatMap((l) => {
    const key = lookupServiceKey(l.name)
    return key ? [[l.id, key] as const] : []
  }),
)

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
  layanan?: { name?: string | null; id?: string | null } | null
  idLayanan?: string | null
}): ServiceKey | null {
  if (input.layanan?.name) {
    const key = lookupServiceKey(input.layanan.name)
    if (key) return key
  }
  if (input.service) {
    const key = lookupServiceKey(input.service)
    if (key) return key
  }

  const layananId = input.idLayanan?.trim() || input.layanan?.id?.trim()
  if (layananId && FALLBACK_LAYANAN_KEY_BY_ID[layananId]) {
    return FALLBACK_LAYANAN_KEY_BY_ID[layananId]
  }

  return null
}

/** Normalisasi objek reservasi ke service key — sama di admin loket & bidang. */
export function getServiceKeyFromReservation(reservation: {
  service?: string | null
  idLayanan?: string | null
  layanan?: { name?: string | null; id?: string | null } | null
}): ServiceKey | null {
  return getServiceKey({
    service: reservation.service,
    idLayanan: reservation.idLayanan,
    layanan: reservation.layanan,
  })
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

import { getWitaTodayYmd } from "./reservation-hours"

/** Hari ini menurut WITA (Banjarmasin, Asia/Makassar). */
export function todayLocalYmd(): string {
  return getWitaTodayYmd()
}
