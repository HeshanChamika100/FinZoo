"use client"

import Image from "next/image"
import { Eye, EyeOff, QrCode, Package, PackageX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Pet } from "@/lib/pets-data"
import { usePets } from "@/lib/pets-context"
import { useState } from "react"

interface AdminPetCardProps {
  pet: Pet
  onGenerateQR: (pet: Pet) => void
}

export function AdminPetCard({ pet, onGenerateQR }: AdminPetCardProps) {
  const { toggleStock, toggleVisibility } = usePets()
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${!pet.isVisible ? "opacity-60" : ""} ${!pet.inStock ? "border-destructive/30" : "border-border"}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0">
          <Image
            src={pet.image || "/placeholder.svg"}
            alt={pet.name}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {/* Status overlay */}
          {!pet.isVisible && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <EyeOff className="h-8 w-8 text-background" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.breed} &bull; {pet.species}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg font-bold text-primary">${pet.price}</span>
                <div className="flex gap-1">
                  {pet.featured && (
                    <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                  <Badge
                    variant={pet.inStock ? "default" : "destructive"}
                    className={`text-xs ${pet.inStock ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {pet.inStock ? "In Stock" : "Sold Out"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mt-auto pt-3 border-t border-border">
              {/* Stock Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id={`stock-${pet.id}`}
                  checked={pet.inStock}
                  onCheckedChange={() => toggleStock(pet.id)}
                />
                <Label
                  htmlFor={`stock-${pet.id}`}
                  className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                >
                  {pet.inStock ? (
                    <>
                      <Package className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">In Stock</span>
                    </>
                  ) : (
                    <>
                      <PackageX className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Sold Out</span>
                    </>
                  )}
                </Label>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id={`visibility-${pet.id}`}
                  checked={pet.isVisible}
                  onCheckedChange={() => toggleVisibility(pet.id)}
                />
                <Label
                  htmlFor={`visibility-${pet.id}`}
                  className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                >
                  {pet.isVisible ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Hidden</span>
                    </>
                  )}
                </Label>
              </div>

              {/* QR Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateQR(pet)}
                className="ml-auto border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <QrCode className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Generate</span> QR
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
