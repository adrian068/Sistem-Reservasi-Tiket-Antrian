-- Seed akun Admin PAUD — jalankan di Supabase SQL Editor
-- Login: revan123 / revan123

INSERT INTO "public"."penggunas" (
  "nama", "email", "password_hash", "peran", "bidang_slug", "dibuat_pada", "diperbarui_pada"
)
SELECT
  'Admin PAUD',
  'revan123@siredi.local',
  '$2b$10$aS.1P8bdFdCBdcTLwfYjf.Lsqn1ZTVqM98K/7pXzAS5JkkNFsWfre',
  'ADMIN_PAUD'::"RoleType",
  'paud',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."penggunas" WHERE LOWER("email") = 'revan123@siredi.local'
);
