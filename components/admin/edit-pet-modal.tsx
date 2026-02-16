"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Pencil, ImageIcon, Trash2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { uploadPetImage } from "@/components/admin/image-upload"
import { MultiImageUpload } from "@/components/admin/multi-image-upload"
import { MultiVideoUpload } from "@/components/admin/multi-video-upload"
import { uploadPetVideo } from "@/components/admin/video-upload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { usePets, type Pet } from "@/lib/pets-context"

interface EditPetModalProps {
  pet: Pet | null
  isOpen: boolean
  onClose: () => void
}

const speciesOptions = [
  "Dog",
  "Cat",
  "Fish",
  "Bird",
  "Rabbit",
  "Turtle",
  "Hamster",
  "Guinea Pig",
  "Parrot",
  "Snake",
  "Lizard",
  "Other",
]

export function EditPetModal({ pet, isOpen, onClose }: EditPetModalProps) {
  const { updatePet, deletePet } = usePets()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [pendingVideoFiles, setPendingVideoFiles] = useState<File[]>([])
  const [existingVideoUrls, setExistingVideoUrls] = useState<string[]>([])
  const [videoError, setVideoError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    price: "",
    price_type: "each" as "each" | "pair",
    image: "",
    images: [] as string[],
    video: "",
    videos: [] as string[],
    description: "",
    in_stock: true,
    is_visible: true,
    featured: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when pet changes
  useEffect(() => {
    if (pet) {
      const allImages = pet.images?.length ? pet.images : (pet.image ? [pet.image] : [])
      const allVideos = pet.videos?.length ? pet.videos : (pet.video ? [pet.video] : [])
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        price: String(pet.price),
        price_type: pet.price_type || "each",
        image: pet.image || "",
        images: allImages,
        video: pet.video || "",
        videos: allVideos,
        description: pet.description || "",
        in_stock: pet.in_stock,
        is_visible: pet.is_visible,
        featured: pet.featured,
      })
      setExistingImageUrls(allImages)
      setExistingVideoUrls(allVideos)
      setPendingImageFiles([])
      setPendingVideoFiles([])
      setErrors({})
      setSubmitError(null)
      setImageError(null)
      setVideoError(null)
    }
  }, [pet])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.species) {
      newErrors.species = "Species is required"
    }
    if (!formData.breed.trim()) {
      newErrors.breed = "Breed is required"
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required"
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !pet) return

    setIsSubmitting(true)
    setSubmitError(null)
    setImageError(null)
    setVideoError(null)

    try {
      // Upload all pending image files
      const uploadedImageUrls: string[] = [...existingImageUrls]
      if (pendingImageFiles.length > 0) {
        try {
          const uploads = await Promise.all(
            pendingImageFiles.map(file => uploadPetImage(file))
          )
          uploadedImageUrls.push(...uploads)
        } catch (err: any) {
          setImageError(err.message || "Failed to upload images")
          setIsSubmitting(false)
          return
        }
      }

      // First image is the cover
      const coverImage = uploadedImageUrls[0] || null
      const allImages = uploadedImageUrls

      // Upload all pending video files
      const uploadedVideoUrls: string[] = [...existingVideoUrls]
      if (pendingVideoFiles.length > 0) {
        try {
          const uploads = await Promise.all(
            pendingVideoFiles.map(file => uploadPetVideo(file))
          )
          uploadedVideoUrls.push(...uploads)
        } catch (err: any) {
          setVideoError(err.message || "Failed to upload videos")
          setIsSubmitting(false)
          return
        }
      }

      // First video as the main video field for backward compatibility
      const mainVideo = uploadedVideoUrls[0] || null
      const allVideos = uploadedVideoUrls

      await updatePet(pet.id, {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        age: formData.age.trim(),
        price: Number(formData.price),
        price_type: formData.price_type,
        image: coverImage,
        images: allImages,
        video: mainVideo,
        videos: allVideos,
        description: formData.description.trim(),
        in_stock: formData.in_stock,
        is_visible: formData.is_visible,
        featured: formData.featured,
      })

      onClose()
    } catch (error: any) {
      console.error("Failed to update pet:", error)
      setSubmitError(error.message || "Failed to update pet. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!pet) return

    setIsDeleting(true)
    setSubmitError(null)

    try {
      await deletePet(pet.id)
      onClose()
    } catch (error: any) {
      console.error("Failed to delete pet:", error)
      setSubmitError(error.message || "Failed to delete pet. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    setSubmitError(null)
    setPendingImageFiles([])
    setExistingImageUrls([])
    setPendingVideoFiles([])
    setExistingVideoUrls([])
    setImageError(null)
    setVideoError(null)
    onClose()
  }

  if (!pet) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Pet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-foreground">Pet Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Max, Whiskers, Goldie"
              className="bg-background border-input"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Species and Breed */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-species" className="text-foreground">Species *</Label>
              <Select
                value={formData.species}
                onValueChange={(value) => setFormData({ ...formData, species: value })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.species && <p className="text-sm text-destructive">{errors.species}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-breed" className="text-foreground">Breed *</Label>
              <Input
                id="edit-breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g., Golden Retriever"
                className="bg-background border-input"
              />
              {errors.breed && <p className="text-sm text-destructive">{errors.breed}</p>}
            </div>
          </div>

          {/* Age and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-age" className="text-foreground">Age *</Label>
              <Input
                id="edit-age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g., 2 years, 6 months"
                className="bg-background border-input"
              />
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-foreground">Price (Rs.) *</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="bg-background border-input flex-1"
                />
                <Select
                  value={formData.price_type}
                  onValueChange={(value: "each" | "pair") => setFormData({ ...formData, price_type: value })}
                >
                  <SelectTrigger className="w-24 bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="pair">Pair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-foreground">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Pet Images
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">First image will be the cover photo. You can add multiple images.</p>
            <MultiImageUpload
              existingImages={existingImageUrls}
              onChange={({ existingImages, pendingFiles }) => {
                setExistingImageUrls(existingImages)
                setPendingImageFiles(pendingFiles)
              }}
              disabled={isSubmitting || isDeleting}
              error={imageError}
            />
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label className="text-foreground">
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Pet Videos
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">You can add multiple videos.</p>
            <MultiVideoUpload
              existingVideos={existingVideoUrls}
              onChange={({ existingVideos, pendingFiles }) => {
                setExistingVideoUrls(existingVideos)
                setPendingVideoFiles(pendingFiles)
              }}
              disabled={isSubmitting || isDeleting}
              error={videoError}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-foreground">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this pet's personality, traits, and any special needs..."
              rows={3}
              className="bg-background border-input resize-none"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="edit-in_stock" className="text-foreground">In Stock</Label>
                <p className="text-xs text-muted-foreground">Pet is available for purchase</p>
              </div>
              <Switch
                id="edit-in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="edit-is_visible" className="text-foreground">Visible on Website</Label>
                <p className="text-xs text-muted-foreground">Show this pet on the public site</p>
              </div>
              <Switch
                id="edit-is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="edit-featured" className="text-foreground">Featured</Label>
                <p className="text-xs text-muted-foreground">Highlight in the featured section</p>
              </div>
              <Switch
                id="edit-featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isDeleting || isSubmitting}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
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
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
