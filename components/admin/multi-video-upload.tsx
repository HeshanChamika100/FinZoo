"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Video, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VideoItem {
  /** URL of an already-uploaded video */
  url?: string
  /** Local file not yet uploaded */
  file?: File
  /** Object URL for local preview */
  preview?: string
}

interface MultiVideoUploadProps {
  /** Existing uploaded video URLs */
  existingVideos: string[]
  /** Called whenever the list of pending files or existing URLs changes */
  onChange: (data: { existingVideos: string[]; pendingFiles: File[] }) => void
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

export function MultiVideoUpload({ existingVideos, onChange, disabled, error }: MultiVideoUploadProps) {
  const [items, setItems] = useState<VideoItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track the last existingVideos we sent to parent so we can ignore echoed-back props
  const lastNotifiedUrls = useRef<string>("")
  const isInitialRender = useRef(true)

  // Initialize items from existing videos on mount
  useEffect(() => {
    setItems(existingVideos.map(url => ({ url })))
    lastNotifiedUrls.current = [...existingVideos].sort().join(",")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync existing videos when parent provides genuinely new data (e.g. modal opens with different pet)
  useEffect(() => {
    const incomingKey = [...existingVideos].sort().join(",")
    // Skip if this is just an echo of what we sent via onChange
    if (incomingKey === lastNotifiedUrls.current) return
    lastNotifiedUrls.current = incomingKey
    setItems(prev => {
      const pendingFiles = prev.filter(i => i.file)
      const newExisting = existingVideos.map(url => ({ url }))
      return [...newExisting, ...pendingFiles]
    })
  }, [existingVideos])

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
      existingVideos: urls,
      pendingFiles: items.filter(i => i.file).map(i => i.file!),
    })
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const validFiles: VideoItem[] = []

    for (const file of Array.from(files)) {
      if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        setValidationError("Please upload video files only (MP4, WebM, OGG, MOV, AVI)")
        continue
      }
      if (file.size > MAX_VIDEO_SIZE) {
        setValidationError("Each video must be less than 50MB")
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
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Video grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, index) => {
            const src = item.preview || item.url || ""

            return (
              <div
                key={`${item.url || ""}-${item.file?.name || ""}-${index}`}
                className="relative group rounded-lg overflow-hidden border border-border bg-muted"
              >
                <video
                  src={src}
                  controls
                  className="w-full h-32 object-contain bg-black rounded-lg"
                  preload="metadata"
                />

                {/* Pending badge */}
                {item.file && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] bg-background/80 text-muted-foreground px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                {!disabled && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              className="h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no videos) */}
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
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop videos here" : "Drag & drop videos"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or <span className="text-primary underline">browse files</span> &bull; Select multiple
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, OGG, MOV, AVI (max 50MB each)
          </p>
        </div>
      )}

      {/* Drop zone overlay when videos exist */}
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
            <p className="text-sm text-primary font-medium">Drop to add more videos</p>
          )}
        </div>
      )}

      {(validationError || error) && (
        <p className="text-sm text-destructive">{validationError || error}</p>
      )}
    </div>
  )
}
