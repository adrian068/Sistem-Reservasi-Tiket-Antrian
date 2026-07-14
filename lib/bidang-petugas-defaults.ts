import { BIDANG_CONFIG, type BidangSlug } from './bidang-config'

export type DefaultPetugasTemplate = {
  id: string
  nama: string
  jabatan: string
  urutan: number
}

function staffTemplate(
  slug: BidangSlug,
  shortLabel: string,
): DefaultPetugasTemplate[] {
  return [
    {
      id: `${slug}-1`,
      nama: `Kepala Seksi ${shortLabel}`,
      jabatan: `Kasi ${shortLabel}`,
      urutan: 1,
    },
    {
      id: `${slug}-2`,
      nama: `Analis ${shortLabel} I`,
      jabatan: 'Staff Kurikulum',
      urutan: 2,
    },
    {
      id: `${slug}-3`,
      nama: `Analis ${shortLabel} II`,
      jabatan: 'Staff Sarpras',
      urutan: 3,
    },
    {
      id: `${slug}-4`,
      nama: 'Penata Layanan Operasional',
      jabatan: 'Staff Administrasi',
      urutan: 4,
    },
    {
      id: `${slug}-5`,
      nama: 'Pranata Humas',
      jabatan: 'Staff Humas & Data',
      urutan: 5,
    },
  ]
}

export const DEFAULT_PETUGAS_BY_BIDANG: Record<BidangSlug, DefaultPetugasTemplate[]> = {
  paud: staffTemplate('paud', 'PAUD'),
  ptk: staffTemplate('ptk', 'PTK'),
  'sd-umum': staffTemplate('sd-umum', 'SD'),
  'smp-umum': staffTemplate('smp-umum', 'SMP'),
}

export function getDefaultPetugasForBidang(slug: string): DefaultPetugasTemplate[] {
  if (slug in DEFAULT_PETUGAS_BY_BIDANG) {
    return DEFAULT_PETUGAS_BY_BIDANG[slug as BidangSlug]
  }
  return []
}

export function getBidangLabelForSlug(slug: string): string {
  if (slug in BIDANG_CONFIG) {
    return BIDANG_CONFIG[slug as BidangSlug].label
  }
  return slug
}
