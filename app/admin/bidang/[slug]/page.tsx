import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getBidangConfig, isBidangSlug } from "@/lib/bidang-config"
import {
  getBidangSlugForUser,
  isAdminPaudUser,
  isLoketAdminUser,
} from "@/lib/auth-shared"
import { BidangAdminPage } from "@/components/admin/bidang-admin-page"

export const dynamic = "force-dynamic"

export default async function AdminBidangPage({
  params,
}: {
  params: { slug: string }
}) {
  if (!isBidangSlug(params.slug)) {
    notFound()
  }

  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  if (!isAdminPaudUser(user) && !isLoketAdminUser(user)) {
    redirect("/reservasi")
  }

  if (isAdminPaudUser(user)) {
    const userSlug = getBidangSlugForUser(user)
    if (userSlug !== params.slug) {
      redirect(`/admin/bidang/${userSlug}`)
    }
  }

  const config = getBidangConfig(params.slug)
  if (!config) notFound()

  return <BidangAdminPage bidangSlug={params.slug} />
}
