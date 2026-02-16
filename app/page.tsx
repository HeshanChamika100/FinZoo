"use client"

import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { FeaturedPets } from "@/components/landing/featured-pets"
import { Services } from "@/components/landing/services"
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
        <Services />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
