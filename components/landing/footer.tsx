"use client"

import Link from "next/link"
import { Fish, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Newsletter section */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Fish className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">
                Fin<span className="text-primary">Zoo</span>
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
          <div>
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
          <div>
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
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-background/70">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>123 Pet Street, Animal City, AC 12345</span>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>+1 (234) 567-890</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@finzoo.com"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>hello@finzoo.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
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
