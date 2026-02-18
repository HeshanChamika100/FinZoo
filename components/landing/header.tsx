"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePets } from "@/lib/pets-context"
import { useLoader } from "@/lib/loader-context"
import gsap from "gsap"

interface HeaderProps {
  variant?: 'default' | 'white'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [isOverHero, setIsOverHero] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLAnchorElement>(null)
  const navLinksRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const { pets } = usePets()
  const { startLoading } = useLoader()

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

  // ... existing scroll, scrollTo, search logic ...
  // Detect scroll position to change header style
  useEffect(() => {
    // Skip scroll detection for white variant
    if (variant === 'white') {
      setIsOverHero(false)
      return
    }

    const handleScroll = () => {
      // Consider hero section as roughly the viewport height
      const heroHeight = window.innerHeight - 100
      setIsOverHero(window.scrollY < heroHeight)
    }

    handleScroll() // Check initial position
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

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

  // Filter pets based on search query
  const filteredPets = searchQuery.trim()
    ? pets.filter(pet =>
      pet.is_visible &&
      (pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5) // Limit to 5 results
    : []

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setMobileSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSearchResults(true)
  }

  const handlePetClick = (petId: string) => {
    setSearchQuery("")
    setShowSearchResults(false)
    setMobileSearchOpen(false)
    startLoading()
    router.push(`/pets/${petId}`)
  }

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${variant === 'white'
        ? 'bg-white border-border'
        : isOverHero
          ? 'bg-transparent border-transparent'
          : 'bg-background/80 backdrop-blur-md border-border'
        }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link ref={logoRef} href="/" className="flex items-center gap-2 group shrink-0" style={{ transformStyle: "preserve-3d" }}>
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

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${variant === 'white' ? 'text-muted-foreground' : isOverHero ? 'text-white/70' : 'text-muted-foreground'
                }`} />
              <Input
                type="text"
                placeholder="Search pets..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
                className={`pl-10 ${variant === 'white'
                  ? 'bg-white border-border'
                  : isOverHero
                    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                    : 'bg-background border-border'
                  }`}
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() && (
              <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {filteredPets.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {filteredPets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => handlePetClick(pet.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                      >
                        {pet.image ? (
                          <Image
                            src={pet.image}
                            alt={pet.breed}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No img</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{pet.breed}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {pet.species} • {pet.breed}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          ${pet.price}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No pets found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div ref={navLinksRef} className="hidden md:flex items-center gap-8 shrink-0">
            <Link
              href="/shop"
              className={`hover:text-primary transition-colors duration-200 font-medium ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
              onClick={() => startLoading()}
            >
              Shop
            </Link>
            <button
              onClick={() => scrollTo('featured')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
            >
              Featured Pets
            </button>
            <button
              onClick={() => scrollTo('about')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
            >
              About Us
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className={`hover:text-primary transition-colors duration-200 font-medium ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                }`}
            >
              Contact
            </button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25">
              <Link href="/shop" onClick={() => startLoading()}>Browse All</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`${variant === 'white' ? 'text-black' : isOverHero ? 'text-white hover:text-white' : ''
                }`}
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                if (mobileMenuOpen) setMobileMenuOpen(false)
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${variant === 'white' ? 'text-black' : isOverHero ? 'text-white hover:text-white' : ''
                }`}
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div ref={mobileSearchRef} className={`md:hidden py-4 border-t animate-in rounded-xl slide-in-from-top-2 duration-200 ${variant === 'white' ? 'bg-white border-border' : isOverHero ? 'bg-black/80 backdrop-blur-md border-white/20' : 'bg-background/95 backdrop-blur-md border-border'
            }`}>
            <div className="px-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${variant === 'white' ? 'text-muted-foreground' : isOverHero ? 'text-white/70' : 'text-muted-foreground'
                  }`} />
                <Input
                  type="text"
                  placeholder="Search pets..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  className={`pl-10 ${variant === 'white'
                    ? 'bg-white border-border'
                    : isOverHero
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      : 'bg-background border-border'
                    }`}
                />
              </div>

              {/* Mobile Search Results */}
              {searchQuery.trim() && (
                <div className="mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  {filteredPets.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {filteredPets.map((pet) => (
                        <button
                          key={pet.id}
                          onClick={() => handlePetClick(pet.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                        >
                          {pet.image ? (
                            <Image
                              src={pet.image}
                              alt={pet.breed}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{pet.breed}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {pet.species} • {pet.breed}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            ${pet.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No pets found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t animate-in rounded-xl text-center slide-in-from-top-2 duration-200 ${variant === 'white' ? 'bg-white border-border' : isOverHero ? 'bg-black/80 backdrop-blur-md border-white/20' : 'bg-background/95 backdrop-blur-md border-border'
            }`}>
            <div className="flex flex-col gap-4">
              <Link
                href="/shop"
                className={`hover:text-primary transition-colors px-2 py-2 ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                  }`}
                onClick={() => {
                  setMobileMenuOpen(false)
                  startLoading()
                }}
              >
                Shop
              </Link>
              <button
                onClick={() => scrollTo('featured')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                  }`}
              >
                Featured Pets
              </button>
              <button
                onClick={() => scrollTo('about')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                  }`}
              >
                About Us
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className={`hover:text-primary transition-colors px-2 py-2 text-center ${variant === 'white' ? 'text-black' : isOverHero ? 'text-white' : 'text-muted-foreground'
                  }`}
              >
                Contact
              </button>
              <Button asChild className="bg-primary text-primary-foreground w-1/2 mx-auto">
                <Link href="/shop" onClick={() => {
                  setMobileMenuOpen(false)
                  startLoading()
                }}>
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
