"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import gsap from "gsap"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOverHero, setIsOverHero] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLAnchorElement>(null)
  const navLinksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header slides down from above
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )

      // Logo 3D flip in
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { rotateY: -90, opacity: 0, transformPerspective: 800 },
          { rotateY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)", delay: 0.3 }
        )
      }

      // Nav links stagger from right
      if (navLinksRef.current) {
        gsap.fromTo(
          navLinksRef.current.children,
          { x: 30, opacity: 0, rotateY: 15, transformPerspective: 600 },
          { x: 0, opacity: 1, rotateY: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.5 }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  // Detect scroll position to change header style
  useEffect(() => {
    const handleScroll = () => {
      // Consider hero section as roughly the viewport height
      const heroHeight = window.innerHeight - 100
      setIsOverHero(window.scrollY < heroHeight)
    }

    handleScroll() // Check initial position
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = useCallback((id: string) => {
    const doScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        const headerOffset = 80
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }

    if (pathname !== '/') {
      router.push(`/#${id}`)
      setTimeout(doScroll, 500)
    } else {
      doScroll()
    }
    setMobileMenuOpen(false)
  }, [pathname, router])

  return (
    <header 
      ref={headerRef} 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isOverHero 
          ? 'bg-transparent border-transparent' 
          : 'bg-background/80 backdrop-blur-md border-border'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link ref={logoRef} href="/" className="flex items-center gap-2 group" style={{ transformStyle: "preserve-3d" }}>
            <Image
              src="/logo.png"
              alt="FinZoo Logo"
              width={40}
              height={40}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-2xl font-bold">
              <span style={{ color: '#196677' }}>Fin</span><span style={{ color: '#c9a97d' }}>Zoo</span>
            </span>
          </Link>

          <div ref={navLinksRef} className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className={`hover:text-primary transition-colors duration-200 font-medium ${
                isOverHero ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              Shop
            </Link>
            <button
              onClick={() => scrollTo('featured')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${
                isOverHero ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              Featured Pets
            </button>
            <button
              onClick={() => scrollTo('about')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${
                isOverHero ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${
                isOverHero ? 'text-white' : 'text-muted-foreground'
              }`}
            >
              Contact
            </button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25">
              <Link href="/shop">Browse All</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${isOverHero ? 'text-white hover:text-white' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t animate-in rounded-xl text-center slide-in-from-top-2 duration-200 ${
            isOverHero ? 'bg-black/80 backdrop-blur-md border-white/20' : 'border-border'
          }`}>
            <div className="flex flex-col gap-4">
              <Link
                href="/shop"
                className={`hover:text-primary transition-colors px-2 py-2 ${
                  isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <button
                onClick={() => scrollTo('featured')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${
                  isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                Featured Pets
              </button>
              <button
                onClick={() => scrollTo('about')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${
                  isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${
                  isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                Contact
              </button>
              <Button asChild className="bg-primary text-primary-foreground w-1/2 mx-auto">
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  Browse All
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
