"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgOrb1Ref = useRef<HTMLDivElement>(null)
  const bgOrb2Ref = useRef<HTMLDivElement>(null)
  const bgOrb3Ref = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const contentColumnRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const transitionOverlayRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Animate background orbs with 3D rotation
      tl.fromTo(
        [bgOrb1Ref.current, bgOrb2Ref.current, bgOrb3Ref.current],
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.5, stagger: 0.2, ease: "elastic.out(1, 0.5)" },
        0
      )

      // Badge drops in with 3D perspective
      tl.fromTo(
        badgeRef.current,
        { y: -60, opacity: 0, rotateX: 45, transformPerspective: 800, transformOrigin: "top center" },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8 },
        0.3
      )

      // Heading words 3D entrance
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll(".hero-word")
        tl.fromTo(
          words,
          { y: 80, opacity: 0, rotateX: -40, transformPerspective: 1000 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.9, stagger: 0.12 },
          0.5
        )
      }

      // Underline SVG draws in
      const underline = sectionRef.current?.querySelector(".hero-underline path")
      if (underline) {
        tl.fromTo(
          underline,
          { strokeDashoffset: 200 },
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
          1.2
        )
      }

      // Subtitle fades up with slight 3D tilt
      tl.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0, rotateX: -10, transformPerspective: 600 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8 },
        1.0
      )

      // CTA buttons with 3D pop
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { y: 30, opacity: 0, scale: 0.8, rotateY: -20, transformPerspective: 800 },
          { y: 0, opacity: 1, scale: 1, rotateY: 0, duration: 0.7, stagger: 0.15, ease: "back.out(1.7)" },
          1.3
        )
      }

      // Trust indicators stagger 3D flip
      if (trustRef.current) {
        tl.fromTo(
          trustRef.current.children,
          { rotateY: 90, opacity: 0, transformPerspective: 800 },
          { rotateY: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.4)" },
          1.5
        )
      }

      // Floating particles — each on its own unpredictable path
      if (particlesRef.current) {
        const particles = particlesRef.current.children
        gsap.fromTo(
          particles,
          { opacity: 0, scale: 0 },
          { opacity: 0.6, scale: 1, duration: 0.8, stagger: 0.1, delay: 2 }
        )
        const driftParticle = (el: Element) => {
          gsap.to(el, {
            x: gsap.utils.random(-60, 60),
            y: gsap.utils.random(-50, 50),
            rotation: gsap.utils.random(-200, 200),
            scale: gsap.utils.random(0.6, 1.4),
            opacity: gsap.utils.random(0.2, 0.7),
            duration: gsap.utils.random(3, 8),
            ease: "sine.inOut",
            onComplete: () => driftParticle(el),
          })
        }
        Array.from(particles).forEach((p, i) => {
          gsap.delayedCall(2 + i * gsap.utils.random(0.2, 0.5), () => driftParticle(p))
        })
      }

      // Background orbs — slow randomized drift (never the same path twice)
      const driftOrb = (el: HTMLDivElement | null, rangeX: number, rangeY: number, scaleRange: [number, number], durRange: [number, number]) => {
        if (!el) return
        gsap.to(el, {
          x: gsap.utils.random(-rangeX, rangeX),
          y: gsap.utils.random(-rangeY, rangeY),
          scale: gsap.utils.random(scaleRange[0], scaleRange[1]),
          rotation: gsap.utils.random(-8, 8),
          duration: gsap.utils.random(durRange[0], durRange[1]),
          ease: "sine.inOut",
          onComplete: () => driftOrb(el, rangeX, rangeY, scaleRange, durRange),
        })
      }
      driftOrb(bgOrb1Ref.current, 80, 50, [0.85, 1.15], [7, 12])
      driftOrb(bgOrb2Ref.current, 60, 70, [0.8, 1.1], [8, 14])
      driftOrb(bgOrb3Ref.current, 50, 60, [0.9, 1.2], [6, 11])

      // ── Scroll-driven exit narrative ──
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "60% top",
          end: "bottom top",
          scrub: 1.2,
        },
      })

      // Hero text scales down & fades like turning a page
      if (contentColumnRef.current) {
        exitTl.to(
          contentColumnRef.current,
          { scale: 0.88, opacity: 0, y: -40, transformOrigin: "center top", ease: "power2.in" },
          0
        )
      }

      // Background orbs shift and dissolve into next section palette
      exitTl.to(
        [bgOrb1Ref.current, bgOrb2Ref.current, bgOrb3Ref.current],
        { opacity: 0, y: 100, scale: 0.6, stagger: 0.05, ease: "power1.in" },
        0
      )

      // Particles scatter and vanish
      if (particlesRef.current) {
        exitTl.to(
          particlesRef.current.children,
          { opacity: 0, y: -30, scale: 0, stagger: 0.02, ease: "power1.in" },
          0
        )
      }

      // Gradient overlay blends into next section's bg
      exitTl.fromTo(
        transitionOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, ease: "none" },
        0.3
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Magnetic pull — CTA buttons subtly attract the cursor
  const handleBtnMagnetic = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: "power2.out",
    })
  }

  const handleBtnLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    })
  }

  // 3D tilt — trust cards respond to cursor position
  const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, {
      rotateY: x * 15,
      rotateX: -y * 15,
      scale: 1.05,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 600,
    })
  }

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      {/* Video Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/80 -z-10" />
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div
          ref={bgOrb1Ref}
          className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-[#196677]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal"
          style={{ opacity: 0 }}
        />
        <div
          ref={bgOrb2Ref}
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#c9a97d]/25 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal"
          style={{ opacity: 0 }}
        />
        <div
          ref={bgOrb3Ref}
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-normal"
          style={{ opacity: 0 }}
        />
      </div>

      {/* Floating Particles — deterministic positions to avoid hydration mismatch */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[
          { w: 7, h: 9, t: 12, l: 85 },
          { w: 5, h: 6, t: 68, l: 22 },
          { w: 10, h: 8, t: 35, l: 55 },
          { w: 6, h: 11, t: 78, l: 8 },
          { w: 9, h: 5, t: 20, l: 72 },
          { w: 8, h: 10, t: 92, l: 40 },
          { w: 4, h: 7, t: 50, l: 15 },
          { w: 11, h: 6, t: 5, l: 63 },
          { w: 6, h: 9, t: 44, l: 90 },
          { w: 8, h: 5, t: 60, l: 33 },
          { w: 5, h: 8, t: 82, l: 48 },
          { w: 10, h: 7, t: 28, l: 5 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.w}px`,
              height: `${p.h}px`,
              top: `${p.t}%`,
              left: `${p.l}%`,
              background: i % 2 === 0 ? '#196677' : '#c9a97d',
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="container px-4 md:px-6 relative z-10 w-full max-w-7xl">
        <div className="flex justify-center items-center">

          {/* Content */}
          <div ref={contentColumnRef} className="flex flex-col items-center text-center space-y-8 max-w-4xl">
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm"
              style={{ transformStyle: "preserve-3d", opacity: 0 }}
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                Trusted by 10,000+ pet lovers
              </span>
            </div>

            {/* Main heading */}
            <h1
              ref={headingRef}
              className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="hero-word inline-block" style={{ opacity: 0 }}>Exotic Fins,</span>
              <br />
              <span className="hero-word inline-block" style={{ opacity: 0 }}>Fluffy Friends &{' '}</span>
              <span className="hero-word inline-block relative" style={{ opacity: 0 }}>
                <span className="text-emerald-400">Feathers</span>
                <svg
                  className="hero-underline absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,4 Q50,0 100,4 T200,4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl text-white/90 max-w-2xl text-pretty"
              style={{ opacity: 0, transformStyle: "preserve-3d" }}
            >
              Discover a world of lovable companions. From colorful Guppies and ornamental Chickens to adorable Rabbits, we connect you with healthy, well-cared-for pets ready to join your family.
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" style={{ transformStyle: "preserve-3d" }}>
              <div
                onMouseMove={handleBtnMagnetic}
                onMouseLeave={handleBtnLeave}
                style={{ opacity: 0, transformStyle: "preserve-3d", willChange: "transform" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 group px-8 py-6 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <Link href="/shop">
                    Explore Pets
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div
                onMouseMove={handleBtnMagnetic}
                onMouseLeave={handleBtnLeave}
                style={{ opacity: 0, transformStyle: "preserve-3d", willChange: "transform" }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="backdrop-blur-sm bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 px-8 py-6 text-lg"
                >
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Trust indicators */}
            <div ref={trustRef} className="flex flex-wrap cursor-pointer justify-center gap-4 sm:gap-8" style={{ transformStyle: "preserve-3d" }}>
              {[
                { icon: Heart, label: "Health Guaranteed", color: "text-red-500", bg: "bg-red-500/10" },
                { icon: Shield, label: "Verified Breeders", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Sparkles, label: "24/7 Support", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <div
                  key={i}
                  onMouseMove={handleCardTilt}
                  onMouseLeave={handleCardLeave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  style={{ opacity: 0, transformStyle: "preserve-3d", willChange: "transform" }}
                >
                  <div className={`p-1.5 rounded-full ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>

      {/* Transition overlay — blends hero bg into next section */}
      <div
        ref={transitionOverlayRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          opacity: 0,
          background: "linear-gradient(to bottom, transparent 0%, transparent 40%, hsl(var(--background)) 100%)",
        }}
      />

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
      `}</style>
    </section>
  )
}
