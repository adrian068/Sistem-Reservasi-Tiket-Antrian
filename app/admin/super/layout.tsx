import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { isAdminUser, isSuperAdminUser } from '@/lib/auth-shared'

export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect('/login?redirect=/admin/super/dashboard')
  }

  if (!isSuperAdminUser(user)) {
    redirect(isAdminUser(user) ? '/admin/dashboard' : '/reservasi')
  }

  return <>{children}</>
}
