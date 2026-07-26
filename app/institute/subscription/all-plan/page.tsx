'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Eye, Loader2 } from 'lucide-react'
import { fetchAllPlans } from '../actions'

interface PlanRecord {
  id: string
  name: string
  description: string
  features: string[]
  validity: string
}

export default function AllPlansPage() {
  const [availablePlans, setAvailablePlans] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function loadPlans() {
      const res = await fetchAllPlans()
      if (res.success && res.data) {
        const mapped = res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || 'Standard academic module package.',
          features: ['Core ERP', 'Custom Workflows', 'Standard Support'],
          validity: `${p.validity_days || 365} Days`
        }))
        setAvailablePlans(mapped)
      }
      setLoading(false)
    }
    loadPlans()
  }, [])

  const handleBuy = (planName: string) => {
    // In a real app, this would redirect to a checkout page or payment gateway
    setToastMsg(`Checkout initiated for ${planName}! Processing...`)
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      window.location.href = '/institute/subscription/active-plan'
    }, 1500)
  }

  if (loading) {
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
        <h1 className="text-xl font-black text-slate-800">All Plan</h1>
      </div>

      {/* Plans list */}
      <div className="space-y-6">
        {availablePlans.map(plan => (
          <div key={plan.id} className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-stretch">
            
            {/* Left Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-800">{plan.name}</h2>
                <p className="text-[11px] leading-relaxed text-slate-400 font-semibold mt-1">{plan.description}</p>
              </div>

              {/* Features list */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan Features</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-600">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Action panel */}
            <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center items-center gap-4 min-w-[200px]">
              <div className="text-center md:mb-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Validity</div>
                <div className="text-lg font-black text-[#1b3a60] mt-0.5">{plan.validity}</div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[140px]">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-teal-200 text-teal-600 rounded-lg text-[10px] font-black hover:bg-teal-50 bg-white"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuy(plan.name)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black shadow"
                >
                  Buy Now
                </button>
              </div>
            </div>

          </div>
        ))}
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
