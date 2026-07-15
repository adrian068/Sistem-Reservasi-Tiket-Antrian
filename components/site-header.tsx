"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
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
  /** Tampilkan logo Disdik dengan header navy (default: aktif) */
  showBrandLogo?: boolean
}

export function SiteHeader({
  hideUserMenu = false,
  inlineAuth = false,
  loginRedirect = "/reservasi",
  showBrandLogo = true,
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
          ? "bg-brand-header border-brand-header-dark text-white"
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
                <SirediLogo size="sm" variant="default" />
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
                        "absolute -bottom-1 left-0 h-0.5 bg-brand-accent transition-all duration-300",
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
                className={cn(
                  "md:hidden p-2 rounded-lg transition-all duration-300",
                  showBrandLogo ? "hover:bg-white/10" : "hover:bg-accent",
                )}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className={cn("w-6 h-6", showBrandLogo ? "text-white" : "text-foreground")} />
                ) : (
                  <Menu className={cn("w-6 h-6", showBrandLogo ? "text-white" : "text-foreground")} />
                )}
              </button>
              <ThemeToggle />
            </div>
          </ScrollReveal>
        </div>

        {isMobileMenuOpen && (
          <div
            className={cn(
              "md:hidden border-t",
              showBrandLogo ? "border-brand-header-dark" : "border-gray-300 dark:border-border",
            )}
          >
            <nav
              className={cn(
                "px-4 py-6 space-y-4",
                showBrandLogo ? "bg-brand-header" : "bg-gray-200 dark:bg-background",
              )}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-300",
                    isNavActive(pathname, item.href)
                      ? showBrandLogo
                        ? "bg-white/20 text-white"
                        : "bg-primary text-primary-foreground"
                      : showBrandLogo
                        ? "text-blue-100 hover:bg-white/10 hover:text-white"
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
