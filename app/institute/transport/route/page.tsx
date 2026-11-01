'use client'

import React, { useState, useEffect } from 'react'
import {
  Search, Plus, Pencil, Trash2, X, UploadCloud, CheckCircle2,
  Navigation, Truck, UserCheck, MapPin, Layers, Bus
} from 'lucide-react'
import Link from 'next/link'

export interface StoppageRateItem {
  id: string | number
  pickupLocation: string
  dropLocation: string
  km: string
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
}

export interface RouteRecord {
  id: number
  routeName: string
  vehicleName: string
  driverName?: string
  firstDestination?: string
  lastDestination?: string
  stoppagesCount?: number
  stoppages?: StoppageRateItem[]
}

interface TransportVehicle {
  id: number
  vehicleName: string
  registrationNo: string
  vehicleType?: string
  assignedDriver?: string
}

interface TransportDriver {
  id: number
  driverName: string
  driverId: string
  assignedVehicle?: string
  contact: string
}

const INITIAL_ROUTES: RouteRecord[] = []

export default function TransportRoutePage() {
  const [routes, setRoutes] = useState<RouteRecord[]>(INITIAL_ROUTES)
  const [searchQuery, setSearchQuery] = useState('')

  // Transport entities loaded from Transportation menu
  const [vehiclesList, setVehiclesList] = useState<TransportVehicle[]>([])
  const [driversList, setDriversList] = useState<TransportDriver[]>([])

  // Modal state for Setup Route & Stoppage Fee Rates
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [routeName, setRouteName] = useState('')
  const [vehicleName, setVehicleName] = useState('')
  const [driverName, setDriverName] = useState('')
  const [stoppageItems, setStoppageItems] = useState<StoppageRateItem[]>([])

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load from local storage
  useEffect(() => {
    const savedRoutes = localStorage.getItem('transport_routes')
    if (savedRoutes) {
      try {
        setRoutes(JSON.parse(savedRoutes))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('transport_routes', JSON.stringify(INITIAL_ROUTES))
    }

    const savedVehicles = localStorage.getItem('transport_vehicles')
    if (savedVehicles) {
      try {
        setVehiclesList(JSON.parse(savedVehicles))
      } catch (e) {
        console.error(e)
      }
    }

    const savedDrivers = localStorage.getItem('transport_drivers')
    if (savedDrivers) {
      try {
        setDriversList(JSON.parse(savedDrivers))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Helper to find driver for a vehicle
  const getDriverForVehicle = (vehName: string) => {
    if (!vehName) return ''
    // 1. Check vehicle's assignedDriver directly
    const matchedVeh = vehiclesList.find(v => {
      const displayVal = v.registrationNo ? `${v.vehicleName} (${v.registrationNo})` : v.vehicleName
      return displayVal.toLowerCase() === vehName.toLowerCase() || 
        v.vehicleName.toLowerCase() === vehName.toLowerCase() || 
        vehName.toLowerCase().includes(v.vehicleName.toLowerCase())
    })
    if (matchedVeh && matchedVeh.assignedDriver) {
      return matchedVeh.assignedDriver
    }

    // 2. Fallback check driver's assignedVehicle
    const cleanVeh = vehName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matched = driversList.find(d => {
      if (!d.assignedVehicle) return false
      const cleanAssigned = d.assignedVehicle.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanVeh.includes(cleanAssigned) || cleanAssigned.includes(cleanVeh)
    })
    return matched ? `${matched.driverName} (${matched.contact || matched.driverId})` : ''
  }

  const handleVehicleChange = (val: string) => {
    setVehicleName(val)
    if (val) {
      const autoDriver = getDriverForVehicle(val)
      setDriverName(autoDriver)
    } else {
      setDriverName('')
    }
  }

  const createBlankStoppage = (): StoppageRateItem => ({
    id: Date.now() + Math.random(),
    pickupLocation: '',
    dropLocation: '',
    km: '',
    monthly: '',
    quarterly: '',
    halfYearly: '',
    yearly: ''
  })

  const handleOpenAdd = () => {
    setEditId(null)
    setRouteName('')
    setVehicleName('')
    setDriverName('')
    setStoppageItems([createBlankStoppage()])
    setModalOpen(true)
  }

  const handleOpenEdit = (r: RouteRecord) => {
    setEditId(r.id)
    setRouteName(r.routeName)
    setVehicleName(r.vehicleName)
    setDriverName(r.driverName || getDriverForVehicle(r.vehicleName) || '')

    // Load stoppages from route or from transportation_fees
    if (Array.isArray(r.stoppages) && r.stoppages.length > 0) {
      setStoppageItems(r.stoppages.map(s => ({
        ...s,
        dropLocation: s.dropLocation || s.pickupLocation
      })))
    } else {
      // Try finding from transportation_fees
      try {
        const rawFees = localStorage.getItem('transportation_fees')
        if (rawFees) {
          const feesList = JSON.parse(rawFees)
          const matchedFees = feesList.filter((f: any) => (f.route || f.routeName) === r.routeName)
          if (matchedFees.length > 0) {
            setStoppageItems(matchedFees.map((f: any) => ({
              id: f.id || Date.now() + Math.random(),
              pickupLocation: f.pickupLocation || f.location || '',
              dropLocation: f.dropLocation || f.pickupLocation || f.location || '',
              km: String(f.km || ''),
              monthly: f.monthly?.replace(/[^0-9]/g, '') || String(f.amount || ''),
              quarterly: f.quarterly?.replace(/[^0-9]/g, '') || '',
              halfYearly: f.halfYearly?.replace(/[^0-9]/g, '') || '',
              yearly: f.yearly?.replace(/[^0-9]/g, '') || ''
            })))
            setModalOpen(true)
            return
          }
        }
      } catch (e) {}

      setStoppageItems([
        {
          id: Date.now(),
          pickupLocation: r.firstDestination || '',
          dropLocation: r.lastDestination || r.firstDestination || '',
          km: '10',
          monthly: '500',
          quarterly: '1500',
          halfYearly: '3000',
          yearly: '6000'
        }
      ])
    }
    setModalOpen(true)
  }

  const handleAddStoppageRow = () => {
    setStoppageItems([...stoppageItems, createBlankStoppage()])
  }

  const handleRemoveStoppageRow = (id: string | number) => {
    if (stoppageItems.length === 1) {
      alert('You must configure at least one stoppage location.')
      return
    }
    setStoppageItems(stoppageItems.filter(s => s.id !== id))
  }

  const handleUpdateStoppageRow = (id: string | number, field: keyof StoppageRateItem, val: string) => {
    setStoppageItems(stoppageItems.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  const handleUpdateStoppageLocation = (id: string | number, val: string) => {
    setStoppageItems(stoppageItems.map(s => s.id === id ? { ...s, pickupLocation: val, dropLocation: val } : s))
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim()) {
      alert('Please enter a Route Name.')
      return
    }
    if (!vehicleName.trim()) {
      alert('Please select an Assigned Vehicle.')
      return
    }

    if (stoppageItems.length === 0) {
      alert('Please add at least one stoppage point.')
      return
    }

    // Validate stoppages
    for (let i = 0; i < stoppageItems.length; i++) {
      const s = stoppageItems[i]
      if (!s.pickupLocation.trim()) {
        alert(`Please enter Pickup / Drop Location for Stoppage #${i + 1}`)
        return
      }
      if (!s.km || isNaN(Number(s.km)) || Number(s.km) <= 0) {
        alert(`Please enter valid Distance (KM) for Stoppage #${i + 1}`)
        return
      }
      if (!s.monthly.trim()) {
        alert(`Please enter Monthly Fee Rate for Stoppage #${i + 1}`)
        return
      }
    }

    const firstDest = stoppageItems[0]?.pickupLocation || ''
    const lastDest = stoppageItems[stoppageItems.length - 1]?.dropLocation || stoppageItems[stoppageItems.length - 1]?.pickupLocation || ''
    const now = new Date()
    const todayStr = `${now.toLocaleDateString('en-GB')} @ ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    const formatRate = (val: string) => {
      const num = Number(val.replace(/[^0-9]/g, ''))
      return num > 0 ? `₹${num}/-` : '-'
    }

    // 1. Update/Save Route in transport_routes
    const routePayload: RouteRecord = {
      id: editId || Date.now(),
      routeName: routeName.trim(),
      vehicleName: vehicleName.trim(),
      driverName: driverName.trim() || '—',
      firstDestination: firstDest,
      lastDestination: lastDest,
      stoppagesCount: stoppageItems.length,
      stoppages: stoppageItems
    }

    let updatedRoutes: RouteRecord[] = []
    if (editId) {
      updatedRoutes = routes.map(item => item.id === editId ? { ...item, ...routePayload } : item)
      showToast('Route details and stoppages updated successfully!')
    } else {
      updatedRoutes = [routePayload, ...routes]
      showToast('Route registered and stoppage fees configured successfully!')
    }

    setRoutes(updatedRoutes)
    localStorage.setItem('transport_routes', JSON.stringify(updatedRoutes))

    // 2. Automatically sync/create Stoppage Fee Rates into transportation_fees
    try {
      const existingFeesRaw = localStorage.getItem('transportation_fees')
      let existingFees: any[] = []
      if (existingFeesRaw) {
        try { existingFees = JSON.parse(existingFeesRaw) } catch {}
      }

      // If editing, remove old fees for this route name
      const remainingFees = editId
        ? existingFees.filter((f: any) => (f.route || f.routeName) !== routeName.trim())
        : existingFees

      const newFeeRecords = stoppageItems.map((s, idx) => ({
        id: Date.now() + idx,
        route: routeName.trim(),
        vehicle: vehicleName.trim() || '—',
        driver: driverName.trim() || '—',
        pickupLocation: s.pickupLocation.trim(),
        dropLocation: (s.dropLocation || s.pickupLocation).trim(),
        km: Number(s.km),
        monthly: formatRate(s.monthly),
        quarterly: formatRate(s.quarterly),
        halfYearly: formatRate(s.halfYearly),
        yearly: formatRate(s.yearly),
        amount: Number(s.monthly.replace(/[^0-9]/g, '')) || 0,
        createdAt: todayStr
      }))

      localStorage.setItem('transportation_fees', JSON.stringify([...newFeeRecords, ...remainingFees]))
    } catch (e) {
      console.error('Failed to sync transportation_fees:', e)
    }

    setModalOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this route? Associated stoppage fee records will also be removed.')) {
      const target = routes.find(r => r.id === id)
      const updated = routes.filter(r => r.id !== id)
      setRoutes(updated)
      localStorage.setItem('transport_routes', JSON.stringify(updated))

      if (target) {
        try {
          const raw = localStorage.getItem('transportation_fees')
          if (raw) {
            const list = JSON.parse(raw)
            const cleaned = list.filter((f: any) => (f.route || f.routeName) !== target.routeName)
            localStorage.setItem('transportation_fees', JSON.stringify(cleaned))
          }
        } catch {}
      }

      showToast('Route deleted successfully!')
    }
  }

  const filtered = routes.filter(r => 
    r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.driverName && r.driverName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
              Transport Routes & Stoppages
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create and manage transit routes with assigned vehicles, drivers, stoppage points, and fee rates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Route & Stoppages</span>
          </button>
          <Link
            href="/institute/fees-setup/transportation-fee"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            title="View and Update Fee Rates"
          >
            <Bus className="w-3.5 h-3.5 text-teal-600" />
            <span>Fee Rates</span>
          </Link>
        </div>
      </div>

      {/* Control Actions & Search */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by route, vehicle, or driver..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={() => showToast('Exporting transport route sheets...')}
            className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Table grid listing */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-6 py-4 text-left">Route Name</th>
                <th className="px-6 py-4 text-left">Assigned Vehicle</th>
                <th className="px-6 py-4 text-left">Assigned Driver</th>
                <th className="px-4 py-4 text-center">Stoppages</th>
                <th className="px-6 py-4 text-left">Pickup / Drop Location</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-6 py-3.5 text-left font-black text-slate-800 dark:text-slate-200 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{item.routeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-left font-bold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 font-bold">
                      <Truck className="w-3.5 h-3.5" />
                      {item.vehicleName}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-left font-semibold text-blue-700 dark:text-blue-400">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      {item.driverName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-black">
                      <MapPin className="w-3 h-3" />
                      {item.stoppagesCount || item.stoppages?.length || 1} Stoppages
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-left text-slate-600 dark:text-slate-300 font-medium">
                    {item.stoppages && item.stoppages.length > 0 ? (
                      <span className="text-[11px] font-bold">
                        {item.stoppages.map(s => s.pickupLocation).filter(Boolean).join(', ')}
                      </span>
                    ) : item.firstDestination ? (
                      <span className="text-[11px] font-bold">
                        {item.firstDestination === item.lastDestination || !item.lastDestination
                          ? item.firstDestination
                          : `${item.firstDestination} → ${item.lastDestination}`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors shadow-xs cursor-pointer"
                        title="Edit Route & Stoppages"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 border border-rose-100 transition-colors shadow-xs cursor-pointer"
                        title="Delete Route"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No routes registered. Click "Add Route & Stoppages" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* EXACT RICH MODAL: SETUP ROUTE STOPPAGE FEE RATES (FROM SCREENSHOT)       */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header matching Screenshot */}
            <div className="bg-[#1b3a60] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-black text-teal-300 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-300" />
                  {editId ? 'Edit Route & Stoppage Fee Rates' : 'Setup Route Stoppage Fee Rates'}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Route Name &rarr; Auto-fills assigned vehicle &amp; driver &rarr; Add multiple pickup/drop locations with all rate slabs
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col flex-1 overflow-hidden text-xs font-semibold">
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. Route, Vehicle & Driver Selection Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Route Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-teal-600" /> Route Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={routeName}
                      onChange={e => setRouteName(e.target.value)}
                      placeholder="e.g. Route 1 - Delhi to Noida"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Assigned Vehicle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-purple-600" /> Assigned Vehicle <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={vehicleName}
                      onChange={e => handleVehicleChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      required
                    >
                      <option value="">-- Select Vehicle --</option>
                      {vehiclesList.length > 0 ? (
                        vehiclesList.map((v, idx) => {
                          const displayVal = v.registrationNo ? `${v.vehicleName} (${v.registrationNo})` : v.vehicleName
                          return <option key={idx} value={displayVal}>{displayVal}</option>
                        })
                      ) : (
                        <>
                          <option value="Bus 01 (UP65-AB-1234)">Bus 01 (UP65-AB-1234)</option>
                          <option value="Van 02 (UP65-CD-5678)">Van 02 (UP65-CD-5678)</option>
                          <option value="Mini Bus 03 (UP65-EF-9012)">Mini Bus 03 (UP65-EF-9012)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Assigned Driver (Auto-filled from selected vehicle) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Assigned Driver
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
                        Auto from vehicle
                      </span>
                    </label>
                    <div className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[38px]">
                      {driverName ? (
                        <span className="text-blue-700 dark:text-blue-400 font-extrabold flex items-center gap-1.5">
                          👨‍✈️ {driverName}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">
                          {vehicleName ? 'No driver assigned to this vehicle' : 'Select vehicle to auto-load driver'}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* 2. Multiple Pickup & Drop Stoppage Location Cards (+) */}
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Pickup, Drop &amp; Rate Slabs ({stoppageItems.length})
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
                            className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove Stoppage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Pickup / Drop Location & Distance (Single Column for Location) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" /> Pickup / Drop Location <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            value={stoppage.pickupLocation}
                            onChange={e => handleUpdateStoppageLocation(stoppage.id, e.target.value)}
                            placeholder="e.g. Sector 1 Market Crossing"
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

                      {/* Fee Slabs Table - NO ONE TIME FEE */}
                      <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="text-[11px] font-black text-teal-700 dark:text-teal-400">
                            Fee Slabs (INR ₹)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

                  {/* Add Stoppage Button (+) */}
                  <button
                    type="button"
                    onClick={handleAddStoppageRow}
                    className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-dashed border-teal-300 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Another Stoppage Location (+)
                  </button>

                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Save All Fee Rates ({stoppageItems.length})
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}
