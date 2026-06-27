'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, Plus, Eye, X, Calendar, Check, ArrowUp, ArrowDown } from 'lucide-react'
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
  brand: string
  description: string
  sim_imei_no: string
  sim_no: string
  tax_percent: number
  total_amount: number
  start_date: string
  end_date: string
  verified: boolean
  created_at: string
}

export default function RechargeRequestPage() {
  const [requests, setRequests] = useState<RechargeRequest[]>([])
  const [plans, setPlans] = useState<DevicePlan[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('') // Expiry filter dropdown

  // Unique list of schools and device types for filter dropdowns
  const [schools, setSchools] = useState<string[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null)

  // Add form fields
  const [addSchool, setAddSchool] = useState('')
  const [addDevice, setAddDevice] = useState('Device 1')
  const [addPlanId, setAddPlanId] = useState('')
  const [addDurationType, setAddDurationType] = useState('Days')
  const [addDuration, setAddDuration] = useState('30 Days')
  const [addPaymentRef, setAddPaymentRef] = useState('')
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // Verify form fields
  const [verifyStartDate, setVerifyStartDate] = useState('')
  const [verifyEndDate, setVerifyEndDate] = useState('')
  const [submittingVerify, setSubmittingVerify] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterSchool) params.append('schoolName', filterSchool)
      if (filterDeviceType) params.append('deviceType', filterDeviceType)
      params.append('verified', 'false') // non-verified requests

      const res = await fetch(`/api/admin/device/recharge?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)

        // populate unique schools and device types if not set
        const uSchools = Array.from(new Set(data.data.map((r: RechargeRequest) => r.school_name))) as string[]
        const uTypes = Array.from(new Set(data.data.map((r: RechargeRequest) => r.device_type))) as string[]
        setSchools(uSchools.length ? uSchools : ['abcdschool'])
        setDeviceTypes(uTypes.length ? uTypes : ['GPS', 'Finger Print', 'Attendance'])
      } else {
        toast.error('Failed to load recharge requests')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching recharge requests')
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
    fetchRequests()
    fetchPlans()
  }, [fetchRequests, fetchPlans])

  // Automatically update duration type and duration when plan selection changes
  const handlePlanChange = (planId: string) => {
    setAddPlanId(planId)
    const selected = plans.find(p => p.id === planId)
    if (selected) {
      setAddDurationType(selected.duration_type)
      setAddDuration(`${selected.duration} ${selected.duration_type}`)
    }
  }

  // Create rechargeable request
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addSchool) return toast.error('Please enter or select a school')
    
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
        fetchRequests()
      } else {
        toast.error(data.error || 'Failed to submit request')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingAdd(false)
    }
  }

  // Verify and activate plan
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    if (!verifyStartDate || !verifyEndDate) return toast.error('Start and End dates are required')

    setSubmittingVerify(true)
    try {
      const res = await fetch(`/api/admin/device/recharge/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: verifyStartDate,
          end_date: verifyEndDate,
          verified: true
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Recharge verified and activated successfully!')
        setSelectedRequest(null)
        fetchRequests()
      } else {
        toast.error(data.error || 'Failed to verify recharge')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingVerify(false)
    }
  }

  const handleOpenVerify = (req: RechargeRequest) => {
    setSelectedRequest(req)
    // Pre-populate dates
    const today = new Date().toISOString().split('T')[0]
    setVerifyStartDate(today)
    
    // Auto-calculate end date based on duration
    const days = parseInt(req.plan_duration) || 30
    const end = new Date()
    end.setDate(end.getDate() + days)
    setVerifyEndDate(end.toISOString().split('T')[0])
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Recharge Request</h1>
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

      {/* Recharge Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 text-center w-16">S.No.</th>
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Device Name</th>
                <th className="py-4 px-5">IMEI No.</th>
                <th className="py-4 px-5">Device Type</th>
                <th className="py-4 px-5 text-center">Image</th>
                <th className="py-4 px-5">Plan Duration</th>
                <th className="py-4 px-5">Paid Amount</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No recharge requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
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
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {req.imei_no}
                    </td>
                    <td className="py-4 px-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {req.device_type}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">
                          IMG
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800 dark:text-slate-200">
                      {req.plan_duration}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-755 dark:text-slate-300">
                      {parseFloat(String(req.amount)).toFixed(2)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleOpenVerify(req)}
                          className="p-1.5 rounded-lg bg-teal-55 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="Verify Recharge details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recharge requests found.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Recharge Request</span>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{req.school_name}</h4>
                  </div>
                  <button
                    onClick={() => handleOpenVerify(req)}
                    className="p-2 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl cursor-pointer"
                    title="Verify Request"
                  >
                    <Eye className="w-4 h-4" />
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
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">IMEI</span>
                    <span>{req.imei_no}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Duration</span>
                    <span>{req.plan_duration}</span>
                  </div>
                  <div className="mt-1 col-span-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Paid Amount</span>
                    <span className="text-teal-650 dark:text-teal-400 font-extrabold">₹{parseFloat(String(req.amount)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Recharge Modal */}
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
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

      {/* Verify Recharge details modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedRequest(null)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Recharge Request
              </h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-slate-55 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Device Details */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Device Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500">Brand</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.brand || 'Brand 1'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Type</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.device_type}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Name</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.device_name}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">IMEI No.</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.imei_no}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Description</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.description || 'Lorem Ipsum'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SIM Details */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  SIM Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">IMEI No.</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.sim_imei_no || '1234567890'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Sim No.</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.sim_no || '9999999999'}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Device Image */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Device Image
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-52 h-36 border-2 border-dashed border-teal-500/30 rounded-2xl bg-teal-50/10 flex items-center justify-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    No Image Uploaded
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-slate-550 dark:text-slate-400 cursor-pointer transition-colors">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-slate-550 dark:text-slate-400 cursor-pointer transition-colors">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Device Plan Amount */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Device Plan Amount
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500">Plan Duration Type</label>
                    <input
                      type="text"
                      disabled
                      value="Days"
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-550 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500">Plan Duration</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.plan_duration}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-555 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500">Amount</label>
                    <input
                      type="text"
                      disabled
                      value={parseFloat(String(selectedRequest.amount)).toFixed(2)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-555 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500">Tax <span className="text-[10px] text-slate-400">(In Percentage)</span></label>
                    <input
                      type="text"
                      disabled
                      value={`${selectedRequest.tax_percent || '18'}%`}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-555 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-500">Total Amount</label>
                    <input
                      type="text"
                      disabled
                      value={parseFloat(String(selectedRequest.total_amount || (selectedRequest.amount * 1.18))).toFixed(2)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-555 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Validity Form */}
              <form onSubmit={handleVerifySubmit} className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-slate-105 dark:border-slate-750 pb-2">
                  Plan Validity
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={verifyStartDate}
                      onChange={e => setVerifyStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={verifyEndDate}
                      onChange={e => setVerifyEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVerify}
                    className="px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingVerify && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
