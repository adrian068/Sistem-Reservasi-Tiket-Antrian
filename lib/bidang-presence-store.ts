import 'server-only'

import { prisma } from './prisma'
import { shouldUseFallbackForDbError } from './api-fallback-data'
import { BIDANG_SLUGS, getBidangConfig, isBidangSlug } from './bidang-config'
import {
  getBidangLabelForSlug,
  getDefaultPetugasForBidang,
} from './bidang-petugas-defaults'

export type PetugasPresence = {
  id: string
  nama: string
  jabatan: string
  hadir: boolean
  diRuangan: boolean
  updatedAt: string
}

export type BidangPresence = {
  slug: string
  nama: string
  petugas: PetugasPresence[]
  updatedAt: string
}

type PresenceStore = {
  bidangs: BidangPresence[]
}

const STORE_PATH = 'data/bidang-presence.json'

function nowIso() {
  return new Date().toISOString()
}

function seedBidangFromDefaults(slug: string): BidangPresence | null {
  const templates = getDefaultPetugasForBidang(slug)
  if (templates.length === 0) return null

  const ts = nowIso()
  return {
    slug,
    nama: getBidangLabelForSlug(slug),
    updatedAt: ts,
    petugas: templates.map((p) => ({
      id: p.id,
      nama: p.nama,
      jabatan: p.jabatan,
      hadir: false,
      diRuangan: false,
      updatedAt: ts,
    })),
  }
}

/** @deprecated use seedBidangFromDefaults('paud') */
function seedPaudBidang(): BidangPresence {
  return seedBidangFromDefaults('paud')!
}

function mapDbBidang(
  row: {
    slug: string
    nama: string
    diperbaruiPada: Date
    petugas: Array<{
      id: string
      nama: string
      jabatan: string
      kehadiran: { hadir: boolean; diRuangan: boolean; updatedAt: Date } | null
    }>
  },
): BidangPresence {
  const petugas = row.petugas.map((p) => ({
    id: p.id,
    nama: p.nama,
    jabatan: p.jabatan,
    hadir: p.kehadiran?.hadir ?? false,
    diRuangan: p.kehadiran?.diRuangan ?? false,
    updatedAt: (p.kehadiran?.updatedAt ?? row.diperbaruiPada).toISOString(),
  }))

  const latest = petugas.reduce(
    (max, p) => Math.max(max, new Date(p.updatedAt).getTime()),
    row.diperbaruiPada.getTime(),
  )

  return {
    slug: row.slug,
    nama: row.nama,
    updatedAt: new Date(latest).toISOString(),
    petugas,
  }
}

async function readFileStore(): Promise<PresenceStore> {
  const { promises: fs } = await import('fs')
  const path = await import('path')
  const filePath = path.join(process.cwd(), STORE_PATH)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as PresenceStore
    if (!Array.isArray(parsed.bidangs)) {
      return { bidangs: [seedPaudBidang()] }
    }
    return parsed
  } catch {
    return { bidangs: [seedPaudBidang()] }
  }
}

async function writeFileStore(store: PresenceStore): Promise<void> {
  const { promises: fs } = await import('fs')
  const path = await import('path')
  const filePath = path.join(process.cwd(), STORE_PATH)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(store, null, 2), 'utf8')
}

async function seedBidangToFileStore(slug: string): Promise<BidangPresence | null> {
  const seeded = seedBidangFromDefaults(slug)
  if (!seeded) return null

  const store = await readFileStore()
  const index = store.bidangs.findIndex((b) => b.slug === slug)
  if (index >= 0) {
    store.bidangs[index] = seeded
  } else {
    store.bidangs.push(seeded)
  }
  await writeFileStore(store)
  return seeded
}

async function ensurePerbidanganRow(slug: string) {
  const config = getBidangConfig(slug)
  if (!config) return null

  const existing = await prisma.perbidangan.findUnique({ where: { slug } })
  if (existing) return existing

  const urutan = (BIDANG_SLUGS as readonly string[]).indexOf(slug)
  return prisma.perbidangan.create({
    data: {
      slug,
      nama: config.label,
      urutan: urutan >= 0 ? urutan + 1 : 99,
      aktif: true,
      ...(slug === 'paud' ? { kapasitasSlot: 5 } : {}),
    },
  })
}

async function seedBidangToDb(slug: string): Promise<BidangPresence | null> {
  const templates = getDefaultPetugasForBidang(slug)
  if (templates.length === 0) return null

  const perbidangan = await ensurePerbidanganRow(slug)
  if (!perbidangan) return null

  const existingCount = await prisma.petugas.count({
    where: { idPerbidangan: perbidangan.id, aktif: true },
  })
  if (existingCount > 0) {
    return fetchDbBidang(slug)
  }

  for (const template of templates) {
    await prisma.petugas.upsert({
      where: { id: template.id },
      create: {
        id: template.id,
        idPerbidangan: perbidangan.id,
        nama: template.nama,
        jabatan: template.jabatan,
        urutan: template.urutan,
        aktif: true,
      },
      update: {
        nama: template.nama,
        jabatan: template.jabatan,
        urutan: template.urutan,
        aktif: true,
        idPerbidangan: perbidangan.id,
      },
    })
    await prisma.kehadiranPetugas.upsert({
      where: { petugasId: template.id },
      create: { petugasId: template.id, hadir: false, diRuangan: false },
      update: {},
    })
  }

  await seedBidangToFileStore(slug)
  return fetchDbBidang(slug)
}

/** Pastikan daftar petugas default ada saat admin bidang dibuat atau panel dibuka. */
export async function ensureBidangPetugasSeeded(slug: string): Promise<BidangPresence | null> {
  if (!isBidangSlug(slug)) return null

  try {
    const existing = await fetchDbBidang(slug)
    if (existing) return existing

    const seeded = await seedBidangToDb(slug)
    if (seeded) return seeded
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  const store = await readFileStore()
  const fromFile = store.bidangs.find((b) => b.slug === slug)
  if (fromFile && fromFile.petugas.length > 0) return fromFile

  return seedBidangToFileStore(slug)
}

async function fetchDbBidang(slug: string): Promise<BidangPresence | null> {
  const row = await prisma.perbidangan.findUnique({
    where: { slug },
    include: {
      petugas: {
        where: { aktif: true },
        orderBy: { urutan: 'asc' },
        include: { kehadiran: true },
      },
    },
  })
  if (!row || row.petugas.length === 0) return null
  return mapDbBidang(row)
}

async function fetchAllDbBidangs(): Promise<BidangPresence[]> {
  const rows = await prisma.perbidangan.findMany({
    where: { aktif: true },
    orderBy: { urutan: 'asc' },
    include: {
      petugas: {
        where: { aktif: true },
        orderBy: { urutan: 'asc' },
        include: { kehadiran: true },
      },
    },
  })

  return rows
    .filter((row) => row.petugas.length > 0)
    .map(mapDbBidang)
}

export async function getBidangPresence(slug: string): Promise<BidangPresence | null> {
  if (!isBidangSlug(slug)) return null

  try {
    const fromDb = await fetchDbBidang(slug)
    if (fromDb) return fromDb
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  const store = await readFileStore()
  let bidang = store.bidangs.find((b) => b.slug === slug) ?? null

  if (!bidang || bidang.petugas.length === 0) {
    return ensureBidangPetugasSeeded(slug)
  }

  return bidang
}

export async function listBidangPresence(): Promise<BidangPresence[]> {
  try {
    const fromDb = await fetchAllDbBidangs()
    if (fromDb.length > 0) return fromDb
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  const store = await readFileStore()
  if (!store.bidangs.some((b) => b.slug === 'paud')) {
    store.bidangs.push(seedPaudBidang())
    await writeFileStore(store)
  }
  return store.bidangs
}

export async function updatePetugasPresence(input: {
  bidangSlug: string
  petugasId: string
  hadir?: boolean
  diRuangan?: boolean
}): Promise<BidangPresence | null> {
  try {
    const petugas = await prisma.petugas.findFirst({
      where: {
        id: input.petugasId,
        aktif: true,
        perbidangan: { slug: input.bidangSlug },
      },
      include: { kehadiran: true, perbidangan: true },
    })

    if (!petugas) return null

    const hadir =
      typeof input.hadir === 'boolean'
        ? input.hadir
        : (petugas.kehadiran?.hadir ?? false)
    const diRuangan =
      typeof input.diRuangan === 'boolean'
        ? input.diRuangan
        : (petugas.kehadiran?.diRuangan ?? false)

    await prisma.kehadiranPetugas.upsert({
      where: { petugasId: petugas.id },
      create: {
        petugasId: petugas.id,
        hadir,
        diRuangan,
      },
      update: {
        hadir,
        diRuangan,
      },
    })

    return fetchDbBidang(input.bidangSlug)
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  const store = await readFileStore()
  let bidang = store.bidangs.find((b) => b.slug === input.bidangSlug)

  if (!bidang || bidang.petugas.length === 0) {
    await ensureBidangPetugasSeeded(input.bidangSlug)
  }

  const freshStore = await readFileStore()
  bidang = freshStore.bidangs.find((b) => b.slug === input.bidangSlug)
  if (!bidang) return null

  const petugas = bidang.petugas.find((p) => p.id === input.petugasId)
  if (!petugas) return null

  const ts = nowIso()
  if (typeof input.hadir === 'boolean') petugas.hadir = input.hadir
  if (typeof input.diRuangan === 'boolean') petugas.diRuangan = input.diRuangan
  petugas.updatedAt = ts
  bidang.updatedAt = ts

  await writeFileStore(freshStore)
  return bidang
}

export function summarizeBidangPresence(bidang: BidangPresence) {
  const total = bidang.petugas.length
  const hadir = bidang.petugas.filter((p) => p.hadir).length
  const diRuangan = bidang.petugas.filter((p) => p.diRuangan).length
  return { total, hadir, diRuangan }
}

export async function updatePetugasProfile(input: {
  bidangSlug: string
  petugasId: string
  nama?: string
  jabatan?: string
}): Promise<BidangPresence | null> {
  const trimmedNama = input.nama?.trim()
  const trimmedJabatan = input.jabatan?.trim()

  if (trimmedNama !== undefined && trimmedNama.length < 2) return null
  if (trimmedJabatan !== undefined && trimmedJabatan.length < 2) return null

  try {
    const petugas = await prisma.petugas.findFirst({
      where: {
        id: input.petugasId,
        aktif: true,
        perbidangan: { slug: input.bidangSlug },
      },
    })

    if (petugas) {
      await prisma.petugas.update({
        where: { id: petugas.id },
        data: {
          ...(trimmedNama !== undefined ? { nama: trimmedNama } : {}),
          ...(trimmedJabatan !== undefined ? { jabatan: trimmedJabatan } : {}),
        },
      })
      return fetchDbBidang(input.bidangSlug)
    }
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  const store = await readFileStore()
  let bidang = store.bidangs.find((b) => b.slug === input.bidangSlug)
  if (!bidang || bidang.petugas.length === 0) {
    await ensureBidangPetugasSeeded(input.bidangSlug)
  }

  const freshStore = await readFileStore()
  bidang = freshStore.bidangs.find((b) => b.slug === input.bidangSlug)
  if (!bidang) return null

  const petugas = bidang.petugas.find((p) => p.id === input.petugasId)
  if (!petugas) return null

  const ts = nowIso()
  if (trimmedNama !== undefined) petugas.nama = trimmedNama
  if (trimmedJabatan !== undefined) petugas.jabatan = trimmedJabatan
  petugas.updatedAt = ts
  bidang.updatedAt = ts

  await writeFileStore(freshStore)
  return bidang
}
