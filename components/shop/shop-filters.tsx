"use client"

import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShopFiltersProps {
   minPrice: number
   maxPrice: number
   priceRange: [number, number]
   setPriceRange: (value: [number, number]) => void
   categories: string[]
   selectedCategories: string[]
   setSelectedCategories: (value: string[]) => void
}

export function ShopFilters({
   minPrice,
   maxPrice,
   priceRange,
   setPriceRange,
   categories,
   selectedCategories,
   setSelectedCategories,
}: ShopFiltersProps) {
   const handleCategoryChange = (category: string, checked: boolean) => {
      if (checked) {
         setSelectedCategories([...selectedCategories, category])
      } else {
         setSelectedCategories(selectedCategories.filter((c) => c !== category))
      }
   }

   const formatPrice = (price: number) => {
      return `Rs ${price.toLocaleString()}`
   }

   return (
      <div className="space-y-8">
         <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Filters</h2>

            {/* Price Section */}
            <div className="space-y-6">
               <h3 className="text-2xl font-bold text-foreground">Price</h3>

               <Slider
                  defaultValue={[minPrice, maxPrice]}
                  max={maxPrice}
                  min={minPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
               />

               <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">Rs</span>
                     <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                           const val = Number(e.target.value)
                           setPriceRange([val, priceRange[1]])
                        }}
                        className="w-20 px-2 py-1 h-9 text-center"
                        min={minPrice}
                        max={priceRange[1]}
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">Rs</span>
                     <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                           const val = Number(e.target.value)
                           setPriceRange([priceRange[0], val])
                        }}
                        className="w-20 px-2 py-1 h-9 text-center"
                        min={priceRange[0]}
                        max={maxPrice}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Category Section */}
         <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Category</h3>

            <div className="space-y-3">
               {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                     <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) =>
                           handleCategoryChange(category, checked as boolean)
                        }
                        className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                     />
                     <Label
                        htmlFor={`category-${category}`}
                        className="text-muted-foreground hover:text-foreground cursor-pointer text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                     >
                        {category}
                     </Label>
                  </div>
               ))}
            </div>


         </div>
      </div>
   )
}
