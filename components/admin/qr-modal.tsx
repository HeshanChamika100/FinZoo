"use client"

import { useState } from "react"
import { X, Download, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Pet } from "@/lib/pets-data"
import { QRCodeCanvas } from "qrcode.react"

interface QRModalProps {
  pet: Pet | null
  isOpen: boolean
  onClose: () => void
}

export function QRModal({ pet, isOpen, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)

  const petUrl = pet
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pets/${pet.id}`
    : ""

  const handleDownload = () => {
    if (!pet) return
    // Download QR code as image
    const canvas = document.querySelector("#finzoo-qr-canvas") as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `finzoo-${pet.name.toLowerCase()}-qr.png`
    link.href = canvas.toDataURL("image/png")
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
            <QRCodeCanvas
              id="finzoo-qr-canvas"
              value={petUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              includeMargin={true}
              className="transition-opacity duration-300"
            />
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
