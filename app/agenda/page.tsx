"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Users, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { useState, useEffect } from "react"
import Image from "next/image"
import { resolveImageUrl } from "@/lib/utils"

interface Agenda {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  address: string
  organizer: string
  capacity: number
  category: string
  registrationFee: string
  contactPerson: string
  imageUrl: string
  status: string
}

export default function AgendaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [selectedStatus, setSelectedStatus] = useState("Semua")
  const [allAgendaData, setAllAgendaData] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ["Semua", "Seminar", "Workshop", "Pelatihan", "Sosialisasi", "Rapat", "Lainnya"]
  const statuses = ["Semua", "SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"]

  // Fetch agendas from API
  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/agendas")
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setAllAgendaData(result.data)
          }
        } else {
          console.error("Failed to fetch agendas")
        }
      } catch (error) {
        console.error("Error fetching agendas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgendas()
  }, [])

  const filteredAgendas = allAgendaData.filter((agenda) => {
    const matchesSearch =
      agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Semua" || agenda.category === selectedCategory
    const matchesStatus = selectedStatus === "Semua" || agenda.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      ONGOING: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      SCHEDULED: "Terjadwal",
      ONGOING: "Berlangsung",
      COMPLETED: "Selesai",
      CANCELLED: "Dibatalkan",
    }
    return labels[status as keyof typeof labels] || status
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
            <p className="text-muted-foreground text-lg">Memuat agenda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Semua Agenda</h1>
          <p className="text-muted-foreground text-lg">
            Temukan agenda kegiatan dan acara pendidikan di Kota Banjarmasin
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari agenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Kategori:</p>
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

          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Status:</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={`transition-all duration-300 ${
                    selectedStatus === status
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-transparent hover:bg-green-50 hover:border-green-300"
                  }`}
                >
                  {status === "Semua" ? status : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Agenda Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgendas.map((agenda) => (
            <Card
              key={agenda.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 group border-2 border-transparent hover:border-blue-400 bg-white dark:bg-card shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={resolveImageUrl(agenda.imageUrl)}
                  alt={agenda.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Badge className={getStatusColor(agenda.status)}>{getStatusLabel(agenda.status)}</Badge>
                  <Badge variant="outline">{agenda.category}</Badge>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 transition-all duration-300 group-hover:text-brand-accent line-clamp-2">
                  {agenda.title}
                </h3>

                <p className="text-muted-foreground mb-4 line-clamp-2">{agenda.description}</p>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(agenda.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{agenda.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{agenda.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Kapasitas: {agenda.capacity} orang</span>
                  </div>
                </div>

                <Link
                  href={`/agenda/${agenda.slug}`}
                  className="text-brand-accent hover:text-brand-accent-hover font-medium transition-all duration-300 relative group-hover:translate-x-2 inline-flex items-center"
                >
                  Lihat Detail
                  <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAgendas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Tidak ada agenda yang ditemukan.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("Semua")
                setSelectedStatus("Semua")
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

