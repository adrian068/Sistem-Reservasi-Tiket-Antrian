require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

async function main() {
  const { listFallbackReservations } = await import("../lib/reservations-fallback-store.ts")
  const file = await listFallbackReservations()
  console.log("file count:", file.length)
  console.log(JSON.stringify(file[0], null, 2))

  try {
    const { listAllReservations } = await import("../lib/reservations-service.ts")
    const { data, fallback } = await listAllReservations()
    console.log("merged count:", data.length, "fallback:", fallback)
    if (data[0]) console.log("first id:", data[0].id, "status:", data[0].status)
  } catch (e) {
    console.error("listAllReservations error:", e.message)
  }
}

main()
