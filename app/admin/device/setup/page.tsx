'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Loader2, X, Search } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface DeviceSetup {
  id: string
  name: string
  model: string
}

export default function DeviceSetupPage() {
  const [devices, setDevices] = useState<DeviceSetup[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceSetup | null>(null)
  
  // Form States
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete States
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDevices = useCallback(async (search = '', isInitial = false) => {
    if (isInitial) setInitialLoading(true)
    try {
      const url = search ? `/api/admin/device/setup?search=${encodeURIComponent(search)}` : '/api/admin/device/setup'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setDevices(data.data)
      } else {
        toast.error('Failed to load devices')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching devices')
    } finally {
      if (isInitial) setInitialLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchDevices('', true)
  }, [fetchDevices])

  // Debounced search without full table unmounting
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevices(searchQuery, false)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchDevices])

  const openModal = (device?: DeviceSetup) => {
    if (device) {
      setSelectedDevice(device)
      setName(device.name)
      setModel(device.model)
    } else {
      setSelectedDevice(null)
      setName('')
      setModel('')
    }
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Device Name is required')
    if (!model.trim()) return toast.error('Device Model is required')

    setSubmitting(true)
    try {
      const url = selectedDevice ? `/api/admin/device/setup/${selectedDevice.id}` : '/api/admin/device/setup'
      const method = selectedDevice ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), model: model.trim() })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(selectedDevice ? 'Device updated successfully' : 'Device added successfully')
        setShowModal(false)
        
        // Instant non-refreshing state update
        if (selectedDevice) {
          setDevices(prev => prev.map(d => d.id === selectedDevice.id ? data.data : d))
        } else {
          setDevices(prev => [data.data, ...prev])
        }
      } else {
        toast.error(data.error || 'Failed to save device')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/device/setup/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Device deleted successfully')
        // Instant state removal without reloading
        setDevices(prev => prev.filter(d => d.id !== deleteId))
        setDeleteId(null)
      } else {
        toast.error(data.error || 'Failed to delete device')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting device')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Device Setup</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            No devices configured yet. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">S.No.</th>
                  <th className="px-6 py-4">Device Name</th>
                  <th className="px-6 py-4">Device Model</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {devices.map((device, idx) => (
                  <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{idx + 1}.</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{device.name}</td>
                    <td className="px-6 py-4">{device.model}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(device)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(device.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {selectedDevice ? 'Edit Device' : 'Add Device'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Device Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPS Tracker"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Device Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TK103"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent dark:text-white"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Device"
          description="Are you sure you want to delete this device? This action cannot be undone."
          loading={deleteLoading}
        />
      )}
    </>
  )
}
