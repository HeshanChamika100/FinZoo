"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import Image from "next/image"
import {
  Truck,
  Stethoscope,
  ShieldCheck,
  HeartHandshake,
  Scissors,
  Phone,
} from "lucide-react"

const services = [
  {
    icon: Truck,
    title: "Safe Pet Delivery",
    description:
      "Temperature-controlled, stress-free transport straight to your doorstep anywhere in Sri Lanka.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Health Guarantee",
    description:
      "30-day health guarantee on all pets. Full support if anything goes wrong after purchase.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: HeartHandshake,
    title: "Adoption Guidance",
    description:
      "Personalised advice on choosing the right pet for your lifestyle, family and living space.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description:
      "Round-the-clock assistance from our pet care specialists whenever you need guidance.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
]

export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const illustrationRef = useRef<HTMLDivElement>(null)
  const svcGuppyRef = useRef<HTMLDivElement>(null)
  const svcBunnyRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

            // Header cascade
            if (headerRef.current) {
              tl.fromTo(
                headerRef.current.children,
                { y: 60, opacity: 0, rotateX: -30, transformPerspective: 800 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.15 },
                0
              )
            }

            // Cards — 3D stagger entrance
            if (cardsRef.current) {
              tl.fromTo(
                cardsRef.current.children,
                {
                  y: 100,
                  opacity: 0,
                  rotateY: -30,
                  rotateX: 20,
                  scale: 0.7,
                  transformPerspective: 1000,
                },
                {
                  y: 0,
                  opacity: 1,
                  rotateY: 0,
                  rotateX: 0,
                  scale: 1,
                  duration: 0.9,
                  stagger: 0.12,
                  ease: "back.out(1.7)",
                },
                0.4
              )
            }

            // Illustration entrance — pets swim / hop in
            if (illustrationRef.current) {
              tl.fromTo(
                illustrationRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.5 },
                0.6
              )
            }
            if (svcGuppyRef.current) {
              tl.fromTo(
                svcGuppyRef.current,
                { x: 120, opacity: 0, scale: 0.4, transformPerspective: 1000 },
                { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" },
                0.7
              )
            }
            if (svcBunnyRef.current) {
              tl.fromTo(
                svcBunnyRef.current,
                { y: 100, opacity: 0, scale: 0.4, transformPerspective: 1000 },
                { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" },
                0.9
              )
            }

            // Organic idle — fish gentle drift
            const swimServiceFish = (el: HTMLDivElement | null) => {
              if (!el) return
              gsap.to(el, {
                y: gsap.utils.random(-15, 10),
                x: gsap.utils.random(-10, 10),
                duration: gsap.utils.random(3, 5),
                ease: "sine.inOut",
                onComplete: () => swimServiceFish(el),
              })
            }
            swimServiceFish(svcGuppyRef.current)

            // Organic idle — bunny gentle breathing
            const breatheServiceBunny = (el: HTMLDivElement | null) => {
              if (!el) return
              gsap.to(el, {
                scaleY: gsap.utils.random(1.005, 1.018),
                scaleX: gsap.utils.random(0.992, 1.005),
                y: gsap.utils.random(-5, 3),
                duration: gsap.utils.random(2.5, 4),
                ease: "sine.inOut",
                onComplete: () => breatheServiceBunny(el),
              })
            }
            breatheServiceBunny(svcBunnyRef.current)
          }, sectionRef)

          return () => ctx.revert()
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Magnetic tilt for service cards
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, {
      rotateY: x * 20,
      rotateX: -y * 20,
      scale: 1.08,
      duration: 0.25,
      ease: "power2.out",
      transformPerspective: 600,
      overwrite: "auto",
    })
  }

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    })
  }

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-24 backdrop-blur-3xl bg-linear-to-b from-primary/30 to-background overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full bg-blue-300/25 text-blue-900 text-sm font-medium mb-4"
            style={{ opacity: 0 }}
          >
            What We Offer
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance"
            style={{ opacity: 0 }}
          >
            Our Services
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty"
            style={{ opacity: 0 }}
          >
            Everything your pet needs, from day one and beyond — delivered with
            care and backed by expertise.
          </p>
        </div>

        {/* Two-column layout: cards + illustration */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-center">

        {/* Services grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {services.map((service, i) => (
            <div
              key={i}
              onMouseMove={handleTilt}
              onMouseLeave={handleLeave}
              className={`group relative rounded-2xl border-2 ${service.border} bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-lg p-6 cursor-pointer transition-all duration-150 hover:shadow-2xl`}
              style={{
                opacity: 0,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${service.bg} mb-4 transition-all duration-200 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-xl`}
              >
                <service.icon className={`h-7 w-7 ${service.color} transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-lg`} />
              </div>

              {/* Content */}
              <h3 className={`text-lg font-bold text-foreground mb-2 transition-all duration-200 group-hover:${service.color}`}>
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-200">
                {service.description}
              </p>

              {/* Animated gradient overlay on hover */}
              <div
                className={`absolute inset-0 ${service.bg} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Corner glow effect - stronger */}
              <div
                className={`absolute -top-1 -right-1 w-32 h-32 ${service.bg} rounded-bl-[100%] rounded-tr-2xl opacity-0 group-hover:opacity-80 transition-all duration-300 blur-2xl animate-pulse`}
              />

              {/* Pulsing border effect */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 ${service.border} opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none animate-pulse`}
              />

              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Right side — animated pets illustration */}
        <div
          ref={illustrationRef}
          className="hidden lg:flex relative w-[340px] min-h-[520px] items-center justify-center"
          style={{ opacity: 0, perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#196677]/10 to-[#c9a97d]/10 rounded-full blur-[80px] scale-90" />

          {/* Rotating rings */}
          <div className="absolute inset-[5%] border-2 border-dashed border-[#196677]/15 rounded-full animate-spin-slow" />
          <div className="absolute inset-[15%] border border-[#c9a97d]/15 rounded-full animate-spin-slow-reverse" />

          {/* Guppy */}
          <div
            ref={svcGuppyRef}
            className="absolute top-[5%] left-0 w-[65%] h-[45%] z-10"
            style={{ transformStyle: "preserve-3d", opacity: 0 }}
          >
            <Image
              src="/guppy.png"
              alt="Colorful Guppy fish"
              fill
              className="object-contain drop-shadow-2xl transform -scale-x-100"
            />
          </div>

          {/* Bunny & chick */}
          <div
            ref={svcBunnyRef}
            className="absolute bottom-[2%] right-0 w-[75%] h-[55%] z-20"
            style={{ transformStyle: "preserve-3d", opacity: 0 }}
          >
            <Image
              src="/bunny and chick.png"
              alt="Cute bunny and chick"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        </div>{/* end two-column */}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .group:hover {
          animation: none;
        }
        .group {
          animation: float 4s ease-in-out infinite;
        }
        .group:nth-child(2) {
          animation-delay: 0.5s;
        }
        .group:nth-child(3) {
          animation-delay: 1s;
        }
        .group:nth-child(4) {
          animation-delay: 1.5s;
        }
        .group:nth-child(5) {
          animation-delay: 2s;
        }
        .group:nth-child(6) {
          animation-delay: 2.5s;
        }
      `}</style>
    </section>
  )
}
