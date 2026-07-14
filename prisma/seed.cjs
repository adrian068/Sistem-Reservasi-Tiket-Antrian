/**
 * Seed data awal SIREDI ke Supabase.
 *
 * Admin Disdik : disdikbanjarmasin@gmail.com / disdik123
 * Super Admin  : silent / Silent12
 * Admin PAUD   : revan123 / revan123
 *
 * Jalankan: npm run db:seed
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const ACCOUNTS = [
  {
    email: 'disdikbanjarmasin@gmail.com',
    password: 'disdik123',
    nama: 'Admin Disdik Banjarmasin',
    peran: 'ADMIN',
    bidangSlug: null,
  },
  {
    email: 'silent12@gmail.com',
    password: 'Silent12',
    nama: 'Super Admin SIREDI',
    peran: 'SUPER_ADMIN',
    bidangSlug: null,
  },
  {
    email: 'revan123@siredi.local',
    password: 'revan123',
    nama: 'Admin PAUD',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'paud',
  },
]

const PERBIDANGANS = [
  { slug: 'ptk', nama: 'PTK (Pendidik dan Tenaga Kependidikan)', urutan: 1 },
  { slug: 'sd-umum', nama: 'SD Umum', urutan: 2 },
  { slug: 'smp-umum', nama: 'SMP Umum', urutan: 3 },
  { slug: 'paud', nama: 'PAUD', urutan: 4 },
]

const LAYANANS = [
  { nama: 'PTK (Pendidik dan Tenaga Kependidikan)', slug: 'ptk' },
  { nama: 'SD Umum', slug: 'sd-umum' },
  { nama: 'SMP Umum', slug: 'smp-umum' },
  { nama: 'PAUD', slug: 'paud' },
]

const PAUD_PETUGAS = [
  { id: 'paud-1', nama: 'Kepala Seksi PAUD', jabatan: 'Kasi PAUD', urutan: 1 },
  { id: 'paud-2', nama: 'Analis PAUD I', jabatan: 'Staff Kurikulum', urutan: 2 },
  { id: 'paud-3', nama: 'Analis PAUD II', jabatan: 'Staff Sarpras', urutan: 3 },
  { id: 'paud-4', nama: 'Penata Layanan Operasional', jabatan: 'Staff Administrasi', urutan: 4 },
  { id: 'paud-5', nama: 'Pranata Humas', jabatan: 'Staff Humas & Data', urutan: 5 },
]

async function upsertLayananByName(nama) {
  const existing = await prisma.layanan.findFirst({ where: { name: nama } })
  if (existing) {
    return prisma.layanan.update({
      where: { id: existing.id },
      data: { isActive: true },
    })
  }
  return prisma.layanan.create({
    data: { name: nama, description: `Layanan ${nama}`, isActive: true },
  })
}

async function main() {
  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10)
    await prisma.pengguna.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        nama: account.nama,
        passwordHash,
        peran: account.peran,
        bidangSlug: account.bidangSlug,
      },
      update: {
        nama: account.nama,
        passwordHash,
        peran: account.peran,
        bidangSlug: account.bidangSlug,
      },
    })
    console.log(`✅ ${account.peran}: ${account.email}`)
  }

  for (const item of PERBIDANGANS) {
    const paudExtra = item.slug === 'paud' ? { kapasitasSlot: 5 } : {}
    await prisma.perbidangan.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        nama: item.nama,
        urutan: item.urutan,
        aktif: true,
        ...paudExtra,
      },
      update: { nama: item.nama, urutan: item.urutan, aktif: true, ...paudExtra },
    })
  }
  console.log('✅ perbidangans siap')

  for (const item of LAYANANS) {
    const layanan = await upsertLayananByName(item.nama)
    const perbidangan = await prisma.perbidangan.findUnique({ where: { slug: item.slug } })
    if (perbidangan) {
      await prisma.layananPerbidangan.upsert({
        where: {
          idLayanan_idPerbidangan: {
            idLayanan: layanan.id,
            idPerbidangan: perbidangan.id,
          },
        },
        create: {
          idLayanan: layanan.id,
          idPerbidangan: perbidangan.id,
        },
        update: {},
      })
    }
  }
  console.log('✅ layanans + relasi siap')

  await prisma.reservationSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      mode: 'auto',
      pesanTutup: 'Reservasi ditutup sementara oleh admin.',
      pesanBuka: 'Reservasi dibuka oleh admin.',
    },
    update: {},
  })
  console.log('✅ reservation_settings siap')

  const paud = await prisma.perbidangan.findUnique({ where: { slug: 'paud' } })
  if (paud) {
    for (const p of PAUD_PETUGAS) {
      await prisma.petugas.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          idPerbidangan: paud.id,
          nama: p.nama,
          jabatan: p.jabatan,
          urutan: p.urutan,
        },
        update: {
          nama: p.nama,
          jabatan: p.jabatan,
          urutan: p.urutan,
          aktif: true,
        },
      })
      await prisma.kehadiranPetugas.upsert({
        where: { petugasId: p.id },
        create: { petugasId: p.id, hadir: false, diRuangan: false },
        update: {},
      })
    }
  }
  console.log('✅ petugas + kehadiran PAUD siap')

  const jadwal = [
    { hari: 1, jamBuka: '08:00', jamTutup: '16:00', keterangan: 'Senin' },
    { hari: 2, jamBuka: '08:00', jamTutup: '16:00', keterangan: 'Selasa' },
    { hari: 3, jamBuka: '08:00', jamTutup: '16:00', keterangan: 'Rabu' },
    { hari: 4, jamBuka: '08:00', jamTutup: '16:00', keterangan: 'Kamis' },
    { hari: 5, jamBuka: '08:00', jamTutup: '10:00', keterangan: 'Jumat' },
    { hari: 0, jamBuka: '00:00', jamTutup: '00:00', aktif: false, keterangan: 'Minggu — tutup' },
    { hari: 6, jamBuka: '00:00', jamTutup: '00:00', aktif: false, keterangan: 'Sabtu — tutup' },
  ]

  for (const j of jadwal) {
    await prisma.jadwalOperasional.upsert({
      where: { hari: j.hari },
      create: j,
      update: j,
    })
  }
  console.log('✅ jadwal_operasional siap')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
