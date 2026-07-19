import 'server-only'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import {
  createLocalUser,
  findLocalUserByEmail,
  findLocalUserByLogin,
  getLocalUserBySessionId,
  isDbConnectionError,
  isLocalUserId,
  loginUsernameFromEmail,
  toLocalSessionId,
  verifyLocalPassword,
  upsertLocalUserMirror,
} from './local-users-store'
import {
  isSuperAdminAccountEmail,
  isSuperAdminUser,
  MASTER_ADMIN_EMAIL,
  OFFLINE_ADMIN_SESSION_ID,
  SESSION_COOKIE_NAME,
  SUPER_ADMIN_ROLE,
  masterAdminCredentialsMatch,
  type SessionUser,
} from './auth-shared'

export {
  isAdminUser,
  isSuperAdminUser,
  getAdminHomePath,
  MASTER_ADMIN_EMAIL,
  MASTER_ADMIN_PASSWORD,
  OFFLINE_ADMIN_SESSION_ID,
  SESSION_COOKIE_NAME,
  masterAdminCredentialsMatch,
  type SessionUser,
} from './auth-shared'

export { isLocalUserId, LOCAL_USER_ID_PREFIX } from './local-users-store'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return null
    }
    
    const user = JSON.parse(sessionCookie.value) as SessionUser
    return user
  } catch (error) {
    console.error('Error parsing session:', error)
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (!isSuperAdminUser(user)) {
    throw new Error('Forbidden')
  }
  return user
}

/**
 * Login admin: cek database, atau kredensial master (email/sandi di atas).
 * Jika DB tidak bisa dihubungi atau user belum ada, kredensial master tetap mengeluarkan sesi admin.
 */
export type RegisterResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string }

async function registerUserLocal(
  nama: string,
  email: string,
  password: string,
  peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD',
  bidangSlug?: string | null,
): Promise<RegisterResult> {
  try {
    const local = await createLocalUser({
      nama,
      email,
      password,
      peran,
      bidangSlug: peran === 'ADMIN_PAUD' ? bidangSlug ?? undefined : undefined,
    })
    console.warn(
      '[auth] Database tidak terhubung — akun disimpan lokal di data/local-users.json',
    )

    const loginOk = await verifyAdminLogin(local.email, password)
    if (!loginOk) {
      return { ok: false, error: 'Akun disimpan lokal tapi login gagal diverifikasi.' }
    }

    return {
      ok: true,
      user: {
        id: toLocalSessionId(local.id),
        nama: local.nama,
        email: local.email,
        peran: local.peran,
        bidangSlug: local.bidangSlug,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return { ok: false, error: 'Email sudah terdaftar' }
    }
    console.error('Local register error:', error)
    return { ok: false, error: 'Gagal menyimpan akun. Coba lagi.' }
  }
}

async function mirrorAdminCredentials(input: {
  nama: string
  email: string
  password: string
  peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD'
  bidangSlug?: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const passwordHash = await hashPassword(input.password)

  try {
    await upsertLocalUserMirror({
      nama: input.nama.trim(),
      email: normalizedEmail,
      password: input.password,
      peran: input.peran,
      bidangSlug:
        input.peran === 'ADMIN_PAUD' ? input.bidangSlug ?? undefined : undefined,
    })
  } catch (error) {
    console.error('mirrorAdminCredentials local error:', error)
    return { ok: false, error: 'Gagal menyimpan kredensial admin' }
  }

  try {
    await prisma.pengguna.updateMany({
      where: { email: normalizedEmail },
      data: { passwordHash },
    })
  } catch (error) {
    if (!isDbConnectionError(error)) {
      console.warn('[auth] Gagal sinkron password admin ke DB:', error)
    }
  }

  return { ok: true }
}

async function verifyAdminLogin(email: string, password: string): Promise<boolean> {
  const login = loginUsernameFromEmail(email)
  const user = await authenticateUser(login, password)
  return user !== null
}

export async function registerUser(
  nama: string,
  email: string,
  password: string,
  peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD' = 'USER',
  bidangSlug?: string | null,
): Promise<RegisterResult> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedNama = nama.trim()

  if (trimmedNama.length < 2) {
    return { ok: false, error: 'Nama minimal 2 karakter' }
  }

  if (peran === 'ADMIN_PAUD' && !bidangSlug) {
    return { ok: false, error: 'Bidang wajib dipilih untuk admin bidang' }
  }

  const localExisting = await findLocalUserByEmail(normalizedEmail)
  if (localExisting) {
    return { ok: false, error: 'Email sudah terdaftar' }
  }

  try {
    const existing = await prisma.pengguna.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return { ok: false, error: 'Email sudah terdaftar' }
    }

    const passwordHash = await hashPassword(password)
    const pengguna = await prisma.pengguna.create({
      data: {
        nama: trimmedNama,
        email: normalizedEmail,
        passwordHash,
        peran,
        bidangSlug: peran === 'ADMIN_PAUD' ? bidangSlug : null,
        aktif: true,
      },
    })

    const isAdmin = peran === 'ADMIN' || peran === 'SUPER_ADMIN' || peran === 'ADMIN_PAUD'
    if (isAdmin) {
      const mirrored = await mirrorAdminCredentials({
        nama: trimmedNama,
        email: normalizedEmail,
        password,
        peran,
        bidangSlug,
      })
      if (!mirrored.ok) {
        await prisma.pengguna.delete({ where: { id: pengguna.id } }).catch(() => {})
        return mirrored
      }
    }

    const loginOk = await verifyAdminLogin(normalizedEmail, password)
    if (!loginOk) {
      await prisma.pengguna.delete({ where: { id: pengguna.id } }).catch(() => {})
      return {
        ok: false,
        error: 'Akun dibuat tapi login gagal diverifikasi. Silakan coba lagi.',
      }
    }

    return {
      ok: true,
      user: {
        id: pengguna.id.toString(),
        nama: pengguna.nama,
        email: pengguna.email,
        peran: pengguna.peran,
        bidangSlug: pengguna.bidangSlug ?? undefined,
      },
    }
  } catch (error) {
    console.error('Register error:', error)
    if (isDbConnectionError(error)) {
      return registerUserLocal(nama, email, password, peran, bidangSlug)
    }
    return {
      ok: false,
      error: 'Gagal mendaftar. Silakan coba lagi.',
    }
  }
}

export type UpdateBidangAdminResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string }

export async function updateBidangAdminUser(
  id: string,
  input: { nama?: string; bidangSlug?: string },
): Promise<UpdateBidangAdminResult> {
  const trimmedNama = input.nama?.trim()
  if (trimmedNama !== undefined && trimmedNama.length < 2) {
    return { ok: false, error: 'Nama minimal 2 karakter' }
  }

  if (isLocalUserId(id)) {
    const { updateLocalAdminUser } = await import('./local-users-store')
    const updated = await updateLocalAdminUser(id, input)
    if (!updated) return { ok: false, error: 'Admin tidak ditemukan' }
    return {
      ok: true,
      user: {
        id: toLocalSessionId(updated.id),
        nama: updated.nama,
        email: updated.email,
        peran: updated.peran,
        bidangSlug: updated.bidangSlug,
      },
    }
  }

  try {
    const existing = await prisma.pengguna.findUnique({ where: { id: BigInt(id) } })
    if (!existing || existing.peran !== 'ADMIN_PAUD') {
      return { ok: false, error: 'Hanya admin bidang yang dapat diubah' }
    }

    const pengguna = await prisma.pengguna.update({
      where: { id: BigInt(id) },
      data: {
        ...(trimmedNama !== undefined ? { nama: trimmedNama } : {}),
        ...(input.bidangSlug !== undefined ? { bidangSlug: input.bidangSlug } : {}),
      },
    })

    return {
      ok: true,
      user: {
        id: pengguna.id.toString(),
        nama: pengguna.nama,
        email: pengguna.email,
        peran: pengguna.peran,
        bidangSlug: pengguna.bidangSlug ?? undefined,
      },
    }
  } catch (error) {
    console.error('Update bidang admin error:', error)
    return { ok: false, error: 'Gagal memperbarui admin bidang' }
  }
}

export type AdminManageResult = { ok: true } | { ok: false; error: string }

function isProtectedAdminEmail(email: string): boolean {
  const e = email.trim().toLowerCase()
  return (
    e === MASTER_ADMIN_EMAIL.toLowerCase() ||
    e === 'disdikbanjarmasin@gmail.com' ||
    e === 'silent12@gmail.com'
  )
}

export async function setAdminUserActive(
  id: string,
  aktif: boolean,
): Promise<AdminManageResult> {
  if (isLocalUserId(id)) {
    const { setLocalAdminActive, getLocalUserBySessionId } = await import('./local-users-store')
    const local = await getLocalUserBySessionId(id)
    if (!local) return { ok: false, error: 'Admin tidak ditemukan' }
    if (isProtectedAdminEmail(local.email)) {
      return { ok: false, error: 'Akun sistem tidak dapat diblokir' }
    }
    const updated = await setLocalAdminActive(id, aktif)
    if (!updated) return { ok: false, error: 'Gagal memperbarui status admin' }
    return { ok: true }
  }

  try {
    const existing = await prisma.pengguna.findUnique({ where: { id: BigInt(id) } })
    if (!existing) return { ok: false, error: 'Admin tidak ditemukan' }
    if (existing.peran === 'SUPER_ADMIN' || isProtectedAdminEmail(existing.email)) {
      return { ok: false, error: 'Akun super admin / sistem tidak dapat diblokir' }
    }

    await prisma.pengguna.update({
      where: { id: BigInt(id) },
      data: { aktif },
    })

    const { setLocalAdminActive, findLocalUserByEmail } = await import('./local-users-store')
    const local = await findLocalUserByEmail(existing.email)
    if (local) {
      await setLocalAdminActive(toLocalSessionId(local.id), aktif)
    }

    return { ok: true }
  } catch (error) {
    console.error('setAdminUserActive error:', error)
    return { ok: false, error: 'Gagal memperbarui status admin' }
  }
}

export async function deleteAdminUser(id: string): Promise<AdminManageResult> {
  if (isLocalUserId(id)) {
    const { deleteLocalAdminBySessionId, getLocalUserBySessionId } = await import(
      './local-users-store'
    )
    const local = await getLocalUserBySessionId(id)
    if (!local) return { ok: false, error: 'Admin tidak ditemukan' }
    if (isProtectedAdminEmail(local.email) || local.peran === 'SUPER_ADMIN') {
      return { ok: false, error: 'Akun super admin / sistem tidak dapat dihapus' }
    }
    const ok = await deleteLocalAdminBySessionId(id)
    return ok ? { ok: true } : { ok: false, error: 'Gagal menghapus admin' }
  }

  try {
    const existing = await prisma.pengguna.findUnique({ where: { id: BigInt(id) } })
    if (!existing) return { ok: false, error: 'Admin tidak ditemukan' }
    if (existing.peran === 'SUPER_ADMIN' || isProtectedAdminEmail(existing.email)) {
      return { ok: false, error: 'Akun super admin / sistem tidak dapat dihapus' }
    }

    await prisma.pengguna.delete({ where: { id: BigInt(id) } })

    const { deleteLocalAdminBySessionId, findLocalUserByEmail } = await import(
      './local-users-store'
    )
    const local = await findLocalUserByEmail(existing.email)
    if (local) {
      await deleteLocalAdminBySessionId(toLocalSessionId(local.id))
    }

    return { ok: true }
  } catch (error) {
    console.error('deleteAdminUser error:', error)
    return { ok: false, error: 'Gagal menghapus admin' }
  }
}

export async function resetAdminPassword(
  id: string,
  newPassword: string,
): Promise<AdminManageResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: 'Password minimal 8 karakter' }
  }

  let meta:
    | {
        nama: string
        email: string
        peran: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ADMIN_PAUD'
        bidangSlug?: string | null
      }
    | null = null

  if (isLocalUserId(id)) {
    const { getLocalUserBySessionId } = await import('./local-users-store')
    const local = await getLocalUserBySessionId(id)
    if (!local) return { ok: false, error: 'Admin tidak ditemukan' }
    if (isProtectedAdminEmail(local.email) || local.peran === 'SUPER_ADMIN') {
      return { ok: false, error: 'Akun super admin / sistem tidak dapat diubah' }
    }
    meta = {
      nama: local.nama,
      email: local.email,
      peran: local.peran,
      bidangSlug: local.bidangSlug ?? null,
    }
  } else {
    try {
      const existing = await prisma.pengguna.findUnique({ where: { id: BigInt(id) } })
      if (!existing) return { ok: false, error: 'Admin tidak ditemukan' }
      if (existing.peran === 'SUPER_ADMIN' || isProtectedAdminEmail(existing.email)) {
        return { ok: false, error: 'Akun super admin / sistem tidak dapat diubah' }
      }
      meta = {
        nama: existing.nama,
        email: existing.email,
        peran: existing.peran,
        bidangSlug: existing.bidangSlug,
      }
    } catch (error) {
      console.error('resetAdminPassword lookup error:', error)
      return { ok: false, error: 'Admin tidak ditemukan' }
    }
  }

  if (!meta) return { ok: false, error: 'Admin tidak ditemukan' }

  const mirrored = await mirrorAdminCredentials({
    nama: meta.nama,
    email: meta.email,
    password: newPassword,
    peran: meta.peran,
    bidangSlug: meta.bidangSlug,
  })
  if (!mirrored.ok) return mirrored

  const loginOk = await verifyAdminLogin(meta.email, newPassword)
  if (!loginOk) {
    return {
      ok: false,
      error: 'Password disimpan tapi verifikasi login gagal. Coba lagi.',
    }
  }

  return { ok: true }
}

async function findPenggunaByLogin(login: string) {
  const normalized = login.trim().toLowerCase()

  const byEmail = await prisma.pengguna.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
  })
  if (byEmail) return byEmail

  if (normalized.includes('@')) return null

  const byPrefix = await prisma.pengguna.findFirst({
    where: {
      email: {
        startsWith: `${normalized}@`,
        mode: 'insensitive',
      },
    },
  })
  if (byPrefix) return byPrefix

  const byLocalPart = await prisma.$queryRaw<
    Array<{
      id_penggunas: bigint
      nama: string
      email: string
      password_hash: string
      peran: string
      bidang_slug: string | null
      aktif: boolean
    }>
  >`
    SELECT id_penggunas, nama, email, password_hash, peran, bidang_slug, aktif
    FROM penggunas
    WHERE LOWER(SPLIT_PART(email, '@', 1)) = ${normalized}
    LIMIT 2
  `

  if (byLocalPart.length !== 1) return null

  return prisma.pengguna.findUnique({
    where: { id: byLocalPart[0].id_penggunas },
  })
}

function sessionFromPengguna(pengguna: {
  id: bigint
  nama: string
  email: string
  peran: string
  bidangSlug?: string | null
}): SessionUser {
  return {
    id: pengguna.id.toString(),
    nama: pengguna.nama,
    email: pengguna.email,
    peran: pengguna.peran,
    bidangSlug: pengguna.bidangSlug ?? undefined,
  }
}

async function syncPasswordToDb(penggunaId: bigint, password: string): Promise<void> {
  try {
    await prisma.pengguna.update({
      where: { id: penggunaId },
      data: { passwordHash: await hashPassword(password) },
    })
  } catch (error) {
    console.warn('[auth] Gagal sinkron password ke DB:', error)
  }
}

async function syncLocalUserToDb(
  local: Awaited<ReturnType<typeof findLocalUserByLogin>>,
  password: string,
): Promise<SessionUser | null> {
  if (!local) return null

  try {
    const passwordHash = await hashPassword(password)
    const pengguna = await prisma.pengguna.upsert({
      where: { email: local.email },
      create: {
        nama: local.nama,
        email: local.email,
        passwordHash,
        peran: local.peran,
        bidangSlug: local.peran === 'ADMIN_PAUD' ? local.bidangSlug ?? null : null,
        aktif: local.aktif !== false,
      },
      update: {
        passwordHash,
        nama: local.nama,
        peran: local.peran,
        bidangSlug: local.peran === 'ADMIN_PAUD' ? local.bidangSlug ?? null : null,
        aktif: local.aktif !== false,
      },
    })

    return sessionFromPengguna(pengguna)
  } catch (error) {
    if (!isDbConnectionError(error)) {
      console.warn('[auth] Gagal sinkron akun lokal ke DB:', error)
    }
    return null
  }
}

async function authenticateLocalUser(
  login: string,
  password: string,
): Promise<SessionUser | null> {
  const local = await findLocalUserByLogin(login)
  if (!local) return null
  if (local.aktif === false) return null

  const isValid = await verifyLocalPassword(local, password)
  if (!isValid) return null

  const peran = isSuperAdminAccountEmail(local.email)
    ? SUPER_ADMIN_ROLE
    : local.peran

  return {
    id: toLocalSessionId(local.id),
    nama: local.nama,
    email: local.email,
    peran,
    bidangSlug: local.bidangSlug,
  }
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<SessionUser | null> {
  const masterOk = masterAdminCredentialsMatch(username, password)

  try {
    const pengguna = await findPenggunaByLogin(username)

    if (pengguna) {
      if (pengguna.aktif === false) {
        return null
      }
      const isValid = await verifyPassword(password, pengguna.passwordHash)
      if (isValid || masterOk) {
        return sessionFromPengguna(pengguna)
      }

      const localRecord = await findLocalUserByLogin(username)
      const localUser = await authenticateLocalUser(username, password)
      if (
        localUser &&
        localRecord &&
        localRecord.email.trim().toLowerCase() === pengguna.email.trim().toLowerCase()
      ) {
        await syncPasswordToDb(pengguna.id, password)
        return sessionFromPengguna(pengguna)
      }
      return null
    }

    const localUser = await authenticateLocalUser(username, password)
    if (localUser) {
      const localRecord = await findLocalUserByLogin(username)
      const synced = await syncLocalUserToDb(localRecord, password)
      return synced ?? localUser
    }

    if (masterOk) {
      return {
        id: OFFLINE_ADMIN_SESSION_ID,
        nama: 'Admin Disdik Banjarmasin',
        email: MASTER_ADMIN_EMAIL,
        peran: 'ADMIN',
      }
    }
    return null
  } catch (error) {
    console.error('Authentication error:', error)

    const localUser = await authenticateLocalUser(username, password)
    if (localUser) {
      const localRecord = await findLocalUserByLogin(username)
      const synced = await syncLocalUserToDb(localRecord, password)
      return synced ?? localUser
    }

    if (masterOk) {
      return {
        id: OFFLINE_ADMIN_SESSION_ID,
        nama: 'Admin Disdik Banjarmasin',
        email: MASTER_ADMIN_EMAIL,
        peran: 'ADMIN',
      }
    }
    return null
  }
}

export async function getSessionProfile(user: SessionUser) {
  if (user.id === OFFLINE_ADMIN_SESSION_ID) {
    const now = new Date()
    return {
      id: user.id,
      nama: user.nama,
      email: user.email,
      peran: user.peran,
      createdAt: now,
      updatedAt: now,
    }
  }

  if (isLocalUserId(user.id)) {
    const local = await getLocalUserBySessionId(user.id)
    if (!local) return null
    return {
      id: user.id,
      nama: local.nama,
      email: local.email,
      peran: local.peran,
      createdAt: new Date(local.createdAt),
      updatedAt: new Date(local.updatedAt),
    }
  }

  try {
    const pengguna = await prisma.pengguna.findUnique({
      where: { id: BigInt(user.id) },
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!pengguna) return null

    return {
      id: pengguna.id.toString(),
      nama: pengguna.nama,
      email: pengguna.email,
      peran: pengguna.peran,
      createdAt: pengguna.createdAt,
      updatedAt: pengguna.updatedAt,
    }
  } catch (error) {
    if (isDbConnectionError(error)) {
      return {
        id: user.id,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    throw error
  }
}



