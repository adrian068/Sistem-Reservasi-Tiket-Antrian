import 'server-only'

import type { BidangReservationRow, BidangSlotRow } from './bidang-admin-service'
import {
  getBidangDashboardData,
  listBidangReservationsForDate,
  updateBidangReservationStatus,
} from './bidang-admin-service'

export type PaudReservationRow = BidangReservationRow
export type PaudSlotRow = BidangSlotRow

export async function listPaudReservationsForDate(dateYmd: string) {
  return listBidangReservationsForDate('paud', dateYmd)
}

export async function getPaudDashboardData(dateYmd?: string) {
  return getBidangDashboardData('paud', dateYmd)
}

export async function updatePaudReservationStatus(
  id: string,
  status: 'WAITING' | 'CALLED' | 'COMPLETED' | 'CANCELLED',
) {
  return updateBidangReservationStatus('paud', id, status)
}
