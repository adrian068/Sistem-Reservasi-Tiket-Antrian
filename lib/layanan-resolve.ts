import 'server-only'

import { FALLBACK_LAYANANS } from './api-fallback-data'
import { prisma } from './prisma'
import { isFallbackLayananId } from './reservations-fallback-store'
import {
  CANONICAL_SERVICE_NAMES,
  getBidangSlugForServiceKey,
  getServiceKey,
  type ServiceKey,
} from './queue-service-key'

export type ResolvedLayanan = {
  service: string
  serviceKey: ServiceKey
  idLayanan: string | null
  bidangSlug: string
}

function resolveFromName(name: string, idLayanan: string | null): ResolvedLayanan | null {
  const serviceKey = getServiceKey({ service: name })
  if (!serviceKey) return null

  return {
    service: CANONICAL_SERVICE_NAMES[serviceKey],
    serviceKey,
    idLayanan,
    bidangSlug: getBidangSlugForServiceKey(serviceKey),
  }
}

/**
 * Tentukan layanan reservasi dari id layanan atau nama layanan.
 * Memastikan data masuk ke bidang admin yang benar (PTK / PAUD / SD / SMP).
 */
export async function resolveLayananForReservation(input: {
  service?: string | null
  idLayanan?: string | null
}): Promise<ResolvedLayanan | null> {
  const idLayanan = input.idLayanan?.trim() || null

  if (idLayanan) {
    try {
      const layanan = await prisma.layanan.findUnique({
        where: { id: BigInt(idLayanan) },
      })
      if (layanan && layanan.isActive !== false) {
        const resolved = resolveFromName(layanan.name, idLayanan)
        if (resolved) return resolved
      }
    } catch {
      // lanjut ke fallback
    }

    if (isFallbackLayananId(idLayanan)) {
      const fallback = FALLBACK_LAYANANS.find((l) => l.id === idLayanan)
      if (fallback) {
        return resolveFromName(fallback.name, fallback.id)
      }
    }
  }

  const fallbackByName = FALLBACK_LAYANANS.find(
    (l) =>
      l.name.trim().toLowerCase() === input.service?.trim().toLowerCase() ||
      getServiceKey({ service: l.name }) === getServiceKey({ service: input.service }),
  )
  if (fallbackByName) {
    return resolveFromName(fallbackByName.name, fallbackByName.id)
  }

  if (input.service?.trim()) {
    return resolveFromName(input.service.trim(), idLayanan)
  }

  return null
}
