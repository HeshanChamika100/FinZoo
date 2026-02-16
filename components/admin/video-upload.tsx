"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Video, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface VideoUploadProps {
  /** Existing video URL (for edit mode) */
  value: string
  /** Called when the pending file changes or video is removed */
  onFileChange: (file: File | null) => void
  /** Called when the existing URL should be cleared */
  onRemove: () => void
  disabled?: boolean
  error?: string | null
}

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
  "video/x-msvideo",  // .avi
]

const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Upload a video file to Supabase Storage and return the public URL.
 * Call this from the form submit handler, not from the component.
 */
export async function uploadPetVideo(file: File): Promise<string> {
  const supabase = createClient()

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4"
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = `pets/videos/${fileName}`

  const { error } = await supabase.storage
    .from("pet-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from("pet-images")
    .getPublicUrl(filePath)

  return publicUrl
}

export function VideoUpload({ value, onFileChange, onRemove, disabled, error }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const selectFile = useCallback((file: File) => {
    // Validate file type
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setValidationError("Please upload a video file (MP4, WebM, OGG, MOV, AVI)")
      return
    }

    // Validate file size (max 50MB)
    if (file.size > MAX_VIDEO_SIZE) {
      setValidationError("Video must be less than 50MB")
      return
    }

    setValidationError(null)

    // Create local preview
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))

    onFileChange(file)
  }, [onFileChange, preview])

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

    const files = e.dataTransfer.files
    if (files.length > 0) selectFile(files[0])
  }, [disabled, selectFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) selectFile(files[0])
    // Reset so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [selectFile])

  const handleRemove = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setValidationError(null)
    onFileChange(null)
    onRemove()
  }, [onFileChange, onRemove, preview])

  const displayVideo = preview || value

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {displayVideo ? (
        /* Video preview */
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted">
          <div className="relative w-full">
            <video
              src={displayVideo}
              controls
              className="w-full h-48 object-contain bg-black rounded-lg"
              preload="metadata"
            />
          </div>
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-background shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {preview && (
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-background/80 text-muted-foreground px-2 py-1 rounded">
                Will upload on save
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
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
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop video here" : "Drag & drop a video"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or <span className="text-primary underline">browse files</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, OGG, MOV, AVI (max 50MB)
          </p>
        </div>
      )}

      {(validationError || error) && (
        <p className="text-sm text-destructive">{validationError || error}</p>
      )}
    </div>
  )
}
