'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { ArrowLeft, Plus, Trash2, X, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface StoppageItem {
  id: number
  from: string
  location: string
  km: string
  fee: string
}

function AddRouteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  const [routeName, setRouteName] = useState('')
  const [vehicleName, setVehicleName] = useState('Vehicle 1')
  const [stoppages, setStoppages] = useState<StoppageItem[]>([
    { id: 1, from: 'School', location: 'Ex: Delhi Sector - 1', km: '15', fee: '500' }
  ])

  useEffect(() => {
    if (editId) {
      // In edit mode, load details
      const savedFees = localStorage.getItem('transportation_fees')
      if (savedFees) {
        try {
          const list = JSON.parse(savedFees)
          const found = list.find((f: any) => f.id === Number(editId))
          if (found) {
            setRouteName(`Route to ${found.location}`)
            setStoppages([
              { id: 1, from: found.from, location: found.location, km: String(found.km), fee: String(found.amount) }
            ])
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [editId])

  const handleAddStoppage = () => {
    const payload: StoppageItem = {
      id: Date.now() + Math.random(),
      from: 'School',
      location: '',
      km: '',
      fee: ''
    }
    setStoppages([...stoppages, payload])
  }

  const handleRemoveStoppage = (id: number) => {
    if (stoppages.length === 1) {
      alert('You must configure at least one stoppage location.')
      return
    }
    setStoppages(stoppages.filter(s => s.id !== id))
  }

  const handleUpdateStoppage = (id: number, key: keyof StoppageItem, val: string) => {
    setStoppages(stoppages.map(s => s.id === id ? { ...s, [key]: val } : s))
  }

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim()) {
      alert('Please enter a Route Name.')
      return
    }

    // 1. Save Route to local storage
    const savedRoutes = localStorage.getItem('transport_routes')
    let activeRoutes: any[] = []
    if (savedRoutes) {
      try { activeRoutes = JSON.parse(savedRoutes) } catch (e) { console.error(e) }
    }

    const firstDest = stoppages[0]?.location || 'School'
    const lastDest = stoppages[stoppages.length - 1]?.location || 'Destination'

    const routePayload = {
      id: editId ? Number(editId) : Date.now(),
      routeName,
      vehicleName,
      firstDestination: firstDest,
      lastDestination: lastDest
    }

    let updatedRoutes = []
    if (editId) {
      updatedRoutes = activeRoutes.map(r => r.id === Number(editId) ? routePayload : r)
    } else {
      updatedRoutes = [routePayload, ...activeRoutes]
    }
    localStorage.setItem('transport_routes', JSON.stringify(updatedRoutes))

    // 2. Save each Stoppage Fee to local storage
    const savedFees = localStorage.getItem('transportation_fees')
    let activeFees: any[] = []
    if (savedFees) {
      try { activeFees = JSON.parse(savedFees) } catch (e) { console.error(e) }
    }

    const todayStr = new Date().toLocaleDateString('en-GB') + ' 11:00 AM'
    const newFees = stoppages.map((s, idx) => ({
      id: Date.now() + idx,
      from: s.from,
      location: s.location || 'Unknown Stoppage',
      km: Number(s.km) || 10,
      amount: Number(s.fee) || 500,
      createdAt: todayStr
    }))

    // Merge or overwrite fees
    const updatedFees = [...newFees, ...activeFees.filter(f => f.id !== Number(editId))]
    localStorage.setItem('transportation_fees', JSON.stringify(updatedFees))

    alert(editId ? 'Route and fee changes updated successfully!' : 'Route and stoppage fees created successfully!')
    router.push('/institute/fees-setup/transportation-fee')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Route' : 'Add Route'}
            </h1>
            <p className="text-xs text-slate-400">Establish route coordinates and associated student charge slabs</p>
          </div>
        </div>
      </div>

      {/* Main wizard forms */}
      <form onSubmit={handleCreateRoute} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Route Setup */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Route Setup</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Route Name *</label>
              <input 
                type="text" 
                placeholder="Ex: Delhi to Noida" 
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Select Vehicle *</label>
              <select 
                value={vehicleName}
                onChange={e => setVehicleName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none"
              >
                <option value="Vehicle 1">Vehicle 1</option>
                <option value="Vehicle 2">Vehicle 2</option>
                <option value="Vehicle 3">Vehicle 3</option>
                <option value="Vehicle 4">Vehicle 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Stoppage Cards list (Screenshot 2) */}
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider">Stoppage Stations</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Define locations in transit order</span>
          </div>

          <div className="space-y-6">
            {stoppages.map((s, idx) => (
              <div 
                key={s.id} 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-5 relative space-y-4 animate-in slide-in-from-top-3 duration-200"
              >
                {/* Remove button */}
                <button 
                  type="button"
                  onClick={() => handleRemoveStoppage(s.id)}
                  className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                  title="Remove Station"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">S. No. / From</label>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-extrabold flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                      <input 
                        type="text" 
                        value={s.from} 
                        readOnly 
                        className="w-full px-4 py-2 border rounded-lg text-xs bg-slate-100 outline-none font-bold text-slate-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Enter Pickup/Stoppage Location *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ex: Delhi Sector - 1" 
                      value={s.location}
                      onChange={e => handleUpdateStoppage(s.id, 'location', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Km *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15" 
                      value={s.km}
                      onChange={e => handleUpdateStoppage(s.id, 'km', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500 text-center"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Fee *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={s.fee}
                      onChange={e => handleUpdateStoppage(s.id, 'fee', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500 text-center"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plus Add button (Screenshot 2) */}
          <div className="flex justify-center pt-2">
            <button 
              type="button"
              onClick={handleAddStoppage}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
              title="Add Stoppage Station"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-center pt-6 border-t border-slate-100">
          <button 
            type="submit"
            className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
          >
            Create Route
          </button>
        </div>

      </form>

    </div>
  )
}

export default function CreateRouteWizardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-xs text-slate-400">Loading...</div>}>
      <AddRouteForm />
    </Suspense>
  )
}
