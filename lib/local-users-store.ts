import { promises as fs } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export const LOCAL_USER_ID_PREFIX = 'local-'

const STORE_PATH = path.join(process.cwd(), 'data', 'local-users.json')

type StoredUser = {
  id: number
  nama: string
  email: string
  passwordHash: string
  peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD'
  bidangSlug?: string
  aktif?: boolean
  createdAt: string
  updatedAt: string
}

type UserStore = {
  nextId: number
  users: StoredUser[]
}

async function readStore(): Promise<UserStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as UserStore
    if (!Array.isArray(parsed.users)) {
      return { nextId: 1, users: [] }
    }
    return parsed
  } catch {
    return { nextId: 1, users: [] }
  }
}

async function writeStore(store: UserStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

export function isLocalUserId(id: string): boolean {
  return id.startsWith(LOCAL_USER_ID_PREFIX)
}

export function toLocalSessionId(numericId: number): string {
  return `${LOCAL_USER_ID_PREFIX}${numericId}`
}

export function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
    return true
  }
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes('ENOTFOUND') ||
    msg.includes('Tenant or user not found') ||
    msg.includes('tenant/user') ||
    msg.includes("Can't reach database") ||
    msg.includes('P1001') ||
    msg.includes('P1000') ||
    msg.includes('P1017') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('Connection terminated') ||
    msg.includes('Error querying the database')
  )
}

export async function findLocalUserByEmail(
  email: string,
): Promise<StoredUser | null> {
  const store = await readStore()
  const normalized = email.trim().toLowerCase()
  return store.users.find((u) => u.email === normalized) ?? null
}

export async function verifyLocalPassword(
  user: StoredUser,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}

export async function findLocalUserByLogin(
  login: string,
): Promise<StoredUser | null> {
  const store = await readStore()
  const normalized = login.trim().toLowerCase()
  return (
    store.users.find((u) => {
      const email = u.email.trim().toLowerCase()
      if (email === normalized) return true
      const at = email.indexOf('@')
      return at > 0 && email.slice(0, at) === normalized
    }) ?? null
  )
}

export async function getLocalUserBySessionId(
  sessionId: string,
): Promise<StoredUser | null> {
  if (!isLocalUserId(sessionId)) return null
  const numericId = Number(sessionId.slice(LOCAL_USER_ID_PREFIX.length))
  if (!Number.isFinite(numericId)) return null

  const store = await readStore()
  return store.users.find((u) => u.id === numericId) ?? null
}

export async function createLocalUser(input: {
  nama: string
  email: string
  password: string
  peran?: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD'
  bidangSlug?: string
}): Promise<StoredUser> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const trimmedNama = input.nama.trim()

  const existing = await findLocalUserByEmail(normalizedEmail)
  if (existing) {
    throw new Error('EMAIL_EXISTS')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const now = new Date().toISOString()
  const store = await readStore()

  const user: StoredUser = {
    id: store.nextId,
    nama: trimmedNama,
    email: normalizedEmail,
    passwordHash,
    peran: input.peran ?? 'ADMIN',
    bidangSlug: input.bidangSlug,
    aktif: true,
    createdAt: now,
    updatedAt: now,
  }

  store.users.push(user)
  store.nextId += 1
  await writeStore(store)
  return user
}

export function loginUsernameFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  const at = normalized.indexOf('@')
  if (at > 0) return normalized.slice(0, at)
  return normalized
}

export async function upsertLocalUserMirror(input: {
  nama: string
  email: string
  password: string
  peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD'
  bidangSlug?: string
}): Promise<StoredUser> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const store = await readStore()
  const passwordHash = await bcrypt.hash(input.password, 10)
  const now = new Date().toISOString()
  const index = store.users.findIndex((u) => u.email === normalizedEmail)

  if (index >= 0) {
    const user = store.users[index]
    user.nama = input.nama.trim()
    user.passwordHash = passwordHash
    user.peran = input.peran
    user.bidangSlug = input.bidangSlug
    user.aktif = true
    user.updatedAt = now
    store.users[index] = user
    await writeStore(store)
    return user
  }

  const user: StoredUser = {
    id: store.nextId,
    nama: input.nama.trim(),
    email: normalizedEmail,
    passwordHash,
    peran: input.peran,
    bidangSlug: input.bidangSlug,
    aktif: true,
    createdAt: now,
    updatedAt: now,
  }
  store.users.push(user)
  store.nextId += 1
  await writeStore(store)
  return user
}

export async function deleteLocalAdminBySessionId(sessionId: string): Promise<boolean> {
  if (!isLocalUserId(sessionId)) return false
  const numericId = Number(sessionId.slice(LOCAL_USER_ID_PREFIX.length))
  if (!Number.isFinite(numericId)) return false

  const store = await readStore()
  const before = store.users.length
  store.users = store.users.filter((u) => u.id !== numericId)
  if (store.users.length === before) return false
  await writeStore(store)
  return true
}

export async function setLocalAdminActive(
  sessionId: string,
  aktif: boolean,
): Promise<StoredUser | null> {
  if (!isLocalUserId(sessionId)) return null
  const numericId = Number(sessionId.slice(LOCAL_USER_ID_PREFIX.length))
  if (!Number.isFinite(numericId)) return null

  const store = await readStore()
  const index = store.users.findIndex((u) => u.id === numericId)
  if (index < 0) return null

  store.users[index].aktif = aktif
  store.users[index].updatedAt = new Date().toISOString()
  await writeStore(store)
  return store.users[index]
}

export async function listLocalAdminUsers(): Promise<StoredUser[]> {
  const store = await readStore()
  return store.users.filter(
    (u) => u.peran === 'ADMIN' || u.peran === 'SUPER_ADMIN' || u.peran === 'ADMIN_PAUD',
  )
}

export async function updateLocalAdminUser(
  sessionId: string,
  input: { nama?: string; bidangSlug?: string },
): Promise<StoredUser | null> {
  if (!isLocalUserId(sessionId)) return null
  const numericId = Number(sessionId.slice(LOCAL_USER_ID_PREFIX.length))
  if (!Number.isFinite(numericId)) return null

  const store = await readStore()
  const index = store.users.findIndex((u) => u.id === numericId)
  if (index < 0) return null

  const user = store.users[index]
  if (user.peran !== 'ADMIN_PAUD') return null

  if (input.nama !== undefined) {
    const trimmed = input.nama.trim()
    if (trimmed.length < 2) return null
    user.nama = trimmed
  }
  if (input.bidangSlug !== undefined) {
    user.bidangSlug = input.bidangSlug
  }
  user.updatedAt = new Date().toISOString()
  store.users[index] = user
  await writeStore(store)
  return user
}

export async function updateLocalUserPasswordByEmail(
  email: string,
  password: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  const store = await readStore()
  const index = store.users.findIndex((u) => u.email === normalized)
  if (index < 0) return false

  store.users[index].passwordHash = await bcrypt.hash(password, 10)
  store.users[index].updatedAt = new Date().toISOString()
  await writeStore(store)
  return true
}
