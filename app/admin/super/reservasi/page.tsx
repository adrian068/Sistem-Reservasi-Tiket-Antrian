"use client"

import { SuperAdminShell } from "@/components/super-admin-shell"
import { ReservationsDataPanel } from "@/components/super-admin/reservations-data-panel"

export default function SuperAdminReservasiPage() {
  return (
    <SuperAdminShell
      title="Data Reservasi"
      subtitle="Lihat dan kelola seluruh data reservasi SIREDI"
    >
      <ReservationsDataPanel />
    </SuperAdminShell>
  )
}
