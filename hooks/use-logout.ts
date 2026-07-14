"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

export function useLogout() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async (): Promise<boolean> => {
    if (isLoggingOut) return false

    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (!response.ok) return false

      router.push("/login")
      router.refresh()
      return true
    } catch (error) {
      console.error("Logout error:", error)
      return false
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, router])

  return { logout, isLoggingOut }
}
