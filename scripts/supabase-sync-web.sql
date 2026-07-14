-- ============================================================
-- SUPABASE SYNC — selaraskan database dengan web SIMDIK terbaru
-- Jalankan di Supabase SQL Editor ATAU: node scripts/apply-supabase-sync.cjs
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- 1) ENUM RoleType (Prisma membutuhkan tipe ini; DB lama pakai VARCHAR)
DO $$
BEGIN
  CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'USER', 'SUPER_ADMIN', 'ADMIN_PAUD');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'ADMIN_PAUD';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Konversi kolom peran VARCHAR -> RoleType
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

    RAISE NOTICE '✅ Kolom peran dikonversi ke RoleType';
  ELSE
    RAISE NOTICE '✓ Kolom peran sudah RoleType';
  END IF;
END $$;

-- 3) Kolom bidang_slug untuk admin bidang (PAUD, dll.)
ALTER TABLE "public"."penggunas"
ADD COLUMN IF NOT EXISTS "bidang_slug" VARCHAR(180);

CREATE INDEX IF NOT EXISTS "penggunas_bidang_slug_idx"
ON "public"."penggunas"("bidang_slug");

-- 4) Tabel perbidangans (jika belum ada)
CREATE TABLE IF NOT EXISTS "public"."perbidangans" (
  "id_perbidangans" BIGSERIAL PRIMARY KEY,
  "nama" VARCHAR(150) NOT NULL,
  "slug" VARCHAR(180) NOT NULL UNIQUE,
  "deskripsi" TEXT,
  "ikon" VARCHAR(100),
  "warna" VARCHAR(50),
  "urutan" INTEGER NOT NULL DEFAULT 0,
  "aktif" BOOLEAN NOT NULL DEFAULT TRUE,
  "dibuat_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
SELECT 'PTK (Pendidik dan Tenaga Kependidikan)', 'ptk', 'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan', 'users', 'blue', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'ptk');

INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
SELECT 'SD Umum', 'sd-umum', 'Layanan untuk Sekolah Dasar', 'school', 'green', 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'sd-umum');

INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
SELECT 'SMP Umum', 'smp-umum', 'Layanan untuk Sekolah Menengah Pertama', 'graduation-cap', 'purple', 3, TRUE
WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'smp-umum');

INSERT INTO "public"."perbidangans" ("nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif")
SELECT 'PAUD', 'paud', 'Layanan untuk Pendidikan Anak Usia Dini', 'baby', 'orange', 4, TRUE
WHERE NOT EXISTS (SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'paud');

-- 5) Pengaturan reservasi (singleton id=1)
CREATE TABLE IF NOT EXISTS "public"."reservation_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
  "mode" VARCHAR(20) NOT NULL DEFAULT 'auto',
  "pesan_tutup" TEXT,
  "pesan_buka" TEXT,
  "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "diperbarui_oleh" VARCHAR(150)
);

INSERT INTO "public"."reservation_settings" ("id", "mode", "pesan_tutup", "pesan_buka")
VALUES (
  1,
  'auto',
  'Reservasi ditutup sementara oleh admin.',
  'Reservasi dibuka oleh admin.'
)
ON CONFLICT ("id") DO NOTHING;

-- 6) Kehadiran petugas bidang (JSON snapshot per bidang)
CREATE TABLE IF NOT EXISTS "public"."bidang_presence" (
  "slug" VARCHAR(180) PRIMARY KEY,
  "nama" VARCHAR(150) NOT NULL,
  "petugas" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "diperbarui_pada" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 7) Pastikan kolom reservations lengkap
ALTER TABLE "public"."reservations"
ADD COLUMN IF NOT EXISTS "id_layanans" BIGINT;

ALTER TABLE "public"."reservations"
ADD COLUMN IF NOT EXISTS "nik" VARCHAR(20);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reservations_id_layanans_fkey'
  ) THEN
    ALTER TABLE "public"."reservations"
    ADD CONSTRAINT "reservations_id_layanans_fkey"
    FOREIGN KEY ("id_layanans")
    REFERENCES "public"."layanans"("id_layanans")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 8) Seed akun admin
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

-- 9) Seed layanan (nama kolom Indonesia)
INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'PTK (Pendidik dan Tenaga Kependidikan)', 'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan', 'Users', 'bg-blue-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'PTK (Pendidik dan Tenaga Kependidikan)');

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'SD Umum', 'Layanan untuk Sekolah Dasar', 'School', 'bg-green-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'SD Umum');

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'SMP Umum', 'Layanan untuk Sekolah Menengah Pertama', 'GraduationCap', 'bg-purple-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'SMP Umum');

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'PAUD', 'Layanan untuk Pendidikan Anak Usia Dini', 'Baby', 'bg-orange-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'PAUD');

-- 10) Hapus trigger beritas yang salah (jika masih ada)
DROP TRIGGER IF EXISTS beritas_updated_at_trigger ON beritas;
DROP FUNCTION IF EXISTS update_beritas_updated_at();

-- 11) Verifikasi
SELECT 'penggunas' AS tabel, "email", "peran"::TEXT, "bidang_slug"
FROM "public"."penggunas"
ORDER BY "id_penggunas";

SELECT 'reservation_settings' AS tabel, *
FROM "public"."reservation_settings";

SELECT 'bidang_presence' AS tabel, "slug", "nama", jsonb_array_length("petugas") AS jumlah_petugas
FROM "public"."bidang_presence";
