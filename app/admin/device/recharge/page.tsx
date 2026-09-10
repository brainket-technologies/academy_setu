'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Eye, X, Calendar } from 'lucide-react'
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
  const [institutes, setInstitutes] = useState<InstituteItem[]>([])
  const [deviceSetups, setDeviceSetups] = useState<DeviceSetup[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null)

  // Add form fields
  const [addSchool, setAddSchool] = useState('')
  const [addDeviceId, setAddDeviceId] = useState('')
  const [addPlanId, setAddPlanId] = useState('')
  const [addDurationType, setAddDurationType] = useState('Days')
  const [addDuration, setAddDuration] = useState('30 Days')
  const [addPaymentRef, setAddPaymentRef] = useState('')
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // Verify form fields
  const [verifyStartDate, setVerifyStartDate] = useState('')
  const [verifyEndDate, setVerifyEndDate] = useState('')
  const [submittingVerify, setSubmittingVerify] = useState(false)

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
      console.error('Error fetching plans:', err)
    }
  }, [])

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
        setRequests(data.data || [])
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

  useEffect(() => {
    fetchInstitutes()
    fetchDeviceTypes()
    fetchDeviceSetups()
    fetchPlans()
    fetchRequests()
  }, [fetchInstitutes, fetchDeviceTypes, fetchDeviceSetups, fetchPlans, fetchRequests])

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
    const today = new Date().toISOString().split('T')[0]
    setVerifyStartDate(today)
    
    const days = parseInt(req.plan_duration) || 30
    const end = new Date()
    end.setDate(end.getDate() + days)
    setVerifyEndDate(end.toISOString().split('T')[0])
  }

  // Filter requests
  const filteredRequests = requests.filter(item => {
    if (filterSchool && item.school_name !== filterSchool) return false
    if (filterDeviceType && item.device_type !== filterDeviceType) return false
    return true
  })

  return (
    <>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recharge Request</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage and verify incoming device subscription recharge requests</p>
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

      {/* Recharge Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 text-center w-16">S.No.</th>
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Device Name</th>
                <th className="py-4 px-5">IMEI No.</th>
                <th className="py-4 px-5">Device Type</th>
                <th className="py-4 px-5 text-center">Plan Duration</th>
                <th className="py-4 px-5">Paid Amount</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No pending recharge requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => (
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
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {req.imei_no}
                    </td>
                    <td className="py-4 px-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {req.device_type}
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-slate-800 dark:text-slate-200">
                      {req.plan_duration}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                      ₹{parseFloat(String(req.amount)).toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleOpenVerify(req)}
                        className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
                        title="Verify & Activate Recharge"
                      >
                        <Eye className="w-4 h-4" />
                        Verify
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
          ) : filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recharge requests found.
            </div>
          ) : (
            filteredRequests.map((req, idx) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Recharge Request</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">{req.school_name}</h4>
                  </div>
                  <button
                    onClick={() => handleOpenVerify(req)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="Verify Request"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Verify
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
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">IMEI</span>
                    <span>{req.imei_no}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                    <span>{req.plan_duration}</span>
                  </div>
                  <div className="mt-1 col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">₹{parseFloat(String(req.amount)).toFixed(2)}</span>
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

      {/* Verify Recharge details modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedRequest(null)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Verify & Activate Recharge
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review details and set subscription start and end dates</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Institution & Device Details */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Request & Device Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500">Institution / School</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.school_name}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Name</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.device_name}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Type</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.device_type}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Duration</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRequest.plan_duration}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Paid Amount</label>
                    <input
                      type="text"
                      disabled
                      value={`₹${parseFloat(String(selectedRequest.amount)).toFixed(2)}`}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                  {selectedRequest.payment_reference && (
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-500">Payment Reference</label>
                      <input
                        type="text"
                        disabled
                        value={selectedRequest.payment_reference}
                        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Validity Form */}
              <form onSubmit={handleVerifySubmit} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                  Plan Validity & Activation
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Start Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={verifyStartDate}
                      onChange={e => setVerifyStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-200 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">End Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={verifyEndDate}
                      onChange={e => setVerifyEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-200 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVerify}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingVerify && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify & Activate
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
