"use client"

import { use, useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Heart,
  Share2,
  Tag,
  Calendar,
  Info,
  MessageCircle,
  Palette,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePets } from "@/lib/pets-context"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { ColorVariant } from "@/lib/pets-context"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { useRouter } from "next/navigation"

import { useToast } from "@/components/ui/use-toast"

export default function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)
  const { getPetById } = usePets()
  const pet = getPetById(id)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<number | null>(null)

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleShare = async () => {
    if (!pet) return

    const shareData = {
      title: `${pet.breed} - FinZoo`,
      text: `Check out this ${pet.breed} on FinZoo!`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Pet link copied to clipboard",
        })
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  // Parse color variants
  const colorVariants = useMemo(() => {
    if (!pet) return []
    const variants = (pet.color_variants || []) as ColorVariant[]
    return variants.filter(v => v.color_name && (v.images.length > 0 || v.videos.length > 0))
  }, [pet])

  // Determine which images/videos to show based on selected color
  const { displayImages, displayVideos } = useMemo(() => {
    if (!pet) return { displayImages: [], displayVideos: [] }

    if (selectedColor !== null && colorVariants[selectedColor]) {
      const variant = colorVariants[selectedColor]
      return {
        displayImages: variant.images.length > 0 ? variant.images : [],
        displayVideos: variant.videos || [],
      }
    }

    // Default: show pet's main images/videos
    const images = pet.images && pet.images.length > 0 ? pet.images : (pet.image ? [pet.image] : [])
    const videos = pet.videos && pet.videos.length > 0 ? pet.videos : (pet.video ? [pet.video] : [])
    return { displayImages: images, displayVideos: videos }
  }, [pet, selectedColor, colorVariants])

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return

      switch (e.key) {
        case "Escape":
          setIsLightboxOpen(false)
          break
        case "ArrowLeft":
          setSelectedImage(prev => (prev > 0 ? prev - 1 : displayImages.length - 1))
          break
        case "ArrowRight":
          setSelectedImage(prev => (prev < displayImages.length - 1 ? prev + 1 : 0))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Lock body scroll when lightbox is open
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isLightboxOpen, displayImages.length])

  if (!pet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="white" />
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Pet Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This pet listing may have been removed or the URL is incorrect.
            </p>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant="white" />

      {/* Spacer for fixed header */}
      <div className="h-12" />

      {/* Action bar */}
      <div className="sticky top-16 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in group"
              onClick={() => displayImages.length > 0 && setIsLightboxOpen(true)}
            >
              {displayImages.length > 0 ? (
                <>
                  <Image
                    src={displayImages[selectedImage] || "/placeholder.svg"}
                    alt={pet.breed}
                    fill
                    className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  {/* Hover overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No images for this color</p>
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {pet.featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
                {!pet.in_stock && (
                  <Badge variant="destructive">Sold Out</Badge>
                )}
              </div>

              {/* Image counter */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-4 right-4 pointer-events-none">
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    {selectedImage + 1} / {displayImages.length}
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImage(index)
                      setImageLoaded(false)
                    }}
                    className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === selectedImage
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${pet.breed} image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Videos */}
            {displayVideos.length > 0 && displayVideos.map((videoUrl, index) => (
              <div key={index} className="rounded-2xl overflow-hidden border border-border bg-black">
                <video
                  src={videoUrl}
                  controls
                  preload="metadata"
                  className="w-full rounded-2xl"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <Badge variant="outline" className="border-border">
                {pet.species}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">{pet.breed}</h1>
            <p className="text-lg text-muted-foreground mb-4">{pet.species}</p>

            {/* Color Swatches */}
            {colorVariants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedColor !== null ? colorVariants[selectedColor].color_name : "Default"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Default swatch */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedColor(null)
                      setSelectedImage(0)
                      setImageLoaded(false)
                    }}
                    className={`relative h-9 w-9 rounded-full border-2 transition-all bg-gradient-to-br from-gray-200 to-gray-400 ${selectedColor === null
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-border hover:scale-105"
                      }`}
                    title="Default"
                  />
                  {colorVariants.map((variant, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedColor(index)
                        setSelectedImage(0)
                        setImageLoaded(false)
                      }}
                      className={`relative h-9 w-9 rounded-full border-2 transition-all ${selectedColor === index
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-border hover:scale-105"
                        }`}
                      style={{ backgroundColor: variant.color_hex }}
                      title={variant.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-primary">Rs. {pet.price.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground">/{pet.price_type === 'pair' ? 'pair' : 'each'}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Age</div>
                  <div className="font-medium text-foreground">{pet.age}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">About</div>
                  <MarkdownRenderer content={pet.description || ""} />
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!pet.in_stock}
                asChild={pet.in_stock}
              >
                {pet.in_stock ? (
                  <a
                    href={`https://wa.me/94701964941?text=${encodeURIComponent(
                      `Hi! I'm interested in *${pet.breed}*\n\n` +
                      `Species: ${pet.species}\n` +
                      `Breed: ${pet.breed}\n` +
                      `Age: ${pet.age}\n` +
                      (selectedColor !== null ? `Color: ${colorVariants[selectedColor].color_name}\n` : '') +
                      `Price: Rs. ${pet.price.toLocaleString()} /${pet.price_type === 'pair' ? 'pair' : 'each'}\n\n` +
                      `Could you please share more details?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                    Inquire Now Via Whatsapp
                  </a>
                ) : (
                  "Notify When Available"
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-border bg-transparent"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <Badge variant="secondary" className="bg-muted text-foreground text-sm px-3 py-1">
              {selectedImage + 1} / {displayImages.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation - Left */}
          {displayImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 rounded-full bg-background/50 hover:bg-background border border-border h-12 w-12 hidden sm:flex"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(prev => (prev > 0 ? prev - 1 : displayImages.length - 1))
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full max-w-7xl max-h-[85vh] mx-auto p-4 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={displayImages[selectedImage] || "/placeholder.svg"}
                alt={pet.breed}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Navigation - Right */}
          {displayImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 rounded-full bg-background/50 hover:bg-background border border-border h-12 w-12 hidden sm:flex"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(prev => (prev < displayImages.length - 1 ? prev + 1 : 0))
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
