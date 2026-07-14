-- SQL Script untuk membuat table perbidangans di Supabase
-- Jalankan di Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLE
-- ============================================
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

-- ============================================
-- 2. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS "perbidangans_nama_idx"
ON "public"."perbidangans"("nama");

CREATE INDEX IF NOT EXISTS "perbidangans_aktif_idx"
ON "public"."perbidangans"("aktif");

CREATE INDEX IF NOT EXISTS "perbidangans_urutan_idx"
ON "public"."perbidangans"("urutan");

-- ============================================
-- 3. UPDATE TRIGGER FOR diperbarui_pada
-- ============================================
CREATE OR REPLACE FUNCTION "public"."update_perbidangans_diperbarui_pada"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.diperbarui_pada = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trigger_update_perbidangans_diperbarui_pada"
ON "public"."perbidangans";

CREATE TRIGGER "trigger_update_perbidangans_diperbarui_pada"
BEFORE UPDATE ON "public"."perbidangans"
FOR EACH ROW
EXECUTE FUNCTION "public"."update_perbidangans_diperbarui_pada"();

-- ============================================
-- 4. SEED DATA AWAL (OPSIONAL)
-- ============================================
INSERT INTO "public"."perbidangans" (
  "nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif"
)
SELECT
  'PTK (Pendidik dan Tenaga Kependidikan)',
  'ptk',
  'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan',
  'users',
  'blue',
  1,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'ptk'
);

INSERT INTO "public"."perbidangans" (
  "nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif"
)
SELECT
  'SD Umum',
  'sd-umum',
  'Layanan untuk Sekolah Dasar',
  'school',
  'green',
  2,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'sd-umum'
);

INSERT INTO "public"."perbidangans" (
  "nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif"
)
SELECT
  'SMP Umum',
  'smp-umum',
  'Layanan untuk Sekolah Menengah Pertama',
  'graduation-cap',
  'purple',
  3,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'smp-umum'
);

INSERT INTO "public"."perbidangans" (
  "nama", "slug", "deskripsi", "ikon", "warna", "urutan", "aktif"
)
SELECT
  'PAUD',
  'paud',
  'Layanan untuk Pendidikan Anak Usia Dini',
  'baby',
  'orange',
  4,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."perbidangans" WHERE "slug" = 'paud'
);

-- ============================================
-- 5. VERIFIKASI
-- ============================================
SELECT
  "id_perbidangans",
  "nama",
  "slug",
  "aktif",
  "urutan",
  "dibuat_pada",
  "diperbarui_pada"
FROM "public"."perbidangans"
ORDER BY "urutan" ASC, "id_perbidangans" ASC;
