"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SirediLogo } from "@/components/siredi-logo"

interface Reservation {
  id: string
  queueNumber: string
  name: string
  status: string
  layanan?: {
    name: string
  } | null
  service?: string
}

const SERVICE_COLORS = {
  ptk: { bg: 'bg-brand-primary', text: 'text-brand-primary', bgLight: 'bg-brand-light-bg' },
  sd: { bg: 'bg-green-600', text: 'text-green-600', bgLight: 'bg-green-50' },
  smp: { bg: 'bg-yellow-600', text: 'text-yellow-600', bgLight: 'bg-yellow-50' },
  paud: { bg: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50' },
}

const SERVICE_LABELS = {
  ptk: 'PTK (PENDIDIK DAN TENAGA KEPENDIDIKAN)',
  sd: 'SD UMUM',
  smp: 'SMP UMUM',
  paud: 'PAUD',
}

const getServiceKey = (reservation: Reservation): string => {
  const serviceName = (reservation.layanan?.name || reservation.service || '').toLowerCase()
  
  if (serviceName.includes('ptk')) return 'ptk'
  if (serviceName.includes('sd')) return 'sd'
  if (serviceName.includes('smp')) return 'smp'
  if (serviceName.includes('paud')) return 'paud'
  
  return 'ptk' // default
}

export default function DisplayAntrianPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [calledReservations, setCalledReservations] = useState<{[key: string]: Reservation[]}>({
    ptk: [],
    sd: [],
    smp: [],
    paud: [],
  })
 
  const getCurrentWITATime = (): Date => {
   
    const now = new Date()
    const witaString = now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' })
    return new Date(witaString)
  }

  useEffect(() => {
    setMounted(true)
    setCurrentTime(getCurrentWITATime())
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      setCurrentTime(getCurrentWITATime())
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations')
        if (response.ok) {
          const data = await response.json()
          const allReservations = data.data || []
          setReservations(allReservations)
          
          
          const grouped: {[key: string]: Reservation[]} = {
            ptk: [],
            sd: [],
            smp: [],
            paud: [],
          }
          
          allReservations
            .filter((r: Reservation) => r.status === 'called')
            .forEach((r: Reservation) => {
              const key = getServiceKey(r)
              grouped[key].push(r)
            })
          
          setCalledReservations(grouped)
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
      }
    }

    fetchReservations()
    // Refresh every 5 seconds
    const interval = setInterval(fetchReservations, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    
    return date.toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    
    return date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Makassar',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-brand-light to-brand-hero dark:from-gray-900 dark:to-gray-800 p-1 sm:p-2 md:p-3 lg:p-4 flex flex-col">
      {/* Header - Compact untuk monitor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1.5 sm:p-2 md:p-2.5 lg:p-3 mb-1 sm:mb-2 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-2 lg:gap-3">
          <div className="flex-1 flex items-center gap-3">
            <SirediLogo size="sm" showText={false} href={null} imageClassName="w-8 h-8 sm:w-10 sm:h-10" />
            <div>
            <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 leading-tight">
              Layar Antrian — Dinas Pendidikan Kota Banjarmasin
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground">
              Nomor Antrian Layanan
            </p>
            </div>
          </div>
          <div className="text-center md:text-right flex-shrink-0">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-brand-primary dark:text-brand-light leading-none" suppressHydrationWarning>
              {currentTime ? formatTime(currentTime) : '--:--:--'}
            </p>
            <p className="text-xs sm:text-xs md:text-sm lg:text-base text-muted-foreground mt-0.5" suppressHydrationWarning>
              {currentTime ? formatDate(currentTime) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Queue Display Grid - Optimized untuk 2x2 tanpa scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 flex-1 min-h-0 overflow-hidden">
        {(Object.keys(SERVICE_LABELS) as Array<keyof typeof SERVICE_LABELS>).map((serviceKey) => {
          const colors = SERVICE_COLORS[serviceKey]
          const label = SERVICE_LABELS[serviceKey]
          const currentQueue = calledReservations[serviceKey]
          const latestCalled = currentQueue[currentQueue.length - 1]

          return (
            <Card key={serviceKey} className="shadow-lg border border-border flex flex-col h-full overflow-hidden">
              <CardHeader className={`${colors.bg} text-white py-1 sm:py-1.5 md:py-2 px-2 sm:px-2.5 md:px-3 flex-shrink-0`}>
                <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-center leading-tight">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 flex-1 flex flex-col justify-center min-h-0">
                {latestCalled ? (
                  <div className="text-center">
                    <p className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium mb-0.5 sm:mb-1">
                      Nomor Antrian:
                    </p>
                    <div className={`${colors.bgLight} dark:bg-opacity-20 rounded-lg p-1.5 sm:p-2 md:p-2.5 lg:p-3 border border-dashed ${colors.text} border-opacity-50`}>
                      <p className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black ${colors.text} animate-pulse leading-none break-all`}>
                        {latestCalled.queueNumber}
                      </p>
                    </div>
                    <div className="pt-0.5 sm:pt-1 mt-0.5 sm:mt-1 border-t border-border">
                      <p className="text-xs sm:text-xs md:text-sm lg:text-base font-semibold text-foreground truncate px-1">
                        {latestCalled.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium mb-0.5 sm:mb-1">
                      Belum ada antrian
                    </p>
                    <div className={`${colors.bgLight} rounded-lg p-1.5 sm:p-2 md:p-2.5 lg:p-3`}>
                      <p className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold ${colors.text} opacity-30 leading-none`}>-</p>
                    </div>
                  </div>
                )}

                {/* Previous queues (last 2) */}
                {currentQueue.length > 1 && (
                  <div className="mt-0.5 sm:mt-1 pt-0.5 sm:pt-1 border-t border-border">
                    <p className="text-xs sm:text-xs md:text-xs text-muted-foreground mb-0.5 text-center">Sebelumnya:</p>
                    <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap">
                      {currentQueue.slice(-3, -1).reverse().map((res) => (
                        <Badge
                          key={res.id}
                          variant="outline"
                          className={`${colors.text} text-xs sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1`}
                        >
                          {res.queueNumber}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer - Compact */}
      <div className="mt-0.5 sm:mt-1 text-center flex-shrink-0">
        <p className="text-muted-foreground text-xs sm:text-xs md:text-sm">
          Harap perhatikan nomor antrian Anda di layar monitor
        </p>
      </div>
    </div>
  )
}
