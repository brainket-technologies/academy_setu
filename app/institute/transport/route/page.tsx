'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, UploadCloud, CheckCircle2, Navigation, Truck } from 'lucide-react'

interface RouteRecord {
  id: number
  routeName: string
  vehicleName: string
  firstDestination?: string
  lastDestination?: string
}

const INITIAL_ROUTES: RouteRecord[] = []

export default function TransportRoutePage() {
  const [routes, setRoutes] = useState<RouteRecord[]>(INITIAL_ROUTES)
  const [searchQuery, setSearchQuery] = useState('')

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [vehiclesList, setVehiclesList] = useState<any[]>([])
  
  const [routeName, setRouteName] = useState('')
  const [vehicleName, setVehicleName] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('transport_routes')
    if (saved) {
      try {
        setRoutes(JSON.parse(saved))
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
  }, [])

  const handleOpenAdd = () => {
    setEditId(null)
    setRouteName('')
    setVehicleName('')
    setModalOpen(true)
  }

  const handleOpenEdit = (r: RouteRecord) => {
    setEditId(r.id)
    setRouteName(r.routeName)
    setVehicleName(r.vehicleName)
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim() || !vehicleName.trim()) {
      alert('Please fill in Route Name and select a Vehicle.')
      return
    }

    const payload: RouteRecord = {
      id: editId || Date.now(),
      routeName: routeName.trim(),
      vehicleName: vehicleName.trim()
    }

    let updated: RouteRecord[] = []
    if (editId) {
      updated = routes.map(item => item.id === editId ? { ...item, ...payload } : item)
      setToastMsg('Route details updated successfully!')
    } else {
      updated = [payload, ...routes]
      setToastMsg('Route registered successfully!')
    }

    setRoutes(updated)
    localStorage.setItem('transport_routes', JSON.stringify(updated))
    setModalOpen(false)
    
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this route?')) {
      const updated = routes.filter(r => r.id !== id)
      setRoutes(updated)
      localStorage.setItem('transport_routes', JSON.stringify(updated))
      setToastMsg('Route deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = routes.filter(r => 
    r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Transport Routes</h1>
            <p className="text-xs text-slate-400">Manage transit routes and vehicle assignments</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      {/* Control Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by route or vehicle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={() => alert('Exporting transport route sheets...')}
            className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
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
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-6 py-3.5 text-left font-black text-slate-800 dark:text-slate-200 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-teal-600" />
                      {item.routeName}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-left font-bold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 font-bold">
                      <Truck className="w-3.5 h-3.5" />
                      {item.vehicleName}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors shadow-sm"
                        title="Edit Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 border border-rose-100 transition-colors shadow-sm"
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
                  <td colSpan={4} className="py-10 text-center text-slate-400 font-bold">
                    <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No routes registered. Click "Add Route" to create one.
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

      {/* ================================== ROUTE CREATE/EDIT FORM MODAL ================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-200 uppercase tracking-wider">
                {editId ? 'Edit Route Details' : 'Add Route Details'}
              </span>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Route Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Route 1"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Vehicle Name <span className="text-red-500">*</span>
                </label>
                <select 
                  value={vehicleName}
                  onChange={e => setVehicleName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                  required
                >
                  <option value="">Select Vehicle</option>
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
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Save Route
              </button>
            </div>
          </form>
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
