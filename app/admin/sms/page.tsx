'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, Calendar, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { toast } from 'sonner'

interface SmsOrder {
  id: string
  school_name: string
  mobile_no: string
  email: string
  sms_quantity: number
  amount: string | number
  status: string
  created_at: string
}

export default function SmsOrderPage() {
  const [orders, setOrders] = useState<SmsOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'New Order' | 'Active' | 'Under Verification' | 'Inactive'>('New Order')
  const [searchTerm, setSearchTerm] = useState('')

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<SmsOrder | null>(null)
  const [editStatus, setEditStatus] = useState('New Order')

  // Dropdown status switcher state
  const [dropdownOrderId, setDropdownOrderId] = useState<string | null>(null)

  // Listen to close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setDropdownOrderId(null)
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  // Status counts (mock/dynamic counts)
  const [counts, setCounts] = useState({
    newOrder: 3,
    active: 456,
    underVerification: 250,
    inactive: 120
  })

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', activeTab)
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const res = await fetch(`/api/admin/sms/orders?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
        
        // Let's update counts based on mock dashboard visual specifications
        // We'll calculate the base count and keep the dashboard layout look
        if (activeTab === 'New Order') {
          setCounts(prev => ({ ...prev, newOrder: data.data.length }))
        }
      } else {
        toast.error('Failed to load SMS orders')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching SMS orders')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    try {
      const res = await fetch(`/api/admin/sms/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`SMS Order status updated to ${editStatus}`)
        setSelectedOrder(null)
        fetchOrders()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('An error occurred while updating status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-500 border border-emerald-200 uppercase tracking-wider">
            ● Active
          </span>
        )
      case 'Under Verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-500 border border-rose-200 uppercase tracking-wider">
            ● Under Verification
          </span>
        )
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-500 border border-amber-200 uppercase tracking-wider">
            ● Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-500 border border-indigo-200 uppercase tracking-wider">
            ● New Order
          </span>
        )
    }
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">SMS Order</h1>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* New Order Tab */}
        <button
          onClick={() => setActiveTab('New Order')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'New Order'
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-650 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400'
              : 'bg-white border-slate-200 hover:border-indigo-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          <span>New Order</span>
          <span className="px-2 py-0.5 rounded bg-indigo-100/55 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {counts.newOrder}
          </span>
        </button>

        {/* Active Tab */}
        <button
          onClick={() => setActiveTab('Active')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'Active'
              ? 'bg-emerald-50/70 border-emerald-250 text-emerald-650 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          <span>Active</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100/55 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-650 dark:text-emerald-400">
            {counts.active}
          </span>
        </button>

        {/* Under Verification Tab */}
        <button
          onClick={() => setActiveTab('Under Verification')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'Under Verification'
              ? 'bg-rose-50/70 border-rose-200 text-rose-650 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
              : 'bg-white border-slate-200 hover:border-rose-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          <span>Under Verification</span>
          <span className="px-2 py-0.5 rounded bg-rose-100/55 dark:bg-rose-955/70 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400">
            {counts.underVerification}
          </span>
        </button>

        {/* Inactive Tab */}
        <button
          onClick={() => setActiveTab('Inactive')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'Inactive'
              ? 'bg-amber-50/75 border-amber-200 text-amber-650 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          <span>Inactive</span>
          <span className="px-2 py-0.5 rounded bg-amber-100/55 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-600 dark:text-amber-400">
            {counts.inactive}
          </span>
        </button>
      </div>

      {/* Main Table panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        
        {/* Search header inside table panel */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-750 dark:text-slate-350">
            SMS Order List - {activeTab}
          </span>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-350"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 text-center">S.No.</th>
                <th className="py-4 px-6">School Name</th>
                <th className="py-4 px-6">Mobile No.</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6 text-center">SMS Quantity</th>
                <th className="py-4 px-6 text-right">Amount</th>
                {activeTab !== 'New Order' && <th className="py-4 px-6">Status</th>}
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-750 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'New Order' ? 7 : 8} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'New Order' ? 7 : 8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No SMS orders found in this category.
                  </td>
                </tr>
              ) : (
                orders.map((ord, idx) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-4 px-6 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">
                      {ord.school_name}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                      {ord.mobile_no}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                      {ord.email}
                    </td>
                    <td className="py-4 px-6 text-center font-bold">
                      {ord.sms_quantity.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-800 dark:text-slate-250">
                      ₹{parseFloat(String(ord.amount)).toFixed(2)}
                    </td>
                    {activeTab !== 'New Order' && (
                      <td className="py-4 px-6 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDropdownOrderId(dropdownOrderId === ord.id ? null : ord.id)
                          }}
                          className="focus:outline-none cursor-pointer text-left"
                        >
                          {getStatusBadge(ord.status)}
                        </button>
                        
                        {dropdownOrderId === ord.id && (
                          <div className="absolute left-6 top-12 z-30 min-w-[160px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                            {['Under Verification', 'Active', 'Inactive'].map((st) => (
                              <button
                                key={st}
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  setDropdownOrderId(null)
                                  try {
                                    const res = await fetch(`/api/admin/sms/orders/${ord.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: st })
                                    })
                                    const resData = await res.json()
                                    if (resData.success) {
                                      toast.success(`Status updated to ${st}`)
                                      fetchOrders()
                                    } else {
                                      toast.error(resData.error || 'Failed to update status')
                                    }
                                  } catch (err) {
                                    console.error(err)
                                    toast.error('Error updating status')
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer ${
                                  ord.status === st 
                                    ? 'bg-slate-50 dark:bg-slate-700 text-teal-650 dark:text-teal-400' 
                                    : 'text-slate-700 dark:text-slate-355'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord)
                            setEditStatus(ord.status)
                          }}
                          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No SMS orders found.
            </div>
          ) : (
            orders.map((ord, idx) => (
              <div 
                key={ord.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{idx + 1} SMS Order</span>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{ord.school_name}</h4>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(ord)
                      setEditStatus(ord.status)
                    }}
                    className="p-2 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mobile</span>
                    <span>{ord.mobile_no}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email</span>
                    <span className="truncate block max-w-[120px]" title={ord.email}>{ord.email}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quantity</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{ord.sms_quantity.toLocaleString()}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Paid Amount</span>
                    <span className="text-teal-650 dark:text-teal-400 font-extrabold">₹{parseFloat(String(ord.amount)).toFixed(2)}</span>
                  </div>
                </div>

                {activeTab !== 'New Order' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center relative">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDropdownOrderId(dropdownOrderId === ord.id ? null : ord.id)
                      }}
                      className="focus:outline-none cursor-pointer"
                    >
                      {getStatusBadge(ord.status)}
                    </button>
                    
                    {dropdownOrderId === ord.id && (
                      <div className="absolute right-0 bottom-10 z-30 min-w-[160px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {['Under Verification', 'Active', 'Inactive'].map((st) => (
                          <button
                            key={st}
                            onClick={async (e) => {
                              e.stopPropagation()
                              setDropdownOrderId(null)
                              try {
                                const res = await fetch(`/api/admin/sms/orders/${ord.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: st })
                                })
                                const resData = await res.json()
                                if (resData.success) {
                                  toast.success(`Status updated to ${st}`)
                                  fetchOrders()
                                } else {
                                  toast.error(resData.error || 'Failed to update status')
                                }
                              } catch (err) {
                                console.error(err)
                                toast.error('Error updating status')
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer ${
                              ord.status === st 
                                ? 'bg-slate-50 dark:bg-slate-700 text-teal-650 dark:text-teal-400' 
                                : 'text-slate-700 dark:text-slate-355'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer/Pagination */}
        <div className="bg-slate-50/40 dark:bg-slate-900/20 px-6 py-4 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Showing 1-{orders.length} of {activeTab === 'New Order' ? counts.newOrder : activeTab === 'Active' ? counts.active : activeTab === 'Under Verification' ? counts.underVerification : counts.inactive} Entries</span>
          
          <div className="flex gap-1.5 items-center">
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50" disabled>
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              2
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                SMS Order
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-55 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* User Details */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  User Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">School Name</label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.school_name}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Contact Person</label>
                    <input
                      type="text"
                      disabled
                      value="Contact Person Name"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Mobile No.</label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.mobile_no}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Id</label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.email}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">State</label>
                    <input
                      type="text"
                      disabled
                      value="Uttar Pradesh"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">District</label>
                    <input
                      type="text"
                      disabled
                      value="Lucknow"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Order SMS Details */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Order SMS Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Quantity</label>
                    <input
                      type="text"
                      disabled
                      value={selectedOrder.sms_quantity}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Rate</label>
                    <input
                      type="text"
                      disabled
                      value="0.15"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Tax</label>
                    <input
                      type="text"
                      disabled
                      value="18%"
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Total Amount</label>
                    <input
                      type="text"
                      disabled
                      value={parseFloat(String(selectedOrder.amount)).toFixed(2)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-105 dark:border-slate-750 pb-2">
                  Update Status
                </h3>
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-xs font-bold text-slate-500">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="New Order">New Order</option>
                    <option value="Active">Active</option>
                    <option value="Under Verification">Under Verification</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-750 flex gap-3 justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-5 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
