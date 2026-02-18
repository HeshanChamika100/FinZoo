"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

            // Newsletter section slides up with 3D
            if (newsletterRef.current) {
              tl.fromTo(
                newsletterRef.current,
                { y: 60, opacity: 0, rotateX: -10, transformPerspective: 800 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.8 },
                0
              )
            }

            // Footer columns stagger 3D entrance
            if (columnsRef.current) {
              tl.fromTo(
                columnsRef.current.children,
                { y: 80, opacity: 0, rotateY: -25, transformPerspective: 600 },
                { y: 0, opacity: 1, rotateY: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.2)" },
                0.3
              )
            }

            // Bottom bar fades in
            if (bottomRef.current) {
              tl.fromTo(
                bottomRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 },
                0.8
              )
            }
          }, footerRef)

          return () => ctx.revert()
        }
      },
      { threshold: 0.1 }
    )

    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <footer id="contact" ref={footerRef} className="bg-foreground text-background" style={{ perspective: "1200px" }}>
      {/* Newsletter section */}
      <div className="border-b border-background/10">
        <div ref={newsletterRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12" style={{ opacity: 0, transformStyle: "preserve-3d" }}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
              <p className="text-background/70">
                Get updates on new arrivals and exclusive offers.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-primary"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div ref={columnsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12" style={{ transformStyle: "preserve-3d" }}>
          {/* Brand */}
          <div style={{ opacity: 0 }}>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="FinZoo Logo" width={32} height={32} />
              <span className="text-2xl font-bold">
                <span style={{ color: '#196677' }}>Fin</span><span style={{ color: '#c9a97d' }}>Zoo</span>
              </span>
            </Link>
            <p className="text-background/70 mb-6">
              Your trusted partner in finding the perfect pet companion. Quality pets,
              exceptional care, lasting memories.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ opacity: 0 }}>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Browse Pets
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Pet Care Tips
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Pet Categories */}
          <div style={{ opacity: 0 }}>
            <h4 className="text-lg font-semibold mb-6">Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Dogs
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Cats
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Fish & Aquatic
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Birds
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Small Pets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div style={{ opacity: 0 }}>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-background/70">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>508/B/3, Pahala Padukka, Padukka</span>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>+94 (70) 196-4941</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@finzoo.com"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>contact.finzoo@gmail.com</span>
                </a>
              </li>
            </ul>

            {/* Map */}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=6.838385,80.085175"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 block overflow-hidden rounded-xl border border-background/10 relative cursor-pointer"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0!2d80.085175!3d6.838385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTAnMTguMiJOIDgwwrAwNScwNi42IkU!5e0!3m2!1sen!2slk!4v1700000000000"
                width="100%"
                height="180"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(1.1) contrast(1.1)", pointerEvents: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FinZoo Location"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/90 px-4 py-2 rounded-full flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Get Directions
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div ref={bottomRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              &copy; {new Date().getFullYear()} FinZoo. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="#"
                className="text-background/50 hover:text-background transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-background/50 hover:text-background transition-colors"
              >
                Terms of Service
              </Link>
              {/* Discreet Admin Link */}
              <Link
                href="/admin/login"
                className="text-background/30 hover:text-background/50 transition-colors text-xs"
              >
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
