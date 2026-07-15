"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  ScanEyeIcon,
  PenSquare,
  LucideComputer,
  MessageCircleCodeIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { SirediLogo } from "@/components/siredi-logo";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Beranda", href: "/" },
  { label: "Reservasi", href: "/reservasi" },
  { label: "Tentang SIREDI", href: "/tentang-simdik" },
  { label: "Direktori Sekolah", href: "/direktori-sekolah" },
  { label: "Berita", href: "/#berita" },
  { label: "Agenda", href: "/#agenda" },
  { label: "Kontak", href: "/#kontak" },
];

export default function AboutSIMDIKPage() {
  const [setActivityRef, activityVisible] = useStaggeredScrollAnimation(6, {
    delay: 150,
    triggerOnce: true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (item: { label: string; href: string }) => {
    if (item.href === "/") return pathname === "/";
    if (item.href.startsWith("/#")) {
      if (pathname !== "/") return false;
      const sectionHash = item.href.replace("/", "");
      return currentHash === sectionHash;
    }
    return pathname?.startsWith(item.href);
  };

  const officeActivities = [
    {
      title: "Mengamati dan mengalisis sitem informasi yang sudah ada",
      description:
        "Kegiatan ini bertujuan untuk memahami sistem informasi yang telah diterapkan, mengidentifikasi kekuatan dan kelemahan, serta mencari peluang untuk peningkatan efisiensi dan efektivitas pengelolaan data pendidikan.",
      icon: ScanEyeIcon,
      date: "Agt 2025 - Sept 2025",
      location: "Dinas Pendidikan",
      image:
        "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.34%20(1).jpeg",
    },
    {
      title:
        "Mendesain SIREDI (Sistem Reservasi Dinas Pendidikan dan Informasi)",
      description:
        "Membuat desain awal sistem reservasi yang terintegrasi untuk memudahkan pengelolaan data pendidikan dan informasi di Dinas Pendidikan Kota Banjarmasin.",
      icon: PenSquare,
      date: "Agt 2025 - Sept 2025",
      location: "Dinas Pendidikan",
      image:
        "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-19%20at%2009.02.33.jpeg",
    },
    {
      title: "Pengkodean (Development) SIREDI",
      description:
        "Mengembangkan sistem reservasi Dinas Pendidikan dan Informasi (SIREDI) berdasarkan desain yang telah dibuat.",
      icon: LucideComputer,
      date: "Sept 2025 - Okt 2025",
      location: "Dinas Pendidikan",
      image:
        "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-19%20at%2009.54.34%20(1).jpeg",
    },
    {
      title:
        "Mendiskusikan website SIREDI dengan Dinas Pendidikan Kota Banjarmasin",
      description:
        "Melakukan diskusi mendalam dengan pihak Dinas Pendidikan untuk memastikan bahwa website SIREDI memenuhi kebutuhan dan harapan mereka dalam pengelolaan data reservasi.",
      icon: MessageCircleCodeIcon,
      date: "Nov 2025",
      location: "Dinas Pendidikan",
      image:
        "https://vqirqjfmypfwysfmfcjl.supabase.co/storage/v1/object/public/SIMDIK-Uploads/tentang_simdik/WhatsApp%20Image%202025-11-13%20at%2012.48.29.jpeg",
    },
    /*{
      title: "Pengembangan Sistem Informasi Pendidikan",
      description:
        "Meningkatkan dan mengembangkan sistem informasi untuk pengelolaan data pendidikan yang lebih efisien dan terintegrasi.",
      icon: School,
      date: "Agu 2025 - Okt 2025",
      location: "Dinas Pendidikan",
      image: "/kegiatan/sistem-1.png",
    },
    {
      title: "Forum Komunikasi Orang Tua dan Sekolah",
      description:
        "Menyelenggarakan forum rutin untuk mempererat komunikasi antara orang tua, guru, dan pihak dinas pendidikan.",
      icon: Users,
      date: "Nov 2025",
      location: "Berbagai Lokasi",
      image: "/kegiatan/forum-1.png",
    },*/
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-foreground overflow-x-hidden">
      {/* Header - Consistent with main page */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <SirediLogo size="sm" href="/" />

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {NAV_ITEMS.map((item) => (
              <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-medium transition-all duration-300 relative group",
                    isActive(item) ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-brand-accent transition-all duration-300",
                      isActive(item) ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
              </Link>
              ))}
            </nav>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg transition-all duration-300 hover:bg-accent"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="px-4 py-4 space-y-3 bg-background">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-3 font-medium transition-colors",
                    isActive(item)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section for About Page */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Image and Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/dinas-pendidikan-banjarmasin-real.jpeg"
            alt="Kantor Dinas Pendidikan Kota Banjarmasin"
            fill
            className="object-cover object-center animate-bg-pan"
            priority
          />
          <div className="absolute inset-0 bg-brand-header opacity-60"></div>{" "}
          {/* Dark overlay for text readability */}
        </div>
        {/* Background Animation - More colorful and dynamic "pernak-pernik" */}
        <div className="absolute inset-0 opacity-30">
          <ScrollReveal animation="scale" delay={0}>
            <div className="absolute top-10 left-10 w-24 h-24 bg-brand-accent/40 rounded-full animate-float-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={200}>
            <div className="absolute top-32 right-20 w-20 h-20 bg-brand-primary/50 rounded-full animate-float-delayed-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={400}>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-brand-primary rounded-full animate-float-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={600}>
            <div className="absolute bottom-10 right-1/3 w-12 h-12 bg-brand-header rounded-full animate-float-delayed-strong blur-sm"></div>
          </ScrollReveal>

          {/* Additional "pernak-pernik" */}
          <ScrollReveal animation="scale" delay={100}>
            <div className="absolute top-1/2 left-5 w-16 h-16 bg-cyan-400 rounded-lg transform rotate-45 animate-float-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={300}>
            <div className="absolute bottom-5 right-10 w-20 h-20 bg-purple-400 rounded-full animate-float-delayed-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={500}>
            <div className="absolute top-1/4 right-1/4 w-10 h-10 bg-brand-light rounded-full animate-float-strong blur-sm"></div>
          </ScrollReveal>
          <ScrollReveal animation="scale" delay={700}>
            <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-indigo-400 rounded-lg transform -rotate-30 animate-float-delayed-strong blur-sm"></div>
          </ScrollReveal>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal animation="fade-up" delay={0} duration={800}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Tentang Dinas Pendidikan Kota Banjarmasin
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200} duration={800}>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Mewujudkan pendidikan berkualitas dan merata untuk seluruh
              masyarakat Banjarmasin.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/">
          <Button
            variant="outline"
            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>

      {/* About Us Content */}
      <section className="py-16 bg-card shadow-sm border-y border-border firefly-container">
        {/* Firefly elements */}
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="firefly"></div>
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up" delay={0} duration={800}>
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Visi, Misi, dan Motto Kami
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal animation="fade-right" delay={200} duration={800}>
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Visi
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Menjadi pelopor pendidikan inovatif dan inklusif yang
                  menghasilkan generasi cerdas, berkarakter, dan berdaya saing
                  global di Kota Banjarmasin.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-left" delay={400} duration={800}>
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Misi
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>
                    Meningkatkan kualitas dan relevansi kurikulum pendidikan.
                  </li>
                  <li>
                    Mengembangkan kompetensi tenaga pendidik dan kependidikan.
                  </li>
                  <li>
                    Memfasilitasi akses pendidikan yang merata dan berkualitas.
                  </li>
                  <li>
                    Mendorong inovasi dan pemanfaatan teknologi dalam
                    pembelajaran.
                  </li>
                  <li>
                    Membangun kemitraan strategis dengan berbagai pihak untuk
                    kemajuan pendidikan.
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={600} duration={800}>
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Moto Pelayananan : IQRA
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
                  <li>Integrity (Integritas).</li>
                  <li>Quality (Kualitas).</li>
                  <li>Responsibility (Tanggung Jawab).</li>
                  <li>Accountability (Akuntabilitas).</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Office Activities Section */}
      <section className="py-16 bg-card shadow-sm border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal animation="fade-up" delay={0} duration={800}>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Dokumentasi Pengembangan Website SIREDI
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officeActivities.map((activity, index) => {
              const Icon = activity.icon;
              const slug = activity.title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");

              return (
                <div
                  key={index}
                  ref={setActivityRef(index)}
                  className={`transform transition-all duration-700 ease-out ${
                    activityVisible[index]
                      ? "opacity-100 translate-y-0 rotate-0"
                      : "opacity-0 translate-y-8 rotate-1"
                  }`}>
                  <Link href={`/tentang-simdik/kegiatan/${slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 group border-2 border-transparent hover:border-blue-400 cursor-pointer bg-white dark:bg-card shadow-lg">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={activity.image || "/placeholder.svg"}
                          alt={activity.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Lihat Detail
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground transition-all duration-300 group-hover:text-brand-accent">
                            {activity.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {activity.description}
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{activity.date}</span>
                          </p>
                          <p className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{activity.location}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer - Consistent with main page */}
      <footer className="bg-brand-footer text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="border-t border-brand-header-dark mt-8 pt-8 text-center text-blue-200">
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
