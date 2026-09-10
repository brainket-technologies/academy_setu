'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Loader2, X, Search, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface DeviceType {
  id: string
  name: string
  description?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export default function DeviceTypePage() {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null)

  // Form States
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Active')
  const [submitting, setSubmitting] = useState(false)

  // Delete States
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDeviceTypes = useCallback(async (search = '', isInitial = false) => {
    if (isInitial) setInitialLoading(true)
    try {
      const url = search 
        ? `/api/admin/device/types?search=${encodeURIComponent(search)}` 
        : '/api/admin/device/types'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setDeviceTypes(data.data)
      } else {
        toast.error('Failed to load device types')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching device types')
    } finally {
      if (isInitial) setInitialLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchDeviceTypes('', true)
  }, [fetchDeviceTypes])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeviceTypes(searchQuery, false)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchDeviceTypes])

  const openModal = (typeItem?: DeviceType) => {
    if (typeItem) {
      setSelectedType(typeItem)
      setName(typeItem.name)
      setDescription(typeItem.description || '')
      setStatus(typeItem.status || 'Active')
    } else {
      setSelectedType(null)
      setName('')
      setDescription('')
      setStatus('Active')
    }
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Device Type Name is required')

    setSubmitting(true)
    try {
      const url = selectedType ? `/api/admin/device/types/${selectedType.id}` : '/api/admin/device/types'
      const method = selectedType ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          description: description.trim(),
          status: status
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(selectedType ? 'Device Type updated successfully' : 'Device Type added successfully')
        setShowModal(false)

        // Instant optimistic update
        if (selectedType) {
          setDeviceTypes(prev => prev.map(d => d.id === selectedType.id ? data.data : d))
        } else {
          setDeviceTypes(prev => [data.data, ...prev])
        }
      } else {
        toast.error(data.error || 'Failed to save device type')
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
      const res = await fetch(`/api/admin/device/types/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Device Type deleted successfully')
        setDeviceTypes(prev => prev.filter(d => d.id !== deleteId))
        setDeleteId(null)
      } else {
        toast.error(data.error || 'Failed to delete device type')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting device type')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      {/* Top Header & Action Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Device Type Setup</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Manage and configure available device categories</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search device types..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Device Type
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : deviceTypes.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <p className="font-semibold">No device types configured yet.</p>
            <p className="text-xs mt-1 text-slate-400">Click &quot;Add Device Type&quot; above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">S.No.</th>
                  <th className="px-6 py-4">Device Type Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {deviceTypes.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-slate-400">{idx + 1}.</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                      {item.description ? item.description : <span className="text-slate-300 dark:text-slate-600 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        (item.status || 'Active') === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Device Type"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Device Type"
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

      {/* Add / Edit Device Type Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {selectedType ? 'Edit Device Type' : 'Add Device Type'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Device Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPS Tracker, Biometric, Smart Card"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter a brief description for this device type..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent dark:text-white cursor-pointer"
                >
                  <option value="Active" className="dark:bg-slate-800">Active</option>
                  <option value="Inactive" className="dark:bg-slate-800">Inactive</option>
                </select>
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Device Type"
          description="Are you sure you want to delete this device type? Devices associated with this type may be affected."
          loading={deleteLoading}
        />
      )}
    </>
  )
}
