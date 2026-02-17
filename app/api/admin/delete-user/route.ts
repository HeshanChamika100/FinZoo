import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
   try {
      // Verify the requesting user is an authenticated admin
      const supabase = await createServerClient()
      const { data: { user: requestingUser } } = await supabase.auth.getUser()

      if (!requestingUser) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if requesting user is an approved admin
      const { data: requestingProfile } = await supabase
         .from('profiles')
         .select('role, is_approved')
         .eq('id', requestingUser.id)
         .single()

      if (!requestingProfile || requestingProfile.role !== 'admin' || !requestingProfile.is_approved) {
         return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
      }

      // Get the user ID to delete from the request body
      const { userId } = await request.json()

      if (!userId) {
         return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      // Prevent self-deletion
      if (userId === requestingUser.id) {
         return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
      }

      // Use service role key to create an admin client
      const supabaseAdmin = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.SUPABASE_SERVICE_ROLE_KEY!,
         { auth: { autoRefreshToken: false, persistSession: false } }
      )

      // Delete the profile first
      const { error: profileError } = await supabaseAdmin
         .from('profiles')
         .delete()
         .eq('id', userId)

      if (profileError) {
         console.error('Error deleting profile:', profileError.message)
         return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 })
      }

      // Delete the auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authError) {
         console.error('Error deleting auth user:', authError.message)
         return NextResponse.json({ error: 'Profile deleted but failed to delete auth account' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error('Error in delete user API:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
   }
}
