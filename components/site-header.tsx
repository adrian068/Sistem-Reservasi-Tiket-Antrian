"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CalendarCheck, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SirediLogo } from "@/components/siredi-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollReveal } from "@/components/scroll-reveal"
import { SiteUserMenu } from "@/components/site-user-menu"
import { PageAuthActions } from "@/components/page-auth-actions"

const NAV_ITEMS = [{ label: "Beranda", href: "/" }] as const

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

type SiteHeaderProps = {
  hideUserMenu?: boolean
  /** Tombol Masuk / nama / Keluar di bar header (kanan), sejajar Beranda */
  inlineAuth?: boolean
  loginRedirect?: string
  /** Tampilkan logo Disdik dengan header navy (halaman reservasi) */
  showBrandLogo?: boolean
}

export function SiteHeader({
  hideUserMenu = false,
  inlineAuth = false,
  loginRedirect = "/reservasi",
  showBrandLogo = false,
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-sm border-b shadow-sm transition-all duration-300",
        showBrandLogo
          ? "bg-[#0f2d6b] border-[#0a2459] text-white"
          : "bg-gray-200 dark:bg-background/95 border-gray-300 dark:border-border",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6 sm:gap-8 min-w-0">
            <ScrollReveal animation="fade-right" delay={0} triggerOnce={false}>
              {showBrandLogo ? (
                <SirediLogo size="sm" variant="light" />
              ) : (
                <Link href="/" className="flex items-center space-x-3 shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                    <CalendarCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-foreground transition-colors duration-300 hover:text-primary">
                    Reservasi SIREDI
                  </span>
                </Link>
              )}
            </ScrollReveal>

            <ScrollReveal animation="fade-right" delay={80} triggerOnce={false}>
              <nav className="hidden md:flex items-center">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "font-medium transition-all duration-300 relative group",
                      isNavActive(pathname, item.href)
                        ? showBrandLogo
                          ? "text-white"
                          : "text-primary"
                        : showBrandLogo
                          ? "text-blue-100 hover:text-white"
                          : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300",
                        isNavActive(pathname, item.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full",
                      )}
                    />
                  </Link>
                ))}
              </nav>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-left" delay={200} triggerOnce={false}>
            <div className="flex items-center space-x-2 shrink-0">
              {inlineAuth && (
                <div className="hidden sm:flex">
                  <PageAuthActions loginRedirect={loginRedirect} />
                </div>
              )}
              {!hideUserMenu && !inlineAuth && <SiteUserMenu />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-all duration-300 hover:bg-accent"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
              <ThemeToggle />
            </div>
          </ScrollReveal>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-300 dark:border-border">
            <nav className="px-4 py-6 space-y-4 bg-gray-200 dark:bg-background">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-300",
                    isNavActive(pathname, item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {inlineAuth && (
                <div className="sm:hidden pb-2">
                  <PageAuthActions loginRedirect={loginRedirect} />
                </div>
              )}
              {!hideUserMenu && !inlineAuth && (
                <SiteUserMenu
                  variant="mobile"
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default SiteHeader
