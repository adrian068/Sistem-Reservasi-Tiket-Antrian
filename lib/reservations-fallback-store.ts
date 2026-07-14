import { promises as fs } from 'fs'
import path from 'path'

export type FallbackReservation = {
  id: string
  queueNumber: string
  service: string
  idLayanan: string | null
  name: string
  phone: string
  nik: string | null
  purpose: string
  date: string
  timeSlot: string
  status: string
  createdAt: string
  updatedAt: string
  estimatedCallTime?: string | null
}

const STORE_PATH = path.join(process.cwd(), 'data', 'reservations.json')

async function readAll(): Promise<FallbackReservation[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as FallbackReservation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeAll(items: FallbackReservation[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf8')
}

export function toApiReservation(r: FallbackReservation) {
  return {
    id: r.id,
    queueNumber: r.queueNumber,
    service: r.service,
    idLayanan: r.idLayanan,
    layanan: null,
    name: r.name,
    phone: r.phone,
    nik: r.nik,
    purpose: r.purpose,
    date: r.date,
    timeSlot: r.timeSlot,
    status: r.status.toLowerCase(),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    estimatedCallTime: r.estimatedCallTime ?? null,
  }
}

export async function listFallbackReservations(): Promise<FallbackReservation[]> {
  const items = await readAll()
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function getFallbackReservation(
  id: string,
): Promise<FallbackReservation | null> {
  const items = await readAll()
  return items.find((r) => r.id === id) ?? null
}

export async function addFallbackReservation(
  input: Omit<FallbackReservation, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string
  },
): Promise<FallbackReservation> {
  const now = new Date().toISOString()
  const reservation: FallbackReservation = {
    ...input,
    id: input.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: input.status.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  }

  const items = await readAll()
  items.push(reservation)
  await writeAll(items)
  return reservation
}

export async function updateFallbackReservation(
  id: string,
  patch: Partial<FallbackReservation>,
): Promise<FallbackReservation | null> {
  const items = await readAll()
  const index = items.findIndex((r) => r.id === id)
  if (index === -1) return null

  const updated: FallbackReservation = {
    ...items[index],
    ...patch,
    id: items[index].id,
    updatedAt: new Date().toISOString(),
    status: (patch.status ?? items[index].status).toLowerCase(),
  }
  items[index] = updated
  await writeAll(items)
  return updated
}

export async function deleteFallbackReservation(id: string): Promise<boolean> {
  const items = await readAll()
  const next = items.filter((r) => r.id !== id)
  if (next.length === items.length) return false
  await writeAll(next)
  return true
}

export function getServiceCode(service: string): string {
  const map: Record<string, string> = {
    'PTK (Pendidik dan Tenaga Kependidikan)': 'PTK',
    'SD Umum': 'SD',
    'SMP Umum': 'SMP',
    PAUD: 'PAUD',
  }
  return map[service] || service.substring(0, 3).toUpperCase()
}

export async function generateFallbackQueueNumber(service: string): Promise<string> {
  const serviceCode = getServiceCode(service)
  const items = await readAll()
  let max = 0
  for (const r of items) {
    if (!r.queueNumber.startsWith(`${serviceCode}-`)) continue
    const match = r.queueNumber.match(/-(\d+)$/)
    if (match) max = Math.max(max, parseInt(match[1], 10))
  }
  return `${serviceCode}-${(max + 1).toString().padStart(2, '0')}`
}

export function isFallbackReservationId(id: string): boolean {
  return id.startsWith('local-')
}

export function isFallbackLayananId(idLayanan: string | null | undefined): boolean {
  if (!idLayanan) return false
  return /^[1-4]$/.test(String(idLayanan))
}
