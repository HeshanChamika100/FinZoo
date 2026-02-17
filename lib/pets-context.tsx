"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"

// Pet type matching our database schema
export interface Pet {
  id: string
  species: string
  breed: string
  age: string
  price: number
  price_type: 'each' | 'pair'
  image: string | null
  images: string[]
  video: string | null
  videos: string[]
  description: string | null
  in_stock: boolean
  is_visible: boolean
  featured: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

interface PetsContextType {
  pets: Pet[]
  loading: boolean
  refreshPets: () => Promise<void>
  toggleStock: (id: string) => Promise<void>
  toggleVisibility: (id: string) => Promise<void>
  updatePet: (id: string, updates: Partial<Pet>) => Promise<void>
  addPet: (pet: Omit<Pet, "id" | "created_at" | "updated_at" | "created_by">) => Promise<void>
  deletePet: (id: string) => Promise<void>
  getPetById: (id: string) => Pet | undefined
}

const PetsContext = createContext<PetsContextType | undefined>(undefined)

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, loading: authLoading } = useAuth()
  const supabase = createClient()

  // Use a ref to track the latest fetch and prevent stale responses
  const fetchIdRef = React.useRef(0)

  const fetchPets = React.useCallback(async () => {
    const currentFetchId = ++fetchIdRef.current

    try {
      setLoading(true)

      // Build query - admins see all pets, users see only visible ones
      let query = supabase.from("pets").select("*").order("created_at", { ascending: false })

      if (!isAdmin) {
        query = query.eq("is_visible", true)
      }

      const { data, error } = await query

      if (error) throw error

      // Only update state if this is still the latest fetch
      if (currentFetchId === fetchIdRef.current) {
        setPets(data || [])
      }
    } catch (error) {
      console.error("Error fetching pets:", error)
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false)
      }
    }
  }, [isAdmin, supabase])

  useEffect(() => {
    // Wait for auth to finish loading so isAdmin is reliable
    if (authLoading) return

    fetchPets()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("pets-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pets" },
        () => {
          fetchPets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAdmin, authLoading, fetchPets, supabase])

  const refreshPets = async () => {
    await fetchPets()
  }

  const toggleStock = async (id: string) => {
    try {
      const pet = pets.find((p) => p.id === id)
      if (!pet) return

      const { error } = await supabase
        .from("pets")
        .update({ in_stock: !pet.in_stock })
        .eq("id", id)

      if (error) throw error
      await refreshPets()
    } catch (error) {
      console.error("Error toggling stock:", error)
    }
  }

  const toggleVisibility = async (id: string) => {
    try {
      const pet = pets.find((p) => p.id === id)
      if (!pet) return

      const { error } = await supabase
        .from("pets")
        .update({ is_visible: !pet.is_visible })
        .eq("id", id)

      if (error) throw error
      await refreshPets()
    } catch (error) {
      console.error("Error toggling visibility:", error)
    }
  }

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    try {
      const { error } = await supabase.from("pets").update(updates).eq("id", id)

      if (error) throw error
      await refreshPets()
    } catch (error) {
      console.error("Error updating pet:", error)
      throw error
    }
  }

  const addPet = async (pet: Omit<Pet, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      // Get current user ID from auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error("User must be authenticated to add pets")
      }

      const petData = {
        ...pet,
        created_by: currentUser.id
      }

      const { error } = await supabase.from("pets").insert([petData])

      if (error) throw error
      await refreshPets()
    } catch (error) {
      console.error("Error adding pet:", error)
      throw error
    }
  }

  const deletePet = async (id: string) => {
    try {
      const { error } = await supabase.from("pets").delete().eq("id", id)

      if (error) throw error
      await refreshPets()
    } catch (error) {
      console.error("Error deleting pet:", error)
      throw error
    }
  }

  const getPetById = (id: string) => {
    return pets.find((pet) => pet.id === id)
  }

  return (
    <PetsContext.Provider
      value={{
        pets,
        loading,
        refreshPets,
        toggleStock,
        toggleVisibility,
        updatePet,
        addPet,
        deletePet,
        getPetById,
      }}
    >
      {children}
    </PetsContext.Provider>
  )
}

export function usePets() {
  const context = useContext(PetsContext)
  if (context === undefined) {
    throw new Error("usePets must be used within a PetsProvider")
  }
  return context
}
