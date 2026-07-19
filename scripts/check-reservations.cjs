const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  try {
    const rows = await p.reservasi.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        service: true,
        date: true,
        timeSlot: true,
        status: true,
        queueNumber: true,
        idLayanan: true,
      },
    })
    console.log('DB count:', rows.length)
    for (const r of rows) {
      const d = r.date
      console.log({
        queueNumber: r.queueNumber,
        service: r.service,
        idLayanan: r.idLayanan?.toString(),
        timeSlot: r.timeSlot,
        status: r.status,
        dateRaw: d.toISOString(),
        dateLocal: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateUtc: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`,
      })
    }
  } catch (e) {
    console.error('DB ERROR:', e.message)
  }
}

main().finally(() => p.$disconnect())
