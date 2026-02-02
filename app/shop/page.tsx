"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PetCard } from "@/components/landing/pet-card"
import { initialPets } from "@/lib/pets-data"
import { motion } from "framer-motion"

export default function ShopPage() {
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

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {initialPets.map((pet, index) => (
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
            </div>
         </main>
         <Footer />
      </div>
   )
}
