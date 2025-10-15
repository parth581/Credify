"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

// Static image imports (kept outside /public to leverage next/image optimization)
import imgFarmer from "@/assets/images/IndianFarmer.jpg"
import imgTailor from "@/assets/images/IndianTailor.jpg"
import imgStudent from "@/assets/images/MedicalStudent.jpg"
import imgWomen from "@/assets/images/ThreeWorkingWomen.jpg"
import imgWeaving from "@/assets/images/WomanWeaving.jpg"

export function Hero() {
  const backgroundImages = useMemo(
    () => [imgFarmer, imgTailor, imgStudent, imgWomen, imgWeaving],
    []
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (backgroundImages.length <= 1) return
    const intervalMs = 5000 // change image every 5s
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % backgroundImages.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [backgroundImages.length])

  return (
    <section className="relative mx-auto flex h-[95vh] max-h-[95vh] max-w-6xl flex-col items-center justify-end gap-6 px-4 pb-[7vh] pt-32 text-center">
      {/* Background carousel */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {backgroundImages.map((src, idx) => (
          <Image
            key={idx}
            src={src}
            alt="Background"
            fill
            priority={idx === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              idx === activeIndex ? "opacity-[0.95]" : "opacity-0"
            }`}
          />
        ))}
        {/* Subtle vignette overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/60" aria-hidden="true" />
      </div>

      <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
        Community-Powered Lending. Fairer for Everyone.
      </h1>
      <p className="text-pretty text-base text-[var(--color-neutral-dark)] md:text-lg">
        Connect directly with lenders or fund promising applications. A transparent, secure, and community-driven loan
        marketplace.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/login/borrower">
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Apply for a Loan</Button>
        </Link>
        <Link href="/login/lender">
          <Button variant="outline">Start Lending</Button>
        </Link>
      </div>
    </section>
  )
}
