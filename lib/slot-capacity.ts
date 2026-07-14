import 'server-only'

import { prisma } from './prisma'
import { getServiceKey, type ServiceKey } from './queue-service-key'

const SERVICE_SLUG: Record<ServiceKey, string> = {
  ptk: 'ptk',
  sd: 'sd-umum',
  smp: 'smp-umum',
  paud: 'paud',
}

const DEFAULT_CAPACITY: Record<ServiceKey, number> = {
  paud: 5,
  ptk: 1,
  sd: 1,
  smp: 1,
}

export type SlotCapacityInfo = {
  capacity: number
  petugasTotal: number
  petugasHadir: number
  kapasitasSlot: number | null
  bidangSlug: string | null
}

async function findPerbidanganForLayanan(input: {
  idLayanan?: string | null
  service?: string | null
}) {
  if (input.idLayanan) {
    try {
      const link = await prisma.layananPerbidangan.findFirst({
        where: { idLayanan: BigInt(input.idLayanan) },
        include: {
          perbidangan: {
            include: {
              petugas: {
                where: { aktif: true },
                include: { kehadiran: true },
              },
            },
          },
        },
      })
      if (link?.perbidangan) return link.perbidangan
    } catch {
      // fallback below
    }
  }

  const key = getServiceKey(input)
  if (!key) return null

  return prisma.perbidangan.findUnique({
    where: { slug: SERVICE_SLUG[key] },
    include: {
      petugas: {
        where: { aktif: true },
        include: { kehadiran: true },
      },
    },
  })
}

function resolveCapacityFromBidang(
  perbidangan: {
    slug: string
    kapasitasSlot: number | null
    petugas: Array<{ kehadiran: { hadir: boolean } | null }>
  } | null,
  serviceKey: ServiceKey | null,
): SlotCapacityInfo {
  const petugasTotal = perbidangan?.petugas.length ?? 0
  const petugasHadir =
    perbidangan?.petugas.filter((p) => p.kehadiran?.hadir).length ?? 0

  let capacity = 1
  if (perbidangan?.kapasitasSlot != null && perbidangan.kapasitasSlot > 0) {
    capacity = perbidangan.kapasitasSlot
  } else if (petugasTotal > 0) {
    capacity = petugasTotal
  } else if (serviceKey && DEFAULT_CAPACITY[serviceKey]) {
    capacity = DEFAULT_CAPACITY[serviceKey]
  }

  return {
    capacity: Math.min(Math.max(capacity, 1), 20),
    petugasTotal,
    petugasHadir,
    kapasitasSlot: perbidangan?.kapasitasSlot ?? null,
    bidangSlug: perbidangan?.slug ?? null,
  }
}

export async function getSlotCapacityForLayanan(input: {
  idLayanan?: string | null
  service?: string | null
}): Promise<number> {
  const info = await getSlotCapacityInfo(input)
  return info.capacity
}

export async function getSlotCapacityInfo(input: {
  idLayanan?: string | null
  service?: string | null
}): Promise<SlotCapacityInfo> {
  const serviceKey = getServiceKey(input)
  const perbidangan = await findPerbidanganForLayanan(input)
  return resolveCapacityFromBidang(perbidangan, serviceKey)
}

export async function getSlotCapacityForBidangSlug(slug: string): Promise<SlotCapacityInfo> {
  const perbidangan = await prisma.perbidangan.findUnique({
    where: { slug },
    include: {
      petugas: {
        where: { aktif: true },
        include: { kehadiran: true },
      },
    },
  })

  const serviceKey =
    slug === 'paud'
      ? 'paud'
      : slug === 'sd-umum'
        ? 'sd'
        : slug === 'smp-umum'
          ? 'smp'
          : slug === 'ptk'
            ? 'ptk'
            : null

  return resolveCapacityFromBidang(perbidangan, serviceKey)
}

export async function updateBidangSlotCapacity(
  slug: string,
  kapasitasSlot: number,
): Promise<SlotCapacityInfo> {
  const safe = Math.min(Math.max(Math.round(kapasitasSlot), 1), 20)

  await prisma.perbidangan.update({
    where: { slug },
    data: { kapasitasSlot: safe },
  })

  return getSlotCapacityForBidangSlug(slug)
}

export type BidangCapacityRow = SlotCapacityInfo & {
  slug: string
  nama: string
}

function slugToServiceKey(slug: string): ServiceKey | null {
  if (slug === 'paud') return 'paud'
  if (slug === 'sd-umum') return 'sd'
  if (slug === 'smp-umum') return 'smp'
  if (slug === 'ptk') return 'ptk'
  return null
}

export async function listAllBidangCapacity(): Promise<BidangCapacityRow[]> {
  const bidangs = await prisma.perbidangan.findMany({
    where: { aktif: true },
    orderBy: { urutan: 'asc' },
    include: {
      petugas: {
        where: { aktif: true },
        include: { kehadiran: true },
      },
    },
  })

  return bidangs.map((b) => {
    const info = resolveCapacityFromBidang(b, slugToServiceKey(b.slug))
    return {
      slug: b.slug,
      nama: b.nama,
      ...info,
    }
  })
}
