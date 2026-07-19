"use client"

import { useEffect, useRef } from "react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"

const DEFAULT_INTERVAL_MS = 2000

type UseTimeSlotSyncOptions = {
  /** Aktifkan polling / realtime */
  enabled: boolean
  /** Callback muat ulang data slot */
  onRefresh: () => void | Promise<void>
  /** Interval polling (ms). Default 3 detik */
  intervalMs?: number
}

/**
 * Sinkronkan kuota slot waktu antar user & admin.
 * Polling cepat + Supabase Realtime (jika env tersedia) + refresh saat tab fokus.
 */
export function useTimeSlotSync({
  enabled,
  onRefresh,
  intervalMs = DEFAULT_INTERVAL_MS,
}: UseTimeSlotSyncOptions) {
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    if (!enabled) return

    const refresh = () => {
      void onRefreshRef.current()
    }

    refresh()

    const poll = setInterval(refresh, intervalMs)

    const onFocus = () => refresh()
    window.addEventListener("focus", onFocus)

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh()
    }
    document.addEventListener("visibilitychange", onVisibility)

    const supabase = getSupabaseBrowser()
    const channel = supabase
      ?.channel("reservations-slot-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => refresh(),
      )
      .subscribe()

    return () => {
      clearInterval(poll)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      if (channel && supabase) {
        void supabase.removeChannel(channel)
      }
    }
  }, [enabled, intervalMs])
}
