"use client"

import { Clock, Timer, Hourglass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DURATION_CATEGORIES,
  groupSlotsByDuration,
  type DurationCategory,
} from "@/lib/time-slots"
import { isTimeSlotPassed, getSlotRemaining, isSlotSelectable } from "@/lib/reservation-hours"

export type TimeSlotOption = {
  id: string
  time: string
  capacity: number
  booked: number
  durationCategory?: DurationCategory
  durationLabel?: string
  durationMinutes?: number
}

interface TimeSlotColumnsProps {
  slots: TimeSlotOption[]
  selectedSlotId: string
  selectedDate?: Date
  onSelect: (slotId: string) => void
}

function SlotColumn({
  category,
  slots,
  selectedSlotId,
  selectedDate,
  onSelect,
}: {
  category: DurationCategory
  slots: TimeSlotOption[]
  selectedSlotId: string
  selectedDate?: Date
  onSelect: (slotId: string) => void
}) {
  const meta = DURATION_CATEGORIES[category]
  const Icon = category === "short" ? Timer : Hourglass

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border-2 p-3 sm:p-4 min-h-[240px] sm:min-h-[280px]",
        category === "short"
          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-brand-border-light bg-brand-light/80 dark:border-brand-header-dark dark:bg-brand-header-dark/30",
      )}
    >
      <div className="flex items-start gap-2.5 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
        <div
          className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0",
            category === "short"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-brand-primary/15 text-brand-text-navy dark:text-brand-light",
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base text-foreground">{meta.title}</p>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{meta.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6 flex-1 flex items-center justify-center">
          Tidak ada slot tersedia
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[min(360px,45vh)] overflow-y-auto pr-0.5 flex-1">
          {slots.map((slot) => {
            const remaining = getSlotRemaining(slot)
            const isPassed = selectedDate ? isTimeSlotPassed(selectedDate, slot.id) : false
            const isDisabled = !isSlotSelectable(slot, selectedDate)
            const isSelected = selectedSlotId === slot.id

            return (
              <Button
                key={slot.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                disabled={isDisabled}
                className={cn(
                  "h-auto min-h-[56px] sm:min-h-[60px] w-full justify-between gap-2.5 py-3 px-3 sm:px-4 text-left",
                  isSelected &&
                    (category === "short"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-brand-primary hover:bg-brand-accent-hover"),
                  isDisabled && "opacity-50 cursor-not-allowed",
                  !isSelected &&
                    !isDisabled &&
                    "bg-background dark:bg-background hover:border-current",
                )}
                onClick={() => {
                  if (!isDisabled) onSelect(slot.id)
                }}
              >
                <span className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Clock className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 opacity-80" />
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-sm sm:text-base font-semibold leading-tight">{slot.time}</span>
                    {isPassed ? (
                      <span className="text-xs text-red-500 mt-0.5 font-medium">Sudah lewat</span>
                    ) : remaining <= 0 ? (
                      <span className="text-xs text-red-500 mt-0.5 font-medium">Penuh</span>
                    ) : (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {remaining} dari {slot.capacity} tersisa
                      </span>
                    )}
                  </span>
                </span>
                {!isPassed && slot.capacity > 1 && (
                  <span
                    className={cn(
                      "shrink-0 text-xs sm:text-sm font-semibold rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 border min-w-[4.75rem] sm:min-w-[5.25rem] text-center",
                      remaining <= 0
                        ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-950/40 dark:border-red-800"
                        : "border-border bg-muted/60 text-foreground",
                    )}
                  >
                    {slot.booked}/{slot.capacity} tamu
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TimeSlotColumns({
  slots,
  selectedSlotId,
  selectedDate,
  onSelect,
}: TimeSlotColumnsProps) {
  const grouped = groupSlotsByDuration(slots)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-3 sm:gap-4 mt-2">
      <SlotColumn
        category="short"
        slots={grouped.short}
        selectedSlotId={selectedSlotId}
        selectedDate={selectedDate}
        onSelect={onSelect}
      />
      <SlotColumn
        category="long"
        slots={grouped.long}
        selectedSlotId={selectedSlotId}
        selectedDate={selectedDate}
        onSelect={onSelect}
      />
    </div>
  )
}
