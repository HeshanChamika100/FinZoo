import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
   const { searchParams, origin } = new URL(request.url)
   const code = searchParams.get('code')
   const next = searchParams.get('next') ?? '/admin/dashboard'

   if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
         const { data: { user } } = await supabase.auth.getUser()

         if (user) {
            // Try to fetch existing profile
            let { data: profile } = await supabase
               .from('profiles')
               .select('role, is_approved')
               .eq('id', user.id)
               .single()

            // If no profile exists, create one (first-time OAuth user)
            if (!profile) {
               const meta = user.user_metadata
               const { data: newProfile } = await supabase
                  .from('profiles')
                  .upsert({
                     id: user.id,
                     email: user.email ?? '',
                     name: meta?.full_name ?? meta?.name ?? null,
                     role: 'user',
                     is_approved: false,
                  })
                  .select('role, is_approved')
                  .single()

               profile = newProfile
            }

            if (profile && profile.role === 'admin' && profile.is_approved) {
               // Approved admin — redirect to dashboard
               return NextResponse.redirect(`${origin}${next}`)
            }

            // User exists but is not an approved admin — sign them out and redirect with message
            await supabase.auth.signOut()
            const loginUrl = new URL('/admin/login', origin)
            loginUrl.searchParams.set('message', 'Your account is pending approval by an administrator.')
            return NextResponse.redirect(loginUrl.toString())
         }
      }
   }

   // Something went wrong — redirect to login with error
   const loginUrl = new URL('/admin/login', origin)
   loginUrl.searchParams.set('error', 'auth_callback_error')
   return NextResponse.redirect(loginUrl.toString())
}

