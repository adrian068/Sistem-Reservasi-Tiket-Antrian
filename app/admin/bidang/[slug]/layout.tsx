import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isAdminPaudUser, isLoketAdminUser } from "@/lib/auth-shared"
import { isBidangSlug } from "@/lib/bidang-config"

export const dynamic = "force-dynamic"

export default async function AdminBidangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (!isAdminPaudUser(user) && !isLoketAdminUser(user)) {
    redirect("/reservasi")
  }

  if (!isBidangSlug(params.slug)) {
    redirect("/reservasi")
  }

  return <div className="admin-bidang-layout">{children}</div>
}
