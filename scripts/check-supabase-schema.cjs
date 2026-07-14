const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`

  console.log('=== TABLES ===')
  for (const row of tables) console.log(' -', row.table_name)

  async function cols(table) {
    return prisma.$queryRaw`
      SELECT column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position`
  }

  for (const table of [
    'penggunas',
    'reservations',
    'layanans',
    'perbidangans',
    'layanan_perbidangans',
    'reservation_settings',
    'petugas',
    'kehadiran_petugas',
    'jadwal_operasional',
    'slot_waktu',
    'log_reservasi',
    'otp_resets',
  ]) {
    console.log(`\n=== ${table.toUpperCase()} ===`)
    try {
      const c = await cols(table)
      if (c.length === 0) console.log('  (table not found)')
      else c.forEach((r) => console.log(`  ${r.column_name} | ${r.data_type} | ${r.udt_name}`))
    } catch (e) {
      console.log('  ERROR:', e.message)
    }
  }

  const enums = await prisma.$queryRaw`
    SELECT t.typname as enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname`

  console.log('\n=== ENUMS ===')
  for (const row of enums) console.log(` ${row.enum_name}:`, row.values)
}

main()
  .catch((e) => {
    console.error('FATAL:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
