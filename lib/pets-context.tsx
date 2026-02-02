"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { initialPets, type Pet } from "./pets-data"

interface PetsContextType {
  pets: Pet[]
  toggleStock: (id: string) => void
  toggleVisibility: (id: string) => void
  updatePet: (id: string, updates: Partial<Pet>) => void
  addPet: (pet: Omit<Pet, "id">) => void
  deletePet: (id: string) => void
  getPetById: (id: string) => Pet | undefined
}

const PetsContext = createContext<PetsContextType | undefined>(undefined)

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(initialPets)

  const toggleStock = (id: string) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? { ...pet, inStock: !pet.inStock } : pet))
    )
  }

  const toggleVisibility = (id: string) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? { ...pet, isVisible: !pet.isVisible } : pet))
    )
  }

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? { ...pet, ...updates } : pet))
    )
  }

  const addPet = (pet: Omit<Pet, "id">) => {
    const newPet: Pet = {
      ...pet,
      id: Date.now().toString(),
    }
    setPets((prev) => [newPet, ...prev])
  }

  const deletePet = (id: string) => {
    setPets((prev) => prev.filter((pet) => pet.id !== id))
  }

  const getPetById = (id: string) => {
    return pets.find((pet) => pet.id === id)
  }

  return (
    <PetsContext.Provider value={{ pets, toggleStock, toggleVisibility, updatePet, addPet, deletePet, getPetById }}>
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
