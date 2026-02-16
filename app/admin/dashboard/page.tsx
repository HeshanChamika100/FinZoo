"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LogOut,
  Search,
  Package,
  PackageX,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Filter,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { usePets } from "@/lib/pets-context"
import { AdminPetCard } from "@/components/admin/admin-pet-card"
import { QRModal } from "@/components/admin/qr-modal"
import { AddPetModal } from "@/components/admin/add-pet-modal"
import { EditPetModal } from "@/components/admin/edit-pet-modal"
import type { Pet } from "@/lib/pets-context"

type FilterType = "all" | "inStock" | "soldOut" | "visible" | "hidden"

export default function AdminDashboard() {
  const { user, profile, isAuthenticated, logout, loading: authLoading } = useAuth()
  const { pets, loading: petsLoading } = usePets()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [addPetModalOpen, setAddPetModalOpen] = useState(false)
  const [editPetModalOpen, setEditPetModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, authLoading, router])

  const handleGenerateQR = (pet: Pet) => {
    setSelectedPet(pet)
    setQrModalOpen(true)
  }

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setEditPetModalOpen(true)
  }

  // Filter and search pets
  const filteredPets = pets.filter((pet) => {
    // Search filter
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    let matchesFilter = true
    switch (filter) {
      case "inStock":
        matchesFilter = pet.in_stock
        break
      case "soldOut":
        matchesFilter = !pet.in_stock
        break
      case "visible":
        matchesFilter = pet.is_visible
        break
      case "hidden":
        matchesFilter = !pet.is_visible
        break
    }

    return matchesSearch && matchesFilter
  })

  // Stats
  const stats = {
    total: pets.length,
    inStock: pets.filter((p) => p.in_stock).length,
    soldOut: pets.filter((p) => !p.in_stock).length,
    visible: pets.filter((p) => p.is_visible).length,
    hidden: pets.filter((p) => !p.is_visible).length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="FinZoo Logo" width={40} height={40} />
              <span className="text-xl font-bold">
                <span style={{ color: '#196677' }}>Fin</span><span style={{ color: '#c9a97d' }}>Zoo</span>
              </span>
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                Admin
              </Badge>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {profile?.name || user?.email || "Admin"}
              </span>
              <Button
                size="sm"
                onClick={() => setAddPetModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Pet</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-border hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pet Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your pets, update stock status, and generate QR codes.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Pets</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{stats.inStock}</span>
            </div>
            <div className="text-sm text-muted-foreground">In Stock</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-destructive/20">
            <div className="flex items-center gap-2">
              <PackageX className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{stats.soldOut}</span>
            </div>
            <div className="text-sm text-muted-foreground">Sold Out</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-card-foreground">{stats.visible}</span>
              <span className="text-muted-foreground">/</span>
              <EyeOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-muted-foreground">{stats.hidden}</span>
            </div>
            <div className="text-sm text-muted-foreground">Visible / Hidden</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pets by name, breed, or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-input"
            />
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border shrink-0 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                {filter === "all" && "All Pets"}
                {filter === "inStock" && "In Stock"}
                {filter === "soldOut" && "Sold Out"}
                {filter === "visible" && "Visible"}
                {filter === "hidden" && "Hidden"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Pets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inStock")}>
                <Package className="h-4 w-4 mr-2" />
                In Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("soldOut")}>
                <PackageX className="h-4 w-4 mr-2" />
                Sold Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("visible")}>
                <Eye className="h-4 w-4 mr-2" />
                Visible
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("hidden")}>
                <EyeOff className="h-4 w-4 mr-2" />
                Hidden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-none ${viewMode === "list" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-none ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredPets.length} of {pets.length} pets
        </p>

        {/* Pet list */}
        {petsLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-4 animate-pulse flex gap-4 items-center"
              >
                <div className="h-16 w-16 bg-muted rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPets.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {filteredPets.map((pet) => (
              <AdminPetCard key={pet.id} pet={pet} onGenerateQR={handleGenerateQR} onEdit={handleEditPet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="text-muted-foreground mb-2">No pets found</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </main>

      {/* QR Modal */}
      <QRModal
        pet={selectedPet}
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false)
          setSelectedPet(null)
        }}
      />

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={addPetModalOpen}
        onClose={() => setAddPetModalOpen(false)}
      />

      {/* Edit Pet Modal */}
      <EditPetModal
        pet={editingPet}
        isOpen={editPetModalOpen}
        onClose={() => {
          setEditPetModalOpen(false)
          setEditingPet(null)
        }}
      />
    </div>
  )
}
