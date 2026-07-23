const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.reservasi.count()
  console.log("Total DB reservations count =", count)
  
  const all = await prisma.reservasi.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  for (const r of all) {
    console.log(`- ID: ${r.id}, Queue: ${r.queueNumber}, Name: ${r.name}, Service: ${r.service}, Date: ${r.date.toISOString().split('T')[0]}, Status: ${r.status}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
