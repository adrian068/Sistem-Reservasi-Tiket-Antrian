require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  await prisma.$queryRaw`SELECT 1`
  const count = await prisma.pengguna.count()
  console.log("OK: connected, penggunas count =", count)
}

main()
  .catch((e) => {
    console.error("FAIL:", e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
