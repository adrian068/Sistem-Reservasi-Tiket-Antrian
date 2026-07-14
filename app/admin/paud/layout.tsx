import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isAdminPaudUser, isLoketAdminUser } from "@/lib/auth-shared"

export const dynamic = "force-dynamic"

export default async function AdminPaudLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (!isAdminPaudUser(user) && !isLoketAdminUser(user)) {
    redirect("/reservasi")
  }

  return <div className="admin-paud-layout">{children}</div>
}
