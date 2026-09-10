'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Plus, Edit, Trash2, Search, UploadCloud, Layers, Cpu, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface DevicePlan {
  id: string
  name: string
  duration_type?: string
  duration: number
  amount: number
  tax_percent: number
  total_amount: number
  status: string
  device_type: string
  device_name: string
  device_model?: string
  imei_no?: string
  description?: string
  plan_description?: string
  image_url?: string
  created_at: string
}

interface DeviceItem {
  id: string
  device_type: string
  name: string
  model: string
}

interface TypeItem {
  id: string
  name: string
}

export default function PlanSetupPage() {
  const [plans, setPlans] = useState<DevicePlan[]>([])
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [deviceTypes, setDeviceTypes] = useState<TypeItem[]>([])
  const [loading, setLoading] = useState(true)

  // View toggle: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingPlan, setEditingPlan] = useState<DevicePlan | null>(null)

  // Filter & Search states (List View)
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [filterDeviceName, setFilterDeviceName] = useState('')
  const [searchText, setSearchText] = useState('')

  // Form Fields (Create/Edit View)
  const [formDeviceType, setFormDeviceType] = useState('')
  const [formDeviceName, setFormDeviceName] = useState('')
  const [formDeviceModel, setFormDeviceModel] = useState('')
  const [formImeiNo, setFormImeiNo] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formPlanName, setFormPlanName] = useState('')
  const [formPlanDescription, setFormPlanDescription] = useState('')
  const [formDuration, setFormDuration] = useState('30')
  const [formPlanStatus, setFormPlanStatus] = useState('Active')
  const [formAmount, setFormAmount] = useState('')
  const [formTaxPercent, setFormTaxPercent] = useState('18')
  const [submittingForm, setSubmittingForm] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/setup')
      const data = await res.json()
      if (data.success) {
        setDevices(data.data)
      }
    } catch (err) {
      console.error('Error fetching devices:', err)
    }
  }, [])

  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/types')
      const data = await res.json()
      if (data.success) {
        setDeviceTypes(data.data)
      }
    } catch (err) {
      console.error('Error fetching types:', err)
    }
  }, [])

  const fetchPlans = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterDeviceType) params.append('deviceType', filterDeviceType)
      if (filterDeviceName) params.append('deviceName', filterDeviceName)
      if (searchText) params.append('search', searchText)

      const res = await fetch(`/api/admin/device/plans?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setPlans(data.data)
      } else {
        toast.error('Failed to load device plans')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching plans')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [filterDeviceType, filterDeviceName, searchText])

  useEffect(() => {
    fetchPlans(true)
  }, [filterDeviceType, filterDeviceName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchText, fetchPlans])

  useEffect(() => {
    fetchDevices()
    fetchTypes()
  }, [fetchDevices, fetchTypes])

  const handleOpenCreate = () => {
    setEditingPlan(null)
    const initialType = deviceTypes[0]?.name || ''
    const initialDev = devices.find(d => !initialType || d.device_type === initialType) || devices[0]

    setFormDeviceType(initialDev?.device_type || initialType)
    setFormDeviceName(initialDev?.name || '')
    setFormDeviceModel(initialDev?.model || '')
    setFormImeiNo('')
    setFormDescription('')
    setFormImageUrl('')
    setFormPlanName('')
    setFormPlanDescription('')
    setFormDuration('30')
    setFormPlanStatus('Active')
    setFormAmount('')
    setFormTaxPercent('18')
    setView('create')
  }

  const handleOpenEdit = (plan: DevicePlan) => {
    setEditingPlan(plan)
    setFormDeviceType(plan.device_type)
    setFormDeviceName(plan.device_name || '')
    setFormDeviceModel(plan.device_model || '')
    setFormImeiNo(plan.imei_no || '')
    setFormDescription(plan.description || '')
    setFormImageUrl(plan.image_url || '')
    setFormPlanName(plan.name)
    setFormPlanDescription(plan.plan_description || '')
    setFormDuration(String(plan.duration))
    setFormPlanStatus(plan.status)
    setFormAmount(String(plan.amount))
    setFormTaxPercent(String(plan.tax_percent))
    setView('edit')
  }

  const handleDeviceChange = (nameVal: string) => {
    setFormDeviceName(nameVal)
    const found = devices.find(d => d.name === nameVal)
    if (found) {
      if (found.device_type) setFormDeviceType(found.device_type)
      if (found.model) setFormDeviceModel(found.model)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file (PNG, JPG, JPEG, WEBP)')
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFormImageUrl(reader.result as string)
      toast.success('Image selected successfully')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setFormImageUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    try {
      const res = await fetch(`/api/admin/device/plans/${planId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan deleted successfully')
        setPlans(prev => prev.filter(p => p.id !== planId))
      } else {
        toast.error(data.error || 'Failed to delete plan')
      }
    } catch {
      toast.error('Error deleting plan')
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPlanName.trim()) return toast.error('Plan Name is required')
    if (!formDeviceType.trim()) return toast.error('Device Type is required')
    if (!formDuration || parseInt(formDuration) <= 0) return toast.error('Valid Plan Duration (in days) is required')
    if (!formAmount || parseFloat(formAmount) < 0) return toast.error('Valid Amount is required')

    setSubmittingForm(true)
    try {
      const url = editingPlan ? `/api/admin/device/plans/${editingPlan.id}` : '/api/admin/device/plans'
      const method = editingPlan ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formPlanName.trim(),
          duration_type: 'Days',
          duration: parseInt(formDuration),
          amount: parseFloat(formAmount),
          tax_percent: parseFloat(formTaxPercent || '0'),
          status: formPlanStatus,
          device_type: formDeviceType.trim(),
          device_name: formDeviceName.trim(),
          device_model: formDeviceModel.trim(),
          imei_no: formImeiNo.trim(),
          description: formDescription.trim(),
          plan_description: formPlanDescription.trim(),
          image_url: formImageUrl
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!')
        setView('list')
        fetchPlans(true)
      } else {
        toast.error(data.error || 'Failed to save plan')
      }
    } catch {
      toast.error('Something went wrong while saving plan')
    } finally {
      setSubmittingForm(false)
    }
  }

  // Calculate total amount (amount + tax) dynamically
  const getComputedTotal = () => {
    const amt = parseFloat(formAmount) || 0
    const tax = parseFloat(formTaxPercent) || 0
    return (amt + (amt * (tax / 100))).toFixed(2)
  }

  // Filtered devices based on selected formDeviceType
  const filteredFormDevices = formDeviceType
    ? devices.filter(d => !d.device_type || d.device_type === formDeviceType)
    : devices

  return (
    <>
      {view === 'list' ? (
        /* LIST VIEW: All Plan Dashboard */
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">All Plan</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Manage and configure subscription plans for your devices</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </div>

          {/* Filters card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
            <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
                <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Type</label>
                  <select
                    value={filterDeviceType}
                    onChange={e => setFilterDeviceType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Device Types</option>
                    {deviceTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device</label>
                  <select
                    value={filterDeviceName}
                    onChange={e => setFilterDeviceName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Devices</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} {d.model ? `(${d.model})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative w-full lg:w-96 mt-2 lg:mt-5">
                <input
                  type="text"
                  placeholder="Search by Device Name, Device Type, Model..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-4 px-5 text-center w-16">S.No.</th>
                    <th className="py-4 px-5">Plan Name</th>
                    <th className="py-4 px-5">Device Type</th>
                    <th className="py-4 px-5">Device Name</th>
                    <th className="py-4 px-5">Device Model</th>
                    <th className="py-4 px-5 text-center">Image</th>
                    <th className="py-4 px-5">Plan Duration</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                      </td>
                    </tr>
                  ) : plans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400">
                        <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">No configured plans found.</p>
                        <p className="text-xs mt-1 text-slate-400">Click &quot;Add Plan&quot; to create a new plan.</p>
                      </td>
                    </tr>
                  ) : (
                    plans.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-5 text-center font-medium text-slate-400">
                          {idx + 1}.
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-850 dark:text-slate-100">
                          {p.name}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {p.device_type}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200">
                          {p.device_name || '-'}
                        </td>
                        <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-400">
                          {p.device_model || '-'}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 font-semibold">
                          {p.duration} Days
                        </td>
                        <td className="py-4 px-5 font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{parseFloat(String(p.amount)).toFixed(2)}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Plan"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete Plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
              </div>
            ) : plans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No configured plans found.</p>
                <p className="text-xs mt-1 text-slate-400">Click &quot;Add Plan&quot; to create a new plan.</p>
              </div>
            ) : (
              plans.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} Device Plan</span>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{p.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Type</span>
                      <span>{p.device_type}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Device Name</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.device_name || '-'}</span>
                    </div>
                    <div className="mt-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Model</span>
                      <span>{p.device_model || '-'}</span>
                    </div>
                    <div className="mt-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Duration</span>
                      <span>{p.duration} Days</span>
                    </div>
                    <div className="mt-1 col-span-2">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Plan Amount</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{parseFloat(String(p.amount)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* FORM VIEW: SINGLE CARD FOR WHOLE PROCESS */
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">
                {editingPlan ? 'Edit Plan Setup' : 'Create Plan Setup'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Configure subscription pricing and device associations</p>
            </div>
            <Link
              href="/admin/device/setup"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              Manage Devices
            </Link>
          </div>

          {/* SINGLE CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              
              {/* SECTION 1: DEVICE DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs uppercase font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                    Device Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Type <span className="text-red-500">*</span></label>
                    <select
                      value={formDeviceType}
                      onChange={e => {
                        setFormDeviceType(e.target.value)
                        const matchingDev = devices.find(d => d.device_type === e.target.value)
                        if (matchingDev) {
                          setFormDeviceName(matchingDev.name)
                          setFormDeviceModel(matchingDev.model)
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">Select Device Type</option>
                      {deviceTypes.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Select Device (from Device Setup)</label>
                    <select
                      value={formDeviceName}
                      onChange={e => handleDeviceChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose from configured devices or enter below --</option>
                      {filteredFormDevices.map(d => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.model || 'No Model'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GPS Tracker"
                      value={formDeviceName}
                      onChange={e => setFormDeviceName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Model</label>
                    <input
                      type="text"
                      placeholder="e.g. TK103"
                      value={formDeviceModel}
                      onChange={e => setFormDeviceModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Description & Compact Image Column side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Description</label>
                    <textarea
                      placeholder="Enter device or plan details..."
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200 h-28 resize-none"
                    />
                  </div>

                  {/* Compact Device Image Box */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Device Image</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {formImageUrl ? (
                      <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-900 h-28 flex items-center gap-3">
                        <img
                          src={formImageUrl}
                          alt="Device preview"
                          className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                        />
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Image Attached</span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 text-left cursor-pointer"
                          >
                            Change Image
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-300/60 dark:border-indigo-800/60 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/20 h-28 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group"
                      >
                        <UploadCloud className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Click to upload image</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: PLAN DETAILS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs uppercase font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                    Plan Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter Plan Name (e.g. 30 Days GPS Standard Plan)"
                      value={formPlanName}
                      onChange={e => setFormPlanName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Description</label>
                    <input
                      type="text"
                      placeholder="Enter Plan Description"
                      value={formPlanDescription}
                      onChange={e => setFormPlanDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DEVICE PLAN AMOUNT */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">₹</span>
                  <h3 className="text-xs uppercase font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                    Device Plan Amount
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Duration (In Days) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 30, 90, 365"
                      value={formDuration}
                      onChange={e => setFormDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Plan Status</label>
                    <select
                      value={formPlanStatus}
                      onChange={e => setFormPlanStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Amount (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter Amount"
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Tax (In Percentage %)</label>
                    <input
                      type="number"
                      placeholder="e.g. 18"
                      value={formTaxPercent}
                      onChange={e => setFormTaxPercent(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Total Amount (₹)</label>
                    <input
                      type="text"
                      disabled
                      value={`₹${getComputedTotal()}`}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-8 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingForm && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
