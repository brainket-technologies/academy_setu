'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  plan_name: string
  segment: string
}

interface ActivatePlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  institutionId: string
  institutionName: string
  currentActivePlan?: string | null
}

export function ActivatePlanModal({
  isOpen,
  onClose,
  onSuccess,
  institutionId,
  institutionName,
  currentActivePlan
}: ActivatePlanModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoadingPlans(true)
      fetch('/api/admin/plan?pageSize=100')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPlans(data.data)
            // Prefill with the plan matching current active plan if any
            if (currentActivePlan) {
              const matched = data.data.find((p: Plan) => p.plan_name === currentActivePlan)
              if (matched) setSelectedPlanId(matched.id)
            }
          } else {
            toast.error('Failed to load plans')
          }
        })
        .catch(() => toast.error('Failed to load plans'))
        .finally(() => setLoadingPlans(false))
    } else {
      setSelectedPlanId('')
    }
  }, [isOpen, currentActivePlan])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanId) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/institute/${institutionId}/activate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan_id: selectedPlanId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan activated successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to activate plan')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop Close */}
      <div className="absolute inset-0 cursor-default" onClick={submitting ? undefined : onClose} />

      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-md relative flex flex-col animate-in zoom-in-95 duration-200 z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Plan Icon Banner */}
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mb-4 shrink-0 mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2 text-center">
          Activate Plan
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed px-1 text-center">
          Select and activate a plan for <strong className="text-slate-700 dark:text-slate-300">{institutionName}</strong>.
          {currentActivePlan && (
            <span className="block mt-1 text-xs">
              Current Active Plan: <strong className="text-emerald-600 dark:text-emerald-400">{currentActivePlan}</strong>
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Select Plan
            </label>
            {loadingPlans ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            ) : (
              <select
                required
                disabled={submitting}
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="">-- Choose a Plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan_name} ({p.segment})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPlanId}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Activate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
