-- Seed layanans (kolom Indonesia — selaras dengan Prisma schema)
INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'PTK (Pendidik dan Tenaga Kependidikan)', 'Layanan untuk guru, kepala sekolah, dan tenaga kependidikan', 'Users', 'bg-blue-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."layanans" WHERE "nama" = 'PTK (Pendidik dan Tenaga Kependidikan)'
);

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'SD Umum', 'Layanan untuk Sekolah Dasar', 'School', 'bg-green-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'SD Umum');

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'SMP Umum', 'Layanan untuk Sekolah Menengah Pertama', 'GraduationCap', 'bg-purple-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'SMP Umum');

INSERT INTO "public"."layanans" ("nama", "deskripsi", "ikon", "warna", "aktif", "dibuat_pada", "diperbarui_pada")
SELECT 'PAUD', 'Layanan untuk Pendidikan Anak Usia Dini', 'Baby', 'bg-orange-500', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."layanans" WHERE "nama" = 'PAUD');

SELECT "id_layanans", "nama", "aktif" FROM "public"."layanans" ORDER BY "id_layanans";
