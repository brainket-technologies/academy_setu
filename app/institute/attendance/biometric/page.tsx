'use client'

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, CheckCircle2, Cpu } from 'lucide-react'

interface DeviceRecord {
  deviceName: string
  serialNo: string
  status: 'Active' | 'Inactive'
  totalRegistered: number
  lastUpdate: string
  createdAt: string
}

const INITIAL_DEVICES: DeviceRecord[] = [
]

export default function BiometricDevicesPage() {
  const [activeTab, setActiveTab] = useState<'Registration' | 'DeviceSetup'>('DeviceSetup')
  const [deviceFilter, setDeviceFilter] = useState<'All' | 'Deleted'>('All')

  // Registration Checklist state (Screenshot 5)
  const [selectAll, setSelectAll] = useState(false)
  const [allStudents, setAllStudents] = useState(true)
  const [allTeachers, setAllTeachers] = useState(true)
  const [allEmployees, setAllEmployees] = useState(false)
  const [selectedClassesStudents, setSelectedClassesStudents] = useState(false)
  const [selectedClassesSection, setSelectedClassesSection] = useState(false)
  const [selectedTeachers, setSelectedTeachers] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(false)

  const [selectedDevice, setSelectedDevice] = useState('Device 01')
  const [registrationAction, setRegistrationAction] = useState('Registration') // Registration vs Delete (Screenshot 1)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleToggleSelectAll = (val: boolean) => {
    setSelectAll(val)
    setAllStudents(val)
    setAllTeachers(val)
    setAllEmployees(val)
    setSelectedClassesStudents(val)
    setSelectedClassesSection(val)
    setSelectedTeachers(val)
    setSelectedEmployee(val)
  }

  const handleSaveRegistration = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMsg(`Biometric sync action '${registrationAction}' completed successfully for ${selectedDevice}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Biometric Devices</h1>
          <p className="text-xs text-slate-400">Sync and setup fingerprint or facial recognition hardware</p>
        </div>
      </div>

      {/* Main Tab selector (Screenshot 3 & 5) */}
      <div className="flex bg-white dark:bg-slate-800 border p-2 rounded-2xl gap-3 max-w-xs shadow-sm select-none">
        <button 
          type="button" 
          onClick={() => setActiveTab('Registration')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'Registration' ? 'bg-teal-600 text-white font-black shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Registration
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('DeviceSetup')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'DeviceSetup' ? 'bg-teal-600 text-white font-black shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Device Setup
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-hidden">
        
        {activeTab === 'DeviceSetup' ? (
          /* Device Setup Tab display (Screenshot 3) */
          <div className="space-y-6">
            
            {/* Status sub-tabs */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDeviceFilter('All')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-[10px] uppercase font-black tracking-wider ${
                  deviceFilter === 'All' 
                    ? 'border-teal-600 bg-teal-50/15 text-teal-650'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span>All</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] ${
                  deviceFilter === 'All' ? 'bg-teal-600 text-white' : 'bg-slate-100'
                }`}>03</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceFilter('Deleted')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-[10px] uppercase font-black tracking-wider ${
                  deviceFilter === 'Deleted' 
                    ? 'border-teal-600 bg-teal-50/15 text-teal-650'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span>Deleted</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] ${
                  deviceFilter === 'Deleted' ? 'bg-teal-600 text-white' : 'bg-slate-100'
                }`}>02</span>
              </button>
            </div>

            {/* Devices log list table */}
            {deviceFilter === 'All' ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-center text-xs border-collapse">
                  <thead className="bg-slate-50 font-black border-b text-slate-655">
                    <tr>
                      <th className="py-3.5">Device Name</th>
                      <th>Serial No.</th>
                      <th>Status</th>
                      <th>Total Registered</th>
                      <th>Last Update At</th>
                      <th>Created At</th>
                      <th className="w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INITIAL_DEVICES.map(device => (
                      <tr key={device.serialNo} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                        <td className="py-3.5 font-bold text-slate-800">{device.deviceName}</td>
                        <td className="text-slate-450 font-mono">{device.serialNo}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            device.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                          }`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="font-bold text-slate-700">{device.totalRegistered}</td>
                        <td className="text-slate-450">{device.lastUpdate}</td>
                        <td className="text-slate-450">{device.createdAt}</td>
                        <td>
                          <div className="flex items-center justify-center">
                            <button type="button" className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-bold">No deleted hardware devices in logs.</div>
            )}

          </div>
        ) : (
          /* Registration Tab Form display (Screenshot 5) */
          <form onSubmit={handleSaveRegistration} className="space-y-6 max-w-2xl animate-in fade-in duration-200">
            
            {/* Checklist checkbox loops */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2 flex justify-between items-center">
                <span>Who do you want to register?</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-500 text-[10px]">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={e => handleToggleSelectAll(e.target.checked)} 
                    className="w-3.5 h-3.5 text-teal-650"
                  />
                  Select All
                </label>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={allStudents} onChange={e => setAllStudents(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  All Students
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={allTeachers} onChange={e => setAllTeachers(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  All Teachers
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={allEmployees} onChange={e => setAllEmployees(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  All Employees
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={selectedClassesStudents} onChange={e => setSelectedClassesStudents(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  Register selected classes Students
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={selectedClassesSection} onChange={e => setSelectedClassesSection(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  Register selected classes Section
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={selectedTeachers} onChange={e => setSelectedTeachers(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  Register selected Teachers
                </label>
                <label className="flex items-center gap-2.5 font-bold text-slate-655 cursor-pointer">
                  <input type="checkbox" checked={selectedEmployee} onChange={e => setSelectedEmployee(e.target.checked)} className="w-4 h-4 rounded text-teal-655" />
                  Register selected Employee
                </label>
              </div>
            </div>

            {/* Inputs selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Select Device *</label>
                <select 
                  value={selectedDevice} 
                  onChange={e => setSelectedDevice(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none"
                >
                  <option value="Device 01">Device 01</option>
                  <option value="Device 02">Device 02</option>
                  <option value="Device 03">Device 03</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Action *</label>
                <select 
                  value={registrationAction} 
                  onChange={e => setRegistrationAction(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none"
                >
                  <option value="Registration">Registration</option>
                  <option value="Delete">Delete</option>
                </select>
              </div>
            </div>

            {/* Save trigger button */}
            <div className="flex justify-center pt-6 border-t border-slate-100">
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Save
              </button>
            </div>

          </form>
        )}

      </div>

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
