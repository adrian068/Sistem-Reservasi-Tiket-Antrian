import { SirediLogo } from "@/components/siredi-logo"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <SirediLogo size="md" showText={false} href={null} imageClassName="animate-pulse" />
        </div>

        <div className="w-8 h-8 border-4 border-brand-light border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>

        <p className="text-muted-foreground animate-pulse">Memuat direktori sekolah...</p>
      </div>
    </div>
  )
}
