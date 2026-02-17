"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
   LogOut,
   Users,
   Search,
   Shield,
   ShieldCheck,
   ShieldX,
   UserCheck,
   UserX,
   Clock,
   Loader2,
   ArrowLeft,
   Trash2,
   ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
   id: string
   email: string
   name: string | null
   role: string
   is_approved: boolean
   created_at: string
   updated_at: string
}

type FilterType = "all" | "admins" | "users" | "pending" | "approved"

export default function UserManagementPage() {
   const { user, profile, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth()
   const router = useRouter()
   const supabase = createClient()

   const [users, setUsers] = useState<UserProfile[]>([])
   const [loading, setLoading] = useState(true)
   const [searchQuery, setSearchQuery] = useState("")
   const [filter, setFilter] = useState<FilterType>("all")
   const [actionLoading, setActionLoading] = useState<string | null>(null)

   useEffect(() => {
      if (!authLoading && !isAuthenticated) {
         router.push("/admin/login")
      }
      if (!authLoading && isAuthenticated && profile && !isAdmin) {
         router.push("/admin/login")
      }
   }, [isAuthenticated, isAdmin, profile, authLoading, router])

   const fetchUsers = async () => {
      try {
         const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })

         if (error) {
            console.error("Error fetching users:", error.message)
            return
         }

         setUsers(data || [])
      } catch (error) {
         console.error("Error fetching users:", error)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      if (isAdmin) {
         fetchUsers()
      }
   }, [isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

   const handleApprove = async (userId: string) => {
      setActionLoading(userId)
      try {
         const { error } = await supabase
            .from("profiles")
            .update({ is_approved: true })
            .eq("id", userId)

         if (error) {
            console.error("Error approving user:", error.message)
            return
         }

         setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, is_approved: true } : u))
         )
      } catch (error) {
         console.error("Error approving user:", error)
      } finally {
         setActionLoading(null)
      }
   }

   const handleReject = async (userId: string) => {
      setActionLoading(userId)
      try {
         const { error } = await supabase
            .from("profiles")
            .update({ is_approved: false })
            .eq("id", userId)

         if (error) {
            console.error("Error revoking user:", error.message)
            return
         }

         setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, is_approved: false } : u))
         )
      } catch (error) {
         console.error("Error revoking user:", error)
      } finally {
         setActionLoading(null)
      }
   }

   const handleChangeRole = async (userId: string, newRole: string) => {
      setActionLoading(userId)
      try {
         const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId)

         if (error) {
            console.error("Error changing role:", error.message)
            return
         }

         setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
         )
      } catch (error) {
         console.error("Error changing role:", error)
      } finally {
         setActionLoading(null)
      }
   }

   const handleDelete = async (userId: string) => {
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

      setActionLoading(userId)
      try {
         const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId)

         if (error) {
            console.error("Error deleting user:", error.message)
            return
         }

         setUsers((prev) => prev.filter((u) => u.id !== userId))
      } catch (error) {
         console.error("Error deleting user:", error)
      } finally {
         setActionLoading(null)
      }
   }

   // Filter and search
   const filteredUsers = users.filter((u) => {
      const matchesSearch =
         (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.email.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesFilter = true
      switch (filter) {
         case "admins":
            matchesFilter = u.role === "admin"
            break
         case "users":
            matchesFilter = u.role === "user"
            break
         case "pending":
            matchesFilter = !u.is_approved
            break
         case "approved":
            matchesFilter = u.is_approved
            break
      }

      return matchesSearch && matchesFilter
   })

   // Stats
   const stats = {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      pending: users.filter((u) => !u.is_approved).length,
      approved: users.filter((u) => u.is_approved).length,
   }

   if (authLoading || (isAuthenticated && !profile)) {
      return (
         <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
               <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
               <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
         </div>
      )
   }

   if (!isAuthenticated || !isAdmin) {
      return null
   }

   return (
      <div className="min-h-screen bg-background">
         {/* Header */}
         <header className="sticky top-0 z-40 bg-card border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
               <div className="flex h-16 items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                     <Image src="/logo.png" alt="FinZoo Logo" width={40} height={40} />
                     <span className="text-xl font-bold">
                        <span style={{ color: '#196677' }}>Fin</span><span style={{ color: '#c9a97d' }}>Zoo</span>
                     </span>
                     <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                        Admin
                     </Badge>
                  </Link>

                  <div className="flex items-center gap-4">
                     <span className="text-sm text-muted-foreground hidden sm:block">
                        Welcome, {profile?.name || user?.email || "Admin"}
                     </span>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="border-border hover:bg-destructive hover:text-destructive-foreground"
                     >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                     </Button>
                  </div>
               </div>
            </div>
         </header>

         <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Back to dashboard */}
            <Link
               href="/admin/dashboard"
               className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
               <ArrowLeft className="h-4 w-4" />
               Back to Dashboard
            </Link>

            {/* Page title */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-foreground">User Management</h1>
               <p className="text-muted-foreground mt-1">
                  Manage admin accounts, approve new signups, and control access.
               </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
               <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2">
                     <Users className="h-5 w-5 text-muted-foreground" />
                     <span className="text-2xl font-bold text-card-foreground">{stats.total}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
               </div>
               <div className="bg-card rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="h-5 w-5 text-primary" />
                     <span className="text-2xl font-bold text-primary">{stats.admins}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Admins</div>
               </div>
               <div className="bg-card rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center gap-2">
                     <UserCheck className="h-5 w-5 text-green-500" />
                     <span className="text-2xl font-bold text-green-500">{stats.approved}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
               </div>
               <div className="bg-card rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center gap-2">
                     <Clock className="h-5 w-5 text-amber-500" />
                     <span className="text-2xl font-bold text-amber-500">{stats.pending}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
               </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                     placeholder="Search by name or email..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10 bg-card border-input"
                  />
               </div>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="border-border shrink-0 bg-transparent">
                        <Shield className="h-4 w-4 mr-2" />
                        {filter === "all" && "All Users"}
                        {filter === "admins" && "Admins"}
                        {filter === "users" && "Users"}
                        {filter === "pending" && "Pending"}
                        {filter === "approved" && "Approved"}
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                     <DropdownMenuItem onClick={() => setFilter("all")}>All Users</DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => setFilter("admins")}>
                        <ShieldCheck className="h-4 w-4 mr-2" /> Admins
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilter("users")}>
                        <Users className="h-4 w-4 mr-2" /> Users
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => setFilter("pending")}>
                        <Clock className="h-4 w-4 mr-2" /> Pending
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilter("approved")}>
                        <UserCheck className="h-4 w-4 mr-2" /> Approved
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
               Showing {filteredUsers.length} of {users.length} users
            </p>

            {/* User list */}
            {loading ? (
               <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <div
                        key={i}
                        className="bg-card rounded-xl border border-border p-4 animate-pulse flex gap-4 items-center"
                     >
                        <div className="h-10 w-10 bg-muted rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                           <div className="h-4 bg-muted rounded w-1/4" />
                           <div className="h-3 bg-muted rounded w-1/3" />
                        </div>
                     </div>
                  ))}
               </div>
            ) : filteredUsers.length > 0 ? (
               <div className="flex flex-col gap-3">
                  {filteredUsers.map((u) => {
                     const isCurrentUser = u.id === user?.id
                     return (
                        <Card key={u.id} className={`border ${!u.is_approved ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}>
                           <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                 {/* Avatar */}
                                 <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${u.role === "admin" ? "bg-primary/10" : "bg-muted"
                                    }`}>
                                    <span className={`text-sm font-semibold ${u.role === "admin" ? "text-primary" : "text-muted-foreground"
                                       }`}>
                                       {(u.name || u.email).charAt(0).toUpperCase()}
                                    </span>
                                 </div>

                                 {/* User info */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <p className="text-sm font-medium text-card-foreground truncate">
                                          {u.name || "No name"}
                                       </p>
                                       {isCurrentUser && (
                                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                             You
                                          </Badge>
                                       )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                       {/* Role badge */}
                                       <Badge
                                          variant="secondary"
                                          className={`text-xs ${u.role === "admin"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground"
                                             }`}
                                       >
                                          {u.role === "admin" ? (
                                             <><ShieldCheck className="h-3 w-3 mr-1" /> Admin</>
                                          ) : (
                                             <><Users className="h-3 w-3 mr-1" /> User</>
                                          )}
                                       </Badge>

                                       {/* Approval badge */}
                                       <Badge
                                          variant="secondary"
                                          className={`text-xs ${u.is_approved
                                                ? "bg-green-500/10 text-green-600"
                                                : "bg-amber-500/10 text-amber-600"
                                             }`}
                                       >
                                          {u.is_approved ? (
                                             <><UserCheck className="h-3 w-3 mr-1" /> Approved</>
                                          ) : (
                                             <><Clock className="h-3 w-3 mr-1" /> Pending</>
                                          )}
                                       </Badge>

                                       {/* Joined date */}
                                       <span className="text-xs text-muted-foreground">
                                          Joined {new Date(u.created_at).toLocaleDateString("en-US", {
                                             month: "short",
                                             day: "numeric",
                                             year: "numeric",
                                          })}
                                       </span>
                                    </div>
                                 </div>

                                 {/* Actions */}
                                 {!isCurrentUser && (
                                    <div className="flex items-center gap-2 shrink-0">
                                       {/* Approve / Revoke */}
                                       {!u.is_approved ? (
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleApprove(u.id)}
                                             disabled={actionLoading === u.id}
                                             className="border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                                          >
                                             {actionLoading === u.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                             ) : (
                                                <>
                                                   <UserCheck className="h-4 w-4 mr-1" />
                                                   <span className="hidden sm:inline">Approve</span>
                                                </>
                                             )}
                                          </Button>
                                       ) : (
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleReject(u.id)}
                                             disabled={actionLoading === u.id}
                                             className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                                          >
                                             {actionLoading === u.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                             ) : (
                                                <>
                                                   <ShieldX className="h-4 w-4 mr-1" />
                                                   <span className="hidden sm:inline">Revoke</span>
                                                </>
                                             )}
                                          </Button>
                                       )}

                                       {/* Role change dropdown */}
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={actionLoading === u.id}
                                                className="border-border"
                                             >
                                                <Shield className="h-4 w-4 mr-1" />
                                                <span className="hidden sm:inline">Role</span>
                                                <ChevronDown className="h-3 w-3 ml-1" />
                                             </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                             <DropdownMenuItem
                                                onClick={() => handleChangeRole(u.id, "admin")}
                                                disabled={u.role === "admin"}
                                             >
                                                <ShieldCheck className="h-4 w-4 mr-2" />
                                                Set as Admin
                                             </DropdownMenuItem>
                                             <DropdownMenuItem
                                                onClick={() => handleChangeRole(u.id, "user")}
                                                disabled={u.role === "user"}
                                             >
                                                <Users className="h-4 w-4 mr-2" />
                                                Set as User
                                             </DropdownMenuItem>
                                          </DropdownMenuContent>
                                       </DropdownMenu>

                                       {/* Delete */}
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDelete(u.id)}
                                          disabled={actionLoading === u.id}
                                          className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                       >
                                          {actionLoading === u.id ? (
                                             <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                             <Trash2 className="h-4 w-4" />
                                          )}
                                       </Button>
                                    </div>
                                 )}
                              </div>
                           </CardContent>
                        </Card>
                     )
                  })}
               </div>
            ) : (
               <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <UserX className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <div className="text-muted-foreground mb-2">No users found</div>
                  <p className="text-sm text-muted-foreground">
                     Try adjusting your search or filter criteria.
                  </p>
               </div>
            )}
         </main>
      </div>
   )
}
