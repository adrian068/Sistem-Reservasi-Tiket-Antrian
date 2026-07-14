import {
  Calendar,
  Crown,
  LayoutDashboard,
  Settings,
  Shield,
  UserCog,
  type LucideIcon,
} from "lucide-react"

export type SuperAdminCapability = {
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  actions: string[]
}

/** Daftar wewenang & modul yang dapat diatur Super Admin. */
export const SUPER_ADMIN_CAPABILITIES: SuperAdminCapability[] = [
  {
    id: "admins",
    title: "Kelola Admin",
    description: "Membuat admin loket & admin bidang, mengubah penugasan bidang.",
    href: "/admin/super/admins",
    icon: UserCog,
    actions: [
      "Buat admin loket (operasional harian)",
      "Buat admin bidang PAUD, SD, SMP, PTK",
      "Ubah nama & penugasan bidang admin",
      "Lihat daftar semua admin",
    ],
  },
  {
    id: "reservations",
    title: "Data Reservasi",
    description: "Melihat seluruh antrian dan detail reservasi masyarakat.",
    href: "/admin/super/reservasi",
    icon: Calendar,
    actions: [
      "Lihat semua data reservasi (tiket, nama, jadwal)",
      "Filter status & layanan",
      "Cari berdasarkan nama atau nomor antrian",
      "Detail lengkap setiap reservasi",
    ],
  },
  {
    id: "gate",
    title: "Buka / Tutup Reservasi",
    description: "Mengatur apakah publik boleh mengisi formulir reservasi.",
    href: "/admin/super/reservasi#pengaturan",
    icon: Settings,
    actions: [
      "Mode otomatis (sesuai jam operasional)",
      "Paksa buka reservasi",
      "Paksa tutup reservasi + pesan kustom",
    ],
  },
  {
    id: "admin-panel",
    title: "Panel Admin Biasa",
    description: "Masuk ke tampilan admin untuk operasional (panggil antrian, edit).",
    href: "/admin/reservasi",
    icon: LayoutDashboard,
    actions: [
      "Panggil antrian per layanan",
      "Edit & hapus reservasi",
      "Tampilan monitor antrian",
    ],
  },
  {
    id: "security",
    title: "Keamanan & Akses",
    description: "Hak akses tertinggi hanya untuk Super Admin.",
    href: "/admin/super/dashboard",
    icon: Shield,
    actions: [
      "Satu-satunya role yang bisa buat admin",
      "Akses Pusat Kendali Super Admin",
      "Beralih antara panel Super dan Admin",
    ],
  },
]
