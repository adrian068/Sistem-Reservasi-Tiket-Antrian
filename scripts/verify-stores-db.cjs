const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.reservationSetting.findUnique({ where: { id: 1 } })
  console.log('reservation_settings:', settings)

  const paud = await prisma.bidangPresenceSnapshot.findUnique({ where: { slug: 'paud' } })
  console.log('bidang_presence paud:', {
    slug: paud?.slug,
    nama: paud?.nama,
    petugasCount: Array.isArray(paud?.petugas) ? paud.petugas.length : 0,
  })
}

main()
  .catch((e) => {
    console.error('ERR:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
