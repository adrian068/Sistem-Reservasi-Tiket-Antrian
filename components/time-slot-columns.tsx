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
        "flex flex-col rounded-xl border-2 p-3 sm:p-4 min-h-[200px]",
        category === "short"
          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/30",
      )}
    >
      <div className="flex items-start gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/10">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            category === "short"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-blue-500/15 text-blue-700 dark:text-blue-400",
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">{meta.title}</p>
          <p className="text-xs font-medium text-muted-foreground">{meta.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{meta.description}</p>
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
                  "h-auto w-full justify-between gap-2 py-2.5 px-3 text-left",
                  isSelected &&
                    (category === "short"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"),
                  isDisabled && "opacity-50 cursor-not-allowed",
                  !isSelected &&
                    !isDisabled &&
                    "bg-background dark:bg-background hover:border-current",
                )}
                onClick={() => {
                  if (!isDisabled) onSelect(slot.id)
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-xs sm:text-sm font-semibold leading-tight">{slot.time}</span>
                    {isPassed ? (
                      <span className="text-[10px] text-red-500 mt-0.5">Sudah lewat</span>
                    ) : remaining <= 0 ? (
                      <span className="text-[10px] text-red-500 mt-0.5">Penuh</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {remaining} dari {slot.capacity} tersisa
                      </span>
                    )}
                  </span>
                </span>
                {!isPassed && slot.capacity > 1 && (
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-medium rounded-full px-2 py-0.5 border",
                      remaining <= 0
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-border bg-muted/50 text-muted-foreground",
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
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
