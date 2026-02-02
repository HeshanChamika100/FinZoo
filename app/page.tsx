"use client"

import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { FeaturedPets } from "@/components/landing/featured-pets"
import { Stats } from "@/components/landing/stats"
import { Footer } from "@/components/landing/footer"
import { PetsProvider } from "@/lib/pets-context"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedPets />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
