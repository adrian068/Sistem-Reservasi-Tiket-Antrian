"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Agenda {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
}

interface ScrollingAgendaCarouselProps {
  agendas: Agenda[]
}

export function ScrollingAgendaCarousel({ agendas }: ScrollingAgendaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [cardsPerView, setCardsPerView] = useState(3)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<NodeJS.Timeout>()
  const resumeTimeoutRef = useRef<NodeJS.Timeout>()

  // Update cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1) // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2) // Tablet: 2 cards
      } else {
        setCardsPerView(3) // Desktop: 3 cards
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  // Reset currentIndex when cardsPerView changes
  useEffect(() => {
    const maxIndex = Math.max(0, agendas.length - cardsPerView)
    if (currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [cardsPerView, agendas.length, currentIndex])

  // Auto-scroll functionality
  useEffect(() => {
    if (agendas.length === 0) return
    const maxIndex = Math.max(0, agendas.length - cardsPerView)
    
    if (isAutoScrolling && maxIndex > 0) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1
          return nextIndex > maxIndex ? 0 : nextIndex
        })
      }, 4000) // Change slide every 4 seconds
    } else {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
        autoScrollRef.current = undefined
      }
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
        autoScrollRef.current = undefined
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = undefined
      }
    }
  }, [isAutoScrolling, agendas.length, cardsPerView])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoScrolling(false)
    
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = undefined
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true)
    }, 10000)
  }

  const goToPrevious = () => {
    const maxIndex = Math.max(0, agendas.length - cardsPerView)
    const newIndex = currentIndex === 0 ? maxIndex : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const maxIndex = Math.max(0, agendas.length - cardsPerView)
    const newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
    goToSlide(newIndex)
  }

  // Handle mouse events for auto-scroll control
  const handleMouseEnter = () => {
    setIsAutoScrolling(false)
  }

  const handleMouseLeave = () => {
    setIsAutoScrolling(true)
  }

  // Don't show carousel if there are 3 or fewer agendas
  if (agendas.length <= 3) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
        {agendas.map((agenda) => (
          <div key={agenda.id}>
            <Card className="card-glow card-glow-purple overflow-hidden group border-2 border-transparent h-full max-w-sm mx-auto">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 transition-all duration-300 group-hover:text-brand-accent line-clamp-2">
                  {agenda.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold">Tanggal:</span> {new Date(agenda.date).toLocaleDateString('id-ID')}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3">
                  <span className="font-semibold">Lokasi:</span> {agenda.location}
                </p>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{agenda.description}</p>
                <Link
                  href={`/agenda/${agenda.slug}`}
                  className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium transition-all duration-300 relative group-hover:translate-x-2 inline-flex items-center"
                >
                  Lihat Detail
                  <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  // Show carousel if there are more than 3 agendas
  const cardWidthPercentage = 100 / cardsPerView
  const maxIndex = Math.max(0, agendas.length - cardsPerView)

  return (
    <div className="relative overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Scrolling Container */}
      <div
        ref={scrollContainerRef}
        className="flex transition-transform duration-700 ease-in-out will-change-transform"
        style={{
          transform: `translateX(-${currentIndex * cardWidthPercentage}%)`,
        }}
      >
        {agendas.map((agenda, index) => (
          <div 
            key={agenda.id} 
            className="flex-shrink-0 px-2 md:px-3"
            style={{ width: `${cardWidthPercentage}%` }}
          >
            <Card className="card-glow card-glow-purple overflow-hidden group border-2 border-transparent h-full bg-white dark:bg-card shadow-lg">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 transition-all duration-300 group-hover:text-brand-accent line-clamp-2">
                  {agenda.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold">Tanggal:</span> {new Date(agenda.date).toLocaleDateString('id-ID')}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3">
                  <span className="font-semibold">Lokasi:</span> {agenda.location}
                </p>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{agenda.description}</p>
                <Link
                  href={`/agenda/${agenda.slug}`}
                  className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium transition-all duration-300 relative group-hover:translate-x-2 inline-flex items-center"
                >
                  Lihat Detail
                  <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={goToNext}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-brand-primary scale-125" : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Auto-scroll indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isAutoScrolling ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
      </div>
    </div>
  )
}

