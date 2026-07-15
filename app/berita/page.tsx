"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Eye, School, Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { SiteHeader } from "@/components/site-header"
import { useState, useEffect } from "react"
import Image from "next/image"
import { resolveImageUrl } from "@/lib/utils"

interface News {
  id: string
  judul: string
  slug: string
  ringkasan?: string
  kategori: string
  konten: string
  status: string
  tanggalTerbit?: string
  unggulan: boolean
  gambarUtama?: string
  views: number
  tags?: string
  idPenggunas?: string | null
  createdAt: string
  updatedAt: string
}

export default function BeritaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [allNewsData, setAllNewsData] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ["Semua", "PENGUMUMAN", "KEGIATAN", "PENDAFTARAN", "KEUANGAN", "KERJASAMA", "BEASISWA"]

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/news")
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

  const filteredNews = allNewsData.filter((news) => {
    const matchesSearch =
      news.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (news.ringkasan && news.ringkasan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      news.konten.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Semua" || news.kategori === selectedCategory
    return matchesSearch && matchesCategory
  })

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <SiteHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Memuat berita...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Semua Berita</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Temukan berita terbaru seputar pendidikan di Kota Banjarmasin</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-brand-primary hover:bg-brand-accent-hover"
                    : "bg-transparent hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredNews.map((news) => (
            <Card
              key={news.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group border-2 border-transparent hover:border-blue-400 max-w-sm mx-auto w-full bg-white dark:bg-card shadow-lg"
            >
              <div className="relative overflow-hidden h-44 sm:h-48">
                <Image
                  src={resolveImageUrl(news.gambarUtama)}
                  alt={news.judul}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <Badge className={`${getCategoryColor(news.kategori)} text-xs`}>{news.kategori}</Badge>
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

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">{formatDate(news.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{news.views}</span>
                  </div>
                </div>

                <Link
                  href={`/berita/${news.slug}`}
                  className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium transition-all duration-300 relative group-hover:translate-x-2 inline-flex items-center"
                >
                  Baca Selengkapnya
                  <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Tidak ada berita yang ditemukan.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("Semua")
              }}
              className="mt-4"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
