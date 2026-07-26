'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, UploadCloud, CheckCircle2 } from 'lucide-react'

interface RouteRecord {
  id: number
  routeName: string
  vehicleName: string
  firstDestination: string
  lastDestination: string
}

const INITIAL_ROUTES: RouteRecord[] = [
  { id: 1, routeName: 'Route 1', vehicleName: 'Vehicle 1', firstDestination: 'Location 1', lastDestination: 'Location 5' },
  { id: 2, routeName: 'Route 2', vehicleName: 'Vehicle 2', firstDestination: 'Location 2', lastDestination: 'Location 5' },
  { id: 3, routeName: 'Route 3', vehicleName: 'Vehicle 3', firstDestination: 'Location 3', lastDestination: 'Location 7' },
  { id: 4, routeName: 'Route 4', vehicleName: 'Vehicle 4', firstDestination: 'Location 4', lastDestination: 'Location 8' },
]

export default function TransportRoutePage() {
  const [routes, setRoutes] = useState<RouteRecord[]>(INITIAL_ROUTES)
  const [searchQuery, setSearchQuery] = useState('')

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [routeName, setRouteName] = useState('')
  const [vehicleName, setVehicleName] = useState('')
  const [firstDestination, setFirstDestination] = useState('')
  const [lastDestination, setLastDestination] = useState('')

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
  }, [])

  const handleOpenAdd = () => {
    setEditId(null)
    setRouteName('')
    setVehicleName('')
    setFirstDestination('')
    setLastDestination('')
    setModalOpen(true)
  }

  const handleOpenEdit = (r: RouteRecord) => {
    setEditId(r.id)
    setRouteName(r.routeName)
    setVehicleName(r.vehicleName)
    setFirstDestination(r.firstDestination)
    setLastDestination(r.lastDestination)
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName || !vehicleName || !firstDestination || !lastDestination) {
      alert('Please fill in all required fields.')
      return
    }

    const payload: RouteRecord = {
      id: editId || Date.now(),
      routeName,
      vehicleName,
      firstDestination,
      lastDestination
    }

    let updated: RouteRecord[] = []
    if (editId) {
      updated = routes.map(item => item.id === editId ? payload : item)
      setToastMsg('Route details updated successfully!')
    } else {
      updated = [...routes, payload]
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
    r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.firstDestination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.lastDestination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Route</h1>
          <p className="text-xs text-slate-400">Map and assign transport coverage vectors</p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search & Actions */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={() => alert('Exporting transport route sheets...')}
            className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Route
          </button>
        </div>

      </div>

      {/* Table grid listing (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Route Name</th>
                <th className="px-4 py-4 text-left">Vehicle</th>
                <th className="px-4 py-4">First Destination</th>
                <th className="px-4 py-4">Last Destination</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-extrabold text-slate-850 dark:text-slate-200">{item.routeName}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-655">{item.vehicleName}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.firstDestination}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.lastDestination}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Route"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">No routes registered.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-655">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* ================================== ROUTE CREATE/EDIT FORM MODAL ================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">
                {editId ? 'Edit Route Info' : 'Add Route details'}
              </span>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Route Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Route 1"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vehicle 1"
                  value={vehicleName}
                  onChange={e => setVehicleName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">First Destination *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Location 1"
                  value={firstDestination}
                  onChange={e => setFirstDestination(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Last Destination *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Location 5"
                  value={lastDestination}
                  onChange={e => setLastDestination(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm"
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
