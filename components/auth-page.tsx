"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Fish, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

/* ───────── Google icon (inline SVG) ───────── */
function GoogleIcon({ className }: { className?: string }) {
   return (
      <svg className={className} viewBox="0 0 24 24">
         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
   )
}

/* ───────── Inner content (needs useSearchParams) ───────── */
function AuthPageInner({ initialMode }: { initialMode: "login" | "signup" }) {
   const [isSignup, setIsSignup] = useState(initialMode === "signup")

   // Login state
   const [loginEmail, setLoginEmail] = useState("")
   const [loginPassword, setLoginPassword] = useState("")
   const [showLoginPassword, setShowLoginPassword] = useState(false)
   const [loginLoading, setLoginLoading] = useState(false)
   const [loginError, setLoginError] = useState("")
   const [loginInfo, setLoginInfo] = useState("")

   // Signup state
   const [signupName, setSignupName] = useState("")
   const [signupEmail, setSignupEmail] = useState("")
   const [signupPassword, setSignupPassword] = useState("")
   const [signupConfirm, setSignupConfirm] = useState("")
   const [showSignupPassword, setShowSignupPassword] = useState(false)
   const [signupLoading, setSignupLoading] = useState(false)
   const [signupError, setSignupError] = useState("")
   const [signupSuccess, setSignupSuccess] = useState("")

   const [googleLoading, setGoogleLoading] = useState(false)

   const { login, signup, loginWithGoogle } = useAuth()
   const router = useRouter()
   const searchParams = useSearchParams()

   useEffect(() => {
      const message = searchParams.get("message")
      const errorParam = searchParams.get("error")
      if (message) setLoginInfo(message)
      if (errorParam) setLoginError("Authentication failed. Please try again.")
   }, [searchParams])

   /* ── handlers ── */
   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoginError("")
      setLoginInfo("")
      setLoginLoading(true)
      try {
         const result = await login(loginEmail, loginPassword)
         if (result.success) {
            router.push("/admin/dashboard")
         } else {
            setLoginError(result.error || "Invalid email or password")
         }
      } catch {
         setLoginError("An error occurred. Please try again.")
      } finally {
         setLoginLoading(false)
      }
   }

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault()
      setSignupError("")
      setSignupSuccess("")

      if (signupPassword !== signupConfirm) {
         setSignupError("Passwords do not match")
         return
      }
      if (signupPassword.length < 6) {
         setSignupError("Password must be at least 6 characters")
         return
      }

      setSignupLoading(true)
      try {
         const result = await signup(signupName, signupEmail, signupPassword)
         if (result.success) {
            setSignupSuccess(
               "Your account has been created and is pending approval by an administrator. You will be able to sign in once your account is approved."
            )
         } else {
            setSignupError(result.error || "Failed to create account")
         }
      } catch {
         setSignupError("An error occurred. Please try again.")
      } finally {
         setSignupLoading(false)
      }
   }

   const handleGoogle = async () => {
      setGoogleLoading(true)
      try {
         await loginWithGoogle()
      } catch {
         setGoogleLoading(false)
      }
   }

   /* ── reusable eye toggle ── */
   const EyeToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
      <button
         type="button"
         onClick={toggle}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
         {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
   )

   /* ── shared input style ── */
   const inputClass =
      "w-full px-4 py-3 rounded-lg bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-300 focus:bg-gray-50"

   return (
      <div
         className="relative min-h-screen flex items-center justify-center overflow-hidden p-4"
         style={{ fontFamily: "'Poppins', sans-serif" }}
      >
         {/* ─── Background Video ─── */}
         <video
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-sm scale-105"
         >
            <source src="/background-video.mp4" type="video/mp4" />
         </video>
         {/* Dark overlay for contrast */}
         <div className="pointer-events-none absolute inset-0 bg-black/40" />

         {/* ─── Back to Home ─── */}
         <Link
            href="/"
            className="absolute left-6 top-6 z-30 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-4 py-2 text-sm text-white/90 transition-colors hover:bg-black/60 hover:text-white"
         >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
         </Link>

         {/* ═══════════════ MAIN CARD ═══════════════ */}
         <div className="relative z-10 w-full max-w-[880px] rounded-[30px] bg-white shadow-2xl overflow-hidden">

            {/* ── DESKTOP LAYOUT (md+) ── */}
            <div className="hidden md:block relative min-h-[540px]">
               <div className="flex min-h-[540px]">

                  {/* ── SIGN IN FORM (left half) ── */}
                  <div
                     className="w-1/2 shrink-0 flex items-center justify-center p-10 transition-all duration-700"
                     style={{
                        opacity: isSignup ? 0 : 1,
                        transform: isSignup ? "translateX(-20px)" : "translateX(0)",
                        pointerEvents: isSignup ? "none" : "auto",
                     }}
                  >
                     <div className="w-full max-w-[300px]">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-5">Sign In</h1>

                        {/* Google */}
                        <button
                           type="button"
                           onClick={handleGoogle}
                           disabled={googleLoading}
                           className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 mb-4"
                        >
                           {googleLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                           ) : (
                              <GoogleIcon className="h-5 w-5" />
                           )}
                           Login with Google
                        </button>

                        <p className="text-xs text-gray-400 text-center mb-5">or use your email to access admin features</p>

                        {/* Errors */}
                        {loginError && (
                           <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600">
                              {loginError}
                           </div>
                        )}
                        {loginInfo && (
                           <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2.5 text-xs text-yellow-700">
                              {loginInfo}
                           </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-3">
                           <input
                              id="login-email"
                              type="email"
                              placeholder="Email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              className={inputClass}
                           />
                           <div className="relative">
                              <input
                                 id="login-password"
                                 type={showLoginPassword ? "text" : "password"}
                                 placeholder="Password"
                                 value={loginPassword}
                                 onChange={(e) => setLoginPassword(e.target.value)}
                                 required
                                 className={`${inputClass} pr-10`}
                              />
                              <EyeToggle show={showLoginPassword} toggle={() => setShowLoginPassword(!showLoginPassword)} />
                           </div>

                           <button
                              type="submit"
                              disabled={loginLoading}
                              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
                           >
                              {loginLoading ? (
                                 <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                 </>
                              ) : (
                                 "Sign In"
                              )}
                           </button>
                        </form>

                        <p className="mt-4 text-center text-[11px] text-gray-400">
                           <span className="font-medium text-gray-500">Note:</span> New admin accounts require approval.
                        </p>
                     </div>
                  </div>

                  {/* ── SIGN UP FORM (right half) ── */}
                  <div
                     className="w-1/2 shrink-0 flex items-center justify-center p-10 transition-all duration-700"
                     style={{
                        opacity: isSignup ? 1 : 0,
                        transform: isSignup ? "translateX(0)" : "translateX(20px)",
                        pointerEvents: isSignup ? "auto" : "none",
                     }}
                  >
                     <div className="w-full max-w-[300px]">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-5">Create Account</h1>

                        {/* Google */}
                        <button
                           type="button"
                           onClick={handleGoogle}
                           disabled={googleLoading}
                           className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 mb-4"
                        >
                           {googleLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                           ) : (
                              <GoogleIcon className="h-5 w-5" />
                           )}
                           Sign up with Google
                        </button>

                        <p className="text-xs text-gray-400 text-center mb-4">or use your email to register for admin access</p>

                        {/* Errors / Success */}
                        {signupError && (
                           <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600">
                              {signupError}
                           </div>
                        )}
                        {signupSuccess && (
                           <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-700">
                              {signupSuccess}
                           </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-3">
                           <input
                              id="signup-name"
                              type="text"
                              placeholder="Name"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              required
                              className={inputClass}
                           />
                           <input
                              id="signup-email"
                              type="email"
                              placeholder="Email"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              required
                              className={inputClass}
                           />
                           <div className="relative">
                              <input
                                 id="signup-password"
                                 type={showSignupPassword ? "text" : "password"}
                                 placeholder="Password"
                                 value={signupPassword}
                                 onChange={(e) => setSignupPassword(e.target.value)}
                                 required
                                 className={`${inputClass} pr-10`}
                              />
                              <EyeToggle show={showSignupPassword} toggle={() => setShowSignupPassword(!showSignupPassword)} />
                           </div>
                           <input
                              id="signup-confirm"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              value={signupConfirm}
                              onChange={(e) => setSignupConfirm(e.target.value)}
                              required
                              className={inputClass}
                           />

                           <button
                              type="submit"
                              disabled={signupLoading}
                              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
                           >
                              {signupLoading ? (
                                 <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                 </>
                              ) : (
                                 "Sign Up"
                              )}
                           </button>
                        </form>
                     </div>
                  </div>
               </div>

               {/* ── SLIDING OVERLAY PANEL ── */}
               <div
                  className="absolute top-0 left-0 w-1/2 h-full z-20 transition-transform duration-700 ease-in-out"
                  style={{ transform: isSignup ? "translateX(0%)" : "translateX(100%)" }}
               >
                  <div
                     className="relative w-full h-full flex flex-col items-center justify-center text-white px-10 overflow-hidden"
                     style={{
                        background: "linear-gradient(135deg, #667eea 0%, #5b21b6 50%, #7c3aed 100%)",
                        borderRadius: isSignup
                           ? "0 100px 100px 0"   /* on left: flat left edge, curved right edge */
                           : "100px 0 0 100px",   /* on right: curved left edge, flat right edge */
                        transition: "border-radius 0.7s ease-in-out",
                     }}
                  >
                     {/* Decorative circles */}
                     <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
                     <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5" />

                     <img src="/logo.png" alt="FinZoo" className="h-14 w-14 mb-5 drop-shadow-lg" />
                     <h2 className="text-3xl font-bold mb-3 text-center">
                        {isSignup ? "Welcome Back!" : "Hello, Friend!"}
                     </h2>
                     <p className="text-sm text-white/70 text-center mb-8 max-w-[220px] leading-relaxed">
                        {isSignup
                           ? "Sign in here to access admin functions"
                           : "Sign up here to request admin access"}
                     </p>
                     <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="rounded-full border-2 border-white px-10 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-purple-700"
                     >
                        {isSignup ? "Sign In" : "Sign Up"}
                     </button>
                  </div>
               </div>
            </div>

            {/* ── MOBILE LAYOUT (< md) ── */}
            <div className="md:hidden overflow-hidden">
               <div
                  className="flex w-[200%] transition-transform duration-600 ease-in-out"
                  style={{ transform: isSignup ? "translateX(-50%)" : "translateX(0)" }}
               >
                  {/* ── Mobile Sign In ── */}
                  <div className="w-1/2 shrink-0 px-8 py-10">
                     <div className="flex flex-col items-center mb-6">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
                           <img src="/logo.png" alt="FinZoo" className="h-9 w-9" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                     </div>

                     {/* Google */}
                     <button type="button" onClick={handleGoogle} disabled={googleLoading} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-purple-300 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 mb-4">
                        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
                        Login with Google
                     </button>
                     <p className="text-xs text-gray-400 text-center mb-5">or use your email to access admin features</p>

                     {loginError && (
                        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{loginError}</div>
                     )}
                     {loginInfo && (
                        <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-700">{loginInfo}</div>
                     )}

                     <form onSubmit={handleLogin} className="space-y-3">
                        <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className={inputClass} />
                        <div className="relative">
                           <input type={showLoginPassword ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={`${inputClass} pr-10`} />
                           <EyeToggle show={showLoginPassword} toggle={() => setShowLoginPassword(!showLoginPassword)} />
                        </div>
                        <button type="submit" disabled={loginLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-60">
                           {loginLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
                        </button>
                     </form>

                     <p className="mt-6 text-center text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <button type="button" onClick={() => setIsSignup(true)} className="font-semibold text-purple-600 hover:text-purple-500">Sign Up</button>
                     </p>
                     <p className="mt-3 text-center text-[11px] text-gray-400"><span className="font-medium text-gray-500">Note:</span> New admin accounts require approval.</p>
                  </div>

                  {/* ── Mobile Sign Up ── */}
                  <div className="w-1/2 shrink-0 px-8 py-10">
                     <div className="flex flex-col items-center mb-6">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
                           <img src="/logo.png" alt="FinZoo" className="h-9 w-9" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                     </div>

                     {/* Google */}
                     <button type="button" onClick={handleGoogle} disabled={googleLoading} className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-purple-300 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 mb-4">
                        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
                        Sign up with Google
                     </button>
                     <p className="text-xs text-gray-400 text-center mb-4">or use your email to register for admin access</p>

                     {signupError && (
                        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{signupError}</div>
                     )}
                     {signupSuccess && (
                        <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">{signupSuccess}</div>
                     )}

                     <form onSubmit={handleSignup} className="space-y-3">
                        <input type="text" placeholder="Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className={inputClass} />
                        <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className={inputClass} />
                        <div className="relative">
                           <input type={showSignupPassword ? "text" : "password"} placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className={`${inputClass} pr-10`} />
                           <EyeToggle show={showSignupPassword} toggle={() => setShowSignupPassword(!showSignupPassword)} />
                        </div>
                        <input type={showSignupPassword ? "text" : "password"} placeholder="Confirm Password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} required className={inputClass} />
                        <button type="submit" disabled={signupLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-60">
                           {signupLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Sign Up"}
                        </button>
                     </form>

                     <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <button type="button" onClick={() => setIsSignup(false)} className="font-semibold text-purple-600 hover:text-purple-500">Sign In</button>
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </div>
   )
}

/* ───────── Exported component ───────── */
export default function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
   return (
      <Suspense>
         <AuthPageInner initialMode={initialMode} />
      </Suspense>
   )
}
