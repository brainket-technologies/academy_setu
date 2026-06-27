'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Plus, Edit, Trash2, X, Search, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

interface DevicePlan {
  id: string
  name: string
  duration_type: string
  duration: number
  amount: number
  tax_percent: number
  total_amount: number
  status: string
  brand: string
  device_type: string
  device_name: string
  imei_no: string
  description: string
  plan_description: string
  image_url: string
  created_at: string
}

interface BrandItem {
  id: string
  name: string
}

interface TypeItem {
  id: string
  name: string
}

export default function PlanSetupPage() {
  const [plans, setPlans] = useState<DevicePlan[]>([])
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [deviceTypes, setDeviceTypes] = useState<TypeItem[]>([])
  const [loading, setLoading] = useState(true)

  // View toggle: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingPlan, setEditingPlan] = useState<DevicePlan | null>(null)

  // Filter & Search states (List View)
  const [filterBrand, setFilterBrand] = useState('')
  const [filterDeviceType, setFilterDeviceType] = useState('')
  const [searchText, setSearchText] = useState('')

  // Add Brand/Type Modal state
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [modalTab, setModalTab] = useState<'brand' | 'type'>('brand')
  const [newItemName, setNewItemName] = useState('')
  const [savingItem, setSavingItem] = useState(false)

  // Form Fields (Create/Edit View)
  const [formBrand, setFormBrand] = useState('')
  const [formDeviceType, setFormDeviceType] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDeviceName, setFormDeviceName] = useState('')
  const [formImeiNo, setFormImeiNo] = useState('')
  const [formPlanName, setFormPlanName] = useState('')
  const [formPlanDescription, setFormPlanDescription] = useState('')
  const [formDurationType, setFormDurationType] = useState('Days')
  const [formDuration, setFormDuration] = useState('')
  const [formPlanStatus, setFormPlanStatus] = useState('Active')
  const [formAmount, setFormAmount] = useState('')
  const [formTaxPercent, setFormTaxPercent] = useState('18')
  const [submittingForm, setSubmittingForm] = useState(false)

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/brands')
      const data = await res.json()
      if (data.success) {
        setBrands(data.data)
        if (data.data.length > 0 && !formBrand) setFormBrand(data.data[0].name)
      }
    } catch (err) {
      console.error(err)
    }
  }, [formBrand])

  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/device/types')
      const data = await res.json()
      if (data.success) {
        setDeviceTypes(data.data)
        if (data.data.length > 0 && !formDeviceType) setFormDeviceType(data.data[0].name)
      }
    } catch (err) {
      console.error(err)
    }
  }, [formDeviceType])

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterBrand) params.append('brand', filterBrand)
      if (filterDeviceType) params.append('deviceType', filterDeviceType)
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
      setLoading(false)
    }
  }, [filterBrand, filterDeviceType, searchText])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  useEffect(() => {
    fetchBrands()
    fetchTypes()
  }, [fetchBrands, fetchTypes])

  const handleOpenCreate = () => {
    setEditingPlan(null)
    setFormBrand(brands[0]?.name || '')
    setFormDeviceType(deviceTypes[0]?.name || '')
    setFormDescription('')
    setFormDeviceName('Device 1')
    setFormImeiNo('1234567890')
    setFormPlanName('')
    setFormPlanDescription('')
    setFormDurationType('Days')
    setFormDuration('30')
    setFormPlanStatus('Active')
    setFormAmount('2000')
    setFormTaxPercent('18')
    setView('create')
  }

  const handleOpenEdit = (plan: DevicePlan) => {
    setEditingPlan(plan)
    setFormBrand(plan.brand)
    setFormDeviceType(plan.device_type)
    setFormDescription(plan.description || '')
    setFormDeviceName(plan.device_name || 'Device 1')
    setFormImeiNo(plan.imei_no || '1234567890')
    setFormPlanName(plan.name)
    setFormPlanDescription(plan.plan_description || '')
    setFormDurationType(plan.duration_type)
    setFormDuration(String(plan.duration))
    setFormPlanStatus(plan.status)
    setFormAmount(String(plan.amount))
    setFormTaxPercent(String(plan.tax_percent))
    setView('edit')
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    try {
      const res = await fetch(`/api/admin/device/plans/${planId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan deleted successfully')
        fetchPlans()
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
    if (!formDuration) return toast.error('Duration is required')
    if (!formAmount) return toast.error('Amount is required')

    setSubmittingForm(true)
    try {
      const url = editingPlan ? `/api/admin/device/plans/${editingPlan.id}` : '/api/admin/device/plans'
      const method = editingPlan ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formPlanName,
          duration_type: formDurationType,
          duration: parseInt(formDuration),
          amount: parseFloat(formAmount),
          tax_percent: parseFloat(formTaxPercent),
          status: formPlanStatus,
          brand: formBrand,
          device_type: formDeviceType,
          device_name: formDeviceName,
          imei_no: formImeiNo,
          description: formDescription,
          plan_description: formPlanDescription
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingPlan ? 'Plan updated successfully!' : 'Plan configured successfully!')
        setView('list')
        fetchPlans()
      } else {
        toast.error(data.error || 'Failed to save plan config')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingForm(false)
    }
  }

  const handleAddBrandOrType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return toast.error('Name is required')

    setSavingItem(true)
    try {
      const endpoint = modalTab === 'brand' ? '/api/admin/device/brands' : '/api/admin/device/types'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`New ${modalTab === 'brand' ? 'Brand' : 'Device Type'} added!`)
        setNewItemName('')
        setShowBrandModal(false)
        fetchBrands()
        fetchTypes()
      } else {
        toast.error(data.error || 'Failed to add item')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSavingItem(false)
    }
  }

  // Calculate total amount (amount + tax) dynamically
  const getComputedTotal = () => {
    const amt = parseFloat(formAmount) || 0
    const tax = parseFloat(formTaxPercent) || 0
    return (amt + (amt * (tax / 100))).toFixed(2)
  }

  return (
    <AdminLayout>
      {view === 'list' ? (
        /* LIST VIEW: All Plan Dashboard */
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
            <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">All Plan</h1>
            <button
              onClick={handleOpenCreate}
              className="p-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              title="Add New Plan Setup"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filters card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
            <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                  <select
                    value={filterBrand}
                    onChange={e => setFilterBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Type</label>
                  <select
                    value={filterDeviceType}
                    onChange={e => setFilterDeviceType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select an Option</option>
                    {deviceTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative w-80 mt-6">
                <input
                  type="text"
                  placeholder="Search by Device Name, Serial no, IMEI no."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none dark:text-slate-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-5 text-center w-16">S.No.</th>
                  <th className="py-4 px-5">Device Name</th>
                  <th className="py-4 px-5">IMEI No.</th>
                  <th className="py-4 px-5">Brand</th>
                  <th className="py-4 px-5">Device Type</th>
                  <th className="py-4 px-5 text-center">Image</th>
                  <th className="py-4 px-5">Plan Duration</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-755 dark:text-slate-300 font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-650" />
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No configured plans found matching criteria.
                    </td>
                  </tr>
                ) : (
                  plans.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-4 px-5 text-center text-slate-400">
                        {idx + 1}.
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-850 dark:text-slate-200">
                        {p.device_name}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-400">
                        {p.imei_no}
                      </td>
                      <td className="py-4 px-5">
                        {p.brand}
                      </td>
                      <td className="py-4 px-5">
                        {p.device_type}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase">
                            IMG
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold">
                        {p.duration} {p.duration_type}
                      </td>
                      <td className="py-4 px-5 font-bold text-teal-650 dark:text-teal-400">
                        ₹{parseFloat(String(p.amount)).toFixed(2)}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-550 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            ) : plans.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No configured plans found matching criteria.
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
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{p.device_name}</h4>
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
                        className="p-2 bg-red-50 text-red-550 rounded-xl cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Brand</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.brand}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Type</span>
                      <span>{p.device_type}</span>
                    </div>
                    <div className="mt-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">IMEI No.</span>
                      <span>{p.imei_no}</span>
                    </div>
                    <div className="mt-1">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Duration</span>
                      <span>{p.duration} {p.duration_type}</span>
                    </div>
                    <div className="mt-1 col-span-2">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Plan Amount</span>
                      <span className="text-teal-655 dark:text-teal-400 font-bold">₹{parseFloat(String(p.amount)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* FORM VIEW: Recharge Plan Setup Creation/Edit */
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
            <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Plan Setup</h1>
            <button
              onClick={() => {
                setShowBrandModal(true)
                setModalTab('brand')
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Device Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                Device Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Brand</label>
                  <select
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Device Type</label>
                  <select
                    value={formDeviceType}
                    onChange={e => setFormDeviceType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Device Type</option>
                    {deviceTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <textarea
                  placeholder="Lorem ipsum"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200 h-24"
                />
              </div>

              {/* Upload image box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Device Image</label>
                <div className="border-2 border-dashed border-teal-500/25 rounded-2xl bg-teal-50/5 py-8 flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="w-8 h-8 text-teal-600" />
                  <span className="text-xs font-bold text-slate-400">Browser or Desktop</span>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                Plan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Plan Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Plan Name"
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
                    placeholder="Enter Description"
                    value={formPlanDescription}
                    onChange={e => setFormPlanDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Device Plan Amount */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                Device Plan Amount
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Plan Duration Type</label>
                  <select
                    value={formDurationType}
                    onChange={e => setFormDurationType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="Days">Days</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Plan Duration (In Days) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="Enter Duration"
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Amount <span className="text-red-500">*</span></label>
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
                  <label className="text-xs font-bold text-slate-500">Tax (In Percentage)</label>
                  <input
                    type="number"
                    placeholder="Enter Value"
                    value={formTaxPercent}
                    onChange={e => setFormTaxPercent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Total Amount</label>
                  <input
                    type="text"
                    disabled
                    value={getComputedTotal()}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Cancel & Save Buttons */}
            <div className="flex justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-8 py-2.5 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingForm}
                className="px-8 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingForm && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Brand / Device Type Modal Dialog */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowBrandModal(false)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setShowBrandModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tabs */}
            <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl m-6 border border-slate-100 dark:border-slate-750">
              <button
                type="button"
                onClick={() => setModalTab('brand')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  modalTab === 'brand' 
                    ? 'bg-teal-650 text-white shadow' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Add Brand
              </button>
              <button
                type="button"
                onClick={() => setModalTab('type')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  modalTab === 'type' 
                    ? 'bg-teal-650 text-white shadow' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Add Device Type
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleAddBrandOrType} className="px-6 pb-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 dark:text-slate-400">
                  {modalTab === 'brand' ? 'Brand name' : 'Device type name'}
                </label>
                <input
                  type="text"
                  placeholder={modalTab === 'brand' ? 'Enter Brand Name' : 'Enter Device Type Name'}
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-400 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="flex-1 py-2 bg-teal-650 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
