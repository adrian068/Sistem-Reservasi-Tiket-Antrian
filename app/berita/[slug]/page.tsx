"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Eye, Share2, Facebook, Twitter, Linkedin, School, Menu } from "lucide-react"
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
  konten: string
  kategori: string
  status: string
  tanggalTerbit?: string
  unggulan: boolean
  gambarUtama?: string
  views: number
  tags?: string
  tagsArray?: string[]
  idPenggunas?: string | null
  createdAt: string
  updatedAt: string
}

// Sample fallback news data untuk backward compatibility
const newsDataFallback = {
  "pembangunan-sekolah-baru-banjarmasin-timur": {
    id: 1,
    title: "Pembangunan Sekolah Baru di Banjarmasin Timur",
    slug: "pembangunan-sekolah-baru-banjarmasin-timur",
    excerpt:
      "Dinas Pendidikan Kota Banjarmasin meresmikan pembangunan kompleks sekolah baru yang akan menampung 1.200 siswa dengan fasilitas modern dan ramah lingkungan.",
    content: `Dinas Pendidikan Kota Banjarmasin resmi memulai pembangunan kompleks sekolah baru di wilayah Banjarmasin Timur. Proyek ambisius ini direncanakan akan selesai dalam 18 bulan ke depan dengan anggaran sebesar Rp 25 miliar.

Kompleks sekolah baru ini akan terdiri dari gedung SD dan SMP yang terintegrasi, dengan kapasitas total 1.200 siswa. Fasilitas yang akan dibangun meliputi 36 ruang kelas ber-AC, laboratorium IPA modern, perpustakaan digital, aula serbaguna, lapangan olahraga, dan area parkir yang luas.

"Pembangunan sekolah ini merupakan komitmen kami untuk meningkatkan akses pendidikan berkualitas di Banjarmasin Timur," ujar Kepala Dinas Pendidikan Kota Banjarmasin, Dr. Ahmad Rizki, M.Pd.

Sekolah ini juga akan menerapkan konsep green building dengan panel surya, sistem pengolahan air hujan, dan taman hijau di setiap lantai. Diharapkan sekolah ini dapat menjadi model sekolah ramah lingkungan di Kalimantan Selatan.

Pembangunan akan dilakukan secara bertahap, dimulai dari gedung utama, kemudian fasilitas penunjang seperti laboratorium dan perpustakaan. Kontraktor yang ditunjuk adalah PT. Bangun Karya Mandiri yang telah berpengalaman dalam pembangunan fasilitas pendidikan.

Masyarakat sekitar menyambut baik rencana pembangunan ini karena akan memudahkan akses pendidikan bagi anak-anak mereka. Sebelumnya, siswa di wilayah tersebut harus menempuh jarak cukup jauh untuk bersekolah.

Dinas Pendidikan juga berencana melengkapi sekolah ini dengan teknologi pembelajaran terkini, termasuk smart board di setiap kelas dan sistem pembelajaran berbasis digital yang terintegrasi dengan platform SIMDIK Learning.

Kepala Dinas Pendidikan menambahkan bahwa pembangunan sekolah ini merupakan bagian dari program peningkatan infrastruktur pendidikan yang akan terus dilakukan hingga tahun 2027. "Kami berkomitmen untuk memastikan setiap anak di Banjarmasin mendapatkan akses pendidikan yang berkualitas dan mudah dijangkau," tutupnya.`,
    category: "Infrastruktur",
    author: "Tim Redaksi SIMDIK",
    date: "2025-01-10",
    views: 1250,
    image: "/placeholder.svg?height=400&width=800&text=Pembangunan+Sekolah+Baru",
    gambarUtama: "/placeholder.svg?height=400&width=800&text=Pembangunan+Sekolah+Baru",
    tags: ["pembangunan", "sekolah baru", "banjarmasin timur", "infrastruktur", "green building"],
  },
  "program-digitalisasi-pembelajaran": {
    id: 2,
    title: "Program Digitalisasi Pembelajaran Diluncurkan",
    slug: "program-digitalisasi-pembelajaran",
    excerpt:
      "Seluruh sekolah di Banjarmasin kini dilengkapi dengan platform pembelajaran digital untuk meningkatkan kualitas pendidikan dan adaptasi teknologi modern.",
    content: `Dinas Pendidikan Kota Banjarmasin resmi meluncurkan program digitalisasi pembelajaran yang akan diterapkan di seluruh sekolah negeri dan swasta di wilayah Banjarmasin. Program ini merupakan bagian dari transformasi digital pendidikan yang telah direncanakan sejak tahun 2023.

Platform pembelajaran digital yang dikembangkan bernama "SIMDIK Learning" akan menyediakan berbagai fitur seperti kelas virtual, perpustakaan digital, sistem penilaian online, dan komunikasi antara guru, siswa, dan orang tua.

Sebanyak 150 sekolah akan mendapatkan pelatihan intensif untuk menggunakan platform ini. Setiap sekolah juga akan mendapatkan bantuan perangkat tablet untuk siswa dan laptop untuk guru.

"Digitalisasi ini bukan hanya tentang teknologi, tetapi juga tentang mempersiapkan siswa menghadapi era digital," kata Dr. Siti Nurhaliza, M.Pd, Kepala Bidang Kurikulum Dinas Pendidikan.

Program ini diharapkan dapat meningkatkan engagement siswa dalam pembelajaran dan memudahkan guru dalam menyampaikan materi dengan lebih interaktif.

Fitur unggulan dari SIMDIK Learning meliputi adaptive learning yang dapat menyesuaikan tingkat kesulitan materi dengan kemampuan siswa, gamifikasi pembelajaran untuk meningkatkan motivasi belajar, dan analytics dashboard untuk memantau progress belajar siswa secara real-time.

Implementasi akan dilakukan secara bertahap, dimulai dari sekolah-sekolah pilot di setiap kecamatan, kemudian diperluas ke seluruh sekolah dalam waktu 6 bulan. Setiap sekolah akan mendapatkan pendampingan teknis selama masa transisi.

Platform ini juga dilengkapi dengan sistem keamanan berlapis untuk melindungi data pribadi siswa dan guru. Seluruh aktivitas pembelajaran akan tercatat dan dapat diakses oleh orang tua untuk memantau perkembangan belajar anak mereka.

"Dengan digitalisasi ini, kami yakin kualitas pendidikan di Banjarmasin akan semakin meningkat dan dapat bersaing di tingkat nasional," tambah Kepala Dinas Pendidikan.`,
    category: "Teknologi",
    author: "Redaksi SIMDIK",
    date: "2025-01-08",
    views: 980,
    image: "/placeholder.svg?height=400&width=800&text=Digitalisasi+Pembelajaran",
    gambarUtama: "/placeholder.svg?height=400&width=800&text=Digitalisasi+Pembelajaran",
    tags: ["digitalisasi", "teknologi", "simdik learning", "pembelajaran online", "transformasi digital"],
  },
  "pelatihan-guru-berkelanjutan-2024": {
    id: 3,
    title: "Pelatihan Guru Berkelanjutan Tahun 2024",
    slug: "pelatihan-guru-berkelanjutan-2024",
    excerpt:
      "Program pelatihan komprehensif untuk 500 guru se-Kota Banjarmasin dalam meningkatkan kompetensi pedagogik dan profesional di era digital.",
    content: `Dinas Pendidikan Kota Banjarmasin menggelar program pelatihan guru berkelanjutan yang akan diikuti oleh 500 guru dari berbagai jenjang pendidikan. Program ini berlangsung selama 6 bulan dengan berbagai modul pelatihan yang disesuaikan dengan kebutuhan era digital.

Pelatihan ini mencakup beberapa aspek penting seperti pengembangan kurikulum merdeka, pemanfaatan teknologi dalam pembelajaran, manajemen kelas modern, dan pengembangan karakter siswa.

Narasumber pelatihan terdiri dari pakar pendidikan nasional, praktisi teknologi pendidikan, dan guru-guru berprestasi dari berbagai daerah. Setiap peserta akan mendapatkan sertifikat yang dapat digunakan untuk kenaikan pangkat.

"Guru adalah kunci utama dalam transformasi pendidikan. Melalui pelatihan ini, kami berharap kualitas pembelajaran di Banjarmasin semakin meningkat," ungkap Kepala Dinas Pendidikan.

Program ini juga dilengkapi dengan sistem mentoring dimana guru senior akan membimbing guru junior dalam mengimplementasikan hasil pelatihan di kelas masing-masing.

Materi pelatihan dibagi menjadi beberapa modul: Modul 1 tentang Kurikulum Merdeka dan implementasinya, Modul 2 tentang teknologi pembelajaran digital, Modul 3 tentang assessment dan evaluasi modern, dan Modul 4 tentang pengembangan karakter siswa.

Setiap modul akan dilaksanakan selama 2 minggu dengan kombinasi pembelajaran tatap muka dan online. Peserta juga akan mendapatkan tugas praktik yang harus diimplementasikan di sekolah masing-masing.

"Pelatihan ini tidak hanya memberikan teori, tetapi juga praktik langsung yang dapat diterapkan di kelas," kata Dr. Bambang Sutrisno, M.Pd, koordinator program pelatihan.

Evaluasi program akan dilakukan secara berkala untuk memastikan efektivitas pelatihan dan penyesuaian materi sesuai kebutuhan lapangan.`,
    category: "Pelatihan",
    author: "Humas Disdik",
    date: "2025-01-05",
    views: 750,
    image: "/placeholder.svg?height=400&width=800&text=Pelatihan+Guru",
    gambarUtama: "/placeholder.svg?height=400&width=800&text=Pelatihan+Guru",
    tags: ["pelatihan", "guru", "kompetensi", "kurikulum merdeka", "teknologi pembelajaran"],
  },
}

interface NewsDetailPageProps {
  params: {
    slug: string
  }
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedNews, setRelatedNews] = useState<News[]>([])
  const [featuredImageSize, setFeaturedImageSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/news/slug/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setNews(data)

          // Fetch related news (same category, excluding current)
          const relatedResponse = await fetch("/api/news")
          if (relatedResponse.ok) {
            const allNews = await relatedResponse.json()
            const related = allNews.filter(
              (item: News) => item.category === data.category && item.slug !== data.slug
            ).slice(0, 2)
            setRelatedNews(related)
          }
        } else {
          // Try fallback for backward compatibility
          const fallback = newsDataFallback[params.slug as keyof typeof newsDataFallback]
          if (fallback) {
            setNews(fallback as any)
          } else {
            setNews(null)
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setNews(null)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Memuat berita...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Berita Tidak Ditemukan</h1>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    )
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format content paragraphs
  const contentParagraphs = news.konten.split("\n\n").filter((p) => p.trim() !== "")

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
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

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Badge className={getCategoryColor(news.kategori)}>{news.kategori}</Badge>
              {news.unggulan && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  ⭐ Unggulan
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{news.judul}</h1>

            {news.ringkasan && (
              <p className="text-lg text-muted-foreground mb-6 italic">{news.ringkasan}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(news.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{news.views} views</span>
              </div>
            </div>

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
              src={resolveImageUrl(news.gambarUtama)}
              alt={news.judul}
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

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none text-foreground">
                {contentParagraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {news.tagsArray && news.tagsArray.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {news.tagsArray.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Berita Terkait</h3>
                <div className="space-y-4">
                  {relatedNews.map((item) => (
                    <Link key={item.slug} href={`/berita/${item.slug}`}>
                      <div className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
                          <Image
                            src={resolveImageUrl(item.gambarUtama)}
                            alt={item.judul}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1 hover:text-brand-accent transition-colors">
                            {item.judul}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.ringkasan || item.konten.substring(0, 100) + "..."}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
