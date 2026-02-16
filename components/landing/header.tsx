"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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
      // Wait for navigation then scroll
      setTimeout(doScroll, 500)
    } else {
      doScroll()
    }
    setMobileMenuOpen(false)
  }, [pathname, router])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Shop
            </Link>
            <button
              onClick={() => scrollTo('featured')}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Featured Pets
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              About Us
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
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
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4">
              <Link
                href="/shop"
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <button
                onClick={() => scrollTo('featured')}
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2 text-left"
              >
                Featured Pets
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2 text-left"
              >
                About Us
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2 text-left"
              >
                Contact
              </button>
              <Button asChild className="bg-primary text-primary-foreground w-full">
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
