"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PetCard } from "@/components/landing/pet-card"
import { initialPets } from "@/lib/pets-data"
import { motion } from "framer-motion"
import { ShopFilters } from "@/components/shop/shop-filters"
import { useState, useMemo } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ShopPage() {
   // Derive unique categories and price range from data
   const categories = useMemo(() => {
      return Array.from(new Set(initialPets.map((pet) => pet.species))).sort()
   }, [])

   const maxPriceData = useMemo(() => {
      return Math.max(...initialPets.map((pet) => pet.price))
   }, [])

   // Round up max price to nex 100 or 1000 for nicer UI
   const maxPriceLimit = Math.ceil(maxPriceData / 100) * 100

   const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceLimit])
   const [selectedCategories, setSelectedCategories] = useState<string[]>([])

   // Filter logic
   const filteredPets = useMemo(() => {
      return initialPets.filter((pet) => {
         const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(pet.species)
         const matchesPrice = pet.price >= priceRange[0] && pet.price <= priceRange[1]
         return matchesCategory && matchesPrice
      })
   }, [priceRange, selectedCategories])

   return (
      <div className="min-h-screen flex flex-col bg-background">
         <Header />
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
                     <div className="sticky top-24">
                        <ShopFilters
                           minPrice={0}
                           maxPrice={maxPriceLimit}
                           priceRange={priceRange}
                           setPriceRange={setPriceRange}
                           categories={categories}
                           selectedCategories={selectedCategories}
                           setSelectedCategories={setSelectedCategories}
                        />
                     </div>
                  </aside>

                  {/* Mobile Filter Trigger */}
                  <div className="lg:hidden">
                     <Sheet>
                        <SheetTrigger asChild>
                           <Button variant="outline" className="w-full">
                              <Filter className="mr-2 h-4 w-4" /> Filters
                           </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                           <div className="py-4">
                              <ShopFilters
                                 minPrice={0}
                                 maxPrice={maxPriceLimit}
                                 priceRange={priceRange}
                                 setPriceRange={setPriceRange}
                                 categories={categories}
                                 selectedCategories={selectedCategories}
                                 setSelectedCategories={setSelectedCategories}
                              />
                           </div>
                        </SheetContent>
                     </Sheet>
                  </div>

                  {/* Product Grid */}
                  <div className="flex-1">
                     {filteredPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {filteredPets.map((pet, index) => (
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
                              onClick={() => {
                                 setPriceRange([0, maxPriceLimit])
                                 setSelectedCategories([])
                              }}
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
