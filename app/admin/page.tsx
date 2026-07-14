import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getAdminHomePath } from '@/lib/auth-shared'

export default async function AdminPage() {
  const user = await getSession()
  redirect(getAdminHomePath(user))
}
