"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Phone, Mail, Calendar, School as SchoolIcon, Award, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

interface Sekolah {
  id: string
  nama: string
  alamat?: string
  kecamatan?: string
  jenjang?: string
  akreditasi?: string
  status?: string
  telepon?: string
  email?: string
  tahunBerdiri?: string
  deskripsi?: string
  gambarUtama?: string
  foto1?: string
  foto2?: string
}

export default function SchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [school, setSchool] = useState<Sekolah | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sekolahs/${params.id}`)
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data sekolah")
        }

        const result = await response.json()
        if (result.success && result.data) {
          setSchool(result.data)
        } else {
          setError("Sekolah tidak ditemukan")
        }
      } catch (err) {
        console.error("Error fetching school:", err)
        setError("Gagal memuat data sekolah")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSchool()
    }
  }, [params.id])

  const getAccreditationColor = (accreditation?: string) => {
    switch (accreditation) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status?: string) => {
    return status === "Negeri" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="mt-4 text-muted-foreground">Memuat data sekolah...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center py-12">
            <SchoolIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sekolah tidak ditemukan</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/direktori-sekolah">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Direktori
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/direktori-sekolah">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {school.gambarUtama && (
              <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={school.gambarUtama}
                  alt={school.nama}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* School Info Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-3">{school.nama}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {school.jenjang && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {school.jenjang}
                        </Badge>
                      )}
                      {school.akreditasi && (
                        <Badge className={getAccreditationColor(school.akreditasi)}>
                          <Award className="w-3 h-3 mr-1" />
                          Akreditasi {school.akreditasi}
                        </Badge>
                      )}
                      {school.status && (
                        <Badge className={getStatusColor(school.status)}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {school.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                {school.deskripsi && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Tentang Sekolah</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {school.deskripsi}
                    </p>
                  </div>
                )}

                {/* Gallery */}
                {(school.foto1 || school.foto2) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Galeri Foto</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {school.foto1 && (
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={school.foto1}
                            alt="Foto 1"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {school.foto2 && (
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={school.foto2}
                            alt="Foto 2"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.alamat && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alamat</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{school.alamat}</p>
                      {school.kecamatan && (
                        <p className="text-sm text-gray-500 dark:text-gray-500">Kec. {school.kecamatan}</p>
                      )}
                    </div>
                  </div>
                )}

                {school.telepon && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Telepon</p>
                      <a href={`tel:${school.telepon}`} className="text-sm text-brand-accent hover:underline">
                        {school.telepon}
                      </a>
                    </div>
                  </div>
                )}

                {school.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</p>
                      <a href={`mailto:${school.email}`} className="text-sm text-brand-accent hover:underline break-all">
                        {school.email}
                      </a>
                    </div>
                  </div>
                )}

                {school.tahunBerdiri && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tahun Berdiri</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{school.tahunBerdiri}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informasi Umum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Jenjang</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{school.jenjang || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Akreditasi</span>
                  <Badge className={getAccreditationColor(school.akreditasi)}>
                    {school.akreditasi || "-"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <Badge className={getStatusColor(school.status)}>{school.status || "-"}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kecamatan</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{school.kecamatan || "-"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
