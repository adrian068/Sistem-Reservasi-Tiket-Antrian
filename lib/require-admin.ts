import 'server-only'

import { getSession } from './auth'
import { isAdminUser, type SessionUser } from './auth-shared'

export async function requireAdminSession(): Promise<SessionUser | null> {
  const user = await getSession()
  if (!user || !isAdminUser(user)) return null
  return user
}
