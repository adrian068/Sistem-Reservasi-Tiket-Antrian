import { getServiceKey } from "./queue-service-key"

/** Normalisasi nama layanan untuk perbandingan. */
function normalizeServiceName(service: string): string {
  return service.trim().toLowerCase()
}

export type LayananRef = {
  idLayanan?: string | null
  service?: string | null
}

/**
 * Apakah dua reservasi/layanan mengacu pada bidang (layanan) yang sama?
 * Beda layanan → slot waktu yang sama masih boleh dipilih.
 */
export function isSameLayanan(a: LayananRef, b: LayananRef): boolean {
  const idA = a.idLayanan?.trim() || null
  const idB = b.idLayanan?.trim() || null

  if (idA && idB && idA === idB) {
    return true
  }

  const serviceA = a.service?.trim()
  const serviceB = b.service?.trim()
  if (serviceA && serviceB && normalizeServiceName(serviceA) === normalizeServiceName(serviceB)) {
    return true
  }

  const keyA = getServiceKey(a)
  const keyB = getServiceKey(b)
  if (keyA && keyB && keyA === keyB) return true

  return false
}
