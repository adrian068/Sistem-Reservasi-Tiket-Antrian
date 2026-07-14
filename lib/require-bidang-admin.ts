import 'server-only'

import { getSession } from './auth'
import {
  ADMIN_PAUD_BIDANG_SLUG,
  ADMIN_PAUD_ROLE,
  getBidangSlugForUser,
  isAdminPaudUser,
  isLoketAdminUser,
  type SessionUser,
} from './auth-shared'
import { isBidangSlug } from './bidang-config'

export async function requireBidangPresenceReader(): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user) return null
  if (isLoketAdminUser(user) || isAdminPaudUser(user)) return user
  return null
}

export async function requireBidangPresenceEditor(
  bidangSlug: string,
): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user || !isAdminPaudUser(user)) return null

  const userSlug = getBidangSlugForUser(user)
  if (userSlug !== bidangSlug) return null
  return user
}

export function canEditBidangPresence(user: SessionUser, bidangSlug: string): boolean {
  if (!isAdminPaudUser(user)) return false
  return getBidangSlugForUser(user) === bidangSlug
}

/** Admin bidang (slug sendiri) atau admin loket/super (preview) */
export async function requireBidangDashboardReader(
  bidangSlug: string,
): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user) return null
  if (isLoketAdminUser(user)) return user
  if (isAdminPaudUser(user) && getBidangSlugForUser(user) === bidangSlug) return user
  return null
}

/** Hanya admin bidang untuk slug tertentu */
export async function requireBidangAdminForSlug(
  bidangSlug: string,
): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user || !isAdminPaudUser(user)) return null
  if (getBidangSlugForUser(user) !== bidangSlug) return null
  return user
}

export function resolveUserBidangSlug(user: SessionUser): string {
  return getBidangSlugForUser(user)
}

export { ADMIN_PAUD_ROLE, ADMIN_PAUD_BIDANG_SLUG, isBidangSlug }
