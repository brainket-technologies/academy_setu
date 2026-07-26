'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, RotateCcw, X, UploadCloud, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DriverRecord {
  id: number
  username: string
  driverName: string
  driverId: string
  licenseNumber: string
  licenseType: string
  contact: string
  status: 'Active' | 'Inactive'
  joiningDate: string
  email?: string
  gender?: string
  dob?: string
  fatherName?: string
  maritalStatus?: string
  religion?: string
  category?: string
  address?: string
  pincode?: string
  district?: string
  state?: string
  deletedDate?: string
}

const INITIAL_ACTIVE: DriverRecord[] = [
]

const INITIAL_DELETED: DriverRecord[] = [
]

export default function TransportDriverPage() {
  const [activeDrivers, setActiveDrivers] = useState<DriverRecord[]>(INITIAL_ACTIVE)
  const [deletedDrivers, setDeletedDrivers] = useState<DriverRecord[]>(INITIAL_DELETED)
  const [currentTab, setCurrentTab] = useState<'active' | 'deleted'>('active')
  const [searchQuery, setSearchQuery] = useState('')

  // View profile target modal
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'details' | 'attendance' | 'leave' | 'payroll' | 'login'>('details')

  // Edit fields target states
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const savedActive = localStorage.getItem('transport_drivers')
    const savedDeleted = localStorage.getItem('deleted_transport_drivers')

    if (savedActive) {
      try { setActiveDrivers(JSON.parse(savedActive)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('transport_drivers', JSON.stringify(INITIAL_ACTIVE))
    }

    if (savedDeleted) {
      try { setDeletedDrivers(JSON.parse(savedDeleted)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('deleted_transport_drivers', JSON.stringify(INITIAL_DELETED))
    }
  }, [])

  // Delete Driver action (moves to deleted list)
  const handleDelete = (driver: DriverRecord) => {
    if (confirm(`Are you sure you want to delete driver ${driver.driverName}?`)) {
      const today = new Date().toLocaleDateString('en-GB')
      
      const newActive = activeDrivers.filter(d => d.id !== driver.id)
      const newDeleted = [{ ...driver, deletedDate: today }, ...deletedDrivers]

      setActiveDrivers(newActive)
      setDeletedDrivers(newDeleted)

      localStorage.setItem('transport_drivers', JSON.stringify(newActive))
      localStorage.setItem('deleted_transport_drivers', JSON.stringify(newDeleted))

      setToastMsg(`Driver ${driver.driverName} deleted successfully!`)
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  // Restore Driver action (moves back to active list)
  const handleRestore = (driver: DriverRecord) => {
    const { deletedDate, ...cleanRecord } = driver
    const newActive = [...activeDrivers, { ...cleanRecord, status: 'Active' as const }]
    const newDeleted = deletedDrivers.filter(d => d.id !== driver.id)

    setActiveDrivers(newActive)
    setDeletedDrivers(newDeleted)

    localStorage.setItem('transport_drivers', JSON.stringify(newActive))
    localStorage.setItem('deleted_transport_drivers', JSON.stringify(newDeleted))

    setToastMsg(`Driver ${driver.driverName} restored successfully!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Search query filter
  const activeFiltered = activeDrivers.filter(d => 
    d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.contact.includes(searchQuery) ||
    d.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deletedFiltered = deletedDrivers.filter(d => 
    d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.contact.includes(searchQuery) ||
    d.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Driver</h1>
          <p className="text-xs text-slate-400">Manage school transport drivers and credentials</p>
        </div>
      </div>

      {/* Control Actions / Search and Export Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, ID, mobile no, username..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => alert('Exporting drivers database...')}
            className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors bg-white"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          
          <Link 
            href="/institute/transport/driver/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </Link>
        </div>

      </div>

      {/* Active vs Deleted status tab buttons (Screenshot 1 & 2) */}
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider ${
            currentTab === 'active' 
              ? 'border-teal-600 bg-teal-50/15 text-teal-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Total Driver</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
            currentTab === 'active' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-650'
          }`}>
            {activeDrivers.length < 10 ? `0${activeDrivers.length}` : activeDrivers.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('deleted')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider ${
            currentTab === 'deleted' 
              ? 'border-teal-600 bg-teal-50/15 text-teal-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Deleted Driver</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
            currentTab === 'deleted' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-650'
          }`}>
            {deletedDrivers.length < 10 ? `0${deletedDrivers.length}` : deletedDrivers.length}
          </span>
        </button>
      </div>

      {/* Table listing Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          {currentTab === 'active' ? (
            /* Active Drivers list (Screenshot 1) */
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 w-16">S. No.</th>
                  <th className="px-4 py-4 text-left">Username</th>
                  <th className="px-4 py-4 text-left">Driver Name</th>
                  <th className="px-4 py-4">Driver ID</th>
                  <th className="px-4 py-4">License Number</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Joining Date</th>
                  <th className="px-4 py-4 w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeFiltered.map((driver, idx) => (
                  <tr key={driver.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left text-slate-550 dark:text-slate-400 font-mono font-bold">{driver.username}</td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200">{driver.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{driver.driverId}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{driver.licenseNumber}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{driver.contact}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        driver.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold">{driver.joiningDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedDriver(driver)
                            setActiveProfileTab('details')
                          }}
                          className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 border border-sky-100 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <Link 
                          href={`/institute/transport/driver/create?editId=${driver.id}`}
                          className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                          title="Edit Details"
                        >
                          <Pencil className="w-3 h-3" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(driver)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeFiltered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No active drivers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* Deleted Drivers list (Screenshot 2) */
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 w-16">S. No.</th>
                  <th className="px-4 py-4 text-left">Username</th>
                  <th className="px-4 py-4 text-left">Driver Name</th>
                  <th className="px-4 py-4">Driver ID</th>
                  <th className="px-4 py-4">License Number</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Joining Date</th>
                  <th className="px-4 py-4">Deleted Date</th>
                  <th className="px-4 py-4 w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedFiltered.map((driver, idx) => (
                  <tr key={driver.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left text-slate-550 dark:text-slate-400 font-mono font-bold">{driver.username}</td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200">{driver.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{driver.driverId}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{driver.licenseNumber}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{driver.contact}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold">{driver.joiningDate}</td>
                    <td className="px-4 py-3.5 font-bold text-red-500">{driver.deletedDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleRestore(driver)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                          title="Restore Driver"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedFiltered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No deleted drivers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{(currentTab === 'active' ? activeFiltered : deletedFiltered).length} of 456 Entries</span>
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

      {/* ================================== STUNNING DRIVER PROFILE MODAL (Screenshot 5) ================================== */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[840px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <span className="text-sm font-black text-[#1b3a60] dark:text-slate-200 uppercase tracking-wider">Driver Profile</span>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Core */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Header profile widget split */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                
                {/* Left Card: Info avatar & status switch */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center md:col-span-1">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border text-4xl shadow-sm relative mb-3">
                    🧔
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedDriver.driverName}</h4>
                  <p className="text-[10px] text-slate-450 font-bold mt-1">User ID: {selectedDriver.username}</p>
                  
                  {/* Status Toggle switch */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 w-full justify-between">
                    <span className="text-[10px] font-bold text-slate-550 uppercase">Active Status</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = activeDrivers.map(d => d.id === selectedDriver.id ? { ...d, status: (d.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : d)
                        setActiveDrivers(updated)
                        localStorage.setItem('transport_drivers', JSON.stringify(updated))
                        setSelectedDriver({ ...selectedDriver, status: (selectedDriver.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' })
                      }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${selectedDriver.status === 'Active' ? 'bg-teal-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${selectedDriver.status === 'Active' ? 'left-4.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>

                {/* Right Card: Personal details widgets */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-sm md:col-span-2 relative text-xs flex flex-col justify-between">
                  <h5 className="text-[10px] font-black text-[#1b3a60] uppercase tracking-wide border-b pb-2 flex justify-between items-center mb-2">
                    <span>Personal Information</span>
                    <Link href={`/institute/transport/driver/create?editId=${selectedDriver.id}`} className="text-[9px] text-teal-600 font-bold border px-2 py-0.5 rounded hover:bg-slate-50">Edit</Link>
                  </h5>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-slate-700 dark:text-slate-350">
                    <div><span className="text-[9px] uppercase font-bold text-slate-450 block">Driver ID</span><span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedDriver.driverId}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-450 block">License No.</span><span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedDriver.licenseNumber} ({selectedDriver.licenseType})</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-450 block">Mobile No.</span><span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedDriver.contact}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-450 block">Joining Date</span><span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedDriver.joiningDate}</span></div>
                  </div>
                </div>

              </div>

              {/* Sub-tabs selectors (Screenshot 5) */}
              <div className="border-b border-slate-200/80 dark:border-slate-800 flex gap-6 text-xs font-black uppercase tracking-wider shrink-0 bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm">
                <button 
                  onClick={() => setActiveProfileTab('details')} 
                  className={`pb-1 px-1 border-b-2 transition-all ${activeProfileTab === 'details' ? 'border-teal-600 text-teal-600 font-black' : 'border-transparent text-slate-400'}`}
                >
                  Driver Details
                </button>
                <button 
                  onClick={() => setActiveProfileTab('attendance')} 
                  className={`pb-1 px-1 border-b-2 transition-all ${activeProfileTab === 'attendance' ? 'border-teal-600 text-teal-600 font-black' : 'border-transparent text-slate-400'}`}
                >
                  Attendance
                </button>
                <button 
                  onClick={() => setActiveProfileTab('leave')} 
                  className={`pb-1 px-1 border-b-2 transition-all ${activeProfileTab === 'leave' ? 'border-teal-600 text-teal-600 font-black' : 'border-transparent text-slate-400'}`}
                >
                  Leave
                </button>
                <button 
                  onClick={() => setActiveProfileTab('payroll')} 
                  className={`pb-1 px-1 border-b-2 transition-all ${activeProfileTab === 'payroll' ? 'border-teal-600 text-teal-600 font-black' : 'border-transparent text-slate-400'}`}
                >
                  Payroll
                </button>
                <button 
                  onClick={() => setActiveProfileTab('login')} 
                  className={`pb-1 px-1 border-b-2 transition-all ${activeProfileTab === 'login' ? 'border-teal-600 text-teal-600 font-black' : 'border-transparent text-slate-400'}`}
                >
                  Login Details
                </button>
              </div>

              {/* Dynamic Profiles Content tab display */}
              <div className="text-xs">
                
                {/* 1. Driver Details Tab */}
                {activeProfileTab === 'details' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Aadhar details */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
                        <h5 className="text-[10px] font-black text-slate-450 uppercase border-b pb-1.5 mb-3 flex justify-between items-center">
                          <span>Aadhar Details</span>
                          <span className="text-[9px] text-slate-450 font-bold">Verified</span>
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span>Aadhar Card No.</span><span className="font-extrabold">12345678900</span></div>
                          <div className="flex justify-between"><span>Aadhar Card</span><span className="font-bold text-teal-600 cursor-pointer">👁 Aadhar Card.jpg</span></div>
                        </div>
                      </div>

                      {/* Religion Info */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
                        <h5 className="text-[10px] font-black text-slate-450 uppercase border-b pb-1.5 mb-3">Religion & Category</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span>Nationality</span><span className="font-extrabold">Indian</span></div>
                          <div className="flex justify-between"><span>Religion</span><span className="font-extrabold">Hindu</span></div>
                          <div className="flex justify-between"><span>Category</span><span className="font-extrabold">General</span></div>
                        </div>
                      </div>

                      {/* Address details */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
                        <h5 className="text-[10px] font-black text-slate-450 uppercase border-b pb-1.5 mb-3">Address Details</h5>
                        <table className="w-full text-left">
                          <tbody>
                            <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-450 uppercase text-[9px] font-bold">Address</td><td className="py-1.5 text-right font-extrabold">{selectedDriver.address || '123, Location, Street Name, Locality'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-450 uppercase text-[9px] font-bold">Pincode</td><td className="py-1.5 text-right font-extrabold">{selectedDriver.pincode || '221545'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-450 uppercase text-[9px] font-bold">District</td><td className="py-1.5 text-right font-extrabold">{selectedDriver.district || 'Lucknow'}</td></tr>
                            <tr><td className="py-1.5 text-slate-450 uppercase text-[9px] font-bold">State</td><td className="py-1.5 text-right font-extrabold">{selectedDriver.state || 'Uttar Pradesh'}</td></tr>
                          </tbody>
                        </table>
                      </div>

                      {/* License details */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
                        <h5 className="text-[10px] font-black text-slate-450 uppercase border-b pb-1.5 mb-3">License Details</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span>{selectedDriver.licenseNumber}</span><span className="font-bold text-teal-600 cursor-pointer">👁 License.jpg</span></div>
                          <div className="flex justify-between"><span>Issue Date</span><span className="font-extrabold">12-06-2013</span></div>
                          <div className="flex justify-between"><span>Expiry Date</span><span className="font-extrabold">11-06-2028</span></div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. Attendance Tab (Screenshot 4) */}
                {activeProfileTab === 'attendance' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* Header line filters & legend */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-600">Select Session</span>
                        <select className="border border-slate-200 rounded-lg p-1.5 text-xs outline-none bg-white font-semibold">
                          <option value="2025-2026">2025-2026</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Present: P</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Absent: A</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Holiday: H</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Late: L</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Half Day: F</span>
                      </div>
                    </div>

                    {/* Metrics Count cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Present</span><span className="text-xl font-black text-emerald-600">227</span></div>
                        <span className="text-2xl">🟢</span>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="text-[10px] uppercase font-bold text-red-700 block">Total Absent</span><span className="text-xl font-black text-red-500">70</span></div>
                        <span className="text-2xl">🔴</span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="text-[10px] uppercase font-bold text-indigo-700 block">Half Day</span><span className="text-xl font-black text-indigo-600">27</span></div>
                        <span className="text-2xl">🔵</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="text-[10px] uppercase font-bold text-amber-700 block">Total Late</span><span className="text-xl font-black text-amber-600">28</span></div>
                        <span className="text-2xl">🟡</span>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex justify-between items-center">
                        <div><span className="text-[10px] uppercase font-bold text-purple-700 block">Total Holiday</span><span className="text-xl font-black text-purple-600">12</span></div>
                        <span className="text-2xl">🟣</span>
                      </div>
                    </div>

                    {/* Calendar grid sheet */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-center text-[10px] border-collapse font-bold">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="text-left py-2 w-16">Month</th>
                              {Array.from({ length: 30 }, (_, i) => (
                                <th key={i} className="py-2 px-1 w-6">{i + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                              <tr key={m} className="border-b border-slate-100 last:border-0">
                                <td className="text-left font-black py-2.5 text-slate-700 uppercase">{m}</td>
                                {Array.from({ length: 30 }, (_, i) => {
                                  // Mock values
                                  let char = 'P'
                                  let color = 'text-emerald-500'
                                  if ((i + idx) % 7 === 0) { char = 'H'; color = 'text-purple-500' }
                                  else if ((i + idx) % 13 === 0) { char = 'A'; color = 'text-red-500' }
                                  else if ((i + idx) % 19 === 0) { char = 'L'; color = 'text-amber-500' }
                                  else if ((i + idx) % 25 === 0) { char = 'F'; color = 'text-indigo-500' }

                                  return (
                                    <td key={i} className={`py-2 px-1 font-extrabold ${color}`}>{char}</td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. Leave Tab (Screenshot 3) */}
                {activeProfileTab === 'leave' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* Remaining Leave Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-sky-700 block">Casual Leave</span>
                          <span className="text-lg font-black text-sky-600 mt-1 block">12 Available</span>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Used - 1, Available - 11</span>
                        </div>
                        <span className="text-xl">📄</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Medical Leave</span>
                          <span className="text-lg font-black text-emerald-600 mt-1 block">12 Available</span>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Used - 1, Available - 11</span>
                        </div>
                        <span className="text-xl">🩺</span>
                      </div>
                      <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-fuchsia-700 block">Half Day</span>
                          <span className="text-lg font-black text-fuchsia-600 mt-1 block">8 Available</span>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Used - 0, Available - 8</span>
                        </div>
                        <span className="text-xl">⏱</span>
                      </div>
                    </div>

                    {/* Table query list */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-4">
                      <div className="flex justify-between items-center gap-4">
                        <input type="text" placeholder="Search..." className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-teal-500 font-semibold" />
                        <select className="border border-slate-200 rounded-lg p-1.5 text-xs outline-none bg-white font-bold"><option>2025-2026</option></select>
                      </div>

                      <table className="w-full text-center text-xs">
                        <thead className="bg-slate-50 font-black border-b text-slate-655">
                          <tr>
                            <th className="py-2.5">S. No.</th>
                            <th>Leave Type</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Apply Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100 font-semibold">
                            <td className="py-3">1.</td>
                            <td className="font-extrabold text-slate-800">Medical Leave</td>
                            <td className="text-slate-500">12/11/2025 - 13/11/2025</td>
                            <td>3 Days</td>
                            <td className="text-slate-500">11/11/2025</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px]">Approved</span></td>
                          </tr>
                          <tr className="border-b border-slate-100 font-semibold">
                            <td className="py-3">2.</td>
                            <td className="font-extrabold text-slate-800">Casual Leave</td>
                            <td className="text-slate-500">12/11/2025 - 13/11/2025</td>
                            <td>3 Days</td>
                            <td className="text-slate-500">11/11/2025</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-black text-[9px]">Pending</span></td>
                          </tr>
                          <tr className="font-semibold">
                            <td className="py-3">3.</td>
                            <td className="font-extrabold text-slate-800">Special Leave</td>
                            <td className="text-slate-500">12/11/2025 - 13/11/2025</td>
                            <td>3 Days</td>
                            <td className="text-slate-500">11/11/2025</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px]">Approved</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* 4. Payroll Tab (Screenshot 5) */}
                {activeProfileTab === 'payroll' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* Upper counts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Net Salary</span>
                          <span className="text-xl font-black text-emerald-650 mt-1 block">20,000</span>
                        </div>
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-sky-700 block">Total Gross Salary</span>
                          <span className="text-xl font-black text-sky-600 mt-1 block">5,000</span>
                        </div>
                        <span className="text-2xl">💵</span>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-red-700 block">Total Deduction</span>
                          <span className="text-xl font-black text-red-500 mt-1 block">2,500</span>
                        </div>
                        <span className="text-2xl">📉</span>
                      </div>
                    </div>

                    {/* Table lists */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                      
                      <div className="flex justify-between items-center gap-4 border-b pb-4">
                        <div className="flex items-center gap-3">
                          <input type="text" placeholder="Search invoices..." className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-teal-500 font-semibold" />
                          <select className="border border-slate-200 rounded-lg p-1.5 text-xs outline-none bg-white font-bold"><option>2025-2026</option></select>
                        </div>
                        <button type="button" className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">📥 Export</button>
                      </div>

                      <table className="w-full text-center text-xs">
                        <thead className="bg-slate-50 font-black border-b text-slate-655">
                          <tr>
                            <th className="py-2.5">S. No.</th>
                            <th>Invoice ID</th>
                            <th>Salary For</th>
                            <th>Date</th>
                            <th>Net Salary</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100 font-semibold">
                            <td className="py-3">1.</td>
                            <td className="font-extrabold text-slate-800">ABC1234</td>
                            <td className="text-slate-500">Jan 2026</td>
                            <td>05/01/2026</td>
                            <td className="font-bold text-slate-800">20,000</td>
                            <td className="text-slate-500">Bank</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px]">Paid</span></td>
                            <td><span className="text-sky-600 hover:underline cursor-pointer">👁 View</span></td>
                          </tr>
                          <tr className="border-b border-slate-100 font-semibold">
                            <td className="py-3">2.</td>
                            <td className="font-extrabold text-slate-800">ABC1234</td>
                            <td className="text-slate-500">Feb 2026</td>
                            <td>05/02/2026</td>
                            <td className="font-bold text-slate-800">20,000</td>
                            <td className="text-slate-400">—</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-black text-[9px]">Unpaid</span></td>
                            <td><button type="button" onClick={() => alert('Processing payment...')} className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold">Pay Now</button></td>
                          </tr>
                          <tr className="font-semibold">
                            <td className="py-3">3.</td>
                            <td className="font-extrabold text-slate-800">ABC1234</td>
                            <td className="text-slate-500">Mar 2026</td>
                            <td>05/03/2026</td>
                            <td className="font-bold text-slate-800">20,000</td>
                            <td className="text-slate-500">Online</td>
                            <td><span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-black text-[9px]">Unpaid</span></td>
                            <td><button type="button" onClick={() => alert('Processing payment...')} className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold">Pay Now</button></td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Footer total pay details (Screenshot 5) */}
                      <div className="flex justify-between items-center bg-slate-50 border p-4 rounded-2xl mt-4">
                        <span className="font-black text-slate-700">Total Payment Amount</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-[#1b3a60]">66,000/-</span>
                          <button type="button" onClick={() => alert('Processing total dues payment...')} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold">Pay Dues</button>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* 5. Login Details Tab (Screenshot 2) */}
                {activeProfileTab === 'login' && (
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <h5 className="text-[10px] font-black text-[#1b3a60] uppercase border-b pb-2 flex justify-between items-center mb-4">
                      <span>Login/Account Details</span>
                      <button type="button" className="text-[9px] text-teal-605 font-bold border px-2 py-0.5 rounded hover:bg-slate-50 text-teal-600">Edit</button>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase">User Name</label>
                        <input type="text" value={selectedDriver.username} readOnly className="w-full px-4 py-2 border rounded-lg text-xs bg-slate-50 outline-none font-semibold font-mono" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase">Password</label>
                        <div className="relative">
                          <input type="password" value="123456789" readOnly className="w-full px-4 py-2 border rounded-lg text-xs bg-slate-50 outline-none font-semibold font-mono" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400">👁</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase">Confirm Password</label>
                        <div className="relative">
                          <input type="password" value="123456789" readOnly className="w-full px-4 py-2 border rounded-lg text-xs bg-slate-50 outline-none font-semibold font-mono" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400">👁</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

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
