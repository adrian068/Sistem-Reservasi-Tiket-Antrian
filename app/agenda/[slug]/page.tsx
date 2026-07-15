"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Phone,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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

export default function AgendaDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [featuredImageSize, setFeaturedImageSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/agendas")
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            const foundAgenda = result.data.find((item: Agenda) => item.slug === slug)
            if (foundAgenda) {
              setAgenda(foundAgenda)
            } else {
              setNotFound(true)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching agenda:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchAgenda()
    }
  }, [slug])

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Memuat agenda...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !agenda) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Agenda Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Agenda yang Anda cari tidak tersedia.</p>
            <Link href="/agenda">
              <Button>Kembali ke Daftar Agenda</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Format description paragraphs
  const descriptionParagraphs = agenda.description.split("\n\n").filter((p) => p.trim() !== "")

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/agenda">
            <Button
              variant="outline"
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Agenda</span>
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Badge className={getStatusColor(agenda.status)}>{getStatusLabel(agenda.status)}</Badge>
              <Badge variant="outline">{agenda.category}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{agenda.title}</h1>

            {/* Share Buttons */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-foreground">Bagikan:</span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="p-2 bg-transparent">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="p-2 bg-transparent">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="p-2 bg-transparent">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="p-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="w-full mb-8 rounded-lg overflow-hidden bg-muted">
            <Image
              src={resolveImageUrl(agenda.imageUrl)}
              alt={agenda.title}
              width={featuredImageSize?.width ?? 1200}
              height={featuredImageSize?.height ?? 675}
              className="w-full h-auto object-contain bg-background"
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              onLoadingComplete={(img) => {
                const naturalWidth = img.naturalWidth || img.width
                const naturalHeight = img.naturalHeight || img.height
                if (
                  naturalWidth > 0 &&
                  naturalHeight > 0 &&
                  (featuredImageSize?.width !== naturalWidth || featuredImageSize?.height !== naturalHeight)
                ) {
                  setFeaturedImageSize({ width: naturalWidth, height: naturalHeight })
                }
              }}
            />
          </div>

          {/* Event Details */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Detail Acara</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-semibold text-foreground">{formatDate(agenda.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Waktu</p>
                    <p className="font-semibold text-foreground">{agenda.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lokasi</p>
                    <p className="font-semibold text-foreground">{agenda.location}</p>
                    {agenda.address && <p className="text-sm text-muted-foreground mt-1">{agenda.address}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Penyelenggara</p>
                    <p className="font-semibold text-foreground">{agenda.organizer}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kapasitas</p>
                    <p className="font-semibold text-foreground">{agenda.capacity} orang</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Biaya Pendaftaran</p>
                    <p className="font-semibold text-foreground">{agenda.registrationFee}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-brand-accent mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kontak</p>
                    <p className="font-semibold text-foreground">{agenda.contactPerson}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Deskripsi</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
