"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BidangPresencePanel } from "@/components/admin/bidang-presence-panel"
import { ReservationTimeSettings } from "@/components/admin/reservation-time-settings"
import { BidangQueuePanel } from "@/components/admin/bidang-queue-panel"
import { BidangSchedulePanel } from "@/components/admin/bidang-schedule-panel"
import { SirediLogo } from "@/components/siredi-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLogout } from "@/hooks/use-logout"
import { getBidangConfig, type BidangSlug } from "@/lib/bidang-config"
import { cn } from "@/lib/utils"
import { Baby, GraduationCap, LogOut, Menu, School, User, Users } from "lucide-react"

const BIDANG_ICONS = {
  paud: Baby,
  ptk: Users,
  "sd-umum": School,
  "smp-umum": GraduationCap,
} as const

type BidangAdminPageProps = {
  bidangSlug: BidangSlug
}

export function BidangAdminPage({ bidangSlug }: BidangAdminPageProps) {
  const router = useRouter()
  const config = getBidangConfig(bidangSlug)!
  const Icon = BIDANG_ICONS[bidangSlug] ?? GraduationCap
  const { logout, isLoggingOut } = useLogout()
  const [scheduleKey, setScheduleKey] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>("")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <SirediLogo size="sm" showText={false} href={null} imageClassName="w-9 h-9" />
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", config.accentIconBg)}>
                <Icon className={cn("w-5 h-5", config.accentText)} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Petugas Bidang {config.shortLabel}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Kelola jadwal, antrian tamu, dan kehadiran petugas
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/profile')}
            >
              <User className="w-4 h-4 mr-1" />
              Profil Saya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-1" />
              {isLoggingOut ? "Keluar..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
        <div
          className={cn(
            "rounded-xl border p-4",
            config.accentBorder,
            config.accentBg,
          )}
        >
          <p className="text-sm text-foreground">
            Panel ini untuk mengatur{" "}
            <strong>siapa yang siap bertemu di ruangan {config.label}</strong>. Lihat jadwal slot
            waktu, panggil tamu yang menunggu, dan konfirmasi kehadiran petugas dinas.
          </p>
        </div>

        <ReservationTimeSettings
          slugOnly={bidangSlug}
          showGate={false}
          onCapacityUpdated={() => setScheduleKey((k) => k + 1)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BidangQueuePanel 
            bidangSlug={bidangSlug} 
            date={selectedDate} 
            onDateInit={(d) => {
              if (!selectedDate) setSelectedDate(d)
            }} 
            editable 
          />
          <BidangSchedulePanel 
            key={scheduleKey + selectedDate} 
            bidangSlug={bidangSlug} 
            date={selectedDate} 
          />
        </div>

        <BidangPresencePanel bidangSlug={bidangSlug} editable />

        <p className="text-center text-xs text-muted-foreground pb-4">
          Petugas Bidang {config.label} · Dinas Pendidikan Kota Banjarmasin
        </p>
      </main>
    </div>
  )
}
