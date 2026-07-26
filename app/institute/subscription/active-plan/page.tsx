'use client'

import React, { useState, useEffect } from 'react'
import { fetchActivePlan } from '../actions'
import { Loader2, CheckCircle2, Eye } from 'lucide-react'

interface PlanState {
  name: string
  description: string
  validity: string
  validFrom: string
  validTo: string
  daysLeft: number
  daysTotal: number
}

const DEFAULT_PLAN: PlanState = {
  name: 'Standard Academic Plan',
  description: 'A comprehensive plan for academic institutions.',
  validity: '365 Days',
  validFrom: new Date().toLocaleDateString('en-GB'),
  validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
  daysLeft: 365,
  daysTotal: 365
}

export default function ActivePlanPage() {
  const [activePlan, setActivePlan] = useState<PlanState | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function loadPlan() {
      const res = await fetchActivePlan()
      if (res.success && res.data) {
        const validityDays = res.data.validity_days || 365
        setActivePlan({
          name: res.data.name,
          description: res.data.description || DEFAULT_PLAN.description,
          validity: `${validityDays} Days`,
          validFrom: new Date().toLocaleDateString('en-GB'),
          validTo: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
          daysLeft: validityDays,
          daysTotal: validityDays
        })
      } else {
        setActivePlan(DEFAULT_PLAN) // fallback
      }
      setLoading(false)
    }
    loadPlan()
  }, [])

  const triggerAction = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  if (loading || !activePlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Active Plan</h1>
      </div>

      {/* Plan Details Card */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4 text-xs font-semibold text-slate-700">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Plan Details</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xs font-black text-slate-800">{activePlan.name}</h3>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              {activePlan.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerAction('Opening plan details modal...')}
            className="flex items-center gap-1.5 px-4 py-2 border border-teal-200 text-teal-600 rounded-lg text-[10px] font-black hover:bg-teal-50 transition-colors self-start md:self-center flex-shrink-0 bg-white"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Plan</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-655">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Validity From</div>
              <div className="font-black text-slate-850 mt-1">{activePlan.validFrom}</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Validity To</div>
              <div className="font-black text-slate-850 mt-1">{activePlan.validTo}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-2xl font-black text-[#1b3a60]">365 Days</span>
              <span className="text-slate-400 text-sm font-bold"> / 365 Days</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerAction('Upcoming plan options loading...')}
                className="px-4 py-2 bg-white border border-teal-600 text-teal-600 rounded-lg text-[10px] font-black hover:bg-teal-50 transition-all"
              >
                Add Upcoming Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/institute/subscription/all-plan'
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black shadow transition-all"
              >
                Change Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Plan Details Card */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Renewal Plan Details</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs font-semibold text-slate-700">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xs font-black text-slate-800">Renewal Package (Ready)</h3>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              Upcoming renewal queues are prepared for fast processing once active validity is within the 30-day threshold.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerAction('Opening renewal details modal...')}
            className="flex items-center gap-1.5 px-4 py-2 border border-teal-200 text-teal-600 rounded-lg text-[10px] font-black hover:bg-teal-50 transition-colors self-start md:self-center flex-shrink-0 bg-white"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Plan</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-655">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Validity From</div>
              <div className="font-black text-slate-850 mt-1">{activePlan.validTo}</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Validity To</div>
              <div className="font-black text-slate-850 mt-1">15/09/2027</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-[#1b3a60]">0 Days</span>
            <span className="text-slate-400 text-sm font-bold"> / 365 Days</span>
          </div>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
