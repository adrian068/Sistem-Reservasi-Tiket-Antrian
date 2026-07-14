"use client"

import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"
import { SiteHeader } from "@/components/site-header"
import { SirediPageBackground } from "@/components/siredi-page-background"
import { PublicQueueBoard } from "@/components/public-queue-board"
import { cn } from "@/lib/utils"

const HIGHLIGHTS = [
  {
    icon: Building2,
    title: "Profil Dinas",
    description: "Penyelenggara pendidikan dasar dan menengah di Kota Banjarmasin.",
    accent: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-500/15 text-blue-600",
    ring: "group-hover:ring-blue-400/40",
  },
  {
    icon: Users,
    title: "Layanan Terjadwal",
    description: "Reservasi kunjungan PTK, SD, SMP, dan PAUD secara online.",
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/15 text-emerald-600",
    ring: "group-hover:ring-emerald-400/40",
  },
  {
    icon: ShieldCheck,
    title: "Pelayanan Tertib",
    description: "Antrian teratur agar pelayanan lebih nyaman bagi masyarakat.",
    accent: "from-indigo-500 to-violet-600",
    iconBg: "bg-indigo-500/15 text-indigo-600",
    ring: "group-hover:ring-indigo-400/40",
  },
] as const

const STEPS = [
  { label: "Pilih layanan", icon: GraduationCap },
  { label: "Atur jadwal", icon: Clock3 },
  { label: "Konfirmasi", icon: CalendarCheck },
] as const

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      <SirediPageBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader hideUserMenu inlineAuth loginRedirect="/reservasi" />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 lg:py-14">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="text-center text-white mb-8 sm:mb-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-md mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                Sistem Informasi Reservasi Dinas Pendidikan
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight drop-shadow-lg">
                Dinas Pendidikan
                <span className="block mt-1 bg-gradient-to-r from-blue-200 via-white to-blue-100 bg-clip-text text-transparent">
                  Kota Banjarmasin
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-blue-50/90 max-w-xl mx-auto leading-relaxed">
                Layanan reservasi online yang praktis untuk masyarakat dan satuan pendidikan.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={120}>
            <div className="rounded-3xl border border-white/20 bg-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500" />

              <div className="p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
                <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
                  {HIGHLIGHTS.map((item, index) => (
                    <div
                      key={item.title}
                      className={cn(
                        "group relative rounded-2xl bg-white p-5 sm:p-6 shadow-lg transition-all duration-300",
                        "hover:-translate-y-1 hover:shadow-xl ring-1 ring-black/5",
                        item.ring,
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-90",
                          item.accent,
                        )}
                      />
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                          item.iconBg,
                        )}
                      >
                        <item.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-1">
                  {STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 shadow-sm">
                        <step.icon className="w-3.5 h-3.5 text-blue-600" />
                        {step.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-white/50 hidden sm:block" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-8 text-white shadow-inner">
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

                  <div className="relative z-10 grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
                    <div className="text-center lg:text-left">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-4">
                        <CalendarCheck className="w-7 h-7" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        Mulai Reservasi Online
                      </h2>
                      <p className="text-blue-100 text-sm sm:text-base max-w-md mx-auto lg:mx-0 mb-6">
                        Pilih layanan, tanggal, dan slot waktu — proses cepat dan terjadwal.
                      </p>
                      <Button
                        asChild
                        size="lg"
                        className="h-12 px-8 text-base font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                      >
                        <Link href="/reservasi">
                          Klik Reservasi
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    </div>

                    <PublicQueueBoard compact className="lg:mt-0" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </main>

        <footer className="py-6 text-center text-xs sm:text-sm text-white/75">
          © {new Date().getFullYear()} Dinas Pendidikan Kota Banjarmasin — SIREDI
        </footer>
      </div>
    </div>
  )
}
