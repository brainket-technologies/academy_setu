'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, UploadCloud, X, Bus, Navigation, Truck, UserCheck, CheckCircle2, MapPin, Layers } from 'lucide-react'
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
  oneTime: string
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
  amount?: number
  createdAt: string
}

interface StoppageRateItem {
  id: string | number
  pickupLocation: string
  dropLocation: string
  km: string
  oneTime: string
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
}

interface TransportRoute {
  id: number
  routeName: string
  vehicleName: string
  firstDestination?: string
  lastDestination?: string
}

interface TransportVehicle {
  id: number
  vehicleName: string
  registrationNo: string
  vehicleType?: string
}

interface TransportDriver {
  id: number
  driverName: string
  driverId: string
  assignedVehicle?: string
  contact: string
}

export default function TransportationFeePage() {
  const [feeCharts, setFeeCharts] = useState<FeeChartRecord[]>([])
  const [activeTab, setActiveTab] = useState<'Transportation Fee Chart' | 'Applicable Student' | 'Paid Student' | 'Pending Student'>('Transportation Fee Chart')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRoute, setFilterRoute] = useState('')

  // Transport entities loaded from Transportation menu
  const [routesList, setRoutesList] = useState<TransportRoute[]>([])
  const [vehiclesList, setVehiclesList] = useState<TransportVehicle[]>([])
  const [driversList, setDriversList] = useState<TransportDriver[]>([])

  // Modal State for Add / Edit Multiple Stoppage Fee Rates
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  // Route details
  const [selectedRouteName, setSelectedRouteName] = useState('')
  const [selectedVehicleName, setSelectedVehicleName] = useState('')
  const [selectedDriverName, setSelectedDriverName] = useState('')

  // Multiple Stoppage Items list (Add-on +)
  const [stoppageItems, setStoppageItems] = useState<StoppageRateItem[]>([])

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

    // 2. Load Vehicles from Transportation menu
    const savedVehicles = localStorage.getItem('transport_vehicles')
    if (savedVehicles) {
      try {
        const parsed = JSON.parse(savedVehicles)
        if (Array.isArray(parsed)) setVehiclesList(parsed)
      } catch (e) { console.error(e) }
    }

    // 3. Load Drivers from Transportation menu
    const savedDrivers = localStorage.getItem('transport_drivers')
    if (savedDrivers) {
      try {
        const parsed = JSON.parse(savedDrivers)
        if (Array.isArray(parsed)) setDriversList(parsed)
      } catch (e) { console.error(e) }
    }

    // 4. Load Fee configurations
    const savedFees = localStorage.getItem('transportation_fees')
    if (savedFees) {
      try {
        const parsed = JSON.parse(savedFees)
        if (Array.isArray(parsed)) {
          const normalized: FeeChartRecord[] = parsed.map((item: any) => ({
            id: item.id || Date.now(),
            route: item.route || 'Route 1',
            vehicle: item.vehicle || '—',
            driver: item.driver || '—',
            pickupLocation: item.pickupLocation || item.location || '—',
            dropLocation: item.dropLocation || item.from || 'School Main Gate',
            km: Number(item.km) || 0,
            oneTime: item.oneTime || '-',
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

    // 5. Read student metrics
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

  // Helper to find driver for a vehicle
  const getDriverForVehicle = (vehName: string) => {
    if (!vehName) return ''
    const cleanVeh = vehName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matched = driversList.find(d => {
      if (!d.assignedVehicle) return false
      const cleanAssigned = d.assignedVehicle.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanVeh.includes(cleanAssigned) || cleanAssigned.includes(cleanVeh)
    })
    return matched ? `${matched.driverName} (${matched.contact || matched.driverId})` : ''
  }

  // Get only assigned vehicles for the currently selected route
  const getAvailableVehicles = () => {
    if (!selectedRouteName) return []
    const matchedRoute = routesList.find(
      r => r.routeName.toLowerCase() === selectedRouteName.toLowerCase()
    )
    if (matchedRoute && matchedRoute.vehicleName) {
      return [matchedRoute.vehicleName]
    }
    return []
  }

  // Get only assigned driver for the currently selected vehicle
  const getAvailableDrivers = () => {
    if (!selectedVehicleName) return []
    const driver = getDriverForVehicle(selectedVehicleName)
    if (driver) {
      return [driver]
    }
    return []
  }

  // Cascading Auto-fill on Route Selection
  const handleRouteChange = (routeName: string) => {
    setSelectedRouteName(routeName)
    if (!routeName) {
      setSelectedVehicleName('')
      setSelectedDriverName('')
      return
    }

    const matchedRoute = routesList.find(r => r.routeName.toLowerCase() === routeName.toLowerCase())
    if (matchedRoute) {
      const assignedVeh = matchedRoute.vehicleName || ''
      setSelectedVehicleName(assignedVeh)

      if (assignedVeh) {
        const autoDriver = getDriverForVehicle(assignedVeh)
        setSelectedDriverName(autoDriver)
      } else {
        setSelectedDriverName('')
      }

      // Default drop location for items if empty
      const defaultDrop = matchedRoute.lastDestination || matchedRoute.firstDestination || 'School Main Gate'
      setStoppageItems(prev => prev.map(s => s.dropLocation ? s : { ...s, dropLocation: defaultDrop }))
    } else {
      setSelectedVehicleName('')
      setSelectedDriverName('')
    }
  }

  // Cascading Auto-fill on Vehicle Selection
  const handleVehicleChange = (vehName: string) => {
    setSelectedVehicleName(vehName)
    if (!vehName) {
      setSelectedDriverName('')
      return
    }

    const autoDriver = getDriverForVehicle(vehName)
    setSelectedDriverName(autoDriver)
  }

  const createBlankStoppage = (drop = 'School Main Gate'): StoppageRateItem => ({
    id: Date.now() + Math.random(),
    pickupLocation: '',
    dropLocation: drop,
    km: '',
    oneTime: '',
    monthly: '',
    quarterly: '',
    halfYearly: '',
    yearly: ''
  })

  const handleOpenAdd = () => {
    setEditId(null)
    setSelectedRouteName('')
    setSelectedVehicleName('')
    setSelectedDriverName('')
    setStoppageItems([createBlankStoppage()])
    setModalOpen(true)
  }

  const handleOpenEdit = (item: FeeChartRecord) => {
    setEditId(item.id)
    setSelectedRouteName(item.route || '')
    setSelectedVehicleName(item.vehicle || '')
    setSelectedDriverName(item.driver || '')
    setStoppageItems([{
      id: item.id,
      pickupLocation: item.pickupLocation || '',
      dropLocation: item.dropLocation || 'School Main Gate',
      km: String(item.km || ''),
      oneTime: item.oneTime && item.oneTime !== '-' ? item.oneTime.replace('/-', '').replace('₹', '') : '',
      monthly: item.monthly ? item.monthly.replace('/-', '').replace('₹', '') : (item.amount ? String(item.amount) : ''),
      quarterly: item.quarterly && item.quarterly !== '-' ? item.quarterly.replace('/-', '').replace('₹', '') : '',
      halfYearly: item.halfYearly && item.halfYearly !== '-' ? item.halfYearly.replace('/-', '').replace('₹', '') : '',
      yearly: item.yearly && item.yearly !== '-' ? item.yearly.replace('/-', '').replace('₹', '') : ''
    }])
    setModalOpen(true)
  }

  // Add more stoppage items
  const handleAddStoppageRow = () => {
    const defaultDrop = stoppageItems[0]?.dropLocation || 'School Main Gate'
    setStoppageItems([...stoppageItems, createBlankStoppage(defaultDrop)])
  }

  // Remove a stoppage item
  const handleRemoveStoppageRow = (id: string | number) => {
    if (stoppageItems.length === 1) {
      toast.error('You must configure at least one pickup & drop location.')
      return
    }
    setStoppageItems(stoppageItems.filter(s => s.id !== id))
  }

  // Update a single field on a stoppage item
  const handleUpdateStoppageRow = (id: string | number, field: keyof StoppageRateItem, val: string) => {
    setStoppageItems(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRouteName.trim()) {
      toast.error('Please select a Route.')
      return
    }

    if (stoppageItems.length === 0) {
      toast.error('Please add at least one pickup and drop stoppage location.')
      return
    }

    // Validate all stoppage rows
    for (let i = 0; i < stoppageItems.length; i++) {
      const s = stoppageItems[i]
      if (!s.pickupLocation.trim()) {
        toast.error(`Please enter Pickup Location for Stoppage #${i + 1}`)
        return
      }
      if (!s.dropLocation.trim()) {
        toast.error(`Please enter Drop Location for Stoppage #${i + 1}`)
        return
      }
      if (!s.km || isNaN(Number(s.km)) || Number(s.km) <= 0) {
        toast.error(`Please enter valid Distance (KM) for Stoppage #${i + 1}`)
        return
      }
      if (!s.monthly.trim() && !s.oneTime.trim() && !s.yearly.trim()) {
        toast.error(`Please enter at least one fee rate (e.g. Monthly Rate) for Stoppage #${i + 1}`)
        return
      }
    }

    const now = new Date()
    const todayStr = `${now.toLocaleDateString('en-GB')} @ ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    const formatRate = (val: string) => {
      const trimmed = val.trim()
      if (!trimmed) return '-'
      return trimmed.endsWith('/-') ? trimmed : `${trimmed}/-`
    }

    if (editId) {
      // In edit mode for single item
      const s = stoppageItems[0]
      const updated = feeCharts.map(item => item.id === editId ? {
        ...item,
        route: selectedRouteName.trim(),
        vehicle: selectedVehicleName.trim() || '—',
        driver: selectedDriverName.trim() || '—',
        pickupLocation: s.pickupLocation.trim(),
        dropLocation: s.dropLocation.trim(),
        km: Number(s.km),
        oneTime: formatRate(s.oneTime),
        monthly: formatRate(s.monthly),
        quarterly: formatRate(s.quarterly),
        halfYearly: formatRate(s.halfYearly),
        yearly: formatRate(s.yearly),
        amount: Number(s.monthly.replace(/[^0-9]/g, '')) || Number(s.oneTime.replace(/[^0-9]/g, '')) || 0
      } : item)
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success('Transportation fee rate updated successfully!')
    } else {
      // In Add mode with potentially multiple stoppage locations (+)
      const newRecords: FeeChartRecord[] = stoppageItems.map((s, idx) => ({
        id: Date.now() + idx,
        route: selectedRouteName.trim(),
        vehicle: selectedVehicleName.trim() || '—',
        driver: selectedDriverName.trim() || '—',
        pickupLocation: s.pickupLocation.trim(),
        dropLocation: s.dropLocation.trim(),
        km: Number(s.km),
        oneTime: formatRate(s.oneTime),
        monthly: formatRate(s.monthly),
        quarterly: formatRate(s.quarterly),
        halfYearly: formatRate(s.halfYearly),
        yearly: formatRate(s.yearly),
        amount: Number(s.monthly.replace(/[^0-9]/g, '')) || Number(s.oneTime.replace(/[^0-9]/g, '')) || 0,
        createdAt: todayStr
      }))

      const updated = [...newRecords, ...feeCharts]
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      toast.success(`${newRecords.length} transportation fee rate(s) created successfully!`)
    }

    setModalOpen(false)
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
                Transportation Fee Setup
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Set up multiple pickup & drop stoppage locations with One Time, Monthly, Quarterly, Half-Yearly and Yearly rates
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions & Quick Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Stoppage Fee Rate
          </button>
          <Link 
            href="/institute/transport/route"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            title="Manage Routes in Transportation Menu"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" /> Routes
          </Link>
          <Link 
            href="/institute/transport/vehicle"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            title="Manage Vehicles in Transportation Menu"
          >
            <Truck className="w-3.5 h-3.5 text-purple-600" /> Vehicles
          </Link>
          <Link 
            href="/institute/transport/driver"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            title="Manage Drivers in Transportation Menu"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Drivers
          </Link>
        </div>
      </div>

      {/* Control Actions / Search and Export Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
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

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search pickup, drop, route, vehicle, driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Route filter */}
          {allKnownRoutes.length > 0 && (
            <select
              value={filterRoute}
              onChange={e => setFilterRoute(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                <th className="px-4 py-4 text-left">Vehicle</th>
                <th className="px-4 py-4 text-left">Driver</th>
                <th className="px-4 py-4 text-left">Pickup Location</th>
                <th className="px-4 py-4 text-left">Drop Location</th>
                <th className="px-3 py-4">KM</th>
                <th className="px-3 py-4 text-purple-600">One Time</th>
                <th className="px-3 py-4 text-teal-600">Monthly</th>
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
                  <td className="px-4 py-3.5 text-left font-semibold text-purple-700 dark:text-purple-400">{item.vehicle || '—'}</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-blue-700 dark:text-blue-400">{item.driver || '—'}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">{item.pickupLocation}</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-300">{item.dropLocation}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.km} Km</td>
                  <td className="px-3 py-3.5 font-extrabold text-purple-600 dark:text-purple-400">{item.oneTime || '-'}</td>
                  <td className="px-3 py-3.5 font-extrabold text-teal-600 dark:text-teal-400">{item.monthly || (item.amount ? `₹${item.amount}/-` : '₹0/-')}</td>
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
                  <td colSpan={14} className="py-10 text-center text-slate-400 font-bold">
                    <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No transportation fee rates defined yet. Click "Add Stoppage Fee Rate" to create one.
                  </td>
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

      {/* CREATE / EDIT MULTIPLE STOPPAGE FEE RATES MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-black text-teal-400 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-400" />
                  {editId ? 'Edit Transportation Fee Rate' : 'Setup Route Stoppage Fee Rates'}
                </h3>
                <p className="text-[11px] text-slate-300">
                  Select Route $\rightarrow$ Auto-fills assigned vehicle & driver $\rightarrow$ Add multiple pickup/drop locations with all rate slabs
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden text-xs font-semibold">
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. Route, Vehicle & Driver Selection Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Route Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-teal-600" /> Route Name <span className="text-red-500">*</span>
                    </label>
                    {routesList.length > 0 ? (
                      <select 
                        value={selectedRouteName}
                        onChange={e => handleRouteChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="">-- Select Route --</option>
                        {routesList.map(r => (
                          <option key={r.id} value={r.routeName}>{r.routeName}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={selectedRouteName}
                        onChange={e => setSelectedRouteName(e.target.value)}
                        placeholder="e.g. Route 1 - Delhi to Noida"
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    )}
                  </div>

                  {/* Assigned Vehicle (Auto-filled & filtered for the route) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-purple-600" /> Assigned Vehicle
                    </label>
                    {(() => {
                      const availableVehicles = getAvailableVehicles()
                      return (
                        <select 
                          value={selectedVehicleName}
                          onChange={e => handleVehicleChange(e.target.value)}
                          disabled={!selectedRouteName}
                          className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 cursor-pointer"
                        >
                          {!selectedRouteName ? (
                            <option value="">-- Select Route first --</option>
                          ) : availableVehicles.length > 0 ? (
                            <>
                              <option value="">-- Select Vehicle --</option>
                              {availableVehicles.map((v, idx) => (
                                <option key={idx} value={v}>{v}</option>
                              ))}
                            </>
                          ) : (
                            <option value="">No vehicle assigned to this route</option>
                          )}
                        </select>
                      )
                    })()}
                  </div>

                  {/* Assigned Driver (Auto-filled & filtered for the vehicle) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Assigned Driver
                    </label>
                    {(() => {
                      const availableDrivers = getAvailableDrivers()
                      return (
                        <select 
                          value={selectedDriverName}
                          onChange={e => setSelectedDriverName(e.target.value)}
                          disabled={!selectedVehicleName}
                          className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 cursor-pointer"
                        >
                          {!selectedVehicleName ? (
                            <option value="">-- Select Vehicle first --</option>
                          ) : availableDrivers.length > 0 ? (
                            <>
                              <option value="">-- Select Driver --</option>
                              {availableDrivers.map((d, idx) => (
                                <option key={idx} value={d}>{d}</option>
                              ))}
                            </>
                          ) : (
                            <option value="">No driver assigned to this vehicle</option>
                          )}
                        </select>
                      )
                    })()}
                  </div>

                </div>

                {/* 2. Multiple Pickup & Drop Stoppage Location Cards (+) */}
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Pickup, Drop & Rate Slabs ({stoppageItems.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Configure multiple stoppage points with individual fee rates</span>
                  </div>

                  {stoppageItems.map((stoppage, index) => (
                    <div 
                      key={stoppage.id}
                      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 relative animate-in slide-in-from-top-2 duration-200"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                          Stoppage Point #{index + 1}
                        </span>

                        {stoppageItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStoppageRow(stoppage.id)}
                            className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                            title="Remove Stoppage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Pickup Location, Drop Location & Distance */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Pickup Location <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            value={stoppage.pickupLocation}
                            onChange={e => handleUpdateStoppageRow(stoppage.id, 'pickupLocation', e.target.value)}
                            placeholder="e.g. Sector 1 Market Crossing"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Drop Location <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            value={stoppage.dropLocation}
                            onChange={e => handleUpdateStoppageRow(stoppage.id, 'dropLocation', e.target.value)}
                            placeholder="e.g. School Main Gate"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-700 dark:text-slate-300 font-bold">
                            Distance (KM) <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="number" 
                            value={stoppage.km}
                            onChange={e => handleUpdateStoppageRow(stoppage.id, 'km', e.target.value)}
                            placeholder="e.g. 12"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 text-center"
                            required
                          />
                        </div>
                      </div>

                      {/* Fee Slabs Table */}
                      <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="text-[11px] font-black text-teal-700 dark:text-teal-400">
                            💰 Fee Slabs (INR ₹)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              One Time Fee
                            </label>
                            <input 
                              type="number" 
                              value={stoppage.oneTime}
                              onChange={e => handleUpdateStoppageRow(stoppage.id, 'oneTime', e.target.value)}
                              placeholder="e.g. 1000"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-purple-600 outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              Monthly Rate *
                            </label>
                            <input 
                              type="number" 
                              value={stoppage.monthly}
                              onChange={e => handleUpdateStoppageRow(stoppage.id, 'monthly', e.target.value)}
                              placeholder="e.g. 500"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-teal-600 outline-none focus:ring-2 focus:ring-teal-500"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              Quarterly Rate
                            </label>
                            <input 
                              type="number" 
                              value={stoppage.quarterly}
                              onChange={e => handleUpdateStoppageRow(stoppage.id, 'quarterly', e.target.value)}
                              placeholder="e.g. 1500"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              Half Yearly Rate
                            </label>
                            <input 
                              type="number" 
                              value={stoppage.halfYearly}
                              onChange={e => handleUpdateStoppageRow(stoppage.id, 'halfYearly', e.target.value)}
                              placeholder="e.g. 3000"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              Yearly Rate
                            </label>
                            <input 
                              type="number" 
                              value={stoppage.yearly}
                              onChange={e => handleUpdateStoppageRow(stoppage.id, 'yearly', e.target.value)}
                              placeholder="e.g. 6000"
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}

                  {/* Add on + Button */}
                  {!editId && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={handleAddStoppageRow}
                        className="flex items-center gap-2 px-6 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl font-black text-xs transition-all shadow-sm active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Add Another Pickup & Drop Location (+)
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  {editId ? 'Update Fee Rate' : `Save All Fee Rates (${stoppageItems.length})`}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
