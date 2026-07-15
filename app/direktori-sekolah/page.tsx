"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, School, MapPin, Phone, Mail, ArrowLeft } from "lucide-react"
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

export default function SchoolDirectory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [schools, setSchools] = useState<Sekolah[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const schoolsPerPage = 9

  // Fetch schools from API
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/sekolahs")
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data sekolah")
        }

        const result = await response.json()
        if (result.success && result.data) {
          setSchools(result.data)
        } else {
          setError("Tidak ada data sekolah")
        }
      } catch (err) {
        console.error("Error fetching schools:", err)
        setError("Gagal memuat data sekolah")
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  // Filter schools
  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.nama.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !selectedLevel || selectedLevel === "Semua Jenjang" || school.jenjang === selectedLevel
      const matchesDistrict =
      !selectedDistrict || selectedDistrict === "Semua Kecamatan" || school.kecamatan === selectedDistrict

      return matchesSearch && matchesLevel && matchesDistrict
    })

  // Pagination
  const indexOfLastSchool = currentPage * schoolsPerPage
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage
  const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool)
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage)

  // Get unique districts from data
  const uniqueDistricts = Array.from(new Set(schools.map((s) => s.kecamatan).filter(Boolean))).sort()

  // Get badge color based on accreditation
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

  // Get badge color based on status
  const getStatusColor = (status?: string) => {
    return status === "Negeri" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <SiteHeader />

      {/* Hero Section with Cover Image */}
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Background Image and Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/dinas-pendidikan-banjarmasin-real.jpeg"
            alt="Kantor Dinas Pendidikan Kota Banjarmasin"
            fill
            className="object-cover object-center animate-bg-pan"
            priority
          />
          <div className="absolute inset-0 bg-blue-900 opacity-60 pointer-events-none"></div>
      </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <School className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
            Direktori Sekolah
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md px-2">
            Temukan informasi lengkap sekolah di Kota Banjarmasin
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
        <div className="mb-6">
            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Semua Sekolah</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Temukan informasi lengkap sekolah di Kota Banjarmasin
            </p>
        </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                type="text"
                placeholder="Cari nama sekolah..."
                    value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                    className="pl-10"
                  />
                </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Jenjang Filters */}
              <Button
                variant={selectedLevel === "" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLevel("")
                  setCurrentPage(1)
                }}
                className={`transition-all duration-300 ${
                  selectedLevel === ""
                    ? "bg-brand-primary hover:bg-brand-accent-hover"
                    : "bg-transparent hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                Semua Jenjang
              </Button>
              <Button
                variant={selectedLevel === "PAUD" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLevel("PAUD")
                  setCurrentPage(1)
                }}
                className={`transition-all duration-300 ${
                  selectedLevel === "PAUD"
                    ? "bg-brand-primary hover:bg-brand-accent-hover"
                    : "bg-transparent hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                PAUD
              </Button>
              <Button
                variant={selectedLevel === "SD" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLevel("SD")
                  setCurrentPage(1)
                }}
                className={`transition-all duration-300 ${
                  selectedLevel === "SD"
                    ? "bg-brand-primary hover:bg-brand-accent-hover"
                    : "bg-transparent hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                SD
              </Button>
              <Button
                variant={selectedLevel === "SMP" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLevel("SMP")
                  setCurrentPage(1)
                }}
                className={`transition-all duration-300 ${
                  selectedLevel === "SMP"
                    ? "bg-brand-primary hover:bg-brand-accent-hover"
                    : "bg-transparent hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                SMP
              </Button>

              {/* Kecamatan Filter (Dropdown) */}
              {uniqueDistricts.length > 0 && (
                <Select
                  value={selectedDistrict}
                  onValueChange={(value) => {
                    setSelectedDistrict(value === "Semua Kecamatan" ? "" : value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua Kecamatan">Semua Kecamatan</SelectItem>
                    {uniqueDistricts.map((district) => (
                      <SelectItem key={district} value={district!}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold">{filteredSchools.length}</span> sekolah
              {searchTerm && ` untuk pencarian "${searchTerm}"`}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
              <p className="mt-4 text-gray-600">Memuat data sekolah...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <School className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Muat Ulang
                </Button>
              </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSchools.length === 0 && (
            <div className="text-center py-12">
              <School className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada sekolah ditemukan</h3>
              <p className="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedLevel("")
                  setSelectedDistrict("")
                  setCurrentPage(1)
                }}
                variant="outline"
              >
                Reset Filter
              </Button>
          </div>
          )}

          {/* Schools Grid */}
          {!loading && !error && currentSchools.length > 0 && (
            <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {currentSchools.map((school) => (
                  <Card key={school.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-card shadow-lg">
                {/* School Image */}
                    <div className="relative h-40 sm:h-48 bg-gray-200">
                      {school.gambarUtama ? (
                  <Image
                          src={school.gambarUtama}
                          alt={school.nama}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                          <School className="w-16 h-16 text-blue-400" />
                        </div>
                      )}
                </div>

                    {/* School Info */}
                <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                          {school.nama}
                  </h3>
                      </div>

                  {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {school.jenjang && (
                          <Badge variant="outline" className="bg-blue-50 text-brand-text-navy border-blue-200">
                            {school.jenjang}
                          </Badge>
                        )}
                        {school.akreditasi && (
                          <Badge className={getAccreditationColor(school.akreditasi)}>
                            Akreditasi {school.akreditasi}
                    </Badge>
                        )}
                        {school.status && (
                          <Badge className={getStatusColor(school.status)}>{school.status}</Badge>
                        )}
                  </div>

                      {/* Address */}
                      {school.alamat && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{school.alamat}</span>
                        </div>
                      )}

                      {/* Phone */}
                      {school.telepon && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{school.telepon}</span>
                        </div>
                      )}

                      {/* Email */}
                      {school.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{school.email}</span>
                        </div>
                      )}

                      {/* View Detail Button */}
                  <Link href={`/direktori-sekolah/${school.id}`}>
                        <Button className="w-full bg-brand-primary hover:bg-brand-accent-hover">Lihat Detail</Button>
                  </Link>
                </CardContent>
              </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                    {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                      }
                      // Show ellipsis
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <PaginationItem key={pageNumber}>...</PaginationItem>
                      }
                      return null
                    })}

                  <PaginationItem>
                    <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={
                          currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              )}
            </>
        )}
      </div>
      </section>
    </div>
  )
}
