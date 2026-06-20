'use client'

import { useActionState, useState, useEffect } from 'react'
import { loginAction } from './actions'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

const initialState = { error: '' }

export default function AdminLoginPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (state?.success) {
      toast.success('Login successful! Redirecting...')
      const t = setTimeout(() => router.push('/admin/dashboard'), 600)
      return () => clearTimeout(t)
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#faf8ff] font-sans antialiased">
      {/* === Animated luminous gradient background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 animate-gradient-rotate"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 10% 20%, rgba(167,139,250,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 90% 80%, rgba(99,102,241,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 70% 60% at 20% 80%, rgba(14,165,233,0.08) 0%, transparent 50%),
              linear-gradient(135deg, #faf8ff 0%, #f0f2ff 30%, #fdf2f8 60%, #fefce8 100%)
            `,
          }}
        />
      </div>

      {/* === Ultra-thin vector grid === */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* === Animated diagonal vector streams === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `repeating-linear-gradient(
            -35deg,
            transparent,
            transparent 18px,
            rgba(139,92,246,0.07) 18px,
            rgba(139,92,246,0.07) 19px
          )`,
          backgroundSize: '26px 26px',
          animation: 'streamA 10s linear infinite',
        }} />
        <div className="absolute inset-0" style={{
          background: `repeating-linear-gradient(
            55deg,
            transparent,
            transparent 24px,
            rgba(6,182,212,0.05) 24px,
            rgba(6,182,212,0.05) 25px
          )`,
          backgroundSize: '34px 34px',
          animation: 'streamB 14s linear infinite reverse',
        }} />
      </div>

      {/* === Soft floating orbs === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-violet-400/10 rounded-full blur-[150px] animate-orb-drift" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-amber-300/10 rounded-full blur-[150px] animate-orb-drift-delayed" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-sky-400/8 rounded-full blur-[180px] animate-orb-drift-slow" />
      </div>

      {mounted && (
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      )}

      {/* ====== Split layout: Left content + Right form ====== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4">
        {/* === Left Side: Brand Content === */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-200/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Academy Setu</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wider uppercase">Admin Portal</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Welcome Back to Your<br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                Academic Command Center
              </span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Manage students, track applications, oversee programs, and keep your institution running smoothly — all from one powerful dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Real-time Analytics
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Student Management
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Secure &amp; Scalable
            </div>
          </div>

          <div className="hidden lg:block pt-8 opacity-50">
            <svg className="w-48 h-auto text-violet-200" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M0 60 Q50 20 100 60 T200 60" />
              <path d="M0 80 Q50 40 100 80 T200 80" />
              <path d="M0 100 Q50 60 100 100 T200 100" />
              <circle cx="60" cy="50" r="3" fill="currentColor" />
              <circle cx="140" cy="70" r="2" fill="currentColor" />
              <circle cx="100" cy="30" r="4" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* === Right Side: Login Form === */}
        <div className="w-full max-w-[480px]">
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(99,102,241,0.15),0_4px_18px_-4px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15), rgba(251,191,36,0.1), rgba(139,92,246,0.2))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }} />

            <div className="relative p-10">
              <div className="text-center mb-8">
                <p className="text-slate-800 text-xl font-bold tracking-wide">
                  Sign in to your account
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="admin@academysetu.com"
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 text-base focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-base font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-11 py-3.5 text-slate-800 placeholder-slate-400 text-base focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  id="admin-login-btn"
                  type="submit"
                  disabled={pending}
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:via-indigo-500 hover:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-200/60 hover:shadow-xl hover:shadow-violet-300/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg tracking-wide"
                >
                  {pending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <p className="text-center text-slate-400 text-xs mt-6 tracking-wide" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} Academy Setu — Secure Admin Access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
