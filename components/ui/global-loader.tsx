"use client"

import Image from "next/image"
import { useLoader } from "@/lib/loader-context"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export function GlobalLoader() {
   const { isLoading } = useLoader()
   const imageRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (isLoading && imageRef.current) {
         const ctx = gsap.context(() => {
            gsap.fromTo(
               imageRef.current,
               { x: -30, rotation: -45 },
               {
                  x: 30,
                  rotation: 45,
                  duration: 0.8,
                  ease: "power1.inOut",
                  yoyo: true,
                  repeat: -1,
               }
            )
         }, imageRef)

         return () => ctx.revert()
      }
   }, [isLoading])

   if (!isLoading) return null

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
         <div className="relative flex flex-col items-center justify-center">
            <div ref={imageRef} className="relative size-24">
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
