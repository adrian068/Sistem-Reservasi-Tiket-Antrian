"use client"

import { SirediLogo } from "@/components/siredi-logo"
import { cn } from "@/lib/utils"

type AdminSidebarBrandProps = {
  collapsed?: boolean
  variant?: "default" | "light"
  className?: string
}

/** Logo Disdik untuk sidebar admin — hanya tampilan brand */
export function AdminSidebarBrand({
  collapsed = false,
  variant = "default",
  className,
}: AdminSidebarBrandProps) {
  return (
    <SirediLogo
      size="sm"
      showText={!collapsed}
      href={null}
      variant={variant}
      className={className}
      textClassName={variant === "light" ? "text-white" : "text-sidebar-foreground"}
      imageClassName="w-10 h-10"
    />
  )
}
