"use client"

import { usePets } from "@/lib/pets-context"
import { PetCard } from "./pet-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export function FeaturedPets() {
  const { pets, loading } = usePets()
  const [filter, setFilter] = useState<string>("all")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById("featured")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const visiblePets = pets.filter((pet) => pet.is_visible)
  const filteredPets =
    filter === "all"
      ? visiblePets
      : visiblePets.filter((pet) => pet.species.toLowerCase() === filter)

  const species = [...new Set(visiblePets.map((pet) => pet.species))]

  return (
    <section
      id="featured"
      className="py-24 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Collection
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Featured Pets
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Meet our most loved companions, each carefully selected and ready to bring
            joy to your home.
          </p>
        </div>

        {/* Filter buttons */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`transition-all duration-200 ${filter === "all" ? "bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            All Pets
          </Button>
          {species.map((s) => (
            <Button
              key={s}
              variant={filter === s.toLowerCase() ? "default" : "outline"}
              onClick={() => setFilter(s.toLowerCase())}
              className={`transition-all duration-200 ${filter === s.toLowerCase() ? "bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Pets grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card animate-pulse"
              >
                <div className="aspect-square bg-muted rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            filteredPets.map((pet, index) => (
              <PetCard key={pet.id} pet={pet} index={index} />
            ))
          )}
        </div>

        {/* View all button */}
        <div
          className={`text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        ><Link
              href="/shop"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
            
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 group bg-transparent"
          >
            View All Pets
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
