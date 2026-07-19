const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const layanans = await p.layanan.findMany({ orderBy: { id: 'asc' } })
  console.log('Layanans in DB:')
  for (const l of layanans) {
    console.log({ id: l.id.toString(), name: l.name })
  }

  const target = '2026-07-15'
  const ptk = await p.reservasi.findMany({
    where: { date: new Date(`${target}T00:00:00.000Z`), service: { contains: 'PTK', mode: 'insensitive' } },
    select: { queueNumber: true, timeSlot: true, status: true, idLayanan: true },
  })
  console.log(`\nPTK on ${target}:`, ptk.length, ptk)
}

main().catch(console.error).finally(() => p.$disconnect())
