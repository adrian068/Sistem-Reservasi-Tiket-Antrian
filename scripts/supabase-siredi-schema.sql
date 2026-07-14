-- ============================================================
-- SCHEMA SIREDI RESERVASI — 12 tabel aktif di Supabase
-- Jalankan rebuild otomatis: npm run db:supabase-rebuild
-- ============================================================
--
-- TABEL YANG DIHAPUS (legacy SIMDIK, tidak dipakai web SIREDI):
--   agendas, beritas, sekolahs, tentang_simdik, bidang_presence
--
-- 12 TABEL AKTIF:
--   1. penggunas              — akun admin & user
--   2. layanans               — layanan reservasi (PTK, SD, SMP, PAUD)
--   3. perbidangans           — master bidang dinas
--   4. layanan_perbidangans   — relasi layanan ↔ bidang
--   5. reservations           — data reservasi antrian
--   6. reservation_settings   — pengaturan buka/tutup reservasi
--   7. petugas                — daftar petugas per bidang
--   8. kehadiran_petugas      — status hadir / di ruangan
--   9. otp_resets             — reset password
--  10. jadwal_operasional     — jam operasional per hari
--  11. slot_waktu              — template slot waktu (opsional)
--  12. log_reservasi          — riwayat perubahan status reservasi
--
-- ENUM AKTIF:
--   RoleType, ReservationStatus
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE '_prisma%'
ORDER BY table_name;
