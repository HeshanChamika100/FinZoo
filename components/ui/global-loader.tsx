"use client"

import Image from "next/image"
import { useLoader } from "@/lib/loader-context"

export function GlobalLoader() {
   const { isLoading } = useLoader()

   if (!isLoading) return null

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
         <div className="relative flex flex-col items-center justify-center">
            <div className="relative size-24 animate-pulse">
               <Image
                  src="/logo.png"
                  alt="Loading..."
                  fill
                  className="object-contain"
                  priority
               />
            </div>
         </div>
      </div>
   )
}
