"use client"

import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ShopFiltersProps {
   minPrice: number
   maxPrice: number
   priceRange: [number, number]
   setPriceRange: (value: [number, number]) => void
   categoryHierarchy: Record<string, Set<string>>
   selectedBreeds: string[]
   setSelectedBreeds: (value: string[]) => void
   hideTitle?: boolean
   onReset?: () => void
}

export function ShopFilters({
   minPrice,
   maxPrice,
   priceRange,
   setPriceRange,
   categoryHierarchy,
   selectedBreeds,
   setSelectedBreeds,
   hideTitle = false,
   onReset,
}: ShopFiltersProps) {
   // Helper to check if a specific breed is selected
   const isBreedSelected = (breed: string) => selectedBreeds.includes(breed)

   // Helper to check if all breeds of a species are selected
   const isSpeciesSelected = (species: string) => {
      const breeds = Array.from(categoryHierarchy[species] || [])
      return breeds.every((breed) => selectedBreeds.includes(breed)) && breeds.length > 0
   }

   const handleBreedChange = (breed: string, checked: boolean) => {
      if (checked) {
         setSelectedBreeds([...selectedBreeds, breed])
      } else {
         setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))
      }
   }

   const handleSpeciesChange = (species: string, checked: boolean) => {
      const breeds = Array.from(categoryHierarchy[species] || [])
      if (checked) {
         // Add all breeds of this species that aren't already selected
         const newBreeds = breeds.filter((b) => !selectedBreeds.includes(b))
         setSelectedBreeds([...selectedBreeds, ...newBreeds])
      } else {
         // Remove all breeds of this species
         setSelectedBreeds(selectedBreeds.filter((b) => !breeds.includes(b)))
      }
   }

   const formatPrice = (price: number) => {
      return `Rs ${price.toLocaleString()}`
   }

   return (
      <div className="space-y-6">
         {!hideTitle && (
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-foreground">Filters</h2>
               {onReset && (
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={onReset}
                     className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  >
                     Reset
                  </Button>
               )}
            </div>
         )}

         {/* Price Section */}
         <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Price</h3>

            <Slider
               defaultValue={[minPrice, maxPrice]}
               max={maxPrice}
               min={minPrice}
               step={10} // Reduced step for finer control
               value={priceRange}
               onValueChange={(value) => setPriceRange(value as [number, number])}
               className="py-2"
            />

            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rs</span>
                  <Input
                     type="number"
                     value={priceRange[0]}
                     onChange={(e) => {
                        const val = Math.min(Number(e.target.value), priceRange[1])
                        setPriceRange([val, priceRange[1]])
                     }}
                     className="w-20 px-2 py-1 h-8 text-sm text-center"
                     min={minPrice}
                     max={priceRange[1]}
                  />
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rs</span>
                  <Input
                     type="number"
                     value={priceRange[1]}
                     onChange={(e) => {
                        const val = Math.max(Number(e.target.value), priceRange[0])
                        setPriceRange([priceRange[0], val])
                     }}
                     className="w-20 px-2 py-1 h-8 text-sm text-center"
                     min={priceRange[0]}
                     max={maxPrice}
                  />
               </div>
            </div>
         </div>

         <div className="h-px bg-border/50" />

         {/* Category Section with Accordion */}
         <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Category</h3>
            <Accordion type="multiple" defaultValue={Object.keys(categoryHierarchy)} className="w-full">
               {Object.entries(categoryHierarchy).map(([species, breeds]) => (
                  <AccordionItem key={species} value={species} className="border-b-0">
                     <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 px-2 rounded-lg text-sm font-medium">
                        {species}
                     </AccordionTrigger>
                     <AccordionContent className="pt-1 pb-2 px-2">
                        <div className="space-y-2">
                           {/* Select selection for entire species if needed, or just list breeds */}
                           <div className="flex items-center space-x-2">
                              <Checkbox
                                 id={`species-${species}`}
                                 checked={isSpeciesSelected(species)}
                                 onCheckedChange={(checked) => handleSpeciesChange(species, checked as boolean)}
                              />
                              <Label
                                 htmlFor={`species-${species}`}
                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                 All {species}
                              </Label>
                           </div>

                           {/* Breeds List */}
                           <div className="pl-4 space-y-2 pt-1 border-l-2 border-muted ml-1.5">
                              {Array.from(breeds).sort().map((breed) => (
                                 <div key={breed} className="flex items-center space-x-2">
                                    <Checkbox
                                       id={`breed-${species}-${breed}`}
                                       checked={isBreedSelected(breed)}
                                       onCheckedChange={(checked) => handleBreedChange(breed, checked as boolean)}
                                    />
                                    <Label
                                       htmlFor={`breed-${species}-${breed}`}
                                       className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                       {breed}
                                    </Label>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </AccordionContent>
                  </AccordionItem>
               ))}


            </Accordion>
         </div>
      </div>
   )
}
