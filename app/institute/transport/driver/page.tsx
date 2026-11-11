'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, RotateCcw, X, UploadCloud, CheckCircle2, ArrowLeft, ArrowRight, Printer, Calendar } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface DriverRecord {
  id: number
  username: string
  driverName: string
  driverId: string
  licenseNumber: string
  licenseType: string
  assignedVehicle?: string
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
  photo?: string
  aadharNo?: string
  basicSalary?: string
  hra?: string
  conveyance?: string
  specialAllowance?: string
  customAllowances?: any[]
  allocatedLeaves?: any[]
  leaveQuotaFrequency?: 'Monthly' | 'Annually'
  leaveEffectiveDate?: string
  grossSalary?: string
  accountHolderName?: string
  accountNo?: string
  ifscCode?: string
  bankName?: string
  panNo?: string
  upiId?: string
  uanNo?: string
  pfNo?: string
  deletedDate?: string
}

const INITIAL_ACTIVE: DriverRecord[] = []
const INITIAL_DELETED: DriverRecord[] = []

export default function TransportDriverPage() {
  const [activeDrivers, setActiveDrivers] = useState<DriverRecord[]>(INITIAL_ACTIVE)
  const [deletedDrivers, setDeletedDrivers] = useState<DriverRecord[]>(INITIAL_DELETED)
  const [currentTab, setCurrentTab] = useState<'active' | 'deleted'>('active')
  const [searchQuery, setSearchQuery] = useState('')

  // View profile target modal
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'details' | 'attendance' | 'leave' | 'payroll' | 'login'>('details')

  // Multi-step Wizard Modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null)
  const [vehiclesList, setVehiclesList] = useState<any[]>([])

  // Toast notifications state
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const savedActive = localStorage.getItem('transport_drivers')
    const savedDeleted = localStorage.getItem('deleted_transport_drivers')
    const savedVehicles = localStorage.getItem('transport_vehicles')

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

    if (savedVehicles) {
      try { setVehiclesList(JSON.parse(savedVehicles)) } catch (e) { console.error(e) }
    }
  }, [])

  // Open Add Driver Modal
  const openAddModal = () => {
    setEditingDriver(null)
    setAddModalOpen(true)
  }

  // Open Edit Driver Modal
  const openEditModal = (driver: DriverRecord) => {
    setEditingDriver(driver)
    setAddModalOpen(true)
  }

  // Save Driver from Wizard Modal
  const handleSaveDriverFromWizard = (payload: DriverRecord) => {
    let updated: DriverRecord[] = []
    if (editingDriver) {
      updated = activeDrivers.map(d => d.id === editingDriver.id ? payload : d)
    } else {
      updated = [payload, ...activeDrivers]
    }

    setActiveDrivers(updated)
    localStorage.setItem('transport_drivers', JSON.stringify(updated))
    setAddModalOpen(false)
    setToastMsg(editingDriver ? `Driver ${payload.driverName} updated successfully!` : `Driver ${payload.driverName} added successfully!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

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
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Driver Directory</h1>
          <p className="text-xs text-slate-400">Manage school transport drivers, license & vehicle assignments</p>
        </div>
      </div>

      {/* Control Actions / Search and Add Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, ID, mobile no, username..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold bg-slate-50 dark:bg-slate-900"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => toast.success('Exporting drivers database...')}
            className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors bg-white"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Driver
          </button>
        </div>

      </div>

      {/* Active vs Deleted status tab buttons */}
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
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 w-16">S. No.</th>
                  <th className="px-4 py-3.5 text-left">Username</th>
                  <th className="px-4 py-3.5 text-left">Driver Name</th>
                  <th className="px-4 py-3.5">Driver ID</th>
                  <th className="px-4 py-3.5">License Number</th>
                  <th className="px-4 py-3.5">Assigned Vehicle</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joining Date</th>
                  <th className="px-4 py-3.5 w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                {activeFiltered.map((driver, idx) => (
                  <tr key={driver.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-400 font-mono font-bold">{driver.username}</td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2.5">
                        {driver.photo ? (
                          <img src={driver.photo} alt={driver.driverName} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm border border-slate-200 shrink-0">👤</div>
                        )}
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{driver.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{driver.driverId}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                        {driver.licenseNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-teal-600 dark:text-teal-400">
                      {(() => {
                        const matchedVeh = vehiclesList.find((v: any) => {
                          const vD = String(v.assignedDriver || '').toLowerCase()
                          return vD.includes(driver.driverName.toLowerCase())
                        })
                        return matchedVeh ? `${matchedVeh.vehicleName} (${matchedVeh.registrationNo})` : (driver.assignedVehicle || '—')
                      })()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">{driver.contact}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap inline-flex items-center gap-1 ${
                        driver.status === 'Active' 
                          ? 'text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60' 
                          : 'text-rose-500 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
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
                          className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(driver)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          title="Edit Driver Wizard"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(driver)}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeFiltered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-bold text-xs">No active drivers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 w-16">S. No.</th>
                  <th className="px-4 py-3.5 text-left">Username</th>
                  <th className="px-4 py-3.5 text-left">Driver Name</th>
                  <th className="px-4 py-3.5">Driver ID</th>
                  <th className="px-4 py-3.5">License Number</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Joining Date</th>
                  <th className="px-4 py-3.5">Deleted Date</th>
                  <th className="px-4 py-3.5 w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                {deletedFiltered.map((driver, idx) => (
                  <tr key={driver.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-400 font-mono font-bold">{driver.username}</td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{driver.driverName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{driver.driverId}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{driver.licenseNumber}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">{driver.contact}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold">{driver.joiningDate}</td>
                    <td className="px-4 py-3.5 font-bold text-rose-500">{driver.deletedDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleRestore(driver)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
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
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-bold text-xs">No deleted drivers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-semibold text-slate-500">
          <span>Showing 1-{(currentTab === 'active' ? activeFiltered : deletedFiltered).length} of {(currentTab === 'active' ? activeFiltered : deletedFiltered).length} Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* Driver Profile Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[840px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Driver Profile</span>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Core */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center md:col-span-1">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border text-4xl shadow-sm relative mb-3 overflow-hidden">
                    {selectedDriver.photo ? <img src={selectedDriver.photo} className="w-full h-full object-cover" /> : '🧔'}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedDriver.driverName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Username: {selectedDriver.username}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-sm md:col-span-2 relative text-xs flex flex-col justify-between">
                  <h5 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b pb-2 flex justify-between items-center mb-2">
                    <span>Personal Information</span>
                    <button onClick={() => { setSelectedDriver(null); openEditModal(selectedDriver); }} className="text-[9px] text-teal-600 font-bold border px-2 py-0.5 rounded hover:bg-slate-50">Edit</button>
                  </h5>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-slate-700 dark:text-slate-300">
                    <div><span className="text-[9px] uppercase font-bold text-slate-400 block">Driver ID</span><span className="font-extrabold">{selectedDriver.driverId}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-400 block">License No.</span><span className="font-extrabold">{selectedDriver.licenseNumber} ({selectedDriver.licenseType})</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-400 block">Mobile No.</span><span className="font-extrabold">{selectedDriver.contact}</span></div>
                    <div><span className="text-[9px] uppercase font-bold text-slate-400 block">Assigned Vehicle</span><span className="font-extrabold text-teal-600">{selectedDriver.assignedVehicle || 'None'}</span></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MULTI-STEP WIZARD POPUP MODAL */}
      {addModalOpen && (
        <DriverWizardModal 
          editingDriver={editingDriver}
          vehiclesList={vehiclesList}
          driverCount={activeDrivers.length}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSaveDriverFromWizard}
        />
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

function DriverWizardModal({ 
  editingDriver, 
  vehiclesList, 
  driverCount, 
  onClose, 
  onSave 
}: { 
  editingDriver: DriverRecord | null, 
  vehiclesList: any[], 
  driverCount: number, 
  onClose: () => void, 
  onSave: (payload: DriverRecord) => void 
}) {
  const STEPS = ['Personal Details', 'License Details', 'Address Details', 'Payroll & Leave', 'Payment Details', 'Final Preview'] as const
  type StepType = typeof STEPS[number]

  const [currentStep, setCurrentStep] = useState<StepType>('Personal Details')

  // Step 1: Personal
  const [role, setRole] = useState('Driver')
  const [driverId, setDriverId] = useState(editingDriver?.driverId || `${driverCount + 1}`)
  const [joiningDate, setJoiningDate] = useState(editingDriver?.joiningDate || new Date().toISOString().split('T')[0])
  const [firstName, setFirstName] = useState(editingDriver ? editingDriver.driverName.split(' ')[0] : '')
  const [lastName, setLastName] = useState(editingDriver ? editingDriver.driverName.split(' ').slice(1).join(' ') : '')
  const [mobileNo, setMobileNo] = useState(editingDriver?.contact || '')
  const [emailId, setEmailId] = useState(editingDriver?.email || '')
  const [gender, setGender] = useState(editingDriver?.gender || 'Male')
  const [dob, setDob] = useState(editingDriver?.dob || '1990-01-01')
  const [fatherName, setFatherName] = useState(editingDriver?.fatherName || '')
  const [maritalStatus, setMaritalStatus] = useState(editingDriver?.maritalStatus || 'Married')
  const [nationality, setNationality] = useState('Indian')
  const [religion, setReligion] = useState(editingDriver?.religion || 'Hindu')
  const [category, setCategory] = useState(editingDriver?.category || 'General')
  const [username, setUsername] = useState(editingDriver?.username || '')
  const [password, setPassword] = useState('123456789')
  const [confirmPassword, setConfirmPassword] = useState('123456789')
  const [photo, setPhoto] = useState(editingDriver?.photo || '')

  // Step 2: License
  const [licenseType, setLicenseType] = useState(editingDriver?.licenseType || 'LMV')
  const [licenseNumber, setLicenseNumber] = useState(editingDriver?.licenseNumber || '')
  const [licenseIssueDate, setLicenseIssueDate] = useState('2013-06-12')
  const [licenseValidTill, setLicenseValidTill] = useState('2028-06-11')
  const [assignedVehicle, setAssignedVehicle] = useState(editingDriver?.assignedVehicle || '')

  // Step 3: Address
  const [address, setAddress] = useState(editingDriver?.address || '')
  const [state, setState] = useState(editingDriver?.state || 'Uttar Pradesh')
  const [district, setDistrict] = useState(editingDriver?.district || 'Lucknow')
  const [pincode, setPincode] = useState(editingDriver?.pincode || '')
  const [aadharNo, setAadharNo] = useState(editingDriver?.aadharNo || '')
  const [aadharFileName, setAadharFileName] = useState('Aadhar Card.jpg')
  const [sigFileName, setSigFileName] = useState('Signature.png')

  // Step 4: Payroll & Leave
  const [basicSalary, setBasicSalary] = useState(editingDriver?.basicSalary || '12500')
  const [hra, setHra] = useState(editingDriver?.hra || '2000')
  const [conveyance, setConveyance] = useState(editingDriver?.conveyance || '1500')
  const [specialAllowance, setSpecialAllowance] = useState(editingDriver?.specialAllowance || '4000')
  const [customAllowances, setCustomAllowances] = useState<any[]>(editingDriver?.customAllowances || [])
  const [grossSalary, setGrossSalary] = useState(editingDriver?.grossSalary || '20000')

  const [leaveQuotaFrequency, setLeaveQuotaFrequency] = useState<'Monthly' | 'Annually'>(editingDriver?.leaveQuotaFrequency || 'Annually')
  const [leaveEffectiveDate, setLeaveEffectiveDate] = useState(editingDriver?.leaveEffectiveDate || '')
  const [allocatedLeaves, setAllocatedLeaves] = useState<any[]>(() => {
    if (Array.isArray(editingDriver?.allocatedLeaves) && editingDriver.allocatedLeaves.length > 0) {
      return editingDriver.allocatedLeaves
    }
    const defaultDate = editingDriver?.leaveEffectiveDate || ''
    return [
      { id: 1, leaveType: 'Casual Leave', leaveAbbr: 'CL', allowedLeaves: '12', applyFrom: defaultDate },
      { id: 2, leaveType: 'Medical Leave', leaveAbbr: 'ML', allowedLeaves: '10', applyFrom: defaultDate },
      { id: 3, leaveType: 'Half Day Leave', leaveAbbr: 'HDL', allowedLeaves: '6', applyFrom: defaultDate },
      { id: 4, leaveType: 'Sick Leave', leaveAbbr: 'SL', allowedLeaves: '8', applyFrom: defaultDate }
    ]
  })

  const calculateGross = (b: string, h: string, c: string, s: string, allowances: any[]) => {
    const customSum = allowances.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)
    const total = (parseFloat(b) || 0) + (parseFloat(h) || 0) + (parseFloat(c) || 0) + (parseFloat(s) || 0) + customSum
    return total > 0 ? String(total) : ''
  }

  const addCustomAllowance = () => {
    const updated = [...customAllowances, { id: Date.now(), title: '', amount: '' }]
    setCustomAllowances(updated)
    setGrossSalary(calculateGross(basicSalary, hra, conveyance, specialAllowance, updated))
  }

  const updateCustomAllowance = (idx: number, field: string, val: string) => {
    const updated = [...customAllowances]
    updated[idx] = { ...updated[idx], [field]: val }
    setCustomAllowances(updated)
    setGrossSalary(calculateGross(basicSalary, hra, conveyance, specialAllowance, updated))
  }

  const removeCustomAllowance = (idx: number) => {
    const updated = customAllowances.filter((_, i) => i !== idx)
    setCustomAllowances(updated)
    setGrossSalary(calculateGross(basicSalary, hra, conveyance, specialAllowance, updated))
  }

  const handleLeaveDateChange = (val: string) => {
    setLeaveEffectiveDate(val)
    const updated = allocatedLeaves.map(l => ({ ...l, applyFrom: val }))
    setAllocatedLeaves(updated)
  }

  const updateLeaveRow = (index: number, field: string, val: string) => {
    const updated = [...allocatedLeaves]
    updated[index] = { ...updated[index], [field]: val }
    setAllocatedLeaves(updated)
  }

  const addCustomLeave = () => {
    const newRow = { id: Date.now(), leaveType: 'Special Leave', leaveAbbr: 'SPL', allowedLeaves: '5', applyFrom: leaveEffectiveDate }
    setAllocatedLeaves([...allocatedLeaves, newRow])
  }

  const removeCustomLeave = (index: number) => {
    setAllocatedLeaves(allocatedLeaves.filter((_, i) => i !== index))
  }

  // Step 5: Payment
  const [accountHolderName, setAccountHolderName] = useState(editingDriver?.accountHolderName || `${firstName} ${lastName}`.trim())
  const [accountNo, setAccountNo] = useState(editingDriver?.accountNo || '')
  const [ifscCode, setIfscCode] = useState(editingDriver?.ifscCode || '')
  const [bankName, setBankName] = useState(editingDriver?.bankName || '')
  const [panNo, setPanNo] = useState(editingDriver?.panNo || '')
  const [upiId, setUpiId] = useState(editingDriver?.upiId || '')
  const [uanNo, setUanNo] = useState(editingDriver?.uanNo || '')
  const [pfNo, setPfNo] = useState(editingDriver?.pfNo || '')

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    if (currentStep === 'Personal Details' && (!firstName.trim() || !mobileNo.trim())) {
      toast.error('Please fill in required fields: First Name and Mobile No.')
      return
    }
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1])
    }
  }

  const handleBack = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1])
    }
  }

  const handleSubmit = () => {
    const fullDriverName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const payload: DriverRecord = {
      id: editingDriver?.id || Date.now(),
      username: username.trim() || `dri_${driverId.trim() || Date.now()}`,
      driverName: fullDriverName,
      driverId: driverId.trim() || `${driverCount + 1}`,
      licenseNumber: licenseNumber.trim() || 'N/A',
      licenseType,
      assignedVehicle,
      contact: mobileNo.trim(),
      status: editingDriver?.status || 'Active',
      joiningDate,
      email: emailId.trim(),
      gender,
      dob,
      fatherName,
      maritalStatus,
      religion,
      category,
      address,
      district,
      state,
      pincode,
      photo,
      aadharNo,
      basicSalary,
      hra,
      conveyance,
      specialAllowance,
      customAllowances,
      grossSalary,
      leaveQuotaFrequency,
      leaveEffectiveDate,
      allocatedLeaves,
      bankName,
      accountNo
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-teal-400">
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </h1>
            <p className="text-[12px] text-slate-300 font-medium">Configure driver profile, license, address & payroll parameters</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar Header */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {STEPS.map((stepLabel, index) => {
              const stepNumber = index + 1
              const isActive = stepLabel === currentStep
              const isCompleted = STEPS.indexOf(stepLabel) < STEPS.indexOf(currentStep)

              return (
                <button
                  key={stepNumber}
                  type="button"
                  onClick={() => {
                    if (isCompleted) setCurrentStep(stepLabel)
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md scale-[1.02]' 
                      : isCompleted 
                        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive 
                      ? 'bg-white text-teal-600' 
                      : isCompleted 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </span>
                  <span>{stepLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Modal Scrollable Core */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 'Personal Details' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Joining Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Role *</label>
                      <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none">
                        <option value="Driver">Driver</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Driver ID *</label>
                      <input type="text" value={driverId} onChange={e => setDriverId(e.target.value)} placeholder="Enter Driver ID" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Joining Date *</label>
                      <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Basic Info</h3>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">First Name *</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile No. *</label><input type="text" value={mobileNo} onChange={e => setMobileNo(e.target.value)} placeholder="Mobile No." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Id</label><input type="email" value={emailId} onChange={e => setEmailId(e.target.value)} placeholder="Email Id" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" /></div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender *</label>
                        <div className="flex gap-4 pt-1">
                          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="radio" name="gnd" checked={gender === 'Male'} onChange={() => setGender('Male')} /> Male</label>
                          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="radio" name="gnd" checked={gender === 'Female'} onChange={() => setGender('Female')} /> Female</label>
                          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="radio" name="gnd" checked={gender === 'Others'} onChange={() => setGender('Others')} /> Others</label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth *</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" /></div>
                    </div>

                    {/* Upload Photo */}
                    <div className="w-44 h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center rounded-2xl p-3 gap-2 text-center shrink-0">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border text-2xl overflow-hidden">
                        {photo ? <img src={photo} className="w-full h-full object-cover" /> : '🧔'}
                      </div>
                      <label className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm">
                        Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Login / Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">User Name *</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold outline-none" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password *</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none" /></div>
                  </div>
                </div>
             </div>
          )}

          {/* STEP 2: LICENSE DETAILS */}
          {currentStep === 'License Details' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">License Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">License Type *</label>
                      <select value={licenseType} onChange={e => setLicenseType(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none">
                         <option value="LMV">LMV (Light Motor Vehicle)</option>
                         <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                         <option value="PSV">PSV (Public Service Vehicle)</option>
                      </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">License Number *</label>
                      <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. LMV/123/456" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Date *</label>
                      <input type="date" value={licenseIssueDate} onChange={e => setLicenseIssueDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid Till *</label>
                      <input type="date" value={licenseValidTill} onChange={e => setLicenseValidTill(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                   </div>
                </div>
             </div>
          )}

          {/* STEP 3: ADDRESS DETAILS */}
          {currentStep === 'Address Details' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Residential Address</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address *</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street Address, Locality" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">State *</label>
                      <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">District *</label>
                      <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pincode *</label>
                      <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Pincode" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Identity Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Aadhar No. *</label>
                      <input type="text" value={aadharNo} onChange={e => setAadharNo(e.target.value)} placeholder="Aadhar Card No." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Aadhar File</label>
                      <div className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 flex justify-between items-center">
                        <span>{aadharFileName}</span>
                        <span className="text-teal-600 font-bold">📎 Upload</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Signature File</label>
                      <div className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 flex justify-between items-center">
                        <span>{sigFileName}</span>
                        <span className="text-teal-600 font-bold">📎 Upload</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* STEP 4: PAYROLL & LEAVE */}
          {currentStep === 'Payroll & Leave' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Monthly Salary Structure</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Basic Salary (₹) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 15000" 
                        value={basicSalary} 
                        onChange={e => { 
                          setBasicSalary(e.target.value)
                          setGrossSalary(calculateGross(e.target.value, hra, conveyance, specialAllowance, customAllowances)) 
                        }} 
                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        HRA (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2000" 
                        value={hra} 
                        onChange={e => { 
                          setHra(e.target.value)
                          setGrossSalary(calculateGross(basicSalary, e.target.value, conveyance, specialAllowance, customAllowances)) 
                        }} 
                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Conveyance Allowance (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500" 
                        value={conveyance} 
                        onChange={e => { 
                          setConveyance(e.target.value)
                          setGrossSalary(calculateGross(basicSalary, hra, e.target.value, specialAllowance, customAllowances)) 
                        }} 
                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Special Allowance (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 4000" 
                        value={specialAllowance} 
                        onChange={e => { 
                          setSpecialAllowance(e.target.value)
                          setGrossSalary(calculateGross(basicSalary, hra, conveyance, e.target.value, customAllowances)) 
                        }} 
                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    {/* Add Salary Title Button placed directly after Special Allowance */}
                    <div className="flex flex-col justify-end">
                      <label className="invisible hidden sm:block text-xs font-black uppercase tracking-wide mb-1.5 select-none">
                        Action
                      </label>
                      <button 
                        type="button" 
                        onClick={addCustomAllowance} 
                        className="w-full h-[42px] px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Salary Title (Other)</span>
                      </button>
                    </div>

                    {/* Dynamic Custom Allowances */}
                    {customAllowances.map((item, idx) => (
                      <div key={item.id || idx} className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-stretch sm:items-end">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Salary Title / Component</label>
                          <input 
                            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                            placeholder="e.g. Overtime Allowance, Fuel Allowance, Bonus" 
                            value={item.title || ''} 
                            onChange={e => updateCustomAllowance(idx, 'title', e.target.value)} 
                            list="driver-salary-titles"
                          />
                        </div>
                        <div className="sm:w-64">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                          <input 
                            type="number" 
                            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                            placeholder="e.g. 2000" 
                            value={item.amount || ''} 
                            onChange={e => updateCustomAllowance(idx, 'amount', e.target.value)} 
                          />
                        </div>
                        <div className="pb-0.5 self-end">
                          <button 
                            type="button" 
                            onClick={() => removeCustomAllowance(idx)} 
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove Component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Gross Monthly Salary ALWAYS IN LAST */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Gross Monthly Salary (₹)
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          readOnly 
                          className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-bold text-teal-700 dark:text-teal-300 cursor-not-allowed" 
                          placeholder="₹ 0" 
                          value={grossSalary ? `₹ ${Number(grossSalary).toLocaleString('en-IN')}` : '₹ 0'} 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          Calculated
                        </span>
                      </div>
                    </div>
                  </div>

                  <datalist id="driver-salary-titles">
                    <option value="Overtime Allowance" />
                    <option value="Fuel Allowance" />
                    <option value="Night Shift Allowance" />
                    <option value="Performance Bonus" />
                    <option value="Medical Allowance" />
                    <option value="Other Allowance" />
                  </datalist>
                </div>

                {/* ── DISTINCT VISUAL BORDER BETWEEN PAYROLL & LEAVE ── */}
                <div className="relative my-8 py-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-xs flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Allocated Leave Quota Section</span>
                    </span>
                  </div>
                </div>

                {/* ALLOCATED LEAVE QUOTA */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Allocated Leave Quota</h3>
                      {/* Monthly / Annually Radio Buttons */}
                      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                          <input 
                            type="radio" 
                            name="driverLeaveQuotaFrequency" 
                            value="Monthly" 
                            checked={leaveQuotaFrequency === 'Monthly'} 
                            onChange={() => setLeaveQuotaFrequency('Monthly')} 
                            className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                          />
                          <span>Monthly</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                          <input 
                            type="radio" 
                            name="driverLeaveQuotaFrequency" 
                            value="Annually" 
                            checked={leaveQuotaFrequency === 'Annually'} 
                            onChange={() => setLeaveQuotaFrequency('Annually')} 
                            className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                          />
                          <span>Annually</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap">
                        Effective Date:
                      </label>
                      <input 
                        type="date" 
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500" 
                        value={leaveEffectiveDate} 
                        onChange={e => handleLeaveDateChange(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Column Headers for larger screens */}
                  <div className="space-y-3">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3 text-xs font-black text-slate-500 uppercase tracking-wide">
                      <div className="col-span-6">Leave Name</div>
                      <div className="col-span-2">Abbr</div>
                      <div className="col-span-3">Allowed Days ({leaveQuotaFrequency === 'Monthly' ? 'Per Month' : 'Per Year'})</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>

                    {/* Leave Rows */}
                    {allocatedLeaves.map((row, i) => (
                      <div 
                        key={row.id || i} 
                        className="flex flex-col sm:grid sm:grid-cols-12 gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 items-center"
                      >
                        <div className="w-full sm:col-span-6">
                          <label className="sm:hidden block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                            Leave Name
                          </label>
                          <input 
                            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                            placeholder="e.g. Casual Leave" 
                            value={row.leaveType || ''} 
                            onChange={e => updateLeaveRow(i, 'leaveType', e.target.value)} 
                          />
                        </div>
                        <div className="w-full sm:col-span-2">
                          <label className="sm:hidden block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                            Abbr
                          </label>
                          <input 
                            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-bold uppercase text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                            placeholder="CL" 
                            value={row.leaveAbbr || ''} 
                            onChange={e => updateLeaveRow(i, 'leaveAbbr', e.target.value)} 
                          />
                        </div>
                        <div className="w-full sm:col-span-3">
                          <label className="sm:hidden block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                            Allowed Days
                          </label>
                          <div className="relative">
                            <input 
                              type="number" 
                              className="w-full px-3.5 py-2.5 pr-14 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                              placeholder={leaveQuotaFrequency === 'Monthly' ? 'e.g. 1' : 'e.g. 12'} 
                              value={row.allowedLeaves || ''} 
                              onChange={e => updateLeaveRow(i, 'allowedLeaves', e.target.value)} 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 pointer-events-none">
                              DAYS
                            </span>
                          </div>
                        </div>
                        <div className="w-full sm:col-span-1 flex justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeCustomLeave(i)} 
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove Leave Type"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {allocatedLeaves.length === 0 && (
                      <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        No leave types allocated. Click &quot;Add Leave Type&quot; below to allocate leaves.
                      </div>
                    )}

                    {/* Add Leave Type Button at the bottom */}
                    <div className="flex justify-center sm:justify-start pt-2">
                      <button 
                        type="button" 
                        onClick={addCustomLeave} 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-[#0f766e] dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Leave Type</span>
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* STEP 5: PAYMENT DETAILS */}
          {currentStep === 'Payment Details' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Account Holder Name</label><input type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Bank Account No.</label><input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">IFSC Code</label><input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Bank Name</label><input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">PAN No.</label><input type="text" value={panNo} onChange={e => setPanNo(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b pb-2">Other Account Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">UPI ID</label><input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">UAN No.</label><input type="text" value={uanNo} onChange={e => setUanNo(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">PF Account No.</label><input type="text" value={pfNo} onChange={e => setPfNo(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold" /></div>
                  </div>
                </div>
             </div>
          )}

          {/* STEP 6: FINAL PREVIEW */}
          {currentStep === 'Final Preview' && (
             <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-2">Driver Overview</h4>
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-3xl overflow-hidden border">
                            {photo ? <img src={photo} className="w-full h-full object-cover" /> : '🧔'}
                         </div>
                         <div>
                            <span className="text-base font-black text-slate-800 dark:text-slate-100 block">{firstName} {lastName}</span>
                            <span className="text-xs text-slate-500 font-semibold block">ID: {driverId} • Mobile: {mobileNo}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-2">License & Payroll</h4>
                      <div className="space-y-1.5 text-xs">
                         <div className="flex justify-between"><span className="text-slate-500">License Number:</span><span className="font-bold">{licenseNumber} ({licenseType})</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Joining Date:</span><span className="font-bold">{joiningDate}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Gross Salary:</span><span className="font-bold text-teal-600">₹{grossSalary}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Bank Account:</span><span className="font-bold">{accountNo || 'N/A'}</span></div>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>

        {/* Modal Footer Buttons */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-xs transition-all shadow-sm"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {STEPS.indexOf(currentStep) > 0 && (
              <button 
                type="button"
                onClick={handleBack} 
                className="px-6 py-2 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 text-xs transition-all shadow-sm"
              >
                Back
              </button>
            )}

            {currentStep !== 'Final Preview' ? (
              <button 
                type="button"
                onClick={handleNext} 
                className="px-8 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 text-xs transition-all shadow-md shadow-teal-600/20"
              >
                Save & Next
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit} 
                className="px-8 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 text-xs transition-all shadow-md shadow-teal-600/20"
              >
                Confirm & Save Driver
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
