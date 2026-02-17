"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  name: string | null
  role: string
  is_approved: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        // PGRST116 = no rows found — profile doesn't exist yet, create it
        if (error.code === "PGRST116") {
          const { data: authUser } = await supabase.auth.getUser()

          // If the auth user no longer exists (stale session), don't try to create a profile
          if (!authUser?.user) {
            console.warn("No authenticated user found — skipping profile creation")
            return
          }

          const meta = authUser.user.user_metadata

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert({
              id: userId,
              email: authUser?.user?.email ?? "",
              name: meta?.name ?? null,
              role: "user",
              is_approved: false,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error creating profile:", insertError.message)
            return
          }

          setProfile(newProfile)
          return
        }

        throw error
      }

      setProfile(data)
    } catch (error: any) {
      console.error("Error fetching profile:", error?.message ?? error)
    }
  }

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await fetchProfile(data.user.id)

        // Check if user is approved
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_approved")
          .eq("id", data.user.id)
          .single()

        if (profileData && !profileData.is_approved) {
          // Sign out unapproved users
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          return { success: false, error: "Your account is pending approval by an administrator. Please wait until an existing admin approves your account." }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "user", // Default role, change to "admin" in database if needed
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Check if email confirmation is required
      const needsConfirmation = data.user?.identities?.length === 0

      if (data.user && !needsConfirmation) {
        await fetchProfile(data.user.id)
      }

      return {
        success: true,
        needsEmailConfirmation: needsConfirmation,
        message: needsConfirmation
          ? "Please check your email to confirm your account before signing in."
          : undefined
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      setProfile(null)
      await supabase.auth.signOut()
      // Hard redirect ensures clean state, avoids race with onAuthStateChange
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Error logging out:", error)
      // Force redirect even on error
      window.location.href = "/"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isAdmin: profile?.role === "admin" && profile?.is_approved === true,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
