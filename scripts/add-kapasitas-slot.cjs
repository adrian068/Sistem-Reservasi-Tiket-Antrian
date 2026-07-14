/**
 * Tambah kapasitas_slot per bidang + default PAUD = 5
 * Jalankan: node scripts/add-kapasitas-slot.cjs
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."perbidangans"
    ADD COLUMN IF NOT EXISTS "kapasitas_slot" INTEGER;
  `)

  await prisma.$executeRawUnsafe(`
    UPDATE "public"."perbidangans"
    SET "kapasitas_slot" = 5
    WHERE "slug" = 'paud' AND ("kapasitas_slot" IS NULL OR "kapasitas_slot" < 1);
  `)

  const rows = await prisma.$queryRaw`
    SELECT slug, kapasitas_slot FROM perbidangans ORDER BY urutan
  `
  console.log('perbidangans kapasitas_slot:', rows)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
