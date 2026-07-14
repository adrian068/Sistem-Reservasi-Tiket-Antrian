import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isAdminUser } from "@/lib/auth-shared"

// Force dynamic rendering for all admin routes
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (!isAdminUser(user)) {
    redirect("/reservasi")
  }

  // Pembatasan Admin PAUD hanya di middleware (hindari loop ke /admin/paud)
  return <div className="admin-layout">{children}</div>
}



