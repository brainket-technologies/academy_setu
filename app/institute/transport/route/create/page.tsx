'use client'

import React, { useState, useEffect, Suspense } from 'react'
import {
  ArrowLeft, Plus, Trash2, X, CheckCircle2,
  Navigation, Truck, UserCheck, MapPin, Layers
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface StoppageRateItem {
  id: string | number
  pickupLocation: string
  dropLocation: string
  km: string
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
}

function AddRouteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  const [routeName, setRouteName] = useState('')
  const [vehicleName, setVehicleName] = useState('')
  const [driverName, setDriverName] = useState('')

  const [vehiclesList, setVehiclesList] = useState<any[]>([])
  const [driversList, setDriversList] = useState<any[]>([])

  const [stoppages, setStoppages] = useState<StoppageRateItem[]>([
    {
      id: 1,
      pickupLocation: '',
      dropLocation: '',
      km: '',
      monthly: '',
      quarterly: '',
      halfYearly: '',
      yearly: ''
    }
  ])

  useEffect(() => {
    const savedVehicles = localStorage.getItem('transport_vehicles')
    let loadedVehicles: any[] = []
    if (savedVehicles) {
      try {
        loadedVehicles = JSON.parse(savedVehicles)
        setVehiclesList(loadedVehicles)
      } catch (e) {
        console.error(e)
      }
    }

    const savedDrivers = localStorage.getItem('transport_drivers')
    if (savedDrivers) {
      try {
        const parsed = JSON.parse(savedDrivers)
        setDriversList(parsed)
      } catch (e) {
        console.error(e)
      }
    }

    if (editId) {
      const savedRoutes = localStorage.getItem('transport_routes')
      if (savedRoutes) {
        try {
          const list = JSON.parse(savedRoutes)
          const found = list.find((r: any) => r.id === Number(editId))
          if (found) {
            setRouteName(found.routeName || '')
            setVehicleName(found.vehicleName || '')
            setDriverName(found.driverName || '')
            if (Array.isArray(found.stoppages) && found.stoppages.length > 0) {
              setStoppages(found.stoppages)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    } else if (loadedVehicles.length > 0 && !vehicleName) {
      const first = loadedVehicles[0]
      const displayVal = first.registrationNo ? `${first.vehicleName} (${first.registrationNo})` : first.vehicleName
      setVehicleName(displayVal)
      if (first.assignedDriver) {
        setDriverName(first.assignedDriver)
      }
    }
  }, [editId])

  // Helper to find driver for a vehicle
  const getDriverForVehicle = (vehName: string) => {
    if (!vehName) return ''
    const matchedVeh = vehiclesList.find((v: any) => {
      const displayVal = v.registrationNo ? `${v.vehicleName} (${v.registrationNo})` : v.vehicleName
      return displayVal.toLowerCase() === vehName.toLowerCase() || 
        v.vehicleName.toLowerCase() === vehName.toLowerCase() || 
        vehName.toLowerCase().includes(v.vehicleName.toLowerCase())
    })
    if (matchedVeh && matchedVeh.assignedDriver) {
      return matchedVeh.assignedDriver
    }

    const cleanVeh = vehName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const matched = driversList.find((d: any) => {
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

  const handleAddStoppage = () => {
    setStoppages([
      ...stoppages,
      {
        id: Date.now() + Math.random(),
        pickupLocation: '',
        dropLocation: '',
        km: '',
        monthly: '',
        quarterly: '',
        halfYearly: '',
        yearly: ''
      }
    ])
  }

  const handleRemoveStoppage = (id: string | number) => {
    if (stoppages.length === 1) {
      alert('You must configure at least one stoppage location.')
      return
    }
    setStoppages(stoppages.filter(s => s.id !== id))
  }

  const handleUpdateStoppage = (id: string | number, key: keyof StoppageRateItem, val: string) => {
    setStoppages(stoppages.map(s => s.id === id ? { ...s, [key]: val } : s))
  }

  const handleUpdateStoppageLocation = (id: string | number, val: string) => {
    setStoppages(stoppages.map(s => s.id === id ? { ...s, pickupLocation: val, dropLocation: val } : s))
  }

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim()) {
      alert('Please enter a Route Name.')
      return
    }
    if (!vehicleName.trim()) {
      alert('Please select an Assigned Vehicle.')
      return
    }

    for (let i = 0; i < stoppages.length; i++) {
      const s = stoppages[i]
      if (!s.pickupLocation.trim()) {
        alert(`Please enter Pickup / Drop Location for Stoppage #${i + 1}`)
        return
      }
      if (!s.km || isNaN(Number(s.km)) || Number(s.km) <= 0) {
        alert(`Please enter valid Distance in KM for Stoppage #${i + 1}`)
        return
      }
      if (!s.monthly.trim()) {
        alert(`Please enter Monthly Rate for Stoppage #${i + 1}`)
        return
      }
    }

    const firstDest = stoppages[0]?.pickupLocation || 'School'
    const lastDest = stoppages[stoppages.length - 1]?.dropLocation || stoppages[stoppages.length - 1]?.pickupLocation || ''
    const now = new Date()
    const todayStr = `${now.toLocaleDateString('en-GB')} @ ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    const formatRate = (val: string) => {
      const num = Number(val.replace(/[^0-9]/g, ''))
      return num > 0 ? `₹${num}/-` : '-'
    }

    // 1. Save Route to transport_routes
    const savedRoutes = localStorage.getItem('transport_routes')
    let activeRoutes: any[] = []
    if (savedRoutes) {
      try { activeRoutes = JSON.parse(savedRoutes) } catch (e) { console.error(e) }
    }

    const routePayload = {
      id: editId ? Number(editId) : Date.now(),
      routeName: routeName.trim(),
      vehicleName: vehicleName.trim(),
      driverName: driverName.trim() || '—',
      firstDestination: firstDest,
      lastDestination: lastDest,
      stoppagesCount: stoppages.length,
      stoppages
    }

    let updatedRoutes = []
    if (editId) {
      updatedRoutes = activeRoutes.map(r => r.id === Number(editId) ? routePayload : r)
    } else {
      updatedRoutes = [routePayload, ...activeRoutes]
    }
    localStorage.setItem('transport_routes', JSON.stringify(updatedRoutes))

    // 2. Automatically sync to transportation_fees
    try {
      const existingFeesRaw = localStorage.getItem('transportation_fees')
      let existingFees: any[] = []
      if (existingFeesRaw) {
        try { existingFees = JSON.parse(existingFeesRaw) } catch {}
      }

      const remainingFees = editId
        ? existingFees.filter((f: any) => (f.route || f.routeName) !== routeName.trim())
        : existingFees

      const newFeeRecords = stoppages.map((s, idx) => ({
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
      console.error(e)
    }

    alert(editId ? 'Route details and stoppages updated successfully!' : 'Route registered and stoppage fees configured successfully!')
    router.push('/institute/transport/route')
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-teal-600" />
              {editId ? 'Edit Route & Stoppages' : 'Add Route & Stoppages'}
            </h1>
            <p className="text-xs text-slate-400">
              Establish route coordinates, assigned vehicle &amp; driver, and associated student charge slabs
            </p>
          </div>
        </div>
      </div>

      {/* Main wizard forms */}
      <form onSubmit={handleCreateRoute} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Route Setup Card */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-xs font-black text-[#1b3a60] dark:text-slate-200 uppercase tracking-wider border-b border-slate-200/80 pb-2">
            Route &amp; Vehicle Setup
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-teal-600" /> Route Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Route 1 - Delhi to Noida" 
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-purple-600" /> Select Vehicle <span className="text-red-500">*</span>
              </label>
              <select 
                value={vehicleName}
                onChange={e => handleVehicleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 font-bold outline-none cursor-pointer"
                required
              >
                <option value="">-- Select Vehicle --</option>
                {vehiclesList.length > 0 ? (
                  vehiclesList.map((v: any, idx: number) => {
                    const displayVal = v.registrationNo ? `${v.vehicleName} (${v.registrationNo})` : v.vehicleName
                    return (
                      <option key={idx} value={displayVal}>
                        {displayVal}
                      </option>
                    )
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
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
        </div>

        {/* Dynamic Stoppage Cards list */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              Pickup, Drop &amp; Rate Slabs ({stoppages.length})
            </h3>
            <span className="text-[11px] text-slate-400">Configure pickup &amp; drop points with fee rates</span>
          </div>

          <div className="space-y-4">
            {stoppages.map((s, idx) => (
              <div 
                key={s.id} 
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-2">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-black bg-teal-100 text-teal-800">
                    Stoppage Point #{idx + 1}
                  </span>
                  {stoppages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStoppage(s.id)}
                      className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Pickup / Drop Location & Distance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pickup / Drop Location <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sector 1 Market Crossing"
                      value={s.pickupLocation}
                      onChange={e => handleUpdateStoppageLocation(s.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Distance (KM) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 12"
                      value={s.km}
                      onChange={e => handleUpdateStoppage(s.id, 'km', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 text-center"
                      required
                    />
                  </div>
                </div>

                {/* Fee Slabs - NO ONE TIME FEE */}
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-black text-teal-700 dark:text-teal-400 block border-b pb-1">
                    Fee Slabs (INR ₹)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600">Monthly Rate *</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 500"
                        value={s.monthly}
                        onChange={e => handleUpdateStoppage(s.id, 'monthly', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-teal-600 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600">Quarterly Rate</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500"
                        value={s.quarterly}
                        onChange={e => handleUpdateStoppage(s.id, 'quarterly', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600">Half Yearly Rate</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 3000"
                        value={s.halfYearly}
                        onChange={e => handleUpdateStoppage(s.id, 'halfYearly', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600">Yearly Rate</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 6000"
                        value={s.yearly}
                        onChange={e => handleUpdateStoppage(s.id, 'yearly', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStoppage}
            className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-dashed border-teal-300 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Another Stoppage Location (+)
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-7 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Save Route &amp; Stoppages ({stoppages.length})
          </button>
        </div>

      </form>

    </div>
  )
}

export default function AddRoutePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 font-bold">Loading Route Setup...</div>}>
      <AddRouteForm />
    </Suspense>
  )
}
