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
  FileText,
  Settings,
  Sparkles,
  Palette,
  Plus,
  ChevronDown,
  ChevronUp,
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
import type { ColorVariant } from "@/lib/pets-context"

interface VariantFormState {
  color_name: string
  color_hex: string
  existingImages: string[]
  pendingImageFiles: File[]
  existingVideos: string[]
  pendingVideoFiles: File[]
  expanded: boolean
}

interface EditPetModalProps {
  pet: Pet | null
  isOpen: boolean
  onClose: () => void
}

const speciesOptions = [
  "Dog", "Cat", "Fish", "Bird", "Rabbit", "Turtle",
  "Hamster", "Guinea Pig", "Parrot", "Snake", "Lizard", "Other",
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
  const [colorVariants, setColorVariants] = useState<VariantFormState[]>([])

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

      // Populate color variants
      const variants = (pet.color_variants || []) as ColorVariant[]
      setColorVariants(variants.map(v => ({
        color_name: v.color_name,
        color_hex: v.color_hex,
        existingImages: v.images || [],
        pendingImageFiles: [],
        existingVideos: v.videos || [],
        pendingVideoFiles: [],
        expanded: false,
      })))
    }
  }, [pet])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.species) newErrors.species = "Species is required"
    if (!formData.breed.trim()) newErrors.breed = "Breed is required"
    if (!formData.age.trim()) newErrors.age = "Age is required"
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid price is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
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
      const uploadedImageUrls: string[] = [...existingImageUrls]
      if (pendingImageFiles.length > 0) {
        try {
          const uploads = await Promise.all(pendingImageFiles.map(file => uploadPetImage(file)))
          uploadedImageUrls.push(...uploads)
        } catch (err: any) {
          setImageError(err.message || "Failed to upload images")
          setIsSubmitting(false)
          return
        }
      }

      const coverImage = uploadedImageUrls[0] || null
      const allImages = uploadedImageUrls

      const uploadedVideoUrls: string[] = [...existingVideoUrls]
      if (pendingVideoFiles.length > 0) {
        try {
          const uploads = await Promise.all(pendingVideoFiles.map(file => uploadPetVideo(file)))
          uploadedVideoUrls.push(...uploads)
        } catch (err: any) {
          setVideoError(err.message || "Failed to upload videos")
          setIsSubmitting(false)
          return
        }
      }

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
        color_variants: await buildColorVariants(),
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
    setColorVariants([])
    onClose()
  }

  // ── Color variant helpers ──
  const addColorVariant = () => {
    setColorVariants(prev => [
      ...prev,
      {
        color_name: "",
        color_hex: "#6366f1",
        existingImages: [],
        pendingImageFiles: [],
        existingVideos: [],
        pendingVideoFiles: [],
        expanded: true,
      },
    ])
  }

  const removeColorVariant = (index: number) => {
    setColorVariants(prev => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, updates: Partial<VariantFormState>) => {
    setColorVariants(prev => prev.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  const buildColorVariants = async (): Promise<ColorVariant[]> => {
    const result: ColorVariant[] = []
    for (const variant of colorVariants) {
      if (!variant.color_name.trim()) continue

      const images = [...variant.existingImages]
      if (variant.pendingImageFiles.length > 0) {
        const uploaded = await Promise.all(variant.pendingImageFiles.map(f => uploadPetImage(f)))
        images.push(...uploaded)
      }

      const videos = [...variant.existingVideos]
      if (variant.pendingVideoFiles.length > 0) {
        const uploaded = await Promise.all(variant.pendingVideoFiles.map(f => uploadPetVideo(f)))
        videos.push(...uploaded)
      }

      result.push({
        color_name: variant.color_name.trim(),
        color_hex: variant.color_hex,
        images,
        videos,
      })
    }
    return result
  }

  if (!pet) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:!max-w-4xl !max-h-[90vh] !overflow-hidden !gap-0 !p-0 !border-0"
        style={{ background: "#196677" }}
      >
        <DialogTitle className="sr-only">Edit Pet</DialogTitle>

        {/* ═══ Gradient Header (fixed, outside scroll) ═══ */}
        <div className="relative">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #196677 0%, #1a7a8a 50%, #c9a97d 100%)" }}
          />
          <div className="relative px-6 py-5 pr-14">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Pet</h2>
                  <p className="text-sm text-white/70">{pet.species} • {pet.breed}</p>
                </div>
              </div>

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting || isSubmitting}
                    className="text-white/70 hover:text-white hover:bg-white/10 mr-6"
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
          {/* Custom close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* ═══ Scrollable Content ═══ */}
        <div
          className="overflow-y-auto bg-card [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40"
          style={{ maxHeight: "calc(90vh - 82px)" }}
        >
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-6">
            {/* ── Section 1: Basic Info ── */}
            <div className="space-y-3">
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
                          <SelectItem key={species} value={species}>{species}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.species && <p className="text-xs text-destructive">{errors.species}</p>}
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
                    {errors.breed && <p className="text-xs text-destructive">{errors.breed}</p>}
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
                    {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
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
                    {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Media ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon className="h-4 w-4 text-primary" />
                Media
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-5 border border-border/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pet Images</Label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">First = Cover</span>
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
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pet Videos</Label>
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
            <div className="space-y-3">
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
            <div className="space-y-3">
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

            {/* ── Section 5: Color Variants ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Palette className="h-4 w-4 text-primary" />
                  Color Variants
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColorVariant}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" />
                  Add Color
                </Button>
              </div>

              {colorVariants.length === 0 ? (
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50 text-center">
                  <Palette className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No color variants added yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Add colors to show different images/videos per color</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colorVariants.map((variant, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded-xl border border-border/50 overflow-hidden"
                    >
                      {/* Variant Header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => updateVariant(index, { expanded: !variant.expanded })}
                      >
                        <div
                          className="h-7 w-7 rounded-full border-2 border-border shrink-0"
                          style={{ backgroundColor: variant.color_hex }}
                        />
                        <span className="text-sm font-medium text-foreground flex-1">
                          {variant.color_name || `Color ${index + 1}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {variant.existingImages.length + variant.pendingImageFiles.length} img · {variant.existingVideos.length + variant.pendingVideoFiles.length} vid
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); removeColorVariant(index) }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {variant.expanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Variant Details */}
                      {variant.expanded && (
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                          <div className="grid grid-cols-2 gap-3 pt-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Color Name *
                              </Label>
                              <Input
                                value={variant.color_name}
                                onChange={(e) => updateVariant(index, { color_name: e.target.value })}
                                placeholder="e.g., Red, Blue"
                                className="bg-background border-input h-9"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Color
                              </Label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={variant.color_hex}
                                  onChange={(e) => updateVariant(index, { color_hex: e.target.value })}
                                  className="h-9 w-12 rounded-lg border border-input cursor-pointer bg-background p-0.5"
                                />
                                <Input
                                  value={variant.color_hex}
                                  onChange={(e) => updateVariant(index, { color_hex: e.target.value })}
                                  placeholder="#000000"
                                  className="bg-background border-input h-9 font-mono text-xs flex-1"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Variant Images */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Images</Label>
                            <MultiImageUpload
                              existingImages={variant.existingImages}
                              onChange={({ existingImages, pendingFiles }) => {
                                updateVariant(index, {
                                  existingImages,
                                  pendingImageFiles: pendingFiles,
                                })
                              }}
                              disabled={isSubmitting || isDeleting}
                            />
                          </div>

                          {/* Variant Videos */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Videos</Label>
                            <MultiVideoUpload
                              existingVideos={variant.existingVideos}
                              onChange={({ existingVideos, pendingFiles }) => {
                                updateVariant(index, {
                                  existingVideos,
                                  pendingVideoFiles: pendingFiles,
                                })
                              }}
                              disabled={isSubmitting || isDeleting}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                style={{ background: "linear-gradient(135deg, #196677 0%, #1a8a7a 100%)" }}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
