"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle, Shield } from "lucide-react"
import Link from "next/link"
import { SirediLogo } from "@/components/siredi-logo"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"request" | "verify" | "success">("request")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Gagal mengirim OTP")
        setIsLoading(false)
        return
      }

      setMessage(data.message || "Kode OTP telah dikirim ke email perantara")
      setStep("verify")
    } catch (err) {
      console.error("Request OTP error:", err)
      setError("Terjadi kesalahan saat memproses permintaan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok")
      return
    }

    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Gagal reset password")
        setIsLoading(false)
        return
      }

      setStep("success")
    } catch (err) {
      console.error("Reset password error:", err)
      setError("Terjadi kesalahan saat reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-header via-brand-primary via-brand-accent to-brand-light relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-16 left-16 w-40 h-40 bg-white/8 rounded-full blur-3xl"></div>
      <div className="absolute top-32 right-24 w-32 h-32 bg-white/12 rounded-full blur-2xl"></div>
      <div className="absolute bottom-40 left-1/3 w-48 h-48 bg-white/6 rounded-full blur-3xl"></div>
      <div className="absolute bottom-16 right-16 w-36 h-36 bg-white/15 rounded-full blur-2xl"></div>

      <div className="w-full max-w-md">
        <Card className="bg-white/98 backdrop-blur-md shadow-2xl border-0 rounded-2xl">
          <CardHeader>
            <div className="text-center mb-4">
              <div className="flex justify-center mb-4">
                <SirediLogo size="md" showText={false} href={null} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {step === "request" && "Reset Password"}
                {step === "verify" && "Verifikasi OTP"}
                {step === "success" && "Password Berhasil Direset"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {step === "request" && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email admin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-gray-900"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    Kode OTP akan dikirim ke email perantara (disdikreset@gmail.com)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-accent-hover"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Kode OTP"
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm text-brand-accent hover:text-brand-accent-hover"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali ke Login
                </Link>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-900">Kode OTP (6 digit)</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-12 text-center text-2xl tracking-widest font-mono text-gray-900"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-600">
                    Kode OTP berlaku selama 10 menit. Cek email perantara (disdikreset@gmail.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-900">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 h-12 text-gray-900"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 text-gray-900"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-accent-hover"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("request")
                    setOtp("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setError("")
                  }}
                  className="w-full text-sm text-brand-accent hover:text-brand-accent-hover font-medium"
                >
                  Kirim ulang OTP
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Password Berhasil Direset!
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Password Anda telah berhasil diubah. Silakan login dengan password baru.
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full h-12 bg-brand-primary hover:bg-brand-accent-hover">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-100">
            © 2026 SIREDI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

