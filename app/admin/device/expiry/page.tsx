'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Plus, Calendar, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface DevicePlan {
  id: string
  name: string
  duration_type: string
  duration: number
  amount: number
  tax_percent: number
  total_amount: number
}

interface RechargeRequest {
  id: string
  school_name: string
  device_name: string
  imei_no: string
  device_type: string
  image_url: string
  plan_duration: string
  amount: number
  payment_reference: string
  sim_no: string
  start_date: string
  end_date: string
  verified: boolean
  created_at: string
}

export default function ExpiryRechargePage() {
  const [expiryList, setExpiryList] = useState<RechargeRequest[]>([])
  const [plans, setPlans] = useState<DevicePlan[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')

  // Unique list of schools and device types for filter dropdowns
  const [schools, setSchools] = useState<string[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])

  // Recharge Modal States (shares recharge logic with Recharge page)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSchool, setAddSchool] = useState('')
  const [addDevice, setAddDevice] = useState('Device 1')
  const [addPlanId, setAddPlanId] = useState('')
  const [addDurationType, setAddDurationType] = useState('Days')
  const [addDuration, setAddDuration] = useState('30 Days')
  const [addPaymentRef, setAddPaymentRef] = useState('')
  const [submittingAdd, setSubmittingAdd] = useState(false)

  const fetchExpiryList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSchool) params.append('schoolName', filterSchool)
      if (filterDeviceType) params.append('deviceType', filterDeviceType)
      params.append('verified', 'true') // only verified recharges show up under Expiry

      const res = await fetch(`/api/admin/device/recharge?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setExpiryList(data.data)

        // populate unique schools and device types
        const uSchools = Array.from(new Set(data.data.map((r: RechargeRequest) => r.school_name))) as string[]
        const uTypes = Array.from(new Set(data.data.map((r: RechargeRequest) => r.device_type))) as string[]
        setSchools(uSchools.length ? uSchools : ['abcdschool'])
        setDeviceTypes(uTypes.length ? uTypes : ['GPS', 'Finger Print', 'Attendance'])
      } else {
        toast.error('Failed to load expiry data')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching expiry data')
    } finally {
      setLoading(false)
    }
  }, [filterSchool, filterDeviceType])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/plans')
      const data = await res.json()
      if (data.success) {
        setPlans(data.data)
        if (data.data.length > 0) {
          setAddPlanId(data.data[0].id)
          setAddDurationType(data.data[0].duration_type)
          setAddDuration(`${data.data[0].duration} ${data.data[0].duration_type}`)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchExpiryList()
    fetchPlans()
  }, [fetchExpiryList, fetchPlans])

  const handlePlanChange = (planId: string) => {
    setAddPlanId(planId)
    const selected = plans.find(p => p.id === planId)
    if (selected) {
      setAddDurationType(selected.duration_type)
      setAddDuration(`${selected.duration} ${selected.duration_type}`)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addSchool) return toast.error('Please select or enter school')
    const selectedPlan = plans.find(p => p.id === addPlanId)
    if (!selectedPlan) return toast.error('Please select a plan')

    setSubmittingAdd(true)
    try {
      const res = await fetch('/api/admin/device/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: addSchool,
          device_name: addDevice,
          device_type: addDevice === 'Device 1' ? 'GPS' : addDevice === 'Device 2' ? 'Finger Print' : 'Attendance',
          plan_duration: addDuration,
          amount: selectedPlan.amount,
          payment_reference: addPaymentRef
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Recharge request submitted successfully!')
        setShowAddModal(false)
        setAddSchool('')
        setAddPaymentRef('')
        fetchExpiryList()
      } else {
        toast.error(data.error || 'Failed to submit request')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingAdd(false)
    }
  }

  const handleLoginClick = (reqId: string) => {
    toast.info(`Redirecting to live device terminal log login...`)
  }

  // Calculate days remaining between current date and end_date
  const getRemainingDays = (endDateStr: string) => {
    if (!endDateStr) return { days: 0, text: 'Expired' }
    try {
      const today = new Date()
      today.setHours(0,0,0,0)
      const end = new Date(endDateStr)
      end.setHours(0,0,0,0)
      const diffTime = end.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return { days: diffDays, text: `${Math.abs(diffDays)} Days Overdue` }
      }
      return { days: diffDays, text: `${String(diffDays).padStart(2, '0')} Days` }
    } catch {
      return { days: 0, text: '—' }
    }
  }

  const getExpiryBadge = (endDateStr: string) => {
    const { days, text } = getRemainingDays(endDateStr)
    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-150 text-red-500 border border-red-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-500 border border-rose-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-fuchsia-50 text-fuchsia-500 border border-fuchsia-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-500 border border-rose-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-500 border border-emerald-200 uppercase tracking-wider">
        ● {text}
      </span>
    )
  }

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Expiry Recharge</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Recharge
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Name</label>
            <select
              value={filterSchool}
              onChange={e => setFilterSchool(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              {schools.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Type</label>
            <select
              value={filterDeviceType}
              onChange={e => setFilterDeviceType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              {deviceTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Days</label>
            <select
              value={filterExpiry}
              onChange={e => setFilterExpiry(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expiry Recharge Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 text-center w-16">S.No.</th>
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Device Name</th>
                <th className="py-4 px-5">Device Type</th>
                <th className="py-4 px-5">SIM No.</th>
                <th className="py-4 px-5">Valid From</th>
                <th className="py-4 px-5">Valid To</th>
                <th className="py-4 px-5">Expiry Days</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-755 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  </td>
                </tr>
              ) : expiryList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No active recharges tracking expiry.
                  </td>
                </tr>
              ) : (
                expiryList.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-850 dark:text-slate-200">
                      {req.school_name}
                    </td>
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-semibold">
                      {req.device_name}
                    </td>
                    <td className="py-4 px-5 text-xs font-bold text-slate-500 dark:text-slate-450">
                      {req.device_type}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-650 dark:text-slate-300">
                      {req.sim_no || '9999999999'}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDateString(req.start_date)}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDateString(req.end_date)}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {getExpiryBadge(req.end_date)}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleLoginClick(req.id)}
                        className="px-3.5 py-1 bg-teal-650 hover:bg-teal-700 text-white font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
                      >
                        Log in
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-650" />
            </div>
          ) : expiryList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No active recharges tracking expiry.
            </div>
          ) : (
            expiryList.map((req, idx) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Expiring Device</span>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{req.school_name}</h4>
                  </div>
                  <button
                    onClick={() => handleLoginClick(req.id)}
                    className="px-3.5 py-1 bg-teal-650 hover:bg-teal-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer uppercase tracking-wider shadow-xs shrink-0 mt-1"
                  >
                    Log in
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Device</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{req.device_name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Type</span>
                    <span>{req.device_type}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SIM No.</span>
                    <span>{req.sim_no || '9999999999'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Expiry status</span>
                    <div className="mt-0.5">{getExpiryBadge(req.end_date)}</div>
                  </div>
                  <div className="mt-1 col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valid From</span>
                      <span className="text-[11px]">{formatDateString(req.start_date)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valid To</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{formatDateString(req.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recharge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Recharge Request
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-55 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Select School</label>
                  <select
                    value={addSchool}
                    onChange={e => setAddSchool(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-305 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                    required
                  >
                    <option value="">Select an Option</option>
                    <option value="abcdschool">abcdschool</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Select Device</label>
                  <select
                    value={addDevice}
                    onChange={e => setAddDevice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-305 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                  >
                    <option value="Device 1">Device 1 (GPS)</option>
                    <option value="Device 2">Device 2 (Finger Print)</option>
                    <option value="Device 3">Device 3 (Attendance)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Select Plan</label>
                  <select
                    value={addPlanId}
                    onChange={e => handlePlanChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-305 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                    required
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.amount}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Duration Type</label>
                    <input
                      type="text"
                      disabled
                      value={addDurationType}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-205 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Duration</label>
                    <input
                      type="text"
                      disabled
                      value={addDuration}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-205 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Payment Reference</label>
                  <input
                    type="text"
                    placeholder="Enter Reference"
                    value={addPaymentRef}
                    onChange={e => setAddPaymentRef(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="w-full py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
