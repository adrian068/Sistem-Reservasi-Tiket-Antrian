import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'simdik_session'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/', '/reservasi']

const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/queue',
  '/api/layanans',
  '/api/reservasi',
  '/api/time-slots',
]

/** Halaman lama — dialihkan ke reservasi */
const LEGACY_PATH_PREFIXES = [
  '/tentang-simdik',
  '/direktori-sekolah',
  '/berita',
  '/agenda',
  '/admin/sekolah',
  '/admin/berita',
  '/admin/agenda',
]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true
  }
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return true
  }
  return false
}

/** Masyarakat boleh membuat reservasi tanpa login; GET tetap butuh admin. */
function isPublicReservationCreate(request: NextRequest): boolean {
  return (
    request.method === 'POST' &&
    request.nextUrl.pathname === '/api/reservations'
  )
}

type SessionPayload = {
  id?: string
  email?: string
  peran?: string
  bidangSlug?: string
}

function getSessionUser(request: NextRequest): SessionPayload | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)
  if (!cookie?.value) return null

  try {
    const user = JSON.parse(cookie.value) as SessionPayload
    return user?.email ? user : null
  } catch {
    return null
  }
}

function hasSession(request: NextRequest): boolean {
  return getSessionUser(request) !== null
}

function isSuperAdminSession(request: NextRequest): boolean {
  const user = getSessionUser(request)
  if (!user) return false
  if (String(user.peran).toUpperCase() === 'SUPER_ADMIN') return true
  return user.email?.trim().toLowerCase() === 'silent12@gmail.com'
}

function isAdminPaudSession(request: NextRequest): boolean {
  const user = getSessionUser(request)
  if (!user) return false
  return String(user.peran).toUpperCase() === 'ADMIN_PAUD'
}

function isAdminSession(request: NextRequest): boolean {
  const user = getSessionUser(request)
  if (!user) return false
  if (user.id === 'offline-admin') return true
  if (isSuperAdminSession(request)) return true
  if (isAdminPaudSession(request)) return true
  return String(user.peran).toUpperCase() === 'ADMIN'
}

function getBidangAdminHome(request: NextRequest): string {
  const user = getSessionUser(request)
  const slug = user?.bidangSlug?.trim() || 'paud'
  return `/admin/bidang/${slug}`
}

function isBidangAdminRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/admin/paud') ||
    pathname.startsWith('/admin/bidang/') ||
    pathname.startsWith('/api/admin/paud') ||
    pathname.startsWith('/api/admin/bidang/') ||
    pathname.startsWith('/api/admin/bidang-presence') ||
    pathname.startsWith('/api/admin/bidang-capacity')
  )
}
function isLoketAdminSession(request: NextRequest): boolean {
  const user = getSessionUser(request)
  if (!user) return false
  if (user.id === 'offline-admin') return true
  if (isSuperAdminSession(request)) return true
  if (isAdminPaudSession(request)) return false
  return String(user.peran).toUpperCase() === 'ADMIN'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loggedIn = hasSession(request)

  if (
    LEGACY_PATH_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    return NextResponse.redirect(new URL('/reservasi', request.url))
  }

  if (
    pathname.startsWith('/admin/super') ||
    pathname.startsWith('/api/admin/super')
  ) {
    if (!loggedIn) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isSuperAdminSession(request)) {
      return NextResponse.redirect(
        new URL(isAdminSession(request) ? '/admin/dashboard' : '/reservasi', request.url),
      )
    }
  }

  if (isPublicReservationCreate(request)) {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    if (loggedIn && pathname.startsWith('/login')) {
      if (isSuperAdminSession(request)) {
        return NextResponse.redirect(new URL('/admin/super/dashboard', request.url))
      }
      if (isAdminPaudSession(request)) {
        return NextResponse.redirect(new URL(getBidangAdminHome(request), request.url))
      }
      if (isLoketAdminSession(request)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!loggedIn) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin/paud')) {
    return NextResponse.redirect(new URL(getBidangAdminHome(request), request.url))
  }

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')

  if (isAdminPaudSession(request) && isAdminRoute && !isBidangAdminRoute(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL(getBidangAdminHome(request), request.url))
  }

  if (isBidangAdminRoute(pathname) && !isAdminSession(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && !isAdminSession(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/reservasi', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Semua route kecuali file statis Next.js & aset gambar/font.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
