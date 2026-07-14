import { checkReservationStatus, type ReservationStatus } from './reservation-hours'
import type { ReservationSettings } from './reservation-settings-store'

export type PublicReservationStatus = ReservationStatus & {
  mode: ReservationSettings['mode']
  source: 'schedule' | 'admin'
}

export function resolveReservationStatus(
  settings: ReservationSettings,
): PublicReservationStatus {
  if (settings.mode === 'open') {
    return {
      mode: 'open',
      source: 'admin',
      isOpen: true,
      message: settings.pesanBuka || 'Reservasi dibuka oleh admin.',
    }
  }

  if (settings.mode === 'closed') {
    return {
      mode: 'closed',
      source: 'admin',
      isOpen: false,
      message: settings.pesanTutup || 'Reservasi ditutup sementara oleh admin.',
    }
  }

  const schedule = checkReservationStatus()
  return {
    ...schedule,
    mode: 'auto',
    source: 'schedule',
  }
}
