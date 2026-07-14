/**
 * Rebuild Supabase: hapus tabel legacy SIMDIK, buat 12 tabel SIREDI reservasi.
 * Jalankan: node scripts/supabase-rebuild-siredi.cjs
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function run(label, sql) {
  process.stdout.write(`→ ${label}... `)
  try {
    await prisma.$executeRawUnsafe(sql)
    console.log('OK')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (
      msg.includes('does not exist') ||
      msg.includes('already exists') ||
      msg.includes('duplicate key')
    ) {
      console.log('SKIP')
      return
    }
    console.log('GAGAL')
    throw error
  }
}

async function main() {
  console.log('=== Rebuild database SIREDI (hapus legacy, buat 12 tabel) ===\n')

  // --- HAPUS TABEL LEGACY ---
  const legacyTables = [
    'agendas',
    'beritas',
    'sekolahs',
    'tentang_simdik',
    'bidang_presence',
  ]

  for (const table of legacyTables) {
    await run(`Drop legacy ${table}`, `DROP TABLE IF EXISTS "public"."${table}" CASCADE;`)
  }

  // Hapus enum legacy
  await run('Drop enum Status (agenda)', `DROP TYPE IF EXISTS "Status" CASCADE;`)
  await run('Drop enum NewsCategory', `DROP TYPE IF EXISTS "NewsCategory" CASCADE;`)
  await run('Drop enum NewsStatus', `DROP TYPE IF EXISTS "NewsStatus" CASCADE;`)

  // --- PERBAIKI TABEL YANG DIPERTAHANKAN ---
  await run('Hapus kolom orphan created_at penggunas', `
    ALTER TABLE "public"."penggunas" DROP COLUMN IF EXISTS "created_at";
  `)

  await run('Perlebar nomor_antrian', `
    ALTER TABLE "public"."reservations"
    ALTER COLUMN "nomor_antrian" TYPE VARCHAR(50);
  `)

  // --- TABEL BARU ---
  await run('Buat layanan_perbidangans', `
    CREATE TABLE IF NOT EXISTS "public"."layanan_perbidangans" (
      "id_layanans" BIGINT NOT NULL,
      "id_perbidangans" BIGINT NOT NULL,
      PRIMARY KEY ("id_layanans", "id_perbidangans"),
      CONSTRAINT "layanan_perbidangans_layanan_fkey"
        FOREIGN KEY ("id_layanans") REFERENCES "public"."layanans"("id_layanans") ON DELETE CASCADE,
      CONSTRAINT "layanan_perbidangans_perbidangan_fkey"
        FOREIGN KEY ("id_perbidangans") REFERENCES "public"."perbidangans"("id_perbidangans") ON DELETE CASCADE
    );
  `)

  await run('Buat petugas table', `
    CREATE TABLE IF NOT EXISTS "public"."petugas" (
      "id_petugas" TEXT PRIMARY KEY,
      "id_perbidangans" BIGINT NOT NULL,
      "nama" VARCHAR(150) NOT NULL,
      "jabatan" VARCHAR(150) NOT NULL,
      "urutan" INTEGER NOT NULL DEFAULT 0,
      "aktif" BOOLEAN NOT NULL DEFAULT TRUE,
      "dibuat_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "petugas_perbidangan_fkey"
        FOREIGN KEY ("id_perbidangans") REFERENCES "public"."perbidangans"("id_perbidangans") ON DELETE CASCADE
    );
  `)

  await run('Index petugas', `
    CREATE INDEX IF NOT EXISTS "petugas_perbidangan_idx" ON "public"."petugas"("id_perbidangans");
  `)

  await run('Buat kehadiran_petugas', `
    CREATE TABLE IF NOT EXISTS "public"."kehadiran_petugas" (
      "id_petugas" TEXT PRIMARY KEY,
      "hadir" BOOLEAN NOT NULL DEFAULT FALSE,
      "di_ruangan" BOOLEAN NOT NULL DEFAULT FALSE,
      "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "kehadiran_petugas_fkey"
        FOREIGN KEY ("id_petugas") REFERENCES "public"."petugas"("id_petugas") ON DELETE CASCADE
    );
  `)

  await run('Buat jadwal_operasional', `
    CREATE TABLE IF NOT EXISTS "public"."jadwal_operasional" (
      "id_jadwal" BIGSERIAL PRIMARY KEY,
      "hari" INTEGER NOT NULL UNIQUE,
      "jam_buka" VARCHAR(5) NOT NULL,
      "jam_tutup" VARCHAR(5) NOT NULL,
      "aktif" BOOLEAN NOT NULL DEFAULT TRUE,
      "keterangan" VARCHAR(255)
    );
  `)

  await run('Buat slot_waktu table', `
    CREATE TABLE IF NOT EXISTS "public"."slot_waktu" (
      "id_slot" BIGSERIAL PRIMARY KEY,
      "kode" VARCHAR(50) NOT NULL UNIQUE,
      "label" VARCHAR(100) NOT NULL,
      "kapasitas" INTEGER NOT NULL DEFAULT 1,
      "kategori_durasi" VARCHAR(20) NOT NULL,
      "menit_durasi" INTEGER NOT NULL,
      "urutan" INTEGER NOT NULL DEFAULT 0,
      "aktif" BOOLEAN NOT NULL DEFAULT TRUE
    );
  `)

  await run('Index slot_waktu aktif', `
    CREATE INDEX IF NOT EXISTS "slot_waktu_aktif_idx" ON "public"."slot_waktu"("aktif");
  `)

  await run('Index slot_waktu urutan', `
    CREATE INDEX IF NOT EXISTS "slot_waktu_urutan_idx" ON "public"."slot_waktu"("urutan");
  `)

  await run('Buat log_reservasi table', `
    CREATE TABLE IF NOT EXISTS "public"."log_reservasi" (
      "id_log" BIGSERIAL PRIMARY KEY,
      "id_reservations" TEXT NOT NULL,
      "status_lama" "ReservationStatus",
      "status_baru" "ReservationStatus" NOT NULL,
      "catatan" TEXT,
      "diubah_oleh" VARCHAR(150),
      "dibuat_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "log_reservasi_reservation_fkey"
        FOREIGN KEY ("id_reservations") REFERENCES "public"."reservations"("id_reservations") ON DELETE CASCADE
    );
  `)

  await run('Index log_reservasi reservation', `
    CREATE INDEX IF NOT EXISTS "log_reservasi_reservation_idx" ON "public"."log_reservasi"("id_reservations");
  `)

  await run('Index log_reservasi dibuat', `
    CREATE INDEX IF NOT EXISTS "log_reservasi_dibuat_idx" ON "public"."log_reservasi"("dibuat_pada");
  `)

  // --- SEED DATA ---
  await run('Seed perbidangan ptk', `
    INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
    SELECT 'PTK (Pendidik dan Tenaga Kependidikan)', 'ptk', 'Layanan PTK', 'users', 'blue', 1, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'ptk');
  `)

  await run('Seed perbidangan sd-umum', `
    INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
    SELECT 'SD Umum', 'sd-umum', 'Layanan SD', 'school', 'green', 2, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'sd-umum');
  `)

  await run('Seed perbidangan smp-umum', `
    INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
    SELECT 'SMP Umum', 'smp-umum', 'Layanan SMP', 'graduation-cap', 'purple', 3, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'smp-umum');
  `)

  await run('Seed perbidangan paud', `
    INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
    SELECT 'PAUD', 'paud', 'Layanan PAUD', 'baby', 'orange', 4, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'paud');
  `)

  await run('Seed layanan_perbidangans', `
    INSERT INTO "public"."layanan_perbidangans" ("id_layanans", "id_perbidangans")
    SELECT l."id_layanans", p."id_perbidangans"
    FROM "public"."layanans" l
    JOIN "public"."perbidangans" p ON (
      (l."nama" LIKE 'PTK%' AND p."slug" = 'ptk') OR
      (l."nama" = 'SD Umum' AND p."slug" = 'sd-umum') OR
      (l."nama" = 'SMP Umum' AND p."slug" = 'smp-umum') OR
      (l."nama" = 'PAUD' AND p."slug" = 'paud')
    )
    ON CONFLICT DO NOTHING;
  `)

  await run('Seed jadwal_operasional', `
    INSERT INTO "public"."jadwal_operasional" ("hari", "jam_buka", "jam_tutup", "aktif", "keterangan") VALUES
      (1, '08:00', '16:00', TRUE, 'Senin'),
      (2, '08:00', '16:00', TRUE, 'Selasa'),
      (3, '08:00', '16:00', TRUE, 'Rabu'),
      (4, '08:00', '16:00', TRUE, 'Kamis'),
      (5, '08:00', '10:00', TRUE, 'Jumat'),
      (0, '00:00', '00:00', FALSE, 'Minggu — tutup'),
      (6, '00:00', '00:00', FALSE, 'Sabtu — tutup')
    ON CONFLICT ("hari") DO UPDATE SET
      "jam_buka" = EXCLUDED."jam_buka",
      "jam_tutup" = EXCLUDED."jam_tutup",
      "aktif" = EXCLUDED."aktif",
      "keterangan" = EXCLUDED."keterangan";
  `)

  await run('Seed petugas PAUD', `
    INSERT INTO "public"."petugas" ("id_petugas", "id_perbidangans", "nama", "jabatan", "urutan")
    SELECT v.id, p."id_perbidangans", v.nama, v.jabatan, v.urutan
    FROM "public"."perbidangans" p
    CROSS JOIN (VALUES
      ('paud-1', 'Kepala Seksi PAUD', 'Kasi PAUD', 1),
      ('paud-2', 'Analis PAUD I', 'Staff Kurikulum', 2),
      ('paud-3', 'Analis PAUD II', 'Staff Sarpras', 3),
      ('paud-4', 'Penata Layanan Operasional', 'Staff Administrasi', 4),
      ('paud-5', 'Pranata Humas', 'Staff Humas & Data', 5)
    ) AS v(id, nama, jabatan, urutan)
    WHERE p."slug" = 'paud'
    ON CONFLICT ("id_petugas") DO NOTHING;
  `)

  await run('Seed kehadiran_petugas', `
    INSERT INTO "public"."kehadiran_petugas" ("id_petugas", "hadir", "di_ruangan")
    SELECT "id_petugas", FALSE, FALSE FROM "public"."petugas"
    ON CONFLICT ("id_petugas") DO NOTHING;
  `)

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
    ORDER BY table_name
  `

  console.log('\n=== Tabel aktif di Supabase ===')
  for (const row of tables) {
    console.log(`  • ${row.table_name}`)
  }
  console.log(`\nTotal: ${tables.length} tabel`)
  console.log('\n✅ Rebuild selesai.')
}

main()
  .catch((e) => {
    console.error('\nFATAL:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
