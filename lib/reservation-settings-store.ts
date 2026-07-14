import 'server-only'

import { prisma } from './prisma'
import { shouldUseFallbackForDbError } from './api-fallback-data'

/** auto = ikut jadwal; open = paksa buka; closed = paksa tutup */
export type ReservationGateMode = 'auto' | 'open' | 'closed'

export type ReservationSettings = {
  mode: ReservationGateMode
  /** Pesan saat mode tutup paksa */
  pesanTutup?: string
  /** Pesan saat mode buka paksa */
  pesanBuka?: string
  updatedAt: string
  updatedBy?: string
}

const STORE_PATH = 'data/reservation-settings.json'

const DEFAULT_SETTINGS: ReservationSettings = {
  mode: 'auto',
  pesanTutup: 'Reservasi ditutup sementara oleh admin.',
  pesanBuka: 'Reservasi dibuka oleh admin.',
  updatedAt: new Date().toISOString(),
}

async function readFileSettings(): Promise<ReservationSettings> {
  const { promises: fs } = await import('fs')
  const path = await import('path')
  const filePath = path.join(process.cwd(), STORE_PATH)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ReservationSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      mode: parsed.mode ?? 'auto',
      updatedAt: parsed.updatedAt ?? DEFAULT_SETTINGS.updatedAt,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function writeFileSettings(next: ReservationSettings): Promise<void> {
  const { promises: fs } = await import('fs')
  const path = await import('path')
  const filePath = path.join(process.cwd(), STORE_PATH)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), 'utf8')
}

function mapDbRow(row: {
  mode: string
  pesanTutup: string | null
  pesanBuka: string | null
  updatedAt: Date
  updatedBy: string | null
}): ReservationSettings {
  return {
    mode: row.mode as ReservationGateMode,
    pesanTutup: row.pesanTutup ?? DEFAULT_SETTINGS.pesanTutup,
    pesanBuka: row.pesanBuka ?? DEFAULT_SETTINGS.pesanBuka,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy ?? undefined,
  }
}

export async function getReservationSettings(): Promise<ReservationSettings> {
  try {
    const row = await prisma.reservationSetting.findUnique({ where: { id: 1 } })
    if (row) return mapDbRow(row)
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
  }

  return readFileSettings()
}

export async function saveReservationSettings(
  input: Pick<ReservationSettings, 'mode' | 'pesanTutup' | 'pesanBuka'> & {
    updatedBy?: string
  },
): Promise<ReservationSettings> {
  const next: ReservationSettings = {
    mode: input.mode,
    pesanTutup: input.pesanTutup?.trim() || DEFAULT_SETTINGS.pesanTutup,
    pesanBuka: input.pesanBuka?.trim() || DEFAULT_SETTINGS.pesanBuka,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy,
  }

  try {
    const row = await prisma.reservationSetting.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        mode: next.mode,
        pesanTutup: next.pesanTutup,
        pesanBuka: next.pesanBuka,
        updatedBy: next.updatedBy,
      },
      update: {
        mode: next.mode,
        pesanTutup: next.pesanTutup,
        pesanBuka: next.pesanBuka,
        updatedBy: next.updatedBy,
      },
    })
    return mapDbRow(row)
  } catch (error) {
    if (!shouldUseFallbackForDbError(error)) throw error
    await writeFileSettings(next)
    return next
  }
}
