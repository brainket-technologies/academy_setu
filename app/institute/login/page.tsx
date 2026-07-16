'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { loginAction } from './actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const initialState = { error: '' }

export default function InstituteLoginPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const successToastShownRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (state?.success) {
      if (!successToastShownRef.current) {
        toast.success('Login successful! Redirecting...')
        successToastShownRef.current = true
      }
      const t = setTimeout(() => router.push('/institute/dashboard'), 600)
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
              radial-gradient(ellipse 80% 60% at 90% 20%, rgba(14,165,233,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 10% 80%, rgba(167,139,250,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(52,211,153,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 70% 60% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
              linear-gradient(135deg, #f0fbff 0%, #f0fdf4 30%, #fdf2f8 60%, #f5f3ff 100%)
            `,
          }}
        />
      </div>

      {/* === Ultra-thin vector grid === */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)
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
            rgba(6,182,212,0.07) 18px,
            rgba(6,182,212,0.07) 19px
          )`,
          backgroundSize: '26px 26px',
          animation: 'streamA 10s linear infinite',
        }} />
      </div>

      {/* ====== Split layout: Left content + Right form ====== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4">
        {/* === Left Side: Brand Content === */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Academy Setu</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wider uppercase">Institute Portal</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Manage Your<br />
              <span className="bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
                Institution Profile
              </span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Access your personalized dashboard, manage subscriptions, track requests, and keep your details up-to-date.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              View Billing & Plans
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Support Tickets
            </div>
          </div>
        </div>

        {/* === Right Side: Login Form === */}
        <div className="w-full max-w-[480px]">
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(14,165,233,0.15),0_4px_18px_-4px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(59,130,246,0.15), rgba(99,102,241,0.1), rgba(56,189,248,0.2))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }} />

            <div className="relative p-10">
              <div className="text-center mb-8">
                <p className="text-slate-800 text-xl font-bold tracking-wide">
                  Sign in to your Institute
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-slate-700 mb-2">
                    Email Address
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
                      placeholder="institute@example.com"
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 text-base focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
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
                      className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-11 pr-11 py-3.5 text-slate-800 placeholder-slate-400 text-base focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
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
                  type="submit"
                  disabled={pending}
                  className="w-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-400 hover:via-blue-400 hover:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-sky-200/60 hover:shadow-xl hover:shadow-sky-300/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg tracking-wide"
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
                &copy; {new Date().getFullYear()} Academy Setu — Institute Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
