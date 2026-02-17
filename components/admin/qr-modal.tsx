"use client"

import { useRef, useState } from "react"
import { X, Download, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Pet } from "@/lib/pets-data"
import { QRCodeCanvas } from "qrcode.react"
import { toPng } from "html-to-image"
import Image from "next/image"

interface QRModalProps {
  pet: Pet | null
  isOpen: boolean
  onClose: () => void
}

export function QRModal({ pet, isOpen, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)
  const leafletRef = useRef<HTMLDivElement>(null)

  const petUrl = pet
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pets/${pet.id}`
    : ""

  const handleDownload = async () => {
    if (!pet || !leafletRef.current) return

    try {
      // Small delay to ensure the DOM is fully settled
      await new Promise((resolve) => setTimeout(resolve, 100))

      const dataUrl = await toPng(leafletRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2, // High resolution
      })

      const link = document.createElement("a")
      link.download = `finzoo-${pet.name.toLowerCase()}-leaflet.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Failed to generate image:", err)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(petUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen || !pet) return null

  return (
    <>
      {/* HIDDEN LEAFLET CONTAINER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}>
        <div
          ref={leafletRef}
          style={{
            width: 360,
            padding: 24,
            background: '#ffffff',
            borderRadius: 16,
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#222222',
            border: '1px solid #e5e7eb',
            display: 'flex',      // Added flex
            flexDirection: 'column', // Stack vertically
            alignItems: 'center',    // Center everything horizontally
            textAlign: 'center'      // Ensure text is centered
          }}
        >
          {/* Header with Logo - Centered */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <Image 
              src="/logo.png" 
              alt="FinZoo Logo" 
              width={48} 
              height={48} 
              style={{ borderRadius: 8 }} 
              priority 
              unoptimized
            />
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              <span style={{ color: '#196677' }}>Fin</span><span style={{ color: '#c9a97d' }}>Zoo</span>
            </div>
          </div>
          
          {/* Pet Details - Centered */}
          <div style={{ marginBottom: 12, width: '100%' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#222222' }}>{pet?.name}</div>
            <div style={{ fontSize: 15, color: '#666666', marginBottom: 2 }}>{pet?.breed} &bull; {pet?.species}</div>
            <div style={{ fontSize: 13, color: '#888888' }}>Scan the QR code to view this pet online!</div>
          </div>
          
          {/* QR Code Container */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0', width: '100%' }}>
            <div style={{ background: '#ffffff', padding: 8, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #eee' }}>
              <QRCodeCanvas
                value={petUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div style={{ fontSize: 13, color: '#555555', wordBreak: 'break-all', marginBottom: 8 }}>{"fin-zoo.vercel.app"}</div>
          <div style={{ fontSize: 12, color: '#aaaaaa' }}>FinZoo &copy; {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* --- VISIBLE MODAL UI --- */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-card rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-card-foreground">{pet.name}</h2>
            <p className="text-sm text-muted-foreground">{pet.breed} &bull; {pet.species}</p>
          </div>

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
    </>
  )
}