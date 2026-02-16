"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Upload, X, ImageIcon, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ImageItem {
  /** URL of an already-uploaded image */
  url?: string
  /** Local file not yet uploaded */
  file?: File
  /** Object URL for local preview */
  preview?: string
}

interface MultiImageUploadProps {
  /** Existing uploaded image URLs */
  existingImages: string[]
  /** Called whenever the list of pending files or existing URLs changes */
  onChange: (data: { existingImages: string[]; pendingFiles: File[] }) => void
  disabled?: boolean
  error?: string | null
}

export function MultiImageUpload({ existingImages, onChange, disabled, error }: MultiImageUploadProps) {
  const [items, setItems] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track the last existingImages we sent to parent so we can ignore echoed-back props
  const lastNotifiedUrls = useRef<string>("")
  const isInitialRender = useRef(true)

  // Initialize items from existing images on mount
  useEffect(() => {
    setItems(existingImages.map(url => ({ url })))
    lastNotifiedUrls.current = [...existingImages].sort().join(",")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync existing images when parent provides genuinely new data (e.g. modal opens with different pet)
  useEffect(() => {
    const incomingKey = [...existingImages].sort().join(",")
    // Skip if this is just an echo of what we sent via onChange
    if (incomingKey === lastNotifiedUrls.current) return
    lastNotifiedUrls.current = incomingKey
    setItems(prev => {
      const pendingFiles = prev.filter(i => i.file)
      const newExisting = existingImages.map(url => ({ url }))
      return [...newExisting, ...pendingFiles]
    })
  }, [existingImages])

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent whenever items change (after state settles, not during render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const urls = items.filter(i => i.url).map(i => i.url!)
    lastNotifiedUrls.current = [...urls].sort().join(",")
    onChange({
      existingImages: urls,
      pendingFiles: items.filter(i => i.file).map(i => i.file!),
    })
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const validFiles: ImageItem[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setValidationError("Please upload image files only (JPG, PNG, GIF, WebP)")
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationError("Each image must be less than 5MB")
        continue
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      })
    }

    if (validFiles.length > 0) {
      setValidationError(null)
      setItems(prev => [...prev, ...validFiles])
    }
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => {
      const item = prev[index]
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const setCover = useCallback((index: number) => {
    setItems(prev => {
      if (index === 0) return prev
      const updated = [...prev]
      const [item] = updated.splice(index, 1)
      updated.unshift(item)
      return updated
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }, [disabled, addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [addFiles])

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Image grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, index) => {
            const src = item.preview || item.url || ""
            const isCover = index === 0

            return (
              <div
                key={`${item.url || ""}-${item.file?.name || ""}-${index}`}
                className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square"
              >
                <Image
                  src={src}
                  alt={`Pet image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Cover badge */}
                {isCover && (
                  <div className="absolute top-1 left-1">
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                      <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                      Cover
                    </Badge>
                  </div>
                )}

                {/* Pending badge */}
                {item.file && (
                  <div className="absolute bottom-1 left-1">
                    <span className="text-[10px] bg-background/80 text-muted-foreground px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                {!disabled && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {!isCover && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-primary hover:bg-primary/80 text-primary-foreground"
                        onClick={() => setCover(index)}
                        title="Set as cover"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                      onClick={() => removeItem(index)}
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add more button */}
          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images) */}
      {items.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors
            ${isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop images here" : "Drag & drop images"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or <span className="text-primary underline">browse files</span> &bull; Select multiple
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF, WebP (max 5MB each)
          </p>
        </div>
      )}

      {/* Drop zone overlay when images exist */}
      {items.length > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            rounded-lg border-2 border-dashed p-2 text-center transition-colors
            ${isDragging
              ? "border-primary bg-primary/5"
              : "border-transparent"
            }
          `}
        >
          {isDragging && (
            <p className="text-sm text-primary font-medium">Drop to add more images</p>
          )}
        </div>
      )}

      {(validationError || error) && (
        <p className="text-sm text-destructive">{validationError || error}</p>
      )}
    </div>
  )
}
