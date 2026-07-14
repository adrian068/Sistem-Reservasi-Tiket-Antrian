"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const HERO_IMAGE = "/images/dinas-pendidikan-banjarmasin-real.jpeg"

type DinasHeroProps = {
  title: ReactNode
  subtitle?: string
  actions?: ReactNode
  compact?: boolean
  className?: string
}

export function DinasHero({
  title,
  subtitle,
  actions,
  compact = false,
  className,
}: DinasHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        compact
          ? "min-h-[260px] sm:min-h-[320px] md:min-h-[360px]"
          : "min-h-[300px] sm:min-h-[380px] md:min-h-[420px]",
        className,
      )}
    >
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={HERO_IMAGE}
          alt="Kantor Dinas Pendidikan Kota Banjarmasin"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/65" />
      </div>

      {actions ? (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20 pointer-events-auto">
          {actions}
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center text-center text-white max-w-4xl mx-auto px-4 h-full",
          compact ? "py-14 sm:py-16" : "py-16 sm:py-20",
        )}
      >
        <h1
          className={cn(
            "font-bold leading-tight drop-shadow-lg",
            compact ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl sm:text-3xl md:text-4xl",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "text-blue-50/95 mx-auto leading-relaxed drop-shadow-md mt-3",
              compact ? "text-sm sm:text-base max-w-xl" : "text-base sm:text-lg max-w-2xl",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  )
}
