'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

interface DeviceSetup {
  id: string
  name: string
  model: string
  device_type: string
}

interface DeviceTypeItem {
  id: string
  name: string
}

interface InstituteItem {
  id: string
  name: string
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
  const [institutes, setInstitutes] = useState<InstituteItem[]>([])
  const [deviceSetups, setDeviceSetups] = useState<DeviceSetup[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')

  // Recharge Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSchool, setAddSchool] = useState('')
  const [addDeviceId, setAddDeviceId] = useState('')
  const [addPlanId, setAddPlanId] = useState('')
  const [addDurationType, setAddDurationType] = useState('Days')
  const [addDuration, setAddDuration] = useState('30 Days')
  const [addPaymentRef, setAddPaymentRef] = useState('')
  const [submittingAdd, setSubmittingAdd] = useState(false)

  const fetchInstitutes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/institute?simple=true')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setInstitutes(data.data)
      }
    } catch (err) {
      console.error('Error fetching institutes:', err)
    }
  }, [])

  const fetchDeviceTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/types')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setDeviceTypes(data.data)
      }
    } catch (err) {
      console.error('Error fetching device types:', err)
    }
  }, [])

  const fetchDeviceSetups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/setup')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setDeviceSetups(data.data)
        if (data.data.length > 0) {
          setAddDeviceId(data.data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching device setups:', err)
    }
  }, [])

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
        setExpiryList(data.data || [])
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
      if (data.success && Array.isArray(data.data)) {
        setPlans(data.data)
        if (data.data.length > 0) {
          setAddPlanId(data.data[0].id)
          setAddDurationType(data.data[0].duration_type || 'Days')
          setAddDuration(`${data.data[0].duration} ${data.data[0].duration_type || 'Days'}`)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchInstitutes()
    fetchDeviceTypes()
    fetchDeviceSetups()
    fetchPlans()
    fetchExpiryList()
  }, [fetchInstitutes, fetchDeviceTypes, fetchDeviceSetups, fetchPlans, fetchExpiryList])

  const handlePlanChange = (planId: string) => {
    setAddPlanId(planId)
    const selected = plans.find(p => p.id === planId)
    if (selected) {
      setAddDurationType(selected.duration_type || 'Days')
      setAddDuration(`${selected.duration} ${selected.duration_type || 'Days'}`)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addSchool) return toast.error('Please select an institution')
    const selectedPlan = plans.find(p => p.id === addPlanId)
    if (!selectedPlan) return toast.error('Please select a plan')

    const selectedDevice = deviceSetups.find(d => d.id === addDeviceId)
    const deviceName = selectedDevice ? selectedDevice.name : 'GPS Device'
    const deviceType = selectedDevice ? (selectedDevice.device_type || 'GPS') : 'GPS'

    setSubmittingAdd(true)
    try {
      const res = await fetch('/api/admin/device/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: addSchool,
          device_name: deviceName,
          device_type: deviceType,
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-600 border border-red-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">
          ● {text}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
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

  // Filtered expiry list
  const filteredExpiryList = expiryList.filter(item => {
    if (filterSchool && item.school_name !== filterSchool) return false
    if (filterDeviceType && item.device_type !== filterDeviceType) return false
    if (filterExpiry) {
      const { days } = getRemainingDays(item.end_date)
      const maxDays = parseInt(filterExpiry)
      if (days > maxDays || days < 0) return false
    }
    return true
  })

  return (
    <>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Expiry Recharge</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track and recharge device subscriptions approaching expiration</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Recharge
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School / Institution</label>
            <select
              value={filterSchool}
              onChange={e => setFilterSchool(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              {institutes.map(inst => (
                <option key={inst.id} value={inst.name}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Type</label>
            <select
              value={filterDeviceType}
              onChange={e => setFilterDeviceType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              {deviceTypes.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Days</label>
            <select
              value={filterExpiry}
              onChange={e => setFilterExpiry(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">Select an Option</option>
              <option value="7">Next 7 Days</option>
              <option value="15">Next 15 Days</option>
              <option value="30">Next 30 Days</option>
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
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              ) : filteredExpiryList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No active recharges tracking expiry.
                  </td>
                </tr>
              ) : (
                filteredExpiryList.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-slate-200">
                      {req.school_name}
                    </td>
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-semibold">
                      {req.device_name}
                    </td>
                    <td className="py-4 px-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {req.device_type}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-300">
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
                        className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
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
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
            </div>
          ) : filteredExpiryList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No active recharges tracking expiry.
            </div>
          ) : (
            filteredExpiryList.map((req, idx) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Expiring Device</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">{req.school_name}</h4>
                  </div>
                  <button
                    onClick={() => handleLoginClick(req.id)}
                    className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer uppercase tracking-wider shadow-sm shrink-0 mt-1"
                  >
                    Log in
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{req.device_name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                    <span>{req.device_type}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SIM No.</span>
                    <span>{req.sim_no || '9999999999'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry status</span>
                    <div className="mt-0.5">{getExpiryBadge(req.end_date)}</div>
                  </div>
                  <div className="mt-1 col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
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
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Recharge Request
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit a new device subscription recharge</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select School / Institution <span className="text-rose-500">*</span></label>
                  <select
                    value={addSchool}
                    onChange={e => setAddSchool(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    required
                  >
                    <option value="">Select an Option</option>
                    {institutes.length === 0 && <option value="" disabled>No institutions found</option>}
                    {institutes.map(inst => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Device <span className="text-rose-500">*</span></label>
                  <select
                    value={addDeviceId}
                    onChange={e => setAddDeviceId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {deviceSetups.length === 0 && <option value="">No devices configured in Device Setup</option>}
                    {deviceSetups.map(dev => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name} {dev.device_type ? `(${dev.device_type})` : ''} - {dev.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Plan <span className="text-rose-500">*</span></label>
                  <select
                    value={addPlanId}
                    onChange={e => handlePlanChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    required
                  >
                    {plans.length === 0 && <option value="">No plans configured</option>}
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.amount}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Plan Duration Type</label>
                    <input
                      type="text"
                      disabled
                      value={addDurationType}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Plan Duration</label>
                    <input
                      type="text"
                      disabled
                      value={addDuration}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Payment Reference</label>
                  <input
                    type="text"
                    placeholder="Enter Reference / Transaction ID"
                    value={addPaymentRef}
                    onChange={e => setAddPaymentRef(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
