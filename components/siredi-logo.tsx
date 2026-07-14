import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_SRC = "/logo-disdik.png"

const sizes = {
  sm: { img: 36, text: "text-sm sm:text-base" },
  md: { img: 48, text: "text-base sm:text-lg" },
  lg: { img: 96, text: "text-xl sm:text-2xl" },
  xl: { img: 140, text: "text-2xl sm:text-3xl" },
} as const

type SirediLogoProps = {
  size?: keyof typeof sizes
  showText?: boolean
  href?: string | null
  className?: string
  imageClassName?: string
  textClassName?: string
  variant?: "default" | "light"
}

export function SirediLogo({
  size = "md",
  showText = true,
  href = "/",
  className,
  imageClassName,
  textClassName,
  variant = "default",
}: SirediLogoProps) {
  const s = sizes[size]

  const content = (
    <div className={cn("flex items-center gap-2.5 sm:gap-3", className)}>
      <Image
        src={LOGO_SRC}
        alt="Logo Dinas Pendidikan Kota Banjarmasin"
        width={s.img}
        height={s.img}
        className={cn("rounded-full object-cover shrink-0", imageClassName)}
        priority={size === "lg" || size === "xl"}
      />
      {showText && (
        <span
          className={cn(
            "font-bold leading-tight",
            s.text,
            variant === "light" ? "text-white" : "text-[#0f2d6b] dark:text-white",
            textClassName,
          )}
        >
          Dinas Pendidikan
          <span className="block text-[0.85em] font-semibold opacity-90">
            Kota Banjarmasin
          </span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="shrink-0">
        {content}
      </Link>
    )
  }

  return content
}

export function SirediLogoHero({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center text-center px-6", className)}>
      <SirediLogo size="xl" showText={false} href={null} />
      <h2 className="mt-6 text-3xl font-bold text-white">SIREDI</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-blue-100">
        Sistem Informasi Tiket Antrian dan Reservasi Online
      </p>
      <p className="mt-1 text-sm text-blue-200/90">
        Dinas Pendidikan Kota Banjarmasin
      </p>
    </div>
  )
}
