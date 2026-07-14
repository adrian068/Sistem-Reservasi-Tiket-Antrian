import { SirediLogo } from "@/components/siredi-logo"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"

type ReservationTicketCardProps = {
  queueNumber: string
  serviceName?: string
  date?: Date
  time?: string
  name: string
  className?: string
}

const TICKET_ROWS = [
  { key: "queueNumber", label: "Nomor Tiket" },
  { key: "service", label: "Layanan" },
  { key: "date", label: "Tanggal" },
  { key: "time", label: "Waktu" },
  { key: "name", label: "Nama" },
] as const

export function ReservationTicketCard({
  queueNumber,
  serviceName,
  date,
  time,
  name,
  className,
}: ReservationTicketCardProps) {
  const values: Record<(typeof TICKET_ROWS)[number]["key"], string> = {
    queueNumber,
    service: serviceName ?? "—",
    date: date ? format(date, "EEEE, d MMMM yyyy", { locale: id }) : "—",
    time: time ?? "—",
    name: name || "—",
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-lg rounded-2xl border-2 border-[#93c5fd] bg-[#f0f9ff] p-6 sm:p-8 shadow-md print:border-black print:bg-white print:shadow-none",
        className,
      )}
    >
      <div className="flex justify-center mb-5">
        <SirediLogo size="md" showText={false} href={null} />
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-[#0f2d6b] print:text-black">
          Tiket Reservasi
        </h3>
        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#2563eb] print:bg-black" />
      </div>

      <div className="mb-4 border-t border-dashed border-[#93c5fd] print:border-black" />

      <div className="space-y-0">
        {TICKET_ROWS.map((row, index) => (
          <div
            key={row.key}
            className={cn(
              "flex items-center justify-between gap-4 py-3 text-sm sm:text-base",
              index < TICKET_ROWS.length - 1 &&
                "border-b border-dashed border-[#bfdbfe] print:border-black",
            )}
          >
            <span className="font-semibold text-[#0f2d6b] print:text-black shrink-0">
              {row.label}
            </span>
            <span className="text-right font-medium text-[#2563eb] print:text-black break-words max-w-[55%]">
              {values[row.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
