"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, Tag, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePets } from "@/lib/pets-context"

export default function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { getPetById } = usePets()
  const pet = getPetById(id)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
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
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <Image
              src={pet.image || "/placeholder.svg"}
              alt={pet.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              priority
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            
            {/* Status badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {pet.featured && (
                <Badge className="bg-primary text-primary-foreground">Featured</Badge>
              )}
              {!pet.in_stock && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <Badge variant="outline" className="border-border">
                {pet.species}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">{pet.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{pet.breed}</p>

            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-primary">${pet.price}</span>
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
                  <div className="text-sm text-muted-foreground">About</div>
                  <div className="text-foreground">{pet.description}</div>
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
                      `Hi! I'm interested in *${pet.name}*\n\n` +
                      `Species: ${pet.species}\n` +
                      `Breed: ${pet.breed}\n` +
                      `Age: ${pet.age}\n` +
                      `Price: $${pet.price}\n\n` +
                      `Could you please share more details?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inquire Now
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
    </div>
  )
}
