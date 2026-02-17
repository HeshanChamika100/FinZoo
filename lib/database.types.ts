export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
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
        Insert: {
          id?: string
          species: string
          breed: string
          age: string
          price: number
          price_type?: 'each' | 'pair'
          image?: string | null
          images?: string[]
          video?: string | null
          videos?: string[]
          description?: string | null
          in_stock?: boolean
          is_visible?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          species?: string
          breed?: string
          age?: string
          price?: number
          price_type?: 'each' | 'pair'
          image?: string | null
          images?: string[]
          video?: string | null
          videos?: string[]
          description?: string | null
          in_stock?: boolean
          is_visible?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
