"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const INACTIVITY_EXPIRY_MS = 60 * 60 * 1000 // 1 hour of inactivity
const INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000 // Check every 60 seconds
const LAST_ACTIVITY_KEY = "finzoo_last_activity"
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const

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
  loginWithGoogle: () => Promise<void>
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

  // Update the last activity timestamp (throttled to avoid excessive writes)
  const lastActivityWriteRef = useRef(0)
  const updateLastActivity = useCallback(() => {
    const now = Date.now()
    // Only write to localStorage at most once every 30 seconds to avoid performance issues
    if (now - lastActivityWriteRef.current > 30_000) {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
      lastActivityWriteRef.current = now
    }
  }, [])

  // Check if the user has been inactive for longer than the expiry duration
  const isInactive = (): boolean => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
    if (!lastActivity) return false
    const elapsed = Date.now() - parseInt(lastActivity, 10)
    return elapsed >= INACTIVITY_EXPIRY_MS
  }

  // Force logout when inactive for too long
  const handleInactivityExpiry = async () => {
    if (isInactive()) {
      console.log("Session expired due to 1 hour of inactivity — logging out")
      localStorage.removeItem(LAST_ACTIVITY_KEY)
      setUser(null)
      setProfile(null)
      await supabase.auth.signOut()
      window.location.href = "/admin/login"
    }
  }

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        // Check if user has been inactive too long before restoring session
        if (isInactive()) {
          console.log("Inactive too long — clearing session on mount")
          localStorage.removeItem(LAST_ACTIVITY_KEY)
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          // User is active right now (they just opened the page)
          updateLastActivity()
          fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Periodically check for inactivity expiry
    const expiryInterval = setInterval(handleInactivityExpiry, INACTIVITY_CHECK_INTERVAL_MS)

    // Listen for user activity to reset the inactivity timer
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateLastActivity, { passive: true })
    })

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
      clearInterval(expiryInterval)
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateLastActivity)
      })
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

        // Record initial activity timestamp for inactivity tracking
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
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

      // When identities is empty, the email already exists in Supabase Auth
      // (Supabase silently succeeds to avoid revealing registered emails)
      const emailAlreadyExists = data.user?.identities?.length === 0

      if (emailAlreadyExists) {
        return {
          success: false,
          error: "An account with this email already exists. Please try signing in instead.",
        }
      }

      if (data.user) {
        await fetchProfile(data.user.id)
      }

      return {
        success: true,
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const logout = async () => {
    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY)
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
        loginWithGoogle,
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
