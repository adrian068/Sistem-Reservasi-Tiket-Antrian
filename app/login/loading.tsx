import { SirediLogo } from "@/components/siredi-logo"

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-header via-brand-primary to-brand-accent flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <SirediLogo size="md" showText={false} href={null} imageClassName="animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">SIREDI</h2>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <p className="text-blue-100 mt-2">Memuat halaman login...</p>
      </div>
    </div>
  )
}
