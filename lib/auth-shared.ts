/** Utilitas auth tanpa `next/headers` — aman diimpor komponen client. */

import { getBidangAdminPath, getBidangSlugForUser } from './bidang-config'

export { getBidangAdminPath, getBidangSlugForUser } from './bidang-config'

export interface SessionUser {
  id: string
  nama: string
  email: string
  peran: string
  bidangSlug?: string
}

export const SESSION_COOKIE_NAME = 'simdik_session'

export const MASTER_ADMIN_EMAIL = 'disdikbanjarmasin@gmail.com'
export const MASTER_ADMIN_PASSWORD = 'disdik123'

export const OFFLINE_ADMIN_SESSION_ID = 'offline-admin'

export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN'
export const ADMIN_PAUD_ROLE = 'ADMIN_PAUD'
export const SUPER_ADMIN_EMAIL = 'silent12@gmail.com'
export const SUPER_ADMIN_LOGIN = 'silent'

export const ADMIN_PAUD_BIDANG_SLUG = 'paud'

export function emailMatchesLogin(email: string, login: string): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedLogin = login.trim().toLowerCase()
  if (normalizedEmail === normalizedLogin) return true
  const at = normalizedEmail.indexOf('@')
  if (at > 0 && normalizedEmail.slice(0, at) === normalizedLogin) return true
  return false
}

export function masterAdminCredentialsMatch(login: string, password: string): boolean {
  if (password !== MASTER_ADMIN_PASSWORD) return false
  const normalizedLogin = login.trim().toLowerCase()
  const masterLocalPart = MASTER_ADMIN_EMAIL.split('@')[0]?.toLowerCase() ?? ''
  return (
    normalizedLogin === MASTER_ADMIN_EMAIL.toLowerCase() ||
    normalizedLogin === masterLocalPart ||
    normalizedLogin === 'admin'
  )
}

export function isSuperAdminAccountEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}

export function isSuperAdminLogin(login: string): boolean {
  const normalized = login.trim().toLowerCase()
  return (
    normalized === SUPER_ADMIN_LOGIN ||
    normalized === SUPER_ADMIN_EMAIL.toLowerCase() ||
    normalized === SUPER_ADMIN_EMAIL.split('@')[0]?.toLowerCase()
  )
}

export function isSuperAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false
  if (String(user.peran).toUpperCase() === SUPER_ADMIN_ROLE) return true
  return isSuperAdminAccountEmail(user.email)
}

export function isAdminPaudUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false
  return String(user.peran).toUpperCase() === ADMIN_PAUD_ROLE
}

/** Alias — admin bidang (PAUD, SD, SMP, PTK) */
export function isBidangAdminUser(user: SessionUser | null | undefined): boolean {
  return isAdminPaudUser(user)
}

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false
  if (user.id === OFFLINE_ADMIN_SESSION_ID) return true
  if (isSuperAdminUser(user)) return true
  if (isAdminPaudUser(user)) return true
  return String(user.peran).toUpperCase() === 'ADMIN'
}

/** Admin loket / super — bukan admin bidang */
export function isLoketAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false
  if (user.id === OFFLINE_ADMIN_SESSION_ID) return true
  if (isSuperAdminUser(user)) return true
  if (isAdminPaudUser(user)) return false
  return String(user.peran).toUpperCase() === 'ADMIN'
}

export function getAdminHomePath(user: SessionUser | null | undefined): string {
  if (isSuperAdminUser(user)) return '/admin/super/dashboard'
  if (isAdminPaudUser(user)) return getBidangAdminPath(getBidangSlugForUser(user ?? {}))
  return '/admin/dashboard'
}
