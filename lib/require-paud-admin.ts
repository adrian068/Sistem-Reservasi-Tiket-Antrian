import 'server-only'

import { getSession } from './auth'
import {
  ADMIN_PAUD_BIDANG_SLUG,
  isAdminPaudUser,
  isLoketAdminUser,
  type SessionUser,
} from './auth-shared'

export async function requirePaudAdmin(): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user) return null
  if (isAdminPaudUser(user)) return user
  return null
}

/** PAUD admin atau admin loket (preview) — alias slug paud */
export async function requirePaudDashboardReader(): Promise<SessionUser | null> {
  const { requireBidangDashboardReader } = await import('./require-bidang-admin')
  return requireBidangDashboardReader('paud')
}

export function getPaudBidangSlug(user: SessionUser): string {
  return user.bidangSlug ?? ADMIN_PAUD_BIDANG_SLUG
}
