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
        <p className="text-xs sm:text-sm font-medium text-brand-text uppercase tracking-wider">
          Proses Reservasi
        </p>
        <p className="mt-1 text-lg sm:text-2xl font-bold text-brand-text-navy">
          Langkah {currentStep}{" "}
          <span className="font-normal text-brand-primary">
            dari {RESERVATION_TOTAL_STEPS}
          </span>
        </p>
        {activeStep && (
          <p className="mt-1 text-sm sm:text-base text-brand-text">
            {activeStep.label}
          </p>
        )}
      </div>

      <div className="mb-4 sm:mb-5 h-1.5 rounded-full bg-brand-light overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-500 ease-out"
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
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
                  isCompleted &&
                    "bg-brand-light text-brand-text-navy shadow-sm",
                  isCurrent &&
                    "bg-brand-primary text-white ring-4 ring-brand-light shadow-lg",
                  isUpcoming && "bg-brand-light text-brand-text-navy border border-brand-border-light",
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
                  "mt-1.5 text-xs sm:text-sm font-medium text-center leading-tight text-brand-text-navy",
                  isCurrent && "font-semibold",
                  isUpcoming && "opacity-70",
                  isCompleted && "opacity-90",
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
