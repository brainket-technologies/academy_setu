'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, UploadCloud, X, Bus, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export interface FeeChartRecord {
  id: number
  route: string
  from: string
  location: string
  km: number
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
  amount?: number
  createdAt: string
}

export default function TransportationFeePage() {
  const [feeCharts, setFeeCharts] = useState<FeeChartRecord[]>([])
  const [activeTab, setActiveTab] = useState<'Transportation Fee Chart' | 'Applicable Student' | 'Paid Student' | 'Pending Student'>('Transportation Fee Chart')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRoute, setFilterRoute] = useState('')

  // Modal State for Add / Edit Stoppage Fee
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<FeeChartRecord | null>(null)
  const [routeInput, setRouteInput] = useState('')
  const [fromInput, setFromInput] = useState('School Main Gate')
  const [locationInput, setLocationInput] = useState('')
  const [kmInput, setKmInput] = useState('')

  // Duration fee inputs
  const [monthlyInput, setMonthlyInput] = useState('')
  const [quarterlyInput, setQuarterlyInput] = useState('')
  const [halfYearlyInput, setHalfYearlyInput] = useState('')
  const [yearlyInput, setYearlyInput] = useState('')

  // Route options
  const [routeOptionsList, setRouteOptionsList] = useState<string[]>([])

  // Dynamic metric counts
  const [applicableCount, setApplicableCount] = useState(0)
  const [paidCount, setPaidCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('transportation_fees')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy entries
          const clean = parsed.filter((item: any) => 
            !['Sector 1 Market Crossing', 'Sector 5 Metro Station', 'Civil Lines Bus Stand', 'Model Town Square'].includes(item.location)
          )
          if (clean.length !== parsed.length) {
            localStorage.setItem('transportation_fees', JSON.stringify(clean))
          }
          setFeeCharts(clean)
        }
      } catch (e) {
        setFeeCharts([])
      }
    }

    // Load available routes from transport_routes if any
    const savedRoutes = localStorage.getItem('transport_routes')
    if (savedRoutes) {
      try {
        const list = JSON.parse(savedRoutes)
        if (Array.isArray(list) && list.length > 0) {
          const names = list.map((r: any) => r.vehicleName ? `${r.routeName || r.name} (${r.vehicleName})` : (r.routeName || r.name)).filter(Boolean)
          if (names.length > 0) {
            setRouteOptionsList(Array.from(new Set(names)))
          }
        }
      } catch (e) {}
    }

    // Read real student metrics
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

  const handleOpenAdd = () => {
    setEditItem(null)
    setRouteInput(routeOptionsList[0] || 'Route 1')
    setFromInput('School Main Gate')
    setLocationInput('')
    setKmInput('')
    setMonthlyInput('')
    setQuarterlyInput('')
    setHalfYearlyInput('')
    setYearlyInput('')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: FeeChartRecord) => {
    setEditItem(item)
    setRouteInput(item.route || 'Route 1')
    setFromInput(item.from || 'School Main Gate')
    setLocationInput(item.location)
    setKmInput(String(item.km || ''))
    setMonthlyInput(item.monthly || (item.amount ? String(item.amount) : ''))
    setQuarterlyInput(item.quarterly || '')
    setHalfYearlyInput(item.halfYearly || '')
    setYearlyInput(item.yearly || '')
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationInput.trim()) {
      toast.error('Please enter Pickup / Stoppage Location.')
      return
    }
    if (!kmInput || isNaN(Number(kmInput)) || Number(kmInput) <= 0) {
      toast.error('Please enter a valid KM distance.')
      return
    }
    if (!monthlyInput.trim()) {
      toast.error('Please enter Monthly Fee amount.')
      return
    }

    const now = new Date()
    const todayStr = `${now.toLocaleDateString('en-GB')} @ ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    const formattedMonthly = monthlyInput.trim().endsWith('/-') ? monthlyInput.trim() : `${monthlyInput.trim()}/-`
    const formattedQuarterly = quarterlyInput.trim() ? (quarterlyInput.trim().endsWith('/-') ? quarterlyInput.trim() : `${quarterlyInput.trim()}/-`) : ''
    const formattedHalfYearly = halfYearlyInput.trim() ? (halfYearlyInput.trim().endsWith('/-') ? halfYearlyInput.trim() : `${halfYearlyInput.trim()}/-`) : ''
    const formattedYearly = yearlyInput.trim() ? (yearlyInput.trim().endsWith('/-') ? yearlyInput.trim() : `${yearlyInput.trim()}/-`) : ''

    if (editItem) {
      const updated = feeCharts.map(item => item.id === editItem.id ? {
        ...item,
        route: routeInput.trim(),
        from: fromInput.trim(),
        location: locationInput.trim(),
        km: Number(kmInput),
        monthly: formattedMonthly,
        quarterly: formattedQuarterly,
        halfYearly: formattedHalfYearly,
        yearly: formattedYearly,
        amount: Number(monthlyInput.replace(/[^0-9]/g, '')) || 0
      } : item)
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success('Transportation stoppage fee updated successfully!')
    } else {
      const newItem: FeeChartRecord = {
        id: Date.now(),
        route: routeInput.trim() || 'Route 1',
        from: fromInput.trim() || 'School Main Gate',
        location: locationInput.trim(),
        km: Number(kmInput),
        monthly: formattedMonthly,
        quarterly: formattedQuarterly,
        halfYearly: formattedHalfYearly,
        yearly: formattedYearly,
        amount: Number(monthlyInput.replace(/[^0-9]/g, '')) || 0,
        createdAt: todayStr
      }
      const updated = [newItem, ...feeCharts]
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success('New transportation stoppage fee created successfully!')
    }

    setModalOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this stoppage fee configuration?')) {
      const updated = feeCharts.filter(f => f.id !== id)
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success('Fee configuration deleted successfully!')
    }
  }

  const filtered = feeCharts.filter(f => {
    const matchesSearch = f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.route || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRoute = !filterRoute || f.route === filterRoute
    return matchesSearch && matchesRoute
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <Bus className="w-7 h-7 text-teal-600" /> Transportation Fee
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure pickup location distances, route mapping and student monthly/quarterly/yearly fee rates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Stoppage Fee Rate
          </button>
          <Link 
            href="/institute/transport/route/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Navigation className="w-4 h-4" /> Setup New Route
          </Link>
        </div>
      </div>

      {/* Control Actions / Search and Export Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(['Transportation Fee Chart', 'Applicable Student', 'Paid Student', 'Pending Student'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search by Stoppage or Route..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />
          </div>

          <button 
            type="button"
            onClick={() => toast.success('Exporting transportation fee chart sheets...')}
            className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
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

      {/* Table grid listing */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-4 py-4 text-left">Route</th>
                <th className="px-4 py-4 text-left">From</th>
                <th className="px-4 py-4 text-left">Pickup / Stoppage Location</th>
                <th className="px-3 py-4">KM</th>
                <th className="px-3 py-4">Monthly</th>
                <th className="px-3 py-4">Quarterly</th>
                <th className="px-3 py-4">Half Yearly</th>
                <th className="px-3 py-4">Yearly</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-3 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-teal-700 dark:text-teal-400">{item.route}</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-slate-500 dark:text-slate-400">{item.from}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">{item.location}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.km} Km</td>
                  <td className="px-3 py-3.5 font-extrabold text-teal-600 dark:text-teal-400">{item.monthly || (item.amount ? `${item.amount}/-` : '0/-')}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.quarterly || '-'}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.halfYearly || '-'}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.yearly || '-'}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">{item.createdAt}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-200 transition-colors"
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
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-bold">No transportation stoppage rates defined.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of {filtered.length} Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* CREATE / EDIT STOPPAGE FEE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-teal-400">
                  {editItem ? 'Edit Stoppage Fee Rate' : 'Add Stoppage Fee Rate'}
                </h3>
                <p className="text-[11px] text-slate-300">Configure route, pickup location, distance & monthly to yearly rates</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Route Name <span className="text-red-500">*</span></label>
                {routeOptionsList.length > 0 ? (
                  <select 
                    value={routeInput}
                    onChange={e => setRouteInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {routeOptionsList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={routeInput}
                    onChange={e => setRouteInput(e.target.value)}
                    placeholder="e.g. Route 1 (Bus 01)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">From Location</label>
                  <input 
                    type="text" 
                    value={fromInput}
                    onChange={e => setFromInput(e.target.value)}
                    placeholder="e.g. School Main Gate"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Distance (KM) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={kmInput}
                    onChange={e => setKmInput(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pickup / Stoppage Location <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  placeholder="e.g. Sector 1 Market Crossing"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Fee Duration Breakdown (Monthly to Yearly) */}
              <div className="pt-2">
                <label className="text-xs font-black text-teal-700 dark:text-teal-400 block mb-2 uppercase tracking-wider">Fee Breakdown (Monthly to Yearly)</label>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Monthly Fee (₹) *</label>
                    <input 
                      type="text" 
                      value={monthlyInput}
                      onChange={e => setMonthlyInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Quarterly Fee (₹)</label>
                    <input 
                      type="text" 
                      value={quarterlyInput}
                      onChange={e => setQuarterlyInput(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Half Yearly Fee (₹)</label>
                    <input 
                      type="text" 
                      value={halfYearlyInput}
                      onChange={e => setHalfYearlyInput(e.target.value)}
                      placeholder="e.g. 3000"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Yearly Fee (₹)</label>
                    <input 
                      type="text" 
                      value={yearlyInput}
                      onChange={e => setYearlyInput(e.target.value)}
                      placeholder="e.g. 6000"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20"
                >
                  {editItem ? 'Update Fee Rate' : 'Save Stoppage Fee'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
