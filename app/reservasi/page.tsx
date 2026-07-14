"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { SimpleCalendar } from "@/components/ui/simple-calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, Clock, Users, GraduationCap, Baby, School, Menu, Printer } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ScrollReveal } from "@/components/scroll-reveal"
import { SiteHeader } from "@/components/site-header"
import { PublicSiteFooter } from "@/components/public-site-footer"
import { ReservationTicketCard } from "@/components/reservation-ticket-card"
import {
  ReservationStepIndicator,
  RESERVATION_TOTAL_STEPS,
} from "@/components/reservation-step-indicator"
import { SirediPageBackground } from "@/components/siredi-page-background"
import { isTimeSlotPassed, isSlotSelectable } from "@/lib/reservation-hours"
import { getTimeSlotsForDay } from "@/lib/time-slots"
import { TimeSlotColumns, type TimeSlotOption } from "@/components/time-slot-columns"
import {
  getDefaultLayananDisplay,
  layanansToDisplay,
  type LayananDisplay,
} from "@/lib/default-layanans"

// ⚡ Lazy load PDF generator (jsPDF library cukup besar ~100KB)
const generateTicketPDF = async (data: ReservationTicketData) => {
  const module = await import("@/lib/pdf-generator")
  return module.generateTicketPDF(data)
}

// Type import tetap normal
import type { ReservationTicketData } from "@/lib/pdf-generator"

// Format a JS Date to local YYYY-MM-DD (no timezone shift)
const formatLocalYmd = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getTimeSlots = async (
  selectedDate: Date | undefined,
  idLayanan: string,
  service: string,
) => {
  if (!selectedDate || !service) return []

  try {
    const params = new URLSearchParams({
      date: formatLocalYmd(selectedDate),
      service,
    })
    if (idLayanan) params.set("idLayanan", idLayanan)
    const response = await fetch(`/api/time-slots?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch time slots')
    }
    
    const result = await response.json()
    if (result.success) {
      return result.data
    }
  } catch (error) {
    console.error('Error fetching time slots:', error)
  }

  return getTimeSlotsForDay(selectedDate.getDay()).map((slot) => ({
    ...slot,
    booked: 0,
  }))
}

interface ReservationData {
  service: string
  idLayanan: string
  date: Date | undefined
  timeSlot: string
  name: string
  phone: string
  nik: string
  purpose: string
}

export default function ReservasiPage() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [reservationData, setReservationData] = useState<ReservationData>({
    service: "",
    idLayanan: "",
    date: undefined,
    timeSlot: "",
    name: "",
    phone: "",
    nik: "",
    purpose: "",
  })
  const [queueNumber, setQueueNumber] = useState<string>("")
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlotOption[]>([])
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)
  const [timeSlotTick, setTimeSlotTick] = useState(0)
  const [services, setServices] = useState<LayananDisplay[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [reservationStatus, setReservationStatus] = useState<{
    isOpen: boolean
    message: string
    nextOpenTime?: string
    mode?: string
    source?: string
  } | null>(null)

  // Status reservasi dari server (termasuk aturan admin buka/tutup)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/reservasi/status")
        const data = await res.json()
        if (res.ok && data.success) {
          setReservationStatus(data.data)
        }
      } catch (error) {
        console.error("Error fetching reservation status:", error)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch layanans from API (cadangan: PTK, SD, SMP, PAUD)
  useEffect(() => {
    const fetchLayanans = async () => {
      try {
        const response = await fetch("/api/layanans")
        const result = await response.json()

        if (response.ok && result.success && Array.isArray(result.data) && result.data.length > 0) {
          setServices(layanansToDisplay(result.data))
        } else {
          setServices(getDefaultLayananDisplay())
        }
      } catch (error) {
        console.error("Error fetching layanans:", error)
        setServices(getDefaultLayananDisplay())
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchLayanans()
  }, [])

  const handleServiceSelect = (serviceId: string, serviceName: string) => {
    setReservationData({
      ...reservationData,
      service: serviceName,
      idLayanan: serviceId,
    })
    setStep(2)
  }

  const handleDateContinue = () => {
    if (!selectedDate) return
    setReservationData({ ...reservationData, date: selectedDate, timeSlot: "" })
    loadTimeSlots(selectedDate, reservationData.idLayanan, reservationData.service)
    setStep(3)
  }

  const handleTimeContinue = async () => {
    if (!reservationData.timeSlot || !selectedDate) return

    const slots = await loadTimeSlots(
      selectedDate,
      reservationData.idLayanan,
      reservationData.service,
    )
    const slot = slots.find((s) => s.id === reservationData.timeSlot)
    if (!slot || !isSlotSelectable(slot, selectedDate)) {
      alert("Slot waktu tidak tersedia lagi. Silakan pilih waktu lain.")
      setReservationData((prev) => ({ ...prev, timeSlot: "" }))
      return
    }

    setStep(4)
  }

  const loadTimeSlots = async (date: Date, idLayanan: string, service: string) => {
    setIsLoadingTimeSlots(true)
    try {
      const slots = await getTimeSlots(date, idLayanan, service)
      setTimeSlots(slots)
      return slots as TimeSlotOption[]
    } catch (error) {
      console.error('Error loading time slots:', error)
      setTimeSlots([])
      return [] as TimeSlotOption[]
    } finally {
      setIsLoadingTimeSlots(false)
    }
  }

  // Muat ulang slot + cek waktu lewat (WITA) saat langkah pemilihan waktu
  useEffect(() => {
    if (step !== 3 || !selectedDate || !reservationData.service) return

    const refresh = () => {
      void loadTimeSlots(selectedDate, reservationData.idLayanan, reservationData.service)
    }

    refresh()
    const poll = setInterval(refresh, 15000)
    const clock = setInterval(() => setTimeSlotTick((t) => t + 1), 60000)

    return () => {
      clearInterval(poll)
      clearInterval(clock)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate, reservationData.idLayanan, reservationData.service])

  // Kosongkan pilihan jika slot sudah penuh atau lewat
  useEffect(() => {
    if (step !== 3 || !reservationData.timeSlot || !selectedDate) return

    const slot = timeSlots.find((s) => s.id === reservationData.timeSlot)
    if (!slot || !isSlotSelectable(slot, selectedDate)) {
      setReservationData((prev) => ({ ...prev, timeSlot: "" }))
    }
  }, [step, timeSlots, reservationData.timeSlot, selectedDate, timeSlotTick])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reservationStatus?.mode === "closed") {
      alert(reservationStatus.message || "Reservasi sedang ditutup oleh admin.")
      return
    }

    try {
      console.log('Submitting reservation data:', {
        service: reservationData.service,
        idLayanan: reservationData.idLayanan,
        date: reservationData.date?.toISOString().split('T')[0],
        timeSlot: reservationData.timeSlot,
        name: reservationData.name,
        phone: reservationData.phone,
        nik: reservationData.nik,
        purpose: reservationData.purpose,
      })

            const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: reservationData.service,
          idLayanan: reservationData.idLayanan,
                date: reservationData.date ? formatLocalYmd(reservationData.date) : undefined,
          timeSlot: reservationData.timeSlot,
          name: reservationData.name,
          phone: reservationData.phone,
          nik: reservationData.nik,
          purpose: reservationData.purpose,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Response error:', errorData)
        
        // Handle khusus untuk error 403 (reservasi tutup)
        if (response.status === 403) {
          const message = errorData.error || 'Reservasi sedang tutup'
          const nextOpenTime = errorData.nextOpenTime ? `\n\nBuka kembali: ${errorData.nextOpenTime}` : ''
          alert(`❌ ${message}${nextOpenTime}`)
          return
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('Response data:', result)
      
      if (result.success) {
        setQueueNumber(result.data.queueNumber)
        setEstimatedTime(result.data.estimatedCallTime)
        setStep(5)
        if (selectedDate) {
          loadTimeSlots(selectedDate, reservationData.idLayanan, reservationData.service)
        }
      } else {
        throw new Error(result.error || 'Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Terjadi kesalahan saat membuat reservasi: ${errorMessage}`)
    }
  }

  const handlePrint = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return

    setIsGeneratingPDF(true)

    const ticketData: ReservationTicketData = {
      queueNumber,
      serviceName: selectedService.name,
      name: reservationData.name,
      date: format(selectedDate, "PPP", { locale: id }),
      time: selectedTimeSlot.time,
      estimatedTime,
      phone: reservationData.phone,
      purpose: reservationData.purpose,
    }

    try {
      await generateTicketPDF(ticketData)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to regular print
      window.print()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDate(undefined)
    setIsCalendarOpen(false)
    setReservationData({
      service: "",
      idLayanan: "",
      date: undefined,
      timeSlot: "",
      name: "",
      phone: "",
      nik: "",
      purpose: "",
    })
    setQueueNumber("")
    setEstimatedTime("")
  }

  const selectedService = services.find((s) => s.id === reservationData.idLayanan)
  const selectedTimeSlot = timeSlots.find((t) => t.id === reservationData.timeSlot)

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden flex flex-col">
      <SirediPageBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <SiteHeader hideUserMenu inlineAuth loginRedirect="/reservasi" showBrandLogo />

        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8">
        {/* Status Banner - Informasi jam operasional */}
        {reservationStatus && (
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="text-center py-4 mb-6">
              <div className={`${
                reservationStatus.isOpen 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              } border rounded-lg p-4 inline-block`}>
                <span className="text-sm sm:text-base font-medium">
                  {reservationStatus.isOpen ? '✅' : 'ℹ️'} {reservationStatus.message}
                </span>
                {!reservationStatus.isOpen && reservationStatus.mode === "auto" && (
                  <div className="text-xs mt-2 opacity-90">
                    Anda tetap dapat melakukan reservasi untuk hari-hari berikutnya
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {step <= RESERVATION_TOTAL_STEPS && (
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="mb-6 sm:mb-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-5 sm:px-6 sm:py-6">
              <ReservationStepIndicator currentStep={step} />
            </div>
          </ScrollReveal>
        )}

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="shadow-lg border-0 bg-white dark:bg-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 p-4 sm:p-6">
                <CardTitle className="text-center text-xl sm:text-2xl text-blue-700 dark:text-blue-300">
                  Pilih Layanan
                </CardTitle>
                <p className="text-center text-sm sm:text-base text-muted-foreground">
                  Silakan pilih layanan yang Anda butuhkan
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 bg-white dark:bg-card">
                {isLoadingServices ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada layanan tersedia. Muat ulang halaman atau hubungi admin.
                  </p>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {services.map((service) => {
                    const Icon = service.icon
                    return (
                      <Card
                        key={service.id}
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-400 group bg-white dark:bg-card touch-manipulation"
                          onClick={() => handleServiceSelect(service.id, service.name)}
                      >
                          <CardContent className="p-4 sm:p-6 text-center bg-white dark:bg-card">
                          <div
                            className={cn(
                              "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110",
                              service.color,
                            )}
                          >
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-foreground">
                            {service.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{service.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="shadow-lg border-0 bg-white dark:bg-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 p-4 sm:p-6">
                <CardTitle className="text-center text-xl sm:text-2xl text-blue-700 dark:text-blue-300">
                  Pilih Tanggal
                </CardTitle>
                <p className="text-center text-sm sm:text-base text-muted-foreground">
                  Layanan:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedService?.name}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-card dark:bg-card">
                <div className="relative">
                  <Label className="text-sm sm:text-base font-medium text-foreground">Pilih Tanggal Kunjungan</Label>

                  <div className="hidden sm:block relative">
                    <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2 h-10 sm:h-12 bg-background dark:bg-background border-input dark:border-input text-sm sm:text-base touch-manipulation",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-auto p-0 bg-background border-border max-w-fit">
                        <DialogHeader className="px-6 pt-6 pb-2">
                          <DialogTitle>Pilih Tanggal</DialogTitle>
                        </DialogHeader>
                        <div className="px-6 pb-6">
                          <SimpleCalendar
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date)
                              setReservationData({ ...reservationData, date: date, timeSlot: "" })
                              setIsCalendarOpen(false)
                            }}
                            disabled={(date) => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              if (date < today) return true
                              const dayOfWeek = date.getDay()
                              return dayOfWeek === 0 || dayOfWeek === 6
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="sm:hidden">
                    <SimpleCalendar
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setReservationData({ ...reservationData, date: date, timeSlot: "" })
                      }}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        if (date < today) return true
                        const dayOfWeek = date.getDay()
                        return dayOfWeek === 0 || dayOfWeek === 6
                      }}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    *Layanan tidak tersedia pada hari Sabtu dan Minggu
                  </p>
                  {selectedDate && selectedDate.getDay() === 5 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                      *Hari Jumat: Layanan hanya tersedia jam 08:00 - 10:00
                    </p>
                  )}
                  {selectedDate && selectedDate.getDay() >= 1 && selectedDate.getDay() <= 4 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                      *Istirahat siang: 12:00 - 14:00 (layanan tutup)
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full sm:flex-1 h-10 sm:h-12 bg-transparent touch-manipulation"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleDateContinue}
                    disabled={!selectedDate}
                    className="w-full sm:flex-1 h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjutkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 3: Time Slot Selection */}
        {step === 3 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="shadow-lg border-0 bg-white dark:bg-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 p-4 sm:p-6">
                <CardTitle className="text-center text-xl sm:text-2xl text-blue-700 dark:text-blue-300">
                  Pilih Slot Waktu
                </CardTitle>
                <p className="text-center text-sm sm:text-base text-muted-foreground">
                  {selectedService?.name}
                  {selectedDate && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
                      </span>
                    </>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-card dark:bg-card">
                <div>
                  <Label className="text-sm sm:text-base font-medium text-foreground">Pilih Waktu</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Pilih kolom sesuai kebutuhan: pertemuan singkat (10–15 menit) atau standar (15–25 menit).
                    Sisa kuota per slot diperbarui otomatis. Slot penuh atau waktu yang sudah lewat (WITA) tidak
                    dapat dipilih.
                  </p>
                  {isLoadingTimeSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Memuat slot waktu...</div>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-muted-foreground font-medium">Layanan tidak tersedia</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedDate && selectedDate.getDay() === 0 && "Hari Minggu"}
                          {selectedDate && selectedDate.getDay() === 6 && "Hari Sabtu"}
                          {selectedDate &&
                            selectedDate.getDay() !== 0 &&
                            selectedDate.getDay() !== 6 &&
                            "Tidak ada slot waktu tersedia"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TimeSlotColumns
                      slots={timeSlots}
                      selectedSlotId={reservationData.timeSlot}
                      selectedDate={selectedDate}
                      onSelect={(slotId) =>
                        setReservationData({ ...reservationData, timeSlot: slotId })
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="w-full sm:flex-1 h-10 sm:h-12 bg-transparent touch-manipulation"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleTimeContinue}
                    disabled={!reservationData.timeSlot}
                    className="w-full sm:flex-1 h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjutkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 4: Personal Information */}
        {step === 4 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="shadow-lg border-0 bg-white dark:bg-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 p-4 sm:p-6">
                <CardTitle className="text-center text-xl sm:text-2xl text-blue-700 dark:text-blue-300">
                  Data Diri
                </CardTitle>
                <p className="text-center text-sm sm:text-base text-muted-foreground">
                  Lengkapi data diri Anda untuk reservasi
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 bg-white dark:bg-card">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm sm:text-base font-medium text-foreground">
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={reservationData.name}
                        onChange={(e) => setReservationData({ ...reservationData, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="mt-2 h-10 sm:h-12 bg-background dark:bg-background border-input dark:border-input text-foreground text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm sm:text-base font-medium text-foreground">
                        Nomor HP *
                      </Label>
                      <Input
                        id="phone"
                        required
                        type="tel"
                        value={reservationData.phone}
                        onChange={(e) => setReservationData({ ...reservationData, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className="mt-2 h-10 sm:h-12 bg-background dark:bg-background border-input dark:border-input text-foreground text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nik" className="text-sm sm:text-base font-medium text-foreground">
                      NIK (Opsional)
                    </Label>
                    <Input
                      id="nik"
                      value={reservationData.nik}
                      onChange={(e) => setReservationData({ ...reservationData, nik: e.target.value })}
                      placeholder="Nomor Induk Kependudukan"
                      className="mt-2 h-10 sm:h-12 bg-background dark:bg-background border-input dark:border-input text-foreground text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose" className="text-sm sm:text-base font-medium text-foreground">
                      Tujuan Kunjungan *
                    </Label>
                    <Textarea
                      id="purpose"
                      required
                      value={reservationData.purpose}
                      onChange={(e) => setReservationData({ ...reservationData, purpose: e.target.value })}
                      placeholder="Jelaskan secara singkat tujuan kunjungan Anda"
                      rows={3}
                      className="mt-2 bg-background dark:bg-background border-input dark:border-input text-foreground text-sm sm:text-base resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-4 sm:p-6 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
                      Ringkasan Reservasi:
                    </h4>
                    <div className="text-xs sm:text-sm space-y-2 text-foreground">
                      <p>
                        <span className="font-medium">Layanan:</span> {selectedService?.name}
                      </p>
                      <p>
                        <span className="font-medium">Tanggal:</span>{" "}
                        {selectedDate && format(selectedDate, "PPP", { locale: id })}
                      </p>
                      <p>
                        <span className="font-medium">Waktu:</span> {selectedTimeSlot?.time}
                        {selectedTimeSlot?.durationLabel && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({selectedTimeSlot.durationLabel})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(3)}
                      className="w-full sm:flex-1 h-10 sm:h-12 bg-transparent touch-manipulation"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:flex-1 h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 touch-manipulation"
                    >
                      Buat Reservasi
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 5: Ticket Display with Print Option */}
        {step === 5 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="space-y-6">
              <ReservationTicketCard
                queueNumber={queueNumber}
                serviceName={selectedService?.name}
                date={reservationData.date}
                time={selectedTimeSlot?.time}
                name={reservationData.name}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto print:hidden">
                <Button
                  onClick={handlePrint}
                  disabled={isGeneratingPDF}
                  variant="outline"
                  className="w-full sm:flex-1 h-11 sm:h-12 border-[#93c5fd] text-[#2563eb] hover:bg-[#eff6ff] touch-manipulation disabled:opacity-50"
                  size="lg"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isGeneratingPDF ? "Membuat PDF..." : "Unduh Tiket"}
                </Button>
                <Button
                  onClick={resetForm}
                  className="w-full sm:flex-1 h-11 sm:h-12 bg-[#2563eb] hover:bg-[#1d4ed8] touch-manipulation"
                  size="lg"
                >
                  Buat Baru
                </Button>
              </div>
            </div>
          </ScrollReveal>
        )}
        </div>
        <PublicSiteFooter />
      </div>
    </div>
  )
}
