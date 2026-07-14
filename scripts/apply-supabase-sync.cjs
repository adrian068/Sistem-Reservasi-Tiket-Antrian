/**
 * Terapkan migrasi Supabase agar selaras dengan web SIMDIK.
 * Jalankan: node scripts/apply-supabase-sync.cjs
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
      msg.includes('already exists') ||
      msg.includes('duplicate key') ||
      msg.includes('duplicate_object')
    ) {
      console.log('SKIP (sudah ada)')
      return
    }
    console.log('GAGAL')
    throw error
  }
}

async function main() {
  console.log('Memulai sinkronisasi Supabase...\n')

  await run('Buat enum RoleType', `
    DO $$
    BEGIN
      CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'USER', 'SUPER_ADMIN', 'ADMIN_PAUD');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await run('Tambah nilai enum SUPER_ADMIN', `
    DO $$
    BEGIN
      ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await run('Tambah nilai enum ADMIN_PAUD', `
    DO $$
    BEGIN
      ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'ADMIN_PAUD';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await run('Konversi kolom peran ke RoleType', `
    DO $$
    DECLARE
      col_type TEXT;
    BEGIN
      SELECT udt_name INTO col_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'penggunas'
        AND column_name = 'peran';

      IF col_type IS NOT NULL AND col_type <> 'RoleType' THEN
        ALTER TABLE "public"."penggunas" ADD COLUMN IF NOT EXISTS "peran_enum" "RoleType";

        UPDATE "public"."penggunas"
        SET "peran_enum" = CASE UPPER(TRIM("peran"::TEXT))
          WHEN 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::"RoleType"
          WHEN 'ADMIN_PAUD' THEN 'ADMIN_PAUD'::"RoleType"
          WHEN 'ADMIN' THEN 'ADMIN'::"RoleType"
          WHEN 'USER' THEN 'USER'::"RoleType"
          ELSE 'USER'::"RoleType"
        END
        WHERE "peran_enum" IS NULL;

        ALTER TABLE "public"."penggunas" DROP COLUMN IF EXISTS "peran";
        ALTER TABLE "public"."penggunas" RENAME COLUMN "peran_enum" TO "peran";
        ALTER TABLE "public"."penggunas" ALTER COLUMN "peran" SET DEFAULT 'ADMIN'::"RoleType";
        ALTER TABLE "public"."penggunas" ALTER COLUMN "peran" SET NOT NULL;
      END IF;
    END $$;
  `)

  await run('Tambah kolom bidang_slug', `
    ALTER TABLE "public"."penggunas"
    ADD COLUMN IF NOT EXISTS "bidang_slug" VARCHAR(180);
  `)

  await run('Index bidang_slug', `
    CREATE INDEX IF NOT EXISTS "penggunas_bidang_slug_idx"
    ON "public"."penggunas"("bidang_slug");
  `)

  await run('Buat tabel reservation_settings', `
    CREATE TABLE IF NOT EXISTS "public"."reservation_settings" (
      "id" INTEGER PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
      "mode" VARCHAR(20) NOT NULL DEFAULT 'auto',
      "pesan_tutup" TEXT,
      "pesan_buka" TEXT,
      "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "diperbarui_oleh" VARCHAR(150)
    );
  `)

  await run('Seed reservation_settings', `
    INSERT INTO "public"."reservation_settings" ("id", "mode", "pesan_tutup", "pesan_buka")
    VALUES (
      1,
      'auto',
      'Reservasi ditutup sementara oleh admin.',
      'Reservasi dibuka oleh admin.'
    )
    ON CONFLICT ("id") DO NOTHING;
  `)

  await run('Buat tabel bidang_presence', `
    CREATE TABLE IF NOT EXISTS "public"."bidang_presence" (
      "slug" VARCHAR(180) PRIMARY KEY,
      "nama" VARCHAR(150) NOT NULL,
      "petugas" JSONB NOT NULL DEFAULT '[]'::JSONB,
      "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await run('Seed bidang_presence PAUD', `
    INSERT INTO "public"."bidang_presence" ("slug", "nama", "petugas")
    SELECT
      'paud',
      'PAUD',
      '[
        {"id":"paud-1","nama":"Kepala Seksi PAUD","jabatan":"Kasi PAUD","hadir":false,"diRuangan":false},
        {"id":"paud-2","nama":"Analis PAUD I","jabatan":"Staff Kurikulum","hadir":false,"diRuangan":false},
        {"id":"paud-3","nama":"Analis PAUD II","jabatan":"Staff Sarpras","hadir":false,"diRuangan":false},
        {"id":"paud-4","nama":"Penata Layanan Operasional","jabatan":"Staff Administrasi","hadir":false,"diRuangan":false},
        {"id":"paud-5","nama":"Pranata Humas","jabatan":"Staff Humas & Data","hadir":false,"diRuangan":false}
      ]'::JSONB
    WHERE NOT EXISTS (SELECT 1 FROM "public"."bidang_presence" WHERE "slug" = 'paud');
  `)

  await run('Seed admin Disdik', `
    INSERT INTO "public"."penggunas" (
      "nama", "email", "password_hash", "peran", "bidang_slug", "dibuat_pada", "diperbarui_pada"
    ) VALUES (
      'Admin Disdik Banjarmasin',
      'disdikbanjarmasin@gmail.com',
      '$2b$10$g9mJFtisgNBXn8nLnGF7CuQ3GfAfZOGMIVedMkVnTyKbZ8vH8LxF.',
      'ADMIN'::"RoleType",
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "nama" = EXCLUDED."nama",
      "password_hash" = EXCLUDED."password_hash",
      "peran" = EXCLUDED."peran",
      "diperbarui_pada" = NOW();
  `)

  await run('Seed super admin', `
    INSERT INTO "public"."penggunas" (
      "nama", "email", "password_hash", "peran", "bidang_slug", "dibuat_pada", "diperbarui_pada"
    ) VALUES (
      'Super Admin SIREDI',
      'silent12@gmail.com',
      '$2b$10$viTHEr33ThmdTIciwwIB2OWuhboPTQAogE21FIYxuoW95BkvXV5x6',
      'SUPER_ADMIN'::"RoleType",
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "nama" = EXCLUDED."nama",
      "password_hash" = EXCLUDED."password_hash",
      "peran" = 'SUPER_ADMIN'::"RoleType",
      "diperbarui_pada" = NOW();
  `)

  await run('Seed admin PAUD', `
    INSERT INTO "public"."penggunas" (
      "nama", "email", "password_hash", "peran", "bidang_slug", "dibuat_pada", "diperbarui_pada"
    ) VALUES (
      'Admin PAUD',
      'revan123@siredi.local',
      '$2b$10$aS.1P8bdFdCBdcTLwfYjf.Lsqn1ZTVqM98K/7pXzAS5JkkNFsWfre',
      'ADMIN_PAUD'::"RoleType",
      'paud',
      NOW(),
      NOW()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "nama" = EXCLUDED."nama",
      "password_hash" = EXCLUDED."password_hash",
      "peran" = 'ADMIN_PAUD'::"RoleType",
      "bidang_slug" = 'paud',
      "diperbarui_pada" = NOW();
  `)

  await run('Hapus trigger beritas bermasalah', `
    DROP TRIGGER IF EXISTS beritas_updated_at_trigger ON beritas;
  `)

  await run('Hapus function beritas bermasalah', `
    DROP FUNCTION IF EXISTS update_beritas_updated_at();
  `)

  const users = await prisma.$queryRaw`
    SELECT email, peran::TEXT AS peran, bidang_slug
    FROM penggunas
    ORDER BY id_penggunas
  `

  console.log('\n=== Akun pengguna ===')
  for (const u of users) {
    console.log(`  ${u.email} | ${u.peran}${u.bidang_slug ? ` | bidang=${u.bidang_slug}` : ''}`)
  }

  console.log('\n✅ Supabase sync selesai.')
}

main()
  .catch((e) => {
    console.error('\nFATAL:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
