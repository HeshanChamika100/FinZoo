"use client"

import Link from "next/link"
import { Fish, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Fish className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Fin<span className="text-primary">Zoo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Shop
            </Link>
            <Link
              href="#featured"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Featured Pets
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link
              href="#contact"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Contact
            </Link>
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
              <Link
                href="#featured"
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Featured Pets
              </Link>
              <Link
                href="#about"
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
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
