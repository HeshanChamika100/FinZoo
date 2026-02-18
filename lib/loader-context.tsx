"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface LoaderContextType {
   isLoading: boolean
   startLoading: () => void
   stopLoading: () => void
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function LoaderProvider({ children }: { children: ReactNode }) {
   const [isLoading, setIsLoading] = useState(false)

   const startLoading = () => setIsLoading(true)
   const stopLoading = () => setIsLoading(false)

   return (
      <LoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>
         {children}
      </LoaderContext.Provider>
   )
}

export function LoaderURLListener() {
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const { stopLoading } = useLoader()

   useEffect(() => {
      stopLoading()
   }, [pathname, searchParams])

   return null
}

export function useLoader() {
   const context = useContext(LoaderContext)
   if (context === undefined) {
      throw new Error("useLoader must be used within a LoaderProvider")
   }
   return context
}
