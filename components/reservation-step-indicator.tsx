"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export const RESERVATION_STEPS = [
  { id: 1, label: "Layanan", shortLabel: "Layanan" },
  { id: 2, label: "Tanggal", shortLabel: "Tanggal" },
  { id: 3, label: "Waktu", shortLabel: "Waktu" },
  { id: 4, label: "Data Diri", shortLabel: "Data" },
  { id: 5, label: "Tiket", shortLabel: "Selesai" },
] as const

export const RESERVATION_TOTAL_STEPS = RESERVATION_STEPS.length

interface ReservationStepIndicatorProps {
  currentStep: number
  className?: string
}

export function ReservationStepIndicator({
  currentStep,
  className,
}: ReservationStepIndicatorProps) {
  const activeStep = RESERVATION_STEPS.find((s) => s.id === currentStep)
  const progressPercent =
    currentStep <= 1
      ? 0
      : Math.min(100, ((currentStep - 1) / (RESERVATION_TOTAL_STEPS - 1)) * 100)

  return (
    <div className={cn("w-full", className)}>
      <div className="text-center mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm font-medium text-blue-100/90 uppercase tracking-wider">
          Proses Reservasi
        </p>
        <p className="mt-1 text-lg sm:text-2xl font-bold text-white">
          Langkah {currentStep}{" "}
          <span className="font-normal text-blue-100/80">
            dari {RESERVATION_TOTAL_STEPS}
          </span>
        </p>
        {activeStep && (
          <p className="mt-1 text-sm sm:text-base text-blue-50/90">
            {activeStep.label}
          </p>
        )}
      </div>

      <div className="mb-4 sm:mb-5 h-1.5 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-start justify-between gap-1 sm:gap-2 overflow-x-auto pb-1">
        {RESERVATION_STEPS.map((stepItem) => {
          const isCompleted = currentStep > stepItem.id
          const isCurrent = currentStep === stepItem.id
          const isUpcoming = currentStep < stepItem.id

          return (
            <div
              key={stepItem.id}
              className="flex flex-col items-center flex-1 min-w-[52px] sm:min-w-0"
            >
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shrink-0",
                  isCompleted &&
                    "bg-white text-blue-700 shadow-md",
                  isCurrent &&
                    "bg-white text-blue-700 ring-4 ring-white/40 scale-110 shadow-lg",
                  isUpcoming && "bg-white/20 text-white/70 border border-white/30",
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                ) : (
                  stepItem.id
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[4.5rem] sm:max-w-none",
                  isCurrent && "text-white font-semibold",
                  isCompleted && "text-blue-50/90",
                  isUpcoming && "text-white/50",
                )}
              >
                {stepItem.shortLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
