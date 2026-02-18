"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PetCard } from "@/components/landing/pet-card"
import { usePets } from "@/lib/pets-context"
import { motion } from "framer-motion"
import { ShopFilters } from "@/components/shop/shop-filters"
import { useState, useMemo } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select"

export default function ShopPage() {
   const { pets, loading } = usePets()

   // Derive hierarchy from data: { [species]: Set<breed> }
   const categoryHierarchy = useMemo(() => {
      const hierarchy: Record<string, Set<string>> = {}
      pets.forEach((pet) => {
         if (!hierarchy[pet.species]) {
            hierarchy[pet.species] = new Set()
         }
         hierarchy[pet.species].add(pet.breed)
      })
      return hierarchy
   }, [pets])

   const maxPriceData = useMemo(() => {
      return pets.length > 0 ? Math.max(...pets.map((pet) => pet.price)) : 1000
   }, [pets])

   // Round up max price to next 100 or 1000 for nicer UI
   const maxPriceLimit = Math.ceil(maxPriceData / 100) * 100

   const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceLimit])
   const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
   const [sortOption, setSortOption] = useState<string>("newest")
   // Add a key to force re-render components on reset if needed, mostly for internal state ease
   const [filterKey, setFilterKey] = useState(0)

   // Filter and Sort logic
   const filteredAndSortedPets = useMemo(() => {
      // 1. Filter
      let result = pets.filter((pet) => {
         const matchesBreed =
            selectedBreeds.length === 0 || selectedBreeds.includes(pet.breed)

         const matchesPrice = pet.price >= priceRange[0] && pet.price <= priceRange[1]

         return matchesBreed && matchesPrice
      })

      // 2. Sort
      result.sort((a, b) => {
         switch (sortOption) {
            case "price-asc":
               return a.price - b.price
            case "price-desc":
               return b.price - a.price
            case "newest":
            default:
               return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
         }
      })

      return result
   }, [pets, priceRange, selectedBreeds, sortOption])

   const handleReset = () => {
      setPriceRange([0, maxPriceLimit])
      setSelectedBreeds([])
      setSortOption("newest")
      setFilterKey(prev => prev + 1)
   }

   if (loading) {
      return (
         <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-center">
               <p className="text-muted-foreground">Loading pets...</p>
            </main>
            <Footer />
         </div>
      )
   }

   return (
      <div className="min-h-screen flex flex-col bg-background">
         <Header variant="white" />
         <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
               <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                     Shop All <span className="text-primary">Pets</span>
                  </h1>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                     Browse our complete collection of loving companions waiting for their forever homes.
                  </p>
               </div>

               <div className="flex flex-col lg:flex-row gap-8">
                  {/* Desktop Sidebar */}
                  <aside className="hidden lg:block w-64 shrink-0">
                     <div className="sticky top-24 border border-border rounded-xl p-6 bg-card shadow-sm">
                        <ShopFilters
                           key={`desktop-filters-${filterKey}`}
                           minPrice={0}
                           maxPrice={maxPriceLimit}
                           priceRange={priceRange}
                           setPriceRange={setPriceRange}
                           categoryHierarchy={categoryHierarchy}
                           selectedBreeds={selectedBreeds}
                           setSelectedBreeds={setSelectedBreeds}
                           onReset={handleReset}
                        />
                     </div>
                  </aside>

                  {/* Mobile Filter Trigger */}
                  <div className="lg:hidden flex items-center justify-between gap-4">
                     <Sheet>
                        <SheetTrigger asChild>
                           <Button variant="outline" className="flex-1">
                              <Filter className="mr-2 h-4 w-4" /> Filters
                           </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                           <SheetHeader>
                              <SheetTitle>Filters</SheetTitle>
                           </SheetHeader>
                           <div className="p-4">
                              <ShopFilters
                                 key={`mobile-filters-${filterKey}`}
                                 minPrice={0}
                                 maxPrice={maxPriceLimit}
                                 priceRange={priceRange}
                                 setPriceRange={setPriceRange}
                                 categoryHierarchy={categoryHierarchy}
                                 selectedBreeds={selectedBreeds}
                                 setSelectedBreeds={setSelectedBreeds}
                                 hideTitle={true}
                                 onReset={handleReset}
                              />
                           </div>
                        </SheetContent>
                     </Sheet>

                     {/* Mobile Sort */}
                     <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[160px]">
                           <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="newest">Newest Arrivals</SelectItem>
                           <SelectItem value="price-asc">Price: Low to High</SelectItem>
                           <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Product Grid */}
                  <div className="flex-1">
                     {/* Desktop Sort Header */}
                     <div className="hidden lg:flex justify-end mb-6">
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">Sort by:</span>
                           <Select value={sortOption} onValueChange={setSortOption}>
                              <SelectTrigger className="w-[180px]">
                                 <SelectValue placeholder="Newest Arrivals" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="newest">Newest Arrivals</SelectItem>
                                 <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                 <SelectItem value="price-desc">Price: High to Low</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     {filteredAndSortedPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {filteredAndSortedPets.map((pet, index) => (
                              <motion.div
                                 key={pet.id}
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                 <PetCard pet={pet} index={index} />
                              </motion.div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-12">
                           <p className="text-lg text-muted-foreground">
                              No pets found matching your filters.
                           </p>
                           <Button
                              variant="link"
                              onClick={handleReset}
                              className="mt-2"
                           >
                              Clear all filters
                           </Button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </main>
         <Footer />
      </div>
   )
}
