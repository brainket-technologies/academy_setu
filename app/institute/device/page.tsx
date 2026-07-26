'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Download, X, Upload, CheckCircle2, ChevronUp, ChevronDown, FileText } from 'lucide-react'

interface DeviceRecord {
  id: number
  deviceName: string
  brand: string
  deviceType: 'GPS' | 'Finger Print' | 'Attendance'
  simNo: string
  simImei: string
  deviceSrNo: string
  validFrom: string
  validTo: string
  expiryDays: number
  status: string
}

interface PaymentHistoryRecord {
  id: number
  planName: string
  validFrom: string
  validTo: string
  mode: string
  transId: string
  amount: number
  status: 'Under Verification' | 'Paid'
}

const INITIAL_DEVICES: DeviceRecord[] = [
]

const MOCK_PAYMENTS: PaymentHistoryRecord[] = [
]

export default function DeviceModulePage() {
  const [view, setView] = useState<'list' | 'details'>('list')
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null)

  // List filter state
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Add Device Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newBrand, setNewBrand] = useState('')
  const [newType, setNewType] = useState<'GPS' | 'Finger Print' | 'Attendance'>('GPS')
  const [newName, setNewName] = useState('')
  const [newSrNo, setNewSrNo] = useState('')
  const [newSimImei, setNewSimImei] = useState('')
  const [newSimNo, setNewSimNo] = useState('')

  // Device Details Status State
  const [detailsStatus, setDetailsStatus] = useState('Active')

  // Toast State
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const [devicesList, setDevicesList] = useState<DeviceRecord[]>(INITIAL_DEVICES)

  useEffect(() => {
    const saved = localStorage.getItem('school_devices_gps')
    if (saved) {
      try {
        setDevicesList(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_devices_gps', JSON.stringify(INITIAL_DEVICES))
    }
  }, [])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleOpenDetails = (dev: DeviceRecord) => {
    setSelectedDevice(dev)
    setDetailsStatus(dev.status)
    setView('details')
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newSrNo || !newSimNo) {
      alert('Please fill in all required fields marked with *.')
      return
    }

    const newDev: DeviceRecord = {
      id: Date.now(),
      deviceName: newName,
      brand: newBrand || 'Brand 1',
      deviceType: newType,
      simNo: newSimNo,
      simImei: newSimImei || 'IMEI-' + Date.now(),
      deviceSrNo: newSrNo,
      validFrom: new Date().toLocaleDateString('en-GB'),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      expiryDays: 365,
      status: 'Active'
    }

    const updated = [newDev, ...devicesList]
    setDevicesList(updated)
    localStorage.setItem('school_devices_gps', JSON.stringify(updated))

    // Reset Form
    setNewName('')
    setNewBrand('')
    setNewSrNo('')
    setNewSimImei('')
    setNewSimNo('')
    setAddModalOpen(false)
    triggerToast('New device added successfully!')
  }

  const filteredDevices = devicesList.filter(d => {
    const matchesType = deviceTypeFilter ? d.deviceType === deviceTypeFilter : true
    const term = searchQuery.toLowerCase()
    const matchesSearch = term ? (
      d.deviceName.toLowerCase().includes(term) ||
      d.deviceSrNo.toLowerCase().includes(term) ||
      d.simNo.includes(term)
    ) : true
    return matchesType && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* View Header */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">
          {view === 'list' ? 'All Device' : 'Device Name Details'}
        </h1>

        {view === 'list' ? (
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-5 py-2.5 bg-white border text-slate-700 hover:bg-slate-50 rounded-xl font-bold shadow-sm transition-all text-xs"
          >
            Back to List
          </button>
        )}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Filter Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6 text-xs font-semibold text-slate-700">
            <div className="flex flex-col gap-1.5 w-full md:w-64">
              <label className="text-slate-500 font-bold">Device Type</label>
              <select
                value={deviceTypeFilter}
                onChange={e => setDeviceTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-bold"
              >
                <option value="">Select an Option</option>
                <option value="GPS">GPS</option>
                <option value="Finger Print">Finger Print</option>
                <option value="Attendance">Attendance</option>
              </select>
            </div>

            <div className="flex items-end gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Device Name, Serial no, IMEI no."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none font-bold text-slate-700 placeholder-slate-400 text-xs"
                />
              </div>
              <button
                type="button"
                className="w-10 h-10 border rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-100 shadow-sm"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 font-black text-slate-655 border-b">
                <tr>
                  <th className="px-3 py-4 w-14">S. No.</th>
                  <th className="px-3 py-4 text-left">Device Name</th>
                  <th className="px-3 py-4">Device Type</th>
                  <th className="px-3 py-4">SIM No.</th>
                  <th className="px-3 py-4">Valid From</th>
                  <th className="px-3 py-4">Valid To</th>
                  <th className="px-3 py-4">Expiry Days</th>
                  <th className="px-3 py-4 w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((item, idx) => {
                  const isSoon = item.expiryDays <= 15
                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.deviceName}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.deviceType}</td>
                      <td className="px-3 py-3.5 text-slate-700">{item.simNo}</td>
                      <td className="px-3 py-3.5 text-slate-450 leading-tight text-[10px]">
                        {item.validFrom}
                      </td>
                      <td className="px-3 py-3.5 text-slate-450 leading-tight text-[10px]">
                        {item.validTo}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          item.expiryDays <= 5 ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {String(item.expiryDays).padStart(2, '0')} Days
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(item)}
                          className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 border text-slate-400 flex items-center justify-center mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No devices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Details View */}
      {view === 'details' && selectedDevice && (
        <div className="space-y-6 text-xs font-semibold text-slate-700">
          
          {/* Device Details form card */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            
            <h2 className="text-xs font-black text-slate-800 border-b pb-2">Device Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Brand</label>
                <input type="text" readOnly value={selectedDevice.brand} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device Type</label>
                <input type="text" readOnly value={selectedDevice.deviceType} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device Name</label>
                <input type="text" readOnly value={selectedDevice.deviceName} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device IMEI No.</label>
                <input type="text" readOnly value={selectedDevice.deviceSrNo} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
            </div>

            <h2 className="text-xs font-black text-slate-800 border-b pb-2">SIM Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">SIM IMEI No.</label>
                <input type="text" readOnly value={selectedDevice.simImei} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Sim No.</label>
                <input type="text" readOnly value={'+91 ' + selectedDevice.simNo} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
            </div>

            <h2 className="text-xs font-black text-slate-800 border-b pb-2">Device Image</h2>
            <div className="border border-dashed p-8 rounded-xl bg-slate-50 text-center max-w-lg text-slate-400 flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-6 h-6" />
              <span>Device Image Display</span>
            </div>

            <h2 className="text-xs font-black text-slate-800 border-b pb-2">Device Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Select Status</label>
                <select
                  value={detailsStatus}
                  onChange={e => setDetailsStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Device plan recharged successfully!')}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Recharge
              </button>
            </div>

          </div>

          {/* Current & Upcoming Plan tables */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Current Plan</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-3">Plan Name</th>
                    <th className="px-3 py-3">Plan Valid From</th>
                    <th className="px-3 py-3">Plan Valid To</th>
                    <th className="px-3 py-3 w-16">Bill</th>
                    <th className="px-3 py-3 w-40">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold text-slate-700">
                    <td className="px-3 py-3 font-bold text-slate-850">Premium GPS Plan</td>
                    <td className="px-3 py-3 text-slate-500">{selectedDevice.validFrom}</td>
                    <td className="px-3 py-3 text-slate-500">{selectedDevice.validTo}</td>
                    <td className="px-3 py-3">
                      <FileText className="w-4 h-4 text-teal-600 cursor-pointer mx-auto" />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => triggerToast('Upcoming plan config active.')}
                        className="px-3 py-1 bg-teal-55 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-[9px] shadow-sm"
                      >
                        Add Upcoming Plan
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2 pt-4">Upcoming Plan</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-3">Plan Name</th>
                    <th className="px-3 py-3">Plan Valid From</th>
                    <th className="px-3 py-3">Plan Valid To</th>
                    <th className="px-3 py-3 w-16">Bill</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold text-slate-700">
                    <td className="px-3 py-3 font-bold text-slate-850">Standard Tracker Plan</td>
                    <td className="px-3 py-3 text-slate-500">15/09/2026</td>
                    <td className="px-3 py-3 text-slate-500">14/09/2027</td>
                    <td className="px-3 py-3">
                      <FileText className="w-4 h-4 text-teal-600 cursor-pointer mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History card */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Payment History</h2>
            
            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-slate-500 font-bold">Status</label>
              <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold">
                <option value="">Select an Option</option>
                <option value="Paid">Paid</option>
                <option value="Under Verification">Under Verification</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4">Plan Name</th>
                    <th className="px-3 py-4">Plan Valid From</th>
                    <th className="px-3 py-4">Plan Valid To</th>
                    <th className="px-3 py-4">Payment Mode</th>
                    <th className="px-3 py-4">Trans. ID</th>
                    <th className="px-3 py-4">Amount</th>
                    <th className="px-3 py-4 w-16">Bill</th>
                    <th className="px-3 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAYMENTS.map((p, idx) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 font-bold text-slate-850">{p.planName}</td>
                      <td className="px-3 py-3.5 text-slate-500">{p.validFrom}</td>
                      <td className="px-3 py-3.5 text-slate-500">{p.validTo}</td>
                      <td className="px-3 py-3.5 text-slate-600">{p.mode}</td>
                      <td className="px-3 py-3.5 text-slate-600">{p.transId}</td>
                      <td className="px-3 py-3.5 font-bold text-slate-800">₹{p.amount.toFixed(2)}</td>
                      <td className="px-3 py-3.5">
                        <FileText className="w-4 h-4 text-teal-600 cursor-pointer mx-auto" />
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Add Device Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-2xl p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Add Device</h2>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              
              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-850 border-b pb-1 w-full">Device Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Brand <span className="text-red-500">*</span></label>
                    <select
                      value={newBrand}
                      onChange={e => setNewBrand(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                    >
                      <option value="">Select Brand</option>
                      <option value="Brand 1">Brand 1</option>
                      <option value="Brand 2">Brand 2</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Type <span className="text-red-500">*</span></label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold"
                    >
                      <option value="GPS">GPS</option>
                      <option value="Finger Print">Finger Print</option>
                      <option value="Attendance">Attendance</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter Device Name"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Sr. No. <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter IMEI No."
                      value={newSrNo}
                      onChange={e => setNewSrNo(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-850 border-b pb-1 w-full">SIM Details</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">SIM IMEI No. <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter SIM IMEI No."
                      value={newSimImei}
                      onChange={e => setNewSimImei(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Sim No. <span className="text-red-500">*</span></label>
                    <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                      <span className="bg-slate-50 px-3 py-2 text-slate-450 border-r font-bold">+91</span>
                      <input
                        type="text"
                        placeholder="Enter Phone Number"
                        value={newSimNo}
                        onChange={e => setNewSimNo(e.target.value)}
                        className="flex-1 px-3 py-2 outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-850 border-b pb-1 w-full">Device Image</legend>
                <div className="border border-dashed p-6 rounded-xl text-center bg-slate-50 text-slate-450 flex flex-col items-center justify-center gap-1.5">
                  <Upload className="w-5 h-5 text-slate-450" />
                  <span>Browser or Desktop</span>
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Add
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
