import Image from "next/image"

const HERO_IMAGE = "/images/dinas-pendidikan-banjarmasin-real.jpeg"

export function SirediPageBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-blue-900/72" />
    </div>
  )
}
