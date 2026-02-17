"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Pencil,
  ImageIcon,
  Trash2,
  Video,
  X,
  PawPrint,
  DollarSign,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react"
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
      <DialogContent className="sm:!max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <DialogTitle className="sr-only">Edit Pet</DialogTitle>
        {/* Gradient Header */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #196677 0%, #1a7a8a 50%, #c9a97d 100%)",
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="relative px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Pet</h2>
                  <p className="text-sm text-white/70">
                    {pet.species} • {pet.breed}
                  </p>
                </div>
              </div>

              {/* Delete Button in Header */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting || isSubmitting}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {pet.breed}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this {pet.species} ({pet.breed}) from your inventory.
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
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-6">
          {/* ── Section 1: Basic Info ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <PawPrint className="h-4 w-4 text-primary" />
              Basic Information
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-species" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Species *
                  </Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value) => setFormData({ ...formData, species: value })}
                  >
                    <SelectTrigger className="bg-background border-input h-10">
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
                  {errors.species && <p className="text-xs text-destructive mt-1">{errors.species}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-breed" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Breed *
                  </Label>
                  <Input
                    id="edit-breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                    className="bg-background border-input h-10"
                  />
                  {errors.breed && <p className="text-xs text-destructive mt-1">{errors.breed}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-age" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Age *
                  </Label>
                  <Input
                    id="edit-age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g., 2 years, 6 months"
                    className="bg-background border-input h-10"
                  />
                  {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-price" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price (Rs.) *
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs.</span>
                      <Input
                        id="edit-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="bg-background border-input h-10 pl-10"
                      />
                    </div>
                    <Select
                      value={formData.price_type}
                      onValueChange={(value: "each" | "pair") => setFormData({ ...formData, price_type: value })}
                    >
                      <SelectTrigger className="w-24 bg-background border-input h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="pair">Pair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Media ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageIcon className="h-4 w-4 text-primary" />
              Media
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-5 border border-border/50">
              {/* Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pet Images
                  </Label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    First = Cover
                  </span>
                </div>
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

              <div className="border-t border-border/50" />

              {/* Videos */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pet Videos
                </Label>
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
            </div>
          </div>

          {/* ── Section 3: Description ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Description
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this pet's personality, traits, and any special needs..."
                rows={4}
                className="bg-background border-input resize-none"
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* ── Section 4: Settings ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Settings className="h-4 w-4 text-primary" />
              Settings
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                htmlFor="edit-in_stock"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <PawPrint className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">In Stock</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">Available for purchase</div>
                  </div>
                </div>
                <Switch
                  id="edit-in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                />
              </label>

              <label
                htmlFor="edit-is_visible"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Visible</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">Show on public site</div>
                  </div>
                </div>
                <Switch
                  id="edit-is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
              </label>

              <label
                htmlFor="edit-featured"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Featured</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">Highlight on homepage</div>
                  </div>
                </div>
                <Switch
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <X className="h-3 w-3 text-destructive" />
              </div>
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border bg-transparent h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex-1 h-11 text-white font-medium shadow-lg shadow-primary/20"
              style={{
                background: "linear-gradient(135deg, #196677 0%, #1a8a7a 100%)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
