"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  Loader2,
  UserCog,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SuperAdminShell } from "@/components/super-admin-shell"
import { SUPER_ADMIN_CAPABILITIES } from "@/lib/super-admin-capabilities"

type Overview = {
  reservations: number
  admins: number
  users: number
}

export default function SuperAdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/super/overview")
        const json = await res.json()
        if (res.ok && json.success) setOverview(json.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = overview
    ? [
        { label: "Reservasi", value: overview.reservations, icon: Calendar },
        { label: "Admin", value: overview.admins, icon: UserCog },
        { label: "Pengguna Lokal", value: overview.users, icon: Users },
      ]
    : []

  return (
    <SuperAdminShell
      title="Pusat Kendali"
      subtitle="Ringkasan sistem & wewenang Admin"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-brand-border-light dark:border-brand-header-dark bg-gradient-to-r from-brand-header to-brand-primary p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Pusat Kendali Admin</h2>
                <p className="text-blue-100 text-sm mt-1 max-w-2xl">
                  Dari halaman ini Anda mengatur admin, memantau reservasi, dan
                  mengontrol buka/tutup layanan reservasi publik.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="border-brand-border-light dark:border-brand-header-dark/50">
                  <CardContent className="pt-4 pb-4">
                    <Icon className="w-5 h-5 text-brand-accent mb-2" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Yang bisa diatur Admin</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Klik modul di bawah untuk membuka halaman pengaturan atau data.
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {SUPER_ADMIN_CAPABILITIES.map((cap) => {
                const Icon = cap.icon
                return (
                  <Card
                    key={cap.id}
                    className="overflow-hidden border-brand-border-light dark:border-brand-header-dark/40 hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-brand-light-bg dark:bg-brand-header-dark/40 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base">{cap.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cap.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <ul className="space-y-2">
                        {cap.actions.map((action) => (
                          <li
                            key={action}
                            className="flex items-start gap-2 text-sm text-foreground/90"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="w-full bg-brand-primary hover:bg-brand-accent-hover"
                        size="sm"
                      >
                        <Link href={cap.href}>
                          Buka {cap.title}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  )
}
