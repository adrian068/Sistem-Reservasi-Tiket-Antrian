"use client"

import { ReservationGateSettings } from "@/components/admin/reservation-gate-settings"
import { BidangCapacityPanel } from "@/components/admin/bidang-capacity-panel"

type ReservationTimeSettingsProps = {
  /** Hanya satu bidang (admin PAUD) */
  slugOnly?: string
  onCapacityUpdated?: () => void
  showGate?: boolean
}

/** Pengaturan buka/tutup reservasi + kapasitas slot per bidang */
export function ReservationTimeSettings({
  slugOnly,
  onCapacityUpdated,
  showGate = true,
}: ReservationTimeSettingsProps) {
  return (
    <div className="space-y-6">
      {showGate && (
        <div>
          <h3 className="text-base font-semibold mb-3">Status Buka/Tutup Reservasi Publik</h3>
          <ReservationGateSettings />
        </div>
      )}
      <div>
        {!slugOnly && (
          <h3 className="text-base font-semibold mb-3">
            Kapasitas Slot per Bidang
          </h3>
        )}
        <BidangCapacityPanel
          slugOnly={slugOnly}
          onUpdated={onCapacityUpdated}
          className={slugOnly ? "border-orange-200/60 dark:border-orange-900/40" : undefined}
        />
      </div>
    </div>
  )
}
