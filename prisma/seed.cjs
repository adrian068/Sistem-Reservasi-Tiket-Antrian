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
  {
    email: 'adminptk@siredi.local',
    password: 'adminptk',
    nama: 'Admin PTK',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'ptk',
  },
  {
    email: 'adminptk2@siredi.local',
    password: 'adminptk2',
    nama: 'Admin PTK 2',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'ptk',
  },
  {
    email: 'adminsd@siredi.local',
    password: 'adminsd',
    nama: 'Admin SD',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'sd-umum',
  },
  {
    email: 'adminsd2@siredi.local',
    password: 'adminsd2',
    nama: 'Admin SD 2',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'sd-umum',
  },
  {
    email: 'adminsmp@siredi.local',
    password: 'adminsmp',
    nama: 'Admin SMP',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'smp-umum',
  },
  {
    email: 'adminsmp2@siredi.local',
    password: 'adminsmp2',
    nama: 'Admin SMP 2',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'smp-umum',
  },
  {
    email: 'adminpaud@siredi.local',
    password: 'adminpaud',
    nama: 'Admin PAUD 1',
    peran: 'ADMIN_PAUD',
    bidangSlug: 'paud',
  },
  {
    email: 'adminpaud2@siredi.local',
    password: 'adminpaud2',
    nama: 'Admin PAUD 2',
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
  { 
    nama: 'PTK (Pendidik dan Tenaga Kependidikan)', 
    slug: 'ptk',
    deskripsi: 'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan',
    ikon: 'Users',
    warna: 'bg-blue-500'
  },
  { 
    nama: 'SD Umum', 
    slug: 'sd-umum',
    deskripsi: 'Layanan untuk Sekolah Dasar',
    ikon: 'School',
    warna: 'bg-green-500'
  },
  { 
    nama: 'SMP Umum', 
    slug: 'smp-umum',
    deskripsi: 'Layanan untuk Sekolah Menengah Pertama',
    ikon: 'GraduationCap',
    warna: 'bg-purple-500'
  },
  { 
    nama: 'PAUD', 
    slug: 'paud',
    deskripsi: 'Layanan untuk Pendidikan Anak Usia Dini',
    ikon: 'Baby',
    warna: 'bg-orange-500'
  },
]

const PAUD_PETUGAS = [
  { id: 'paud-1', nama: 'Kepala Seksi PAUD', jabatan: 'Kasi PAUD', urutan: 1 },
  { id: 'paud-2', nama: 'Analis PAUD I', jabatan: 'Staff Kurikulum', urutan: 2 },
  { id: 'paud-3', nama: 'Analis PAUD II', jabatan: 'Staff Sarpras', urutan: 3 },
  { id: 'paud-4', nama: 'Penata Layanan Operasional', jabatan: 'Staff Administrasi', urutan: 4 },
  { id: 'paud-5', nama: 'Pranata Humas', jabatan: 'Staff Humas & Data', urutan: 5 },
]

const PTK_PETUGAS = [
  { id: 'ptk-1', nama: 'Kepala Seksi PTK', jabatan: 'Kasi PTK', urutan: 1 },
  { id: 'ptk-2', nama: 'Analis PTK Pendidik', jabatan: 'Staff Pendidik', urutan: 2 },
  { id: 'ptk-3', nama: 'Analis PTK Tendik', jabatan: 'Staff Tenaga Kependidikan', urutan: 3 },
  { id: 'ptk-4', nama: 'Penata Layanan PTK', jabatan: 'Staff Administrasi PTK', urutan: 4 },
  { id: 'ptk-5', nama: 'Pranata Humas PTK', jabatan: 'Staff Humas & Data PTK', urutan: 5 },
]

const SD_PETUGAS = [
  { id: 'sd-1', nama: 'Kepala Seksi SD', jabatan: 'Kasi Kurikulum SD', urutan: 1 },
  { id: 'sd-2', nama: 'Analis Kurikulum SD', jabatan: 'Staff Kurikulum SD', urutan: 2 },
  { id: 'sd-3', nama: 'Analis Sarpras SD', jabatan: 'Staff Sarpras SD', urutan: 3 },
  { id: 'sd-4', nama: 'Penata Layanan SD', jabatan: 'Staff Administrasi SD', urutan: 4 },
  { id: 'sd-5', nama: 'Pranata Humas SD', jabatan: 'Staff Humas SD', urutan: 5 },
]

const SMP_PETUGAS = [
  { id: 'smp-1', nama: 'Kepala Seksi SMP', jabatan: 'Kasi Kurikulum SMP', urutan: 1 },
  { id: 'smp-2', nama: 'Analis Kurikulum SMP', jabatan: 'Staff Kurikulum SMP', urutan: 2 },
  { id: 'smp-3', nama: 'Analis Sarpras SMP', jabatan: 'Staff Sarpras SMP', urutan: 3 },
  { id: 'smp-4', nama: 'Penata Layanan SMP', jabatan: 'Staff Administrasi SMP', urutan: 4 },
  { id: 'smp-5', nama: 'Pranata Humas SMP', jabatan: 'Staff Humas SMP', urutan: 5 },
]

async function upsertLayanan(item) {
  const existing = await prisma.layanan.findFirst({ where: { name: item.nama } })
  if (existing) {
    return prisma.layanan.update({
      where: { id: existing.id },
      data: { 
        isActive: true,
        description: item.deskripsi,
        icon: item.ikon,
        color: item.warna
      },
    })
  }
  return prisma.layanan.create({
    data: { 
      name: item.nama, 
      description: item.deskripsi, 
      icon: item.ikon,
      color: item.warna,
      isActive: true 
    },
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
    const layanan = await upsertLayanan(item)
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

  const perbidanganSlugs = [
    { slug: 'paud', petugas: PAUD_PETUGAS },
    { slug: 'ptk', petugas: PTK_PETUGAS },
    { slug: 'sd-umum', petugas: SD_PETUGAS },
    { slug: 'smp-umum', petugas: SMP_PETUGAS },
  ]

  for (const item of perbidanganSlugs) {
    const perbidangan = await prisma.perbidangan.findUnique({ where: { slug: item.slug } })
    if (perbidangan) {
      for (const p of item.petugas) {
        await prisma.petugas.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            idPerbidangan: perbidangan.id,
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
  }
  console.log('✅ petugas + kehadiran semua bidang siap')

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
