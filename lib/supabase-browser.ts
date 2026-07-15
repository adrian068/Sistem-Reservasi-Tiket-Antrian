import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

/** Client Supabase untuk browser (realtime slot waktu). */
export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  if (!browserClient) {
    browserClient = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  }

  return browserClient
}
