"use client"

import { useEffect, useRef, useState } from "react"
import { X, Download, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Pet } from "@/lib/pets-data"

interface QRModalProps {
  pet: Pet | null
  isOpen: boolean
  onClose: () => void
}

export function QRModal({ pet, isOpen, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)

  const petUrl = pet
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pets/${pet.id}`
    : ""

  useEffect(() => {
    if (!isOpen || !pet || !canvasRef.current) return

    // Generate QR code using canvas
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 200
    canvas.width = size
    canvas.height = size

    // Simple QR-like pattern generator (for demo purposes)
    // In production, you would use a library like qrcode
    generateQRPattern(ctx, petUrl, size)
    setQrGenerated(true)
  }, [isOpen, pet, petUrl])

  const generateQRPattern = (
    ctx: CanvasRenderingContext2D,
    _data: string,
    size: number
  ) => {
    const moduleCount = 25
    const moduleSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Generate pattern based on data hash
    ctx.fillStyle = "#1a1a2e"

    // Create a deterministic pattern based on pet data
    const seed = _data.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Position detection patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize)
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize)
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize)

    // Timing patterns
    for (let i = 8; i < moduleCount - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize)
        ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize)
      }
    }

    // Data modules (pseudo-random based on seed)
    let seedValue = seed
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder patterns and timing
        if (isReserved(row, col, moduleCount)) continue

        seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff
        if (seedValue % 2 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  const drawFinderPattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    moduleSize: number
  ) => {
    // Outer black square
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)

    // Inner white square
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)

    // Center black square
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
  }

  const isReserved = (row: number, col: number, moduleCount: number): boolean => {
    // Top-left finder pattern
    if (row < 9 && col < 9) return true
    // Top-right finder pattern
    if (row < 9 && col >= moduleCount - 8) return true
    // Bottom-left finder pattern
    if (row >= moduleCount - 8 && col < 9) return true
    // Timing patterns
    if (row === 6 || col === 6) return true
    return false
  }

  const handleDownload = () => {
    if (!canvasRef.current || !pet) return

    const link = document.createElement("a")
    link.download = `finzoo-${pet.name.toLowerCase()}-qr.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(petUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen || !pet) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground">{pet.name}</h2>
          <p className="text-sm text-muted-foreground">{pet.breed} &bull; {pet.species}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-background rounded-xl border border-border">
            <canvas
              ref={canvasRef}
              className={`transition-opacity duration-300 ${qrGenerated ? "opacity-100" : "opacity-0"}`}
            />
            {!qrGenerated && (
              <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* URL */}
        <div className="mb-6">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {petUrl}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border bg-transparent"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
