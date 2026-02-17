"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, UserPlus, Clock, Loader2 } from "lucide-react"

interface PendingProfile {
   id: string
   email: string
   name: string | null
   role: string
   is_approved: boolean
   created_at: string
}

export function PendingAdmins() {
   const { isAdmin } = useAuth()
   const [pendingUsers, setPendingUsers] = useState<PendingProfile[]>([])
   const [loading, setLoading] = useState(true)
   const [actionLoading, setActionLoading] = useState<string | null>(null)
   const supabase = createClient()

   const fetchPendingUsers = async () => {
      try {
         const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("is_approved", false)
            .order("created_at", { ascending: false })

         if (error) {
            console.error("Error fetching pending users:", error.message)
            return
         }

         setPendingUsers(data || [])
      } catch (error) {
         console.error("Error fetching pending users:", error)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      if (isAdmin) {
         fetchPendingUsers()
      }
   }, [isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

   const handleApprove = async (userId: string) => {
      setActionLoading(userId)
      try {
         const { error } = await supabase
            .from("profiles")
            .update({ is_approved: true, role: "admin" })
            .eq("id", userId)

         if (error) {
            console.error("Error approving user:", error.message)
            return
         }

         // Remove from pending list
         setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
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
            .delete()
            .eq("id", userId)

         if (error) {
            console.error("Error rejecting user:", error.message)
            return
         }

         // Remove from pending list
         setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      } catch (error) {
         console.error("Error rejecting user:", error)
      } finally {
         setActionLoading(null)
      }
   }

   if (!isAdmin) return null

   if (loading) {
      return (
         <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-6 flex items-center justify-center">
               <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
         </Card>
      )
   }

   if (pendingUsers.length === 0) return null

   return (
      <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
         <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-amber-500/10">
                  <UserPlus className="h-5 w-5 text-amber-500" />
               </div>
               <div>
                  <CardTitle className="text-lg text-card-foreground">
                     Pending Admin Requests
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                     {pendingUsers.length} {pendingUsers.length === 1 ? "request" : "requests"} awaiting approval
                  </p>
               </div>
               <Badge variant="secondary" className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {pendingUsers.length} Pending
               </Badge>
            </div>
         </CardHeader>

         <CardContent className="pt-0">
            <div className="space-y-3">
               {pendingUsers.map((user) => (
                  <div
                     key={user.id}
                     className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
                  >
                     {/* Avatar placeholder */}
                     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                           {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                     </div>

                     {/* User info */}
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                           {user.name || "No name"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                           <Clock className="h-3 w-3 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString("en-US", {
                                 month: "short",
                                 day: "numeric",
                                 year: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit",
                              })}
                           </span>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2 shrink-0">
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleApprove(user.id)}
                           disabled={actionLoading === user.id}
                           className="border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                        >
                           {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                              <>
                                 <Check className="h-4 w-4 mr-1" />
                                 Approve
                              </>
                           )}
                        </Button>
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleReject(user.id)}
                           disabled={actionLoading === user.id}
                           className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                        >
                           {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                              <>
                                 <X className="h-4 w-4 mr-1" />
                                 Reject
                              </>
                           )}
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>
   )
}
