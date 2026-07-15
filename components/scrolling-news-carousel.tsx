"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface News {
  id: string
  judul: string
  slug: string
  ringkasan?: string
  konten: string
  kategori: string
  status: string
  unggulan: boolean
  gambarUtama?: string
  views: number
  createdAt: string
}

export function ScrollingNewsCarousel() {
  const [allNewsData, setAllNewsData] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
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

  // Reset currentIndex when cardsPerView changes to avoid invalid index
  useEffect(() => {
    const maxIndex = Math.max(0, allNewsData.length - cardsPerView)
    if (currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [cardsPerView, allNewsData.length, currentIndex])

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/news?status=PUBLISHED&limit=6")
        if (response.ok) {
          const data = await response.json()
          setAllNewsData(data)
        } else {
          console.error("Failed to fetch news")
        }
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (allNewsData.length === 0) return
    const maxIndex = Math.max(0, allNewsData.length - cardsPerView)
    
    if (isAutoScrolling && maxIndex > 0) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1
          return nextIndex > maxIndex ? 0 : nextIndex
        })
      }, 4000) // Change slide every 4 seconds
    } else {
      // Clear interval when auto-scrolling is disabled
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
  }, [isAutoScrolling, allNewsData.length, cardsPerView])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoScrolling(false)
    
    // Clear any existing timeouts
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = undefined
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }
    
    // Resume auto-scroll after 10 seconds of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true)
    }, 10000)
  }

  const goToPrevious = () => {
    const maxIndex = Math.max(0, allNewsData.length - cardsPerView)
    const newIndex = currentIndex === 0 ? maxIndex : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const maxIndex = Math.max(0, allNewsData.length - cardsPerView)
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

  const getCategoryColor = (category: string) => {
    const colors = {
      PENGUMUMAN: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      KEGIATAN: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      PENDAFTARAN: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      KEUANGAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      KERJASAMA: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      BEASISWA: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
    }
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Memuat berita...</p>
      </div>
    )
  }

  if (allNewsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada berita tersedia</p>
      </div>
    )
  }

  const cardWidthPercentage = 100 / cardsPerView
  const maxIndex = Math.max(0, allNewsData.length - cardsPerView)

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
        {allNewsData.map((news, index) => (
          <div 
            key={news.id} 
            className="flex-shrink-0 px-2 md:px-3"
            style={{ width: `${cardWidthPercentage}%` }}
          >
            <Card className="card-glow card-glow-cyan overflow-hidden group border-2 border-transparent h-full bg-white dark:bg-card shadow-lg">
              <div className="relative overflow-hidden h-44 sm:h-48">
                <Image
                  src={news.gambarUtama || "/placeholder.svg"}
                  alt={news.judul}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <Badge className={`${getCategoryColor(news.kategori)} text-xs`}>
                    {news.kategori}
                  </Badge>
                  {news.unggulan && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs">
                      ⭐ Unggulan
                    </Badge>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 transition-all duration-300 group-hover:text-brand-accent line-clamp-2">
                  {news.judul}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {news.ringkasan || news.konten.substring(0, 100) + "..."}
                </p>
                <Link
                  href={`/berita/${news.slug}`}
                  className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium transition-all duration-300 relative group-hover:translate-x-2 inline-flex items-center"
                >
                  Baca Selengkapnya
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
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-300"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-300"
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
