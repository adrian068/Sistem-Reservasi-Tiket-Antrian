"use client";
import {
  School,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Lightbulb,
  CheckCircle,
  GraduationCap,
  Menu,
  Instagram,
  Facebook,
  Youtube,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ScanEyeIcon,
  PenSquare,
  LucideComputer,
  MessageCircleCodeIcon,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteHeader } from "@/components/site-header";
import { useState } from "react";
import { notFound } from "next/navigation";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { SirediLogo } from "@/components/siredi-logo";

const activityDetails = {
  "mengamati-dan-mengalisis-sitem-informasi-yang-sudah-ada": {
    title:
      "Mengamati dan mengalisis sitem informasi yang sudah ada di Dinas Pendidikan Kota Banjarmasi",
    description:
      "Kegiatan ini bertujuan untuk memahami sistem informasi yang telah diterapkan, mengidentifikasi kekuatan dan kelemahan, serta mencari peluang untuk peningkatan efisiensi dan efektivitas pengelolaan data pendidikan.",
    icon: ScanEyeIcon,
    date: "Agt 2025 - Sept 2025",
    location: "Dinas Pendidikan",
    fullDescription:
      "Kegiatan mengamati dan menganalisis sistem informasi yang sudah ada di Dinas Pendidikan Kota Banjarmasin merupakan langkah awal yang krusial dalam upaya peningkatan pengelolaan data pendidikan. Melalui kegiatan ini, tim akan melakukan evaluasi menyeluruh terhadap sistem yang sedang berjalan, termasuk infrastruktur teknologi, proses bisnis, serta keterlibatan pengguna.",
    objectives: [
      "Memahami sistem informasi yang telah diterapkan di Dinas Pendidikan",
      "Mengidentifikasi kekuatan dan kelemahan sistem yang ada",
      "Mencari peluang untuk peningkatan efisiensi dan efektivitas pengelolaan data pendidikan",
    ],
    photos: [
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.33.jpeg",
        title: "Mengamati Sistem Informasi",
        description:
          "Tim melakukan observasi langsung terhadap sistem informasi yang sedang berjalan di Dinas Pendidikan Kota Banjarmasin.",
      },
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.32%20(1).jpeg",
        title: "Analisis Data dan Proses",
        description:
          "Tim melakukan analisis mendalam terhadap data dan proses bisnis yang terkait dengan sistem informasi pendidikan.",
      },
    ],
  },
  "mendesain-siredi-sistem-reservasi-dinas-pendidikan-dan-informasi": {
    title: "Mendesain SIREDI (Sistem Reservasi Dinas Pendidikan dan Informasi)",
    description:
      "Kegiatan ini fokus pada perancangan sistem reservasi yang efisien dan user-friendly untuk memudahkan akses informasi dan layanan pendidikan bagi masyarakat Banjarmasin.",
    icon: PenSquare,
    date: "Agt 2025 - Sept 2025",
    location: "Dinas Pendidikan",
    fullDescription:
      "Kegiatan mendesain SIREDI (Sistem Reservasi Dinas Pendidikan dan Informasi) merupakan langkah strategis dalam meningkatkan layanan pendidikan di Kota Banjarmasin. Sistem ini dirancang untuk memberikan kemudahan akses informasi dan layanan pendidikan kepada masyarakat melalui platform digital yang terintegrasi.",
    objectives: [
      "Merancang sistem reservasi yang efisien dan user-friendly",
      "Memudahkan akses informasi dan layanan pendidikan bagi masyarakat Banjarmasin",
      "Meningkatkan transparansi dan akuntabilitas layanan pendidikan",
    ],
    photos: [
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-19%20at%2009.02.33.jpeg",
        title: "sesi perancangan sistem",
        description:
          "Merancang arsitektur dan alur kerja sistem reservasi SIREDI.",
      },
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.38.jpeg",
        title: "Pembentukan Prototipe",
        description: "merancang prototipe awal dari sistem reservasi SIREDI.",
      },
    ],
  },
  "pengkodean-development-siredi": {
    title: "Pengkodean (Development) SIREDI",
    description:
      "Mengembangkan sistem reservasi Dinas Pendidikan dan Informasi (SIREDI) berdasarkan desain yang telah dibuat.",
    icon: LucideComputer,
    date: "Sept 2025 - Okt 2025",
    location: "Dinas Pendidikan",
    fullDescription:
      "Kegiatan pengkodean (development) SIREDI merupakan tahap krusial dalam mewujudkan sistem reservasi Dinas Pendidikan dan Informasi yang telah dirancang. Pada tahap ini, tim pengembang akan menerjemahkan desain sistem menjadi kode program yang fungsional dan dapat dioperasikan. Proses pengkodean melibatkan berbagai aspek teknis, termasuk pemilihan bahasa pemrograman, pengembangan database, serta integrasi dengan sistem yang sudah ada.",
    objectives: [
      "Menerjemahkan desain sistem menjadi kode program yang fungsional",
      "Mengembangkan database yang efisien untuk mendukung operasional SIREDI",
      "Melakukan integrasi dengan sistem informasi pendidikan yang sudah ada",
      "Melakukan pengujian awal untuk memastikan sistem berjalan sesuai spesifikasi",
    ],
    photos: [
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-19%20at%2009.54.34%20(1).jpeg",
        title: "Tim Pengembang Sedang mengoding",
        description:
          "Tim pengembang sedang bekerja keras mengkode sistem reservasi SIREDI sesuai dengan desain yang telah dibuat.",
      },
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-19%20at%2009.54.35%20(1).jpeg",
        title: "Tim pengembang berdiskusi",
        description:
          "Tim pengembang berdiskusi untuk menyelesaikan tantangan teknis selama proses pengkodean SIREDI.",
      },
    ],
  },
  "mendiskusikan-website-siredi-dengan-dinas-pendidikan-kota-banjarmasin": {
    title:
      "Mendiskusikan website SIREDI dengan Dinas Pendidikan Kota Banjarmasin",
    description:
      "Melakukan diskusi mendalam dengan pihak Dinas Pendidikan untuk memastikan bahwa website SIREDI memenuhi kebutuhan dan harapan mereka dalam pengelolaan data reservasi.",
    icon: MessageCircleCodeIcon,
    date: "Nov 2025",
    location: "Dinas Pendidikan",
    fullDescription:
      "Kegiatan mendiskusikan website SIREDI dengan Dinas Pendidikan Kota Banjarmasin merupakan langkah penting untuk memastikan bahwa sistem yang dikembangkan benar-benar sesuai dengan kebutuhan dan harapan pengguna akhir. Diskusi ini melibatkan berbagai pihak terkait, termasuk tim pengembang, serta staf Dinas Pendidikan.",
    objectives: [
      "Memastikan bahwa website SIREDI memenuhi kebutuhan dan harapan Dinas Pendidikan",
      "Mendapatkan masukan dan umpan balik dari pihak Dinas Pendidikan untuk perbaikan sistem",
      "Membangun komunikasi yang baik antara tim pengembang dan Dinas Pendidikan untuk kelancaran implementasi sistem",
    ],
    photos: [
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.29.jpeg",
        title: "Diskusi dengan staf Dinas Pendidikan",
        description:
          "Tim pengembang berdiskusi dengan staf Dinas Pendidikan untuk memahami kebutuhan mereka terkait website SIREDI.",
      },
      {
        url: "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.32.jpeg",
        title: "Menunjukkan Progres Website",
        description:
          "Tim pengembang menjelaskan progres pengembangan website SIREDI kepada pihak Dinas Pendidikan.",
      },
    ],
  },
  "pengembangan-sistem-informasi-pendidikan": {
    title: "Pengembangan Sistem Informasi Pendidikan",
    description:
      "Meningkatkan dan mengembangkan sistem informasi untuk pengelolaan data pendidikan yang lebih efisien dan terintegrasi.",
    icon: School,
    date: "Agu 2025 - Okt 2025",
    location: "Dinas Pendidikan",
    fullDescription:
      "Program pengembangan sistem informasi pendidikan merupakan upaya modernisasi pengelolaan data pendidikan di Kota Banjarmasin. Sistem ini dirancang untuk mengintegrasikan seluruh data pendidikan mulai dari data siswa, guru, sekolah, hingga program-program pendidikan.",
    objectives: [
      "Mengintegrasikan seluruh data pendidikan dalam satu sistem",
      "Meningkatkan efisiensi pengelolaan administrasi pendidikan",
      "Menyediakan data real-time untuk pengambilan keputusan",
      "Memudahkan akses informasi bagi stakeholder pendidikan",
    ],
    photos: [
      {
        url: "/kegiatan/sistem-1.png",
        title: "Rapat Pengembangan Sistem",
        description:
          "Tim IT dan stakeholder pendidikan membahas spesifikasi dan kebutuhan sistem informasi pendidikan yang akan dikembangkan.",
      },
      {
        url: "/kegiatan/sistem-2.png",
        title: "Testing dan Quality Assurance",
        description:
          "Proses testing menyeluruh untuk memastikan sistem berjalan dengan baik dan memenuhi kebutuhan pengguna.",
      },
      {
        url: "/kegiatan/sistem-3.png",
        title: "Pelatihan Pengguna Sistem",
        description:
          "Pelatihan intensif bagi staff Dinas Pendidikan dan sekolah-sekolah untuk menggunakan sistem informasi yang baru.",
      },
    ],
  },
  "forum-komunikasi-orang-tua-dan-sekolah": {
    title: "Forum Komunikasi Orang Tua dan Sekolah",
    description:
      "Menyelenggarakan forum rutin untuk mempererat komunikasi antara orang tua, guru, dan pihak dinas pendidikan.",
    icon: Users,
    date: "Nov 2025",
    location: "Berbagai Lokasi",
    fullDescription:
      "Forum komunikasi orang tua dan sekolah merupakan wadah dialog konstruktif antara berbagai pihak yang terlibat dalam pendidikan anak. Forum ini bertujuan untuk membangun sinergi yang kuat antara rumah, sekolah, dan dinas pendidikan.",
    objectives: [
      "Mempererat hubungan antara orang tua dan sekolah",
      "Meningkatkan partisipasi orang tua dalam pendidikan anak",
      "Membahas isu-isu pendidikan yang relevan",
      "Mencari solusi bersama untuk tantangan pendidikan",
    ],
    photos: [
      {
        url: "/kegiatan/forum-1.png",
        title: "Diskusi Panel Pendidikan",
        description:
          "Diskusi panel yang melibatkan orang tua, guru, dan perwakilan Dinas Pendidikan membahas isu-isu terkini dalam pendidikan.",
      },
      {
        url: "/kegiatan/forum-2.png",
        title: "Workshop Parenting",
        description:
          "Sesi workshop khusus untuk orang tua tentang cara mendampingi anak dalam proses belajar di era digital.",
      },
      {
        url: "/kegiatan/forum-3.png",
        title: "Networking Session",
        description:
          "Sesi networking informal yang memungkinkan orang tua, guru, dan pihak sekolah untuk saling bertukar pengalaman dan ide.",
      },
    ],
  },
};

export default function ActivityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const activity = activityDetails[params.slug as keyof typeof activityDetails];

  if (!activity) {
    notFound();
  }

  const Icon = activity.icon;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % activity.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + activity.photos.length) % activity.photos.length
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />

      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/tentang-simdik">
          <Button
            variant="outline"
            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Tentang SIREDI</span>
          </Button>
        </Link>
      </div>

      {/* Activity Header */}
      <section className="py-16 bg-gradient-to-r from-brand-header to-brand-primary text-white">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up" delay={0} duration={800}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{activity.title}</h1>
                <p className="text-blue-100 text-lg">{activity.description}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200} duration={800}>
            <div className="flex flex-wrap gap-6 text-blue-100">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{activity.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{activity.location}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up" delay={0} duration={800}>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Dokumentasi Kegiatan
            </h2>
          </ScrollReveal>

          {/* Main Photo Display */}
          <div className="max-w-4xl mx-auto mb-8">
            <ScrollReveal animation="scale" delay={200} duration={800}>
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={
                    activity.photos[currentPhotoIndex].url || "/placeholder.svg"
                  }
                  alt={activity.photos[currentPhotoIndex].title}
                  fill
                  className="object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300">
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Photo Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {activity.photos.length}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Photo Info */}
          <ScrollReveal animation="fade-up" delay={400} duration={800}>
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {activity.photos[currentPhotoIndex].title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {activity.photos[currentPhotoIndex].description}
              </p>
            </div>
          </ScrollReveal>

          {/* Photo Thumbnails */}
          <div className="max-w-2xl mx-auto">
            <ScrollReveal animation="fade-up" delay={600} duration={800}>
              <div className="flex justify-center space-x-4">
                {activity.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                      index === currentPhotoIndex
                        ? "ring-4 ring-blue-500 scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}>
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Activity Details */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fade-up" delay={0} duration={800}>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Detail Kegiatan
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200} duration={800}>
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {activity.fullDescription}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400} duration={800}>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Tujuan Kegiatan
                </h3>
                <ul className="space-y-4">
                  {activity.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-brand-light-bg text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer - Consistent with main page */}
      <footer className="bg-brand-footer text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Logo and Mission */}
            <div>
              <SirediLogo size="sm" variant="light" href={null} />
              <p className="text-blue-200 leading-relaxed">
                Membangun masa depan pendidikan Banjarmasin melalui inovasi,
                kolaborasi, dan komitmen untuk mencerdaskan generasi bangsa.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Tautan Cepat
              </h3>
              <ul className="space-y-2">
                {[
                  "Beranda",
                  "Tentang SIREDI",
                  "Direktori Sekolah",
                  "Berita",
                  "Agenda",
                  "Kontak",
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={
                        item === "Direktori Sekolah"
                          ? "/direktori-sekolah"
                          : item === "Tentang SIREDI"
                          ? "/tentang-simdik"
                          : item === "Agenda"
                          ? "#agenda"
                          : item === "Kontak"
                          ? "#kontak"
                          : "#"
                      }
                      className="text-blue-200 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Kontak Kami
              </h3>
              <div className="space-y-3 text-blue-200">
                <p>
                  Jl. Sultan Adam No. 18
                  <br />
                  Banjarmasin, Kalimantan Selatan
                  <br />
                  70122
                </p>
                <p>Telepon: (0511) 3252732</p>
                <p>Email: disdik@banjarmasinkota.go.id</p>
              </div>
            </div>

            {/* Column 4: Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Media Sosial
              </h3>
              <div className="flex space-x-4">
                <SocialMediaLinks />
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>
              &copy; {new Date().getFullYear()} Dinas Pendidikan Kota
              Banjarmasin. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
