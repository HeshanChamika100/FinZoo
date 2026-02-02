"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-background to-amber-50/50 dark:from-blue-950/20 dark:via-background dark:to-amber-950/20">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div
          className={`absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:bg-primary/10 dark:mix-blend-normal transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}
        />
        <div
          className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[100px] mix-blend-multiply dark:bg-secondary/10 dark:mix-blend-normal transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
        />
      </div>

      <div className="container px-4 md:px-6 relative z-10 w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">
                Trusted by 10,000+ pet lovers
              </span>
            </div>

            {/* Main heading */}
            <h1
              className={`text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-foreground transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Exotic Fins,
              <br />
              Fluffy Friends &{' '}
              <span className="text-primary relative inline-block">
                Feathers
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,4 Q50,0 100,4 T200,4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={`transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}
                    style={{
                      strokeDasharray: 200,
                      strokeDashoffset: mounted ? 0 : 200,
                    }}
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg sm:text-xl text-muted-foreground max-w-2xl text-pretty transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Discover a world of lovable companions. From colorful Guppies and ornamental Chickens to adorable Rabbits, we connect you with healthy, well-cared-for pets ready to join your family.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="backdrop-blur-sm bg-white/30 dark:bg-black/10 border-white/50 dark:border-white/10 text-foreground hover:bg-white/50 dark:hover:bg-white/10 px-8 py-6 text-lg"
              >
                <Link href="#about">Learn More</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {[
                { icon: Heart, label: "Health Guaranteed", color: "text-red-500", bg: "bg-red-500/10" },
                { icon: Shield, label: "Verified Breeders", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Sparkles, label: "24/7 Support", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm">
                  <div className={`p-1.5 rounded-full ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className={`relative hidden lg:block transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
            <div className="relative w-full aspect-square max-w-[600px] mx-auto animate-float">
              {/* Image Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-[80px] scale-90 animate-pulse-slow" />

              <div className="absolute top-0 left-0 w-[60%] h-[60%] -translate-x-10 translate-y-10 z-10">
                <Image
                  src="/guppy.png"
                  alt="A colorful Guppy fish"
                  fill
                  priority
                  className="object-contain drop-shadow-2xl transform -scale-x-100"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-[70%] h-[70%] translate-x-10 z-20">
                <Image
                  src="/bunny and chick.png"
                  alt="A cute bunny and a chick"
                  fill
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
