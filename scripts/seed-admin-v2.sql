-- COMPREHENSIVE SOLUTION: Check, Fix, and Seed Admin User
-- Run this script step by step

-- ====================
-- STEP 1: CHECK CURRENT TABLE STRUCTURE
-- ====================
SELECT '=== CURRENT TABLE STRUCTURE ===' as step;

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'penggunas'
ORDER BY ordinal_position;

-- ====================
-- STEP 2: ADD MISSING COLUMNS (IF NEEDED)
-- ====================
SELECT '=== ADDING MISSING COLUMNS ===' as step;

-- Add nama
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'nama') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "nama" VARCHAR(100);
    RAISE NOTICE '✅ Added: nama';
  ELSE RAISE NOTICE '✓ Column exists: nama';
  END IF;
END $$;

-- Add email
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'email') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "email" VARCHAR(150) UNIQUE;
    RAISE NOTICE '✅ Added: email';
  ELSE RAISE NOTICE '✓ Column exists: email';
  END IF;
END $$;

-- Add password_hash
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'password_hash') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "password_hash" VARCHAR(255);
    RAISE NOTICE '✅ Added: password_hash';
  ELSE RAISE NOTICE '✓ Column exists: password_hash';
  END IF;
END $$;

-- Add peran
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'peran') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "peran" VARCHAR(20) DEFAULT 'ADMIN';
    RAISE NOTICE '✅ Added: peran';
  ELSE RAISE NOTICE '✓ Column exists: peran';
  END IF;
END $$;

-- Add dibuat_pada
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'dibuat_pada') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "dibuat_pada" TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added: dibuat_pada';
  ELSE RAISE NOTICE '✓ Column exists: dibuat_pada';
  END IF;
END $$;

-- Add diperbarui_pada
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penggunas' AND column_name = 'diperbarui_pada') THEN
    ALTER TABLE "public"."penggunas" ADD COLUMN "diperbarui_pada" TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added: diperbarui_pada';
  ELSE RAISE NOTICE '✓ Column exists: diperbarui_pada';
  END IF;
END $$;

-- ====================
-- STEP 3: INSERT ADMIN USER
-- ====================
SELECT '=== INSERTING ADMIN USER ===' as step;

INSERT INTO "public"."penggunas" (
  nama,
  email,
  password_hash,
  peran,
  dibuat_pada,
  diperbarui_pada
) VALUES (
  'Admin Disdik Banjarmasin',
  'disdikbanjarmasin@gmail.com',
  '$2b$10$g9mJFtisgNBXn8nLnGF7CuQ3GfAfZOGMIVedMkVnTyKbZ8vH8LxF.',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nama = EXCLUDED.nama,
  password_hash = EXCLUDED.password_hash,
  peran = EXCLUDED.peran,
  diperbarui_pada = NOW();

-- ====================
-- STEP 4: VERIFY RESULT
-- ====================
SELECT '=== VERIFICATION ===' as step;

SELECT 
  id_penggunas,
  nama,
  email,
  peran,
  bidang_slug,
  dibuat_pada
FROM "public"."penggunas"
WHERE email = 'disdikbanjarmasin@gmail.com';

SELECT '=== ✅ DONE! ===' as result;



