const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(
    'DROP TRIGGER IF EXISTS beritas_updated_at_trigger ON beritas',
  )
  await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS update_beritas_updated_at()')

  const users = await prisma.$queryRaw`
    SELECT email, peran::TEXT AS peran, bidang_slug
    FROM penggunas
    ORDER BY id_penggunas
  `
  console.log('Users:', users)

  const created = await prisma.pengguna.create({
    data: {
      nama: 'Test',
      email: 'test-role@test.local',
      passwordHash: 'x',
      peran: 'SUPER_ADMIN',
    },
  })
  await prisma.pengguna.delete({ where: { id: created.id } })
  console.log('SUPER_ADMIN insert: OK')
}

main()
  .catch((e) => {
    console.error('ERR:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
