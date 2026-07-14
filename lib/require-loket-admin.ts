import 'server-only'

import { getSession } from './auth'
import {
  isAdminPaudUser,
  isLoketAdminUser,
  isSuperAdminUser,
  type SessionUser,
} from './auth-shared'

/** Admin loket, super admin, atau offline admin */
export async function requireLoketAdminSession(): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user || !isLoketAdminUser(user)) return null
  return user
}

export async function requireLoketOrSuperAdminSession(): Promise<SessionUser | null> {
  return requireLoketAdminSession()
}

/** Kelola kapasitas: loket/super semua bidang; admin PAUD hanya bidang sendiri */
export async function requireBidangCapacityEditor(
  bidangSlug: string,
): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user) return null

  if (isLoketAdminUser(user) || isSuperAdminUser(user)) {
    return user
  }

  if (isAdminPaudUser(user)) {
    const userSlug = user.bidangSlug ?? 'paud'
    if (userSlug === bidangSlug) return user
  }

  return null
}

export async function requireBidangCapacityReader(): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user) return null
  if (isLoketAdminUser(user) || isSuperAdminUser(user) || isAdminPaudUser(user)) {
    return user
  }
  return null
}
