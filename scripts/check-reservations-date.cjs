const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const target = '2026-07-17'
  const rows = await p.reservasi.findMany({
    where: {
      date: new Date(`${target}T00:00:00.000Z`),
    },
    select: {
      queueNumber: true,
      service: true,
      timeSlot: true,
      status: true,
      date: true,
    },
  })
  console.log(`Reservations for ${target}:`, rows.length)
  console.log(JSON.stringify(rows, null, 2))

  const allToday = await p.reservasi.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { queueNumber: true, service: true, date: true, timeSlot: true, status: true, createdAt: true },
  })
  console.log('\nLatest 3:')
  for (const r of allToday) {
    console.log(r.queueNumber, r.service, r.date.toISOString().slice(0, 10), r.timeSlot, r.status)
  }
}

main().catch(console.error).finally(() => p.$disconnect())
