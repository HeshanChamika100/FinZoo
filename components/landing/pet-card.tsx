"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Tag, Video, Images } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Pet } from "@/lib/pets-context"
import { useState } from "react"

interface PetCardProps {
  pet: Pet
  index: number
}

export function PetCard({ pet, index }: PetCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const coverImage = pet.images?.[0] || pet.image || "/placeholder.svg"

  return (
    <Card
      className="group overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          src={coverImage}
          alt={pet.name}
          fill
          className={`object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
          />
        </button>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {pet.featured && (
            <Badge className="bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          {!pet.in_stock && (
            <Badge variant="secondary" className="bg-destructive/90 text-destructive-foreground">
              Sold Out
            </Badge>
          )}
          {pet.video && (
            <Badge variant="secondary" className="bg-background/80 text-foreground">
              <Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
          )}
          {pet.images && pet.images.length > 1 && (
            <Badge variant="secondary" className="bg-background/80 text-foreground">
              <Images className="h-3 w-3 mr-1" />
              {pet.images.length}
            </Badge>
          )}
        </div>

        {/* Quick view on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {pet.in_stock ? (
            <Button
              asChild
              className="w-full bg-card text-card-foreground hover:bg-card/90"
            >
              <Link href={`/pets/${pet.id}`}>View Details</Link>
            </Button>
          ) : (
            <Button
              className="w-full bg-card text-card-foreground hover:bg-card/90"
              disabled
            >
              Notify Me
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
              {pet.name}
            </h3>
            <p className="text-sm text-muted-foreground">{pet.breed}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary font-bold">
              <Tag className="h-4 w-4" />
              Rs. {pet.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs border-border">
            {pet.species}
          </Badge>
          <Badge variant="outline" className="text-xs border-border">
            {pet.age}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {pet.description}
        </p>
      </CardContent>
    </Card>
  )
}
