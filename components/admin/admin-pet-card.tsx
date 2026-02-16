"use client"

import Image from "next/image"
import { Eye, EyeOff, QrCode, Package, PackageX, Pencil, Trash2, Video, Images } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Pet } from "@/lib/pets-context"
import { usePets } from "@/lib/pets-context"
import { useState } from "react"

interface AdminPetCardProps {
  pet: Pet
  onGenerateQR: (pet: Pet) => void
  onEdit: (pet: Pet) => void
}

export function AdminPetCard({ pet, onGenerateQR, onEdit }: AdminPetCardProps) {
  const { toggleStock, toggleVisibility, deletePet } = usePets()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePet(pet.id)
    } catch (error) {
      console.error("Failed to delete pet:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const coverImage = pet.images?.[0] || pet.image || "/placeholder.svg"

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${!pet.is_visible ? "opacity-60" : ""} ${!pet.in_stock ? "border-destructive/30" : "border-border"}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0">
          <Image
            src={coverImage}
            alt={pet.name}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {/* Status overlay */}
          {!pet.is_visible && (
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
                <span className="text-lg font-bold text-primary">Rs. {pet.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">/{pet.price_type === 'pair' ? 'pair' : 'each'}</span>
                <div className="flex gap-1">
                  {pet.featured && (
                    <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                  {pet.video && (
                    <Badge variant="secondary" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {pet.images && pet.images.length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      <Images className="h-3 w-3 mr-1" />
                      {pet.images.length}
                    </Badge>
                  )}
                  <Badge
                    variant={pet.in_stock ? "default" : "destructive"}
                    className={`text-xs ${pet.in_stock ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {pet.in_stock ? "In Stock" : "Sold Out"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mt-auto pt-3 border-t border-border">
              {/* Stock Toggle */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleStock(pet.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStock(pet.id) } }}
                className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Switch
                  checked={pet.in_stock}
                  onCheckedChange={() => toggleStock(pet.id)}
                  className="pointer-events-none"
                />
                {pet.in_stock ? (
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
              </div>

              {/* Visibility Toggle */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleVisibility(pet.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVisibility(pet.id) } }}
                className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Switch
                  checked={pet.is_visible}
                  onCheckedChange={() => toggleVisibility(pet.id)}
                  className="pointer-events-none"
                />
                {pet.is_visible ? (
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
              </div>

              {/* Edit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(pet)}
                className="ml-auto border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <Pencil className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              {/* QR Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateQR(pet)}
                className="border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <QrCode className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Generate</span> QR
              </Button>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {pet.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete {pet.name} from your inventory.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
