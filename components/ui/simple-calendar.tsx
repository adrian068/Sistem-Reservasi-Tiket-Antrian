"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
  /** embedded = tanpa border/shadow sendiri, dipakai di dalam kotak langkah reservasi */
  variant?: "default" | "embedded"
}

export function SimpleCalendar({
  selected,
  onSelect,
  disabled,
  className,
  variant = "default",
}: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate days array
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }

  const isSelected = (date: Date) => {
    return selected && 
           date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear()
  }

  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }

  const isEmbedded = variant === "embedded"

  return (
    <div
      className={cn(
        "w-full",
        !isEmbedded && "bg-background border border-border rounded-xl shadow-lg p-4 sm:p-5",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          {monthNames[month]} {year}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((date, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center justify-center text-sm sm:text-base cursor-pointer rounded-md transition-colors",
              !date && "invisible",
              date && isSelected(date) && "bg-primary text-primary-foreground font-bold",
              date && !isSelected(date) && !isDisabled(date) && "hover:bg-accent hover:text-accent-foreground",
              date && isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground font-bold ring-2 ring-primary ring-inset",
              date && isDisabled(date) && "text-muted-foreground opacity-50 cursor-not-allowed",
              !date && "cursor-default"
            )}
            onClick={() => date && handleDateClick(date)}
          >
            {date?.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
