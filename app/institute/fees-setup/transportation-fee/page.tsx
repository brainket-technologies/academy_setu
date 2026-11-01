'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Trash2, UploadCloud, X, Bus, Navigation, Truck, UserCheck, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export interface FeeChartRecord {
  id: number
  route: string
  vehicle: string
  driver: string
  pickupLocation: string
  dropLocation: string
  km: number
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
  amount?: number
  createdAt: string
}

interface TransportRoute {
  id: number
  routeName: string
  vehicleName: string
  firstDestination?: string
  lastDestination?: string
}

export default function TransportationFeePage() {
  const [feeCharts, setFeeCharts] = useState<FeeChartRecord[]>([])
  const [activeTab, setActiveTab] = useState<'Transportation Fee Chart' | 'Applicable Student' | 'Paid Student' | 'Pending Student'>('Transportation Fee Chart')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRoute, setFilterRoute] = useState('')

  // Transport entities loaded from Transportation menu
  const [routesList, setRoutesList] = useState<TransportRoute[]>([])

  // Modal State for ONLY UPDATING Fee Rates
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FeeChartRecord | null>(null)
  
  // Fee rate values for editing
  const [editMonthly, setEditMonthly] = useState('')
  const [editQuarterly, setEditQuarterly] = useState('')
  const [editHalfYearly, setEditHalfYearly] = useState('')
  const [editYearly, setEditYearly] = useState('')

  // Dynamic metric counts
  const [applicableCount, setApplicableCount] = useState(0)
  const [paidCount, setPaidCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  // Load data on mount
  useEffect(() => {
    // 1. Load Routes from Transportation menu
    const savedRoutes = localStorage.getItem('transport_routes')
    if (savedRoutes) {
      try {
        const parsed = JSON.parse(savedRoutes)
        if (Array.isArray(parsed)) setRoutesList(parsed)
      } catch (e) { console.error(e) }
    }

    // 2. Load Fee configurations
    const savedFees = localStorage.getItem('transportation_fees')
    if (savedFees) {
      try {
        const parsed = JSON.parse(savedFees)
        if (Array.isArray(parsed)) {
          const normalized: FeeChartRecord[] = parsed.map((item: any) => ({
            id: item.id || Date.now(),
            route: item.route || item.routeName || 'Route 1',
            vehicle: item.vehicle || item.vehicleName || '—',
            driver: item.driver || item.driverName || '—',
            pickupLocation: item.pickupLocation || item.location || '—',
            dropLocation: item.dropLocation || item.from || 'School Main Gate',
            km: Number(item.km) || 0,
            monthly: item.monthly || (item.amount ? `₹${item.amount}/-` : '₹0/-'),
            quarterly: item.quarterly || '-',
            halfYearly: item.halfYearly || '-',
            yearly: item.yearly || '-',
            amount: item.amount || Number(String(item.monthly || '').replace(/[^0-9]/g, '')) || 0,
            createdAt: item.createdAt || new Date().toLocaleDateString('en-GB')
          }))
          setFeeCharts(normalized)
        }
      } catch (e) {
        setFeeCharts([])
      }
    }

    // 3. Read student metrics
    const savedStudents = localStorage.getItem('school_students') || localStorage.getItem('school_institute_students')
    if (savedStudents) {
      try {
        const list = JSON.parse(savedStudents)
        if (Array.isArray(list)) {
          const applicable = list.filter((s: any) => s.transRoute || s.transFee || s.transStoppage)
          const paid = applicable.filter((s: any) => s.transFeeStatus === 'Paid')
          const pending = applicable.filter((s: any) => s.transFeeStatus !== 'Paid')
          setApplicableCount(applicable.length)
          setPaidCount(paid.length)
          setPendingCount(pending.length)
        }
      } catch (e) {}
    }
  }, [])

  // Open Edit Fee Rates Modal
  const handleOpenEdit = (f: FeeChartRecord) => {
    setEditingRecord(f)
    setEditMonthly(f.monthly?.replace(/[^0-9]/g, '') || String(f.amount || ''))
    setEditQuarterly(f.quarterly?.replace(/[^0-9]/g, '') || '')
    setEditHalfYearly(f.halfYearly?.replace(/[^0-9]/g, '') || '')
    setEditYearly(f.yearly?.replace(/[^0-9]/g, '') || '')
    setEditModalOpen(true)
  }

  // Save Updated Fee Rates (Only fee rates updated)
  const handleSaveFeeUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    if (!editMonthly.trim()) {
      toast.error('Please enter Monthly Fee Rate')
      return
    }

    const formatRate = (val: string) => {
      const num = Number(val.replace(/[^0-9]/g, ''))
      return num > 0 ? `₹${num}/-` : '-'
    }

    const updated = feeCharts.map(item => item.id === editingRecord.id ? {
      ...item,
      monthly: formatRate(editMonthly),
      quarterly: formatRate(editQuarterly),
      halfYearly: formatRate(editHalfYearly),
      yearly: formatRate(editYearly),
      amount: Number(editMonthly.replace(/[^0-9]/g, '')) || 0
    } : item)

    setFeeCharts(updated)
    localStorage.setItem('transportation_fees', JSON.stringify(updated))
    toast.success('Transportation fee rates updated successfully!')
    setEditModalOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this transportation fee rate?')) {
      const updated = feeCharts.filter(f => f.id !== id)
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success('Fee rate deleted successfully!')
    }
  }

  const filtered = feeCharts.filter(f => {
    const matchesSearch = f.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dropLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.driver.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRoute = !filterRoute || f.route === filterRoute
    return matchesSearch && matchesRoute
  })

  const allKnownRoutes = Array.from(new Set([...routesList.map(r => r.routeName), ...feeCharts.map(f => f.route)].filter(Boolean)))

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
                Transportation Fee Rates
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                View and update pickup & drop stoppage fee rates (Monthly, Quarterly, Half-Yearly, and Yearly). Routes and stoppages are configured in the Route menu.
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions & Route Setup Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            href="/institute/transport/route"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
            title="Create and Configure Routes with Stoppages"
          >
            <Navigation className="w-4 h-4" />
            <span>Manage Routes & Stoppages</span>
          </Link>
          <Link 
            href="/institute/transport/vehicle"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            title="Manage Vehicles"
          >
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Vehicles</span>
          </Link>
          <Link 
            href="/institute/transport/driver"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            title="Manage Drivers"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Drivers</span>
          </Link>
        </div>
      </div>

      {/* Primary Tab Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        
        {/* Tab pill selectors */}
        <div className="flex gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800 rounded-2xl w-fit flex-wrap">
          {(['Transportation Fee Chart', 'Applicable Student', 'Paid Student', 'Pending Student'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-teal-600 text-white font-black shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Global Route and Keyword filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search stoppage, route, vehicle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {allKnownRoutes.length > 0 && (
            <select
              value={filterRoute}
              onChange={e => setFilterRoute(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="">All Routes</option>
              {allKnownRoutes.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          <button 
            type="button"
            onClick={() => toast.success('Exporting transportation fee chart sheets...')}
            className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 shrink-0 cursor-pointer"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Metric Badges row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Transportation Fee Chart</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{feeCharts.length}</span>
          </div>
          <span className="text-2xl">📊</span>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">Applicable Student</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{applicableCount}</span>
          </div>
          <span className="text-2xl">👥</span>
        </div>

        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Paid Student</span>
            <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1 block">{paidCount}</span>
          </div>
          <span className="text-2xl">💳</span>
        </div>

        <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-300 block">Pending Student</span>
            <span className="text-xl font-black text-red-500 dark:text-red-400 mt-1 block">{pendingCount}</span>
          </div>
          <span className="text-2xl">⚠️</span>
        </div>
      </div>

      {/* Table grid listing - NO ONE TIME FEE COLUMN */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-4 py-4 text-left">Route</th>
                <th className="px-4 py-4 text-left">Vehicle</th>
                <th className="px-4 py-4 text-left">Driver</th>
                <th className="px-4 py-4 text-left">Pickup / Drop Location</th>
                <th className="px-3 py-4">KM</th>
                <th className="px-3 py-4 text-teal-600">Monthly Rate</th>
                <th className="px-3 py-4">Quarterly Rate</th>
                <th className="px-3 py-4">Half Yearly Rate</th>
                <th className="px-3 py-4">Yearly Rate</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-teal-700 dark:text-teal-400">{item.route}</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-purple-700 dark:text-purple-400">{item.vehicle || '—'}</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-blue-700 dark:text-blue-400">{item.driver || '—'}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">
                    {item.pickupLocation === item.dropLocation || !item.dropLocation || item.dropLocation === '-' ? (
                      item.pickupLocation
                    ) : (
                      <span>{item.pickupLocation} <span className="text-teal-600 font-bold">→</span> {item.dropLocation}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.km} Km</td>
                  <td className="px-3 py-3.5 font-extrabold text-teal-600 dark:text-teal-400">{item.monthly || (item.amount ? `₹${item.amount}/-` : '₹0/-')}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.quarterly || '-'}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.halfYearly || '-'}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.yearly || '-'}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">{item.createdAt}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors font-bold text-[11px] cursor-pointer"
                        title="Update Fee Rates"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Update Fee</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        title="Delete Fee Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-bold">
                    <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No transportation fee rates found. Create routes and stoppages in the Route menu to establish fee rates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ================================== UPDATE FEE RATES MODAL (NO ONE TIME FEE) ================================== */}
      {editModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveFeeUpdate}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-[#0f766e] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Update Stoppage Fee Rates</h3>
                  <p className="text-[11px] text-teal-100">Update monthly, quarterly, and annual slabs for this route stoppage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stoppage Context Info (Read-only summary) */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Route</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{editingRecord.route}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Vehicle</span>
                  <span className="font-bold text-purple-700 dark:text-purple-400">{editingRecord.vehicle || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Driver</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{editingRecord.driver || '—'}</span>
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Pickup / Drop Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {editingRecord.pickupLocation === editingRecord.dropLocation || !editingRecord.dropLocation || editingRecord.dropLocation === '-'
                      ? editingRecord.pickupLocation
                      : `${editingRecord.pickupLocation} → ${editingRecord.dropLocation}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Distance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{editingRecord.km} KM</span>
                </div>
              </div>

              {/* Fee Slabs Update Inputs (NO ONE TIME FEE) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Fee Slabs (INR ₹)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Monthly Rate (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={editMonthly}
                      onChange={e => setEditMonthly(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-teal-600 outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Quarterly Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={editQuarterly}
                      onChange={e => setEditQuarterly(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Half Yearly Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={editHalfYearly}
                      onChange={e => setEditHalfYearly(e.target.value)}
                      placeholder="e.g. 3000"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Yearly Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={editYearly}
                      onChange={e => setEditYearly(e.target.value)}
                      placeholder="e.g. 6000"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Update Fee Rates
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
