"use client";

import type React from "react";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"
import { getAdminHomePath, isAdminUser } from "@/lib/auth-shared";
import { SirediLogo, SirediLogoHero } from "@/components/siredi-logo";

type AuthMode = "login" | "register";

function getSafeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  if (
    path.startsWith("/login") ||
    path.startsWith("/api") ||
    path.startsWith("/tentang-simdik") ||
    path.startsWith("/direktori-sekolah") ||
    path.startsWith("/berita") ||
    path.startsWith("/agenda")
  ) {
    return "/";
  }
  return path;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetMessages();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat login");
        return;
      }

      const user = data.user
      if (user?.peran && isAdminUser({
        id: "",
        nama: user.nama ?? "",
        email: user.email ?? "",
        peran: user.peran,
        bidangSlug: user.bidangSlug,
      })) {
        const home = getAdminHomePath({
          id: "",
          nama: user.nama ?? "",
          email: user.email ?? "",
          peran: user.peran,
          bidangSlug: user.bidangSlug,
        })
        router.push(
          redirectTo.startsWith("/admin") && user.peran === "ADMIN"
            ? redirectTo
            : home,
        )
        router.refresh()
        return
      }

      router.push(redirectTo)
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat mendaftar");
        return;
      }

      setSuccess("Akun berhasil dibuat. Mengalihkan...");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Register error:", err);
      setError("Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 via-blue-500 to-blue-300 relative overflow-hidden">
      <div className="absolute top-16 left-16 w-40 h-40 bg-white/8 rounded-full blur-3xl" />
      <div className="absolute top-32 right-24 w-32 h-32 bg-white/12 rounded-full blur-2xl" />
      <div className="absolute bottom-40 left-1/3 w-48 h-48 bg-white/6 rounded-full blur-3xl" />
      <div className="absolute bottom-16 right-16 w-36 h-36 bg-white/15 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <SirediLogoHero />
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mb-4 flex justify-center">
                <SirediLogo size="md" showText={false} href={null} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === "login" ? "Selamat Datang" : "Buat Akun Baru"}
              </h1>
              <p className="text-blue-100">
                {mode === "login"
                  ? "Masuk ke sistem reservasi SIREDI"
                  : "Daftar akun untuk mengakses reservasi online"}
              </p>
            </div>

            <div className="mb-6 hidden lg:block">
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === "login" ? "Selamat Datang" : "Buat Akun Baru"}
              </h1>
              <p className="text-blue-100">
                {mode === "login"
                  ? "Masuk ke sistem reservasi SIREDI"
                  : "Daftar akun untuk mengakses reservasi online"}
              </p>
            </div>

          <Card className="bg-white/98 backdrop-blur-md shadow-2xl border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={cn(
                    "py-2.5 text-sm font-medium rounded-md transition-colors",
                    mode === "login"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={cn(
                    "py-2.5 text-sm font-medium rounded-md transition-colors",
                    mode === "register"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  Daftar
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {mode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="contoh: devi123"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                        minLength={3}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Gunakan username persis seperti di Kelola Admin (bukan email). Huruf harus
                      sama, termasuk angka.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Kata Sandi
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Ingat saya
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Masuk
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-sm font-medium text-gray-700">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="nama"
                        type="text"
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                      Kata Sandi
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi kata sandi"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Mendaftar...
                      </>
                    ) : (
                      "Daftar Akun"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-blue-100">
              © 2026 SIREDI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
  );
}
