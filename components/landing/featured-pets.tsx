"use client"

import { usePets } from "@/lib/pets-context"
import { PetCard } from "./pet-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Filter } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

export function FeaturedPets() {
  const { pets, loading } = usePets()
  const [filter, setFilter] = useState<string>("all")
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

            // Header badge, title, subtitle — 3D cascade
            if (headerRef.current) {
              const children = headerRef.current.children
              tl.fromTo(
                children,
                { y: 60, opacity: 0, rotateX: -30, transformPerspective: 800 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.15 },
                0
              )
            }

            // Filter buttons — 3D flip stagger
            if (filtersRef.current) {
              tl.fromTo(
                filtersRef.current.children,
                { scale: 0.5, opacity: 0, rotateY: 60, transformPerspective: 600 },
                { scale: 1, opacity: 1, rotateY: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)" },
                0.4
              )
            }

            // Pet cards — dramatic 3D stagger entrance
            if (gridRef.current) {
              const cards = gridRef.current.querySelectorAll(".pet-card-wrapper")
              if (cards.length > 0) {
                tl.fromTo(
                  cards,
                  { y: 100, opacity: 0, rotateX: -15, scale: 0.85, transformPerspective: 1000 },
                  { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" },
                  0.6
                )
              }
            }

            // CTA button pop
            if (ctaRef.current) {
              tl.fromTo(
                ctaRef.current,
                { y: 40, opacity: 0, scale: 0.8 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" },
                1.0
              )
            }
          }, sectionRef)

          return () => ctx.revert()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Re-animate grid when filter changes
  useEffect(() => {
    if (!gridRef.current || !hasAnimated.current) return
    const cards = gridRef.current.querySelectorAll(".pet-card-wrapper")
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.9, rotateY: -10, transformPerspective: 800 },
        { y: 0, opacity: 1, scale: 1, rotateY: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
      )
    }
  }, [filter])

  const visiblePets = pets.filter((pet) => pet.is_visible && pet.featured)
  const filteredPets =
    filter === "all"
      ? visiblePets
      : visiblePets.filter((pet) => pet.species.toLowerCase() === filter)

  const species = [...new Set(visiblePets.map((pet) => pet.species))]

  return (
    <section
      id="featured"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-background to-muted/30"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4" style={{ opacity: 0 }}>
            Our Collection
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance" style={{ opacity: 0 }}>
            Featured Pets
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty" style={{ opacity: 0 }}>
            Meet our most loved companions, each carefully selected and ready to bring
            joy to your home.
          </p>
        </div>

        {/* Filter buttons */}
        <div
          ref={filtersRef}
          className="flex flex-wrap justify-center gap-3 mb-12"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`transition-all duration-200 ${filter === "all" ? "bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
            style={{ opacity: 0 }}
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
              style={{ opacity: 0 }}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Pets grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
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
              <div key={pet.id} className="pet-card-wrapper h-full" style={{ opacity: 0 }}>
                <PetCard pet={pet} index={index} />
              </div>
            ))
          )}
        </div>

        {/* View all button */}
        <div ref={ctaRef} className="text-center" style={{ opacity: 0 }}>
          <Link
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
