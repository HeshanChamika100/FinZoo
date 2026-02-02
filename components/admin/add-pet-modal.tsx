"use client"

import React from "react"

import { useState } from "react"
import { X, Plus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { usePets } from "@/lib/pets-context"

interface AddPetModalProps {
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

export function AddPetModal({ isOpen, onClose }: AddPetModalProps) {
  const { addPet } = usePets()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    price: "",
    image: "",
    description: "",
    inStock: true,
    isVisible: true,
    featured: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    addPet({
      name: formData.name.trim(),
      species: formData.species,
      breed: formData.breed.trim(),
      age: formData.age.trim(),
      price: Number(formData.price),
      image: formData.image.trim() || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
      description: formData.description.trim(),
      inStock: formData.inStock,
      isVisible: formData.isVisible,
      featured: formData.featured,
    })

    // Reset form
    setFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      price: "",
      image: "",
      description: "",
      inStock: true,
      isVisible: true,
      featured: false,
    })
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      price: "",
      image: "",
      description: "",
      inStock: true,
      isVisible: true,
      featured: false,
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <Plus className="h-5 w-5 text-primary" />
            Add New Pet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Pet Name *</Label>
            <Input
              id="name"
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
              <Label htmlFor="species" className="text-foreground">Species *</Label>
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
              <Label htmlFor="breed" className="text-foreground">Breed *</Label>
              <Input
                id="breed"
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
              <Label htmlFor="age" className="text-foreground">Age *</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g., 2 years, 6 months"
                className="bg-background border-input"
              />
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="bg-background border-input"
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-foreground">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image URL (optional)
              </span>
            </Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/pet-image.jpg"
              className="bg-background border-input"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a default image
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this pet's personality, traits, and any special needs..."
              rows={3}
              className="bg-background border-input resize-none"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inStock" className="text-foreground">In Stock</Label>
                <p className="text-xs text-muted-foreground">Pet is available for purchase</p>
              </div>
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isVisible" className="text-foreground">Visible on Website</Label>
                <p className="text-xs text-muted-foreground">Show this pet on the public site</p>
              </div>
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured" className="text-foreground">Featured</Label>
                <p className="text-xs text-muted-foreground">Highlight in the featured section</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Pet
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
