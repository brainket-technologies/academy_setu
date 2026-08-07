'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Eye, EyeOff, Calendar, CreditCard, Shield, User, MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface InstituteData {
  id: string
  school_name: string
  school_code: string
  affiliated_to: string
  affiliation_code: string
  contact_person: string
  mobile_no: string
  email_id: string
  address: string
  state: string
  district: string
  pincode: string
  plain_password?: string
  principal_name: string
  principal_gender: string
  principal_sign?: string
  principal_photo?: string | null
  director_name: string
  director_gender: string
  director_sign?: string
  director_photo?: string | null
  status: string
}

export default function InstituteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [inst, setInst] = useState<InstituteData | null>(null)
  
  // Plan states
  const [activePlan, setActivePlan] = useState<any>(null)
  const [upcomingPlans, setUpcomingPlans] = useState<any[]>([])
  const [planHistory, setPlanHistory] = useState<any[]>([])
  
  const [showPassword, setShowPassword] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatDateOnly = (dateStr: string | null) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  useEffect(() => {
    if (id) {
      loadAllData()
    }
  }, [id])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Institute Info
      const instRes = await fetch(`/api/admin/institute/${id}`, { cache: 'no-store' })
      const instResult = await instRes.json()
      if (instResult.success && instResult.data) {
        setInst(instResult.data)
      } else {
        toast.error('Failed to load institute profile')
        router.push('/admin/institute')
        return
      }

      // 2. Fetch Plan subscriptions
      await loadPlans()
    } catch (error) {
      console.error(error)
      toast.error('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const planRes = await fetch(`/api/admin/billing/institute-plans?institution_id=${id}`)
      const planResult = await planRes.json()
      if (planResult.success) {
        setActivePlan(planResult.activePlan)
        setUpcomingPlans(planResult.upcomingPlans || [])
        setPlanHistory(planResult.planHistory || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeletePlan = async (billId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) return

    setDeletingId(billId)
    try {
      const res = await fetch(`/api/admin/billing/${billId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(`Plan "${planName}" deleted successfully`)
        // Reload plans after deletion
        await loadPlans()
      } else {
        toast.error(data.error || 'Failed to delete plan')
      }
    } catch {
      toast.error('Error deleting plan')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Loading institute dashboard...</p>
      </div>
    )
  }

  if (!inst) {
    return (
      <div className="p-8 text-center text-slate-500">
        Institute not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12 animate-in fade-in duration-200">
      
      {/* Back link & Top summary card */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/institute"
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline self-start cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Institutes List
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{inst.school_name}</h1>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">Code: {inst.school_code || '—'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            inst.status === 'Active'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}>
            {inst.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* General Metadata */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-650" /> General Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Affiliated To</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inst.affiliated_to || '—'} {inst.affiliation_code ? `(${inst.affiliation_code})` : ''}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Contact Person</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inst.contact_person || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Mobile Number</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inst.mobile_no || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inst.email_id || '—'}</span>
              </div>
              
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Address Details</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mt-0.5">
                  {inst.address}, {inst.district}, {inst.state} - {inst.pincode}
                </span>
              </div>

              {inst.plain_password && (
                <div className="md:col-span-2 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Login Password</span>
                    <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5 select-all">
                      {showPassword ? inst.plain_password : '••••••••'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Authority (Principal / Director) Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-650" /> Authority Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Principal profile */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">Principal Details</h4>
                <div className="flex items-center gap-4">
                  {inst.principal_photo ? (
                    <img src={inst.principal_photo} alt="Principal Photo" className="w-14 h-14 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold uppercase">P</div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{inst.principal_name || '—'}</h5>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Gender: {inst.principal_gender}</p>
                  </div>
                </div>
                {inst.principal_sign && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Signature</span>
                    <img src={inst.principal_sign} alt="Principal Signature" className="max-h-12 object-contain bg-slate-50 dark:bg-slate-700 rounded-lg p-1.5 border border-slate-100 dark:border-slate-700" />
                  </div>
                )}
              </div>

              {/* Director profile */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">Director Details</h4>
                <div className="flex items-center gap-4">
                  {inst.director_photo ? (
                    <img src={inst.director_photo} alt="Director Photo" className="w-14 h-14 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold uppercase">D</div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{inst.director_name || '—'}</h5>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Gender: {inst.director_gender}</p>
                  </div>
                </div>
                {inst.director_sign && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Signature</span>
                    <img src={inst.director_sign} alt="Director Signature" className="max-h-12 object-contain bg-slate-50 dark:bg-slate-700 rounded-lg p-1.5 border border-slate-100 dark:border-slate-700" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Subscription Dashboard */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-650" /> Active Plan
              </h4>
              {activePlan ? (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                  <button
                    onClick={() => handleDeletePlan(activePlan.id, activePlan.plan_name)}
                    disabled={deletingId === activePlan.id}
                    className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete this plan"
                  >
                    {deletingId === activePlan.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              ) : (
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  No Active Plan
                </span>
              )}
            </div>

            {activePlan ? (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{activePlan.plan_name}</h3>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Start Date</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{formatDateOnly(activePlan.start_date)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">End Date</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{formatDateOnly(activePlan.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-650 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-100 uppercase tracking-wider">Amount Paid</span>
                    <h4 className="text-2xl font-black">₹{activePlan.amount}</h4>
                  </div>
                  <div className="text-right text-[10px] text-indigo-100 leading-normal border-l border-white/20 pl-4">
                    <div>Mode: <span className="text-white uppercase font-bold">{activePlan.payment_mode}</span></div>
                    <div className="max-w-[120px] truncate">Txn: <span className="text-white font-mono">{activePlan.transaction_id || '—'}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                This institute has no active subscription.
              </div>
            )}
          </div>

          {/* Upcoming Plans */}
          {upcomingPlans.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
              <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-650" /> Upcoming Plans ({upcomingPlans.length})
              </h4>
              <div className="flex flex-col gap-3">
                {upcomingPlans.map((plan: any) => (
                  <div key={plan.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-150 truncate">{plan.plan_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Start: {formatDateOnly(plan.start_date)} | End: {formatDateOnly(plan.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        ₹{plan.amount}
                      </span>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.plan_name)}
                        disabled={deletingId === plan.id}
                        className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete this plan"
                      >
                        {deletingId === plan.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History plans */}
          {planHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
              <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-650" /> Plan History
              </h4>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {planHistory.map((h: any) => (
                  <div key={h.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs leading-normal">
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-700 dark:text-slate-350 truncate">{h.plan_name}</h5>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                        {formatDateOnly(h.start_date)} - {formatDateOnly(h.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-slate-750 dark:text-slate-300 block">₹{h.amount}</span>
                        <span className="text-[9px] font-mono text-slate-400">{h.transaction_id || '—'}</span>
                      </div>
                      <button
                        onClick={() => handleDeletePlan(h.id, h.plan_name)}
                        disabled={deletingId === h.id}
                        className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete this plan"
                      >
                        {deletingId === h.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
