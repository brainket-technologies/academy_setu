'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, School, Briefcase, UserCheck, Users, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [seeding, setSeeding] = useState(false)
  const [seededMsg, setSeededMsg] = useState('')

  const handleSeedDatabase = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/setup')
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Database tables seeded successfully!')
        setSeededMsg('Database tables successfully initialized and seeded!')
      } else {
        toast.error(data.error || 'Failed to initialize database tables.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Could not connect to the database setup endpoint.')
    } finally {
      setSeeding(false)
    }
  }

  const portals = [
    {
      title: 'Super Admin Portal',
      description: 'System segments, plan configurations, promo codes, billing records, queries, and support ticket queues.',
      href: '/admin/login',
      icon: Shield,
      color: 'from-violet-500 to-purple-600',
      badge: 'System Control'
    },
    {
      title: 'Institute Dashboard',
      description: 'Manage branches, students, sections, fees structure, support tickets, dynamic calendar keys, and GPS devices.',
      href: '/institute/login',
      icon: School,
      color: 'from-teal-500 to-emerald-600',
      badge: 'Academic Hub'
    },
    {
      title: 'BDM Dashboard',
      description: 'Lead generation pipeline tracker, communication history records, conversion analytics, and BDM approvals.',
      href: '/bdm/login',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Sales & Growth'
    },
    {
      title: 'Operations Manager',
      description: 'Template request approvals, expense records audit, referral reviews, and overall operations summary logs.',
      href: '/manager/login',
      icon: UserCheck,
      color: 'from-rose-500 to-pink-600',
      badge: 'Audit & Review'
    },
    {
      title: 'Distributor Portal',
      description: 'Referrals network, active commissions summary, payouts request queue, and distributor details form.',
      href: '/distributor/login',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      badge: 'Partnership'
    }
  ]

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-[#faf8ff] font-sans antialiased">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-40 animate-pulse duration-1000"
          style={{
            background: `
              radial-gradient(circle at 10% 20%, rgba(167,139,250,0.1) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
              linear-gradient(135deg, #faf8ff 0%, #f0f2ff 50%, #fdf2f8 100%)
            `,
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-800 tracking-tight">Academy Setu</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Education Platform</span>
          </div>
        </div>

        {/* Database Seeding Quick Action */}
        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 border bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm text-xs transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding Tables...' : 'Seed database tables'}</span>
        </button>
      </header>

      {/* Main Body */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-12 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />
            Production Ready Setup
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Unified Educational <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Ecosystem Control</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to Academy Setu. Access your custom operations dashboard, audit billing transactions, manage educational workflows, or seed parameters below.
          </p>
        </div>

        {seededMsg && (
          <div className="w-full max-w-xl mx-auto p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>{seededMsg} Login using credentials like <code className="bg-emerald-100/50 px-1 py-0.5 rounded">admin@academysetu.com</code> / <code className="bg-emerald-100/50 px-1 py-0.5 rounded">Admin@123</code></span>
          </div>
        )}

        {/* Portal Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-4">
          {portals.map((p, idx) => {
            const Icon = p.icon
            return (
              <Link
                key={idx}
                href={p.href}
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-md text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-slate-50 border text-[9px] font-black text-slate-500 tracking-wide uppercase">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-4 group-hover:text-violet-600 transition-colors">
                  <span>Open Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-semibold border-t pt-6 gap-4">
        <p>© 2026 Academy Setu. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-600">Privacy Policy</a>
          <span className="text-slate-200">•</span>
          <a href="#" className="hover:text-slate-600">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}
