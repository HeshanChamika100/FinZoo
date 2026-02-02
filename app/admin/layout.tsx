"use client"

import React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { PetsProvider } from "@/lib/pets-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <PetsProvider>{children}</PetsProvider>
    </AuthProvider>
  )
}
