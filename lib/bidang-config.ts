import type { ServiceKey } from './queue-service-key'

export const BIDANG_SLUGS = ['paud', 'ptk', 'sd-umum', 'smp-umum'] as const
export type BidangSlug = (typeof BIDANG_SLUGS)[number]

export type BidangUiConfig = {
  slug: BidangSlug
  serviceKey: ServiceKey
  label: string
  shortLabel: string
  defaultAdminNama: string
  accentBorder: string
  accentBg: string
  accentText: string
  accentIconBg: string
  accentButton: string
}

export const BIDANG_CONFIG: Record<BidangSlug, BidangUiConfig> = {
  paud: {
    slug: 'paud',
    serviceKey: 'paud',
    label: 'PAUD',
    shortLabel: 'PAUD',
    defaultAdminNama: 'Admin Bidang PAUD',
    accentBorder: 'border-orange-200 dark:border-orange-900',
    accentBg: 'bg-orange-50/80 dark:bg-orange-950/30',
    accentText: 'text-orange-600',
    accentIconBg: 'bg-orange-100 dark:bg-orange-950',
    accentButton: 'bg-orange-600 hover:bg-orange-700',
  },
  ptk: {
    slug: 'ptk',
    serviceKey: 'ptk',
    label: 'PTK',
    shortLabel: 'PTK',
    defaultAdminNama: 'Admin Bidang PTK',
    accentBorder: 'border-blue-200 dark:border-blue-900',
    accentBg: 'bg-blue-50/80 dark:bg-blue-950/30',
    accentText: 'text-blue-600',
    accentIconBg: 'bg-blue-100 dark:bg-blue-950',
    accentButton: 'bg-blue-600 hover:bg-blue-700',
  },
  'sd-umum': {
    slug: 'sd-umum',
    serviceKey: 'sd',
    label: 'SD Umum',
    shortLabel: 'SD',
    defaultAdminNama: 'Admin Bidang SD',
    accentBorder: 'border-green-200 dark:border-green-900',
    accentBg: 'bg-green-50/80 dark:bg-green-950/30',
    accentText: 'text-green-600',
    accentIconBg: 'bg-green-100 dark:bg-green-950',
    accentButton: 'bg-green-600 hover:bg-green-700',
  },
  'smp-umum': {
    slug: 'smp-umum',
    serviceKey: 'smp',
    label: 'SMP Umum',
    shortLabel: 'SMP',
    defaultAdminNama: 'Admin Bidang SMP',
    accentBorder: 'border-purple-200 dark:border-purple-900',
    accentBg: 'bg-purple-50/80 dark:bg-purple-950/30',
    accentText: 'text-purple-600',
    accentIconBg: 'bg-purple-100 dark:bg-purple-950',
    accentButton: 'bg-purple-600 hover:bg-purple-700',
  },
}

export function isBidangSlug(value: string): value is BidangSlug {
  return (BIDANG_SLUGS as readonly string[]).includes(value)
}

export function getBidangConfig(slug: string): BidangUiConfig | null {
  if (!isBidangSlug(slug)) return null
  return BIDANG_CONFIG[slug]
}

export function getBidangSlugForUser(user: { bidangSlug?: string | null }): BidangSlug {
  const slug = user.bidangSlug ?? 'paud'
  return isBidangSlug(slug) ? slug : 'paud'
}

export function getBidangAdminPath(slug: string): string {
  const safe = isBidangSlug(slug) ? slug : 'paud'
  return `/admin/bidang/${safe}`
}

export const BIDANG_SELECT_OPTIONS = BIDANG_SLUGS.map((slug) => ({
  slug,
  label: BIDANG_CONFIG[slug].label,
}))
