'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search, Loader2, FileText, X, Upload, Plus,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react'
import { toast } from 'sonner'

interface DistributorPayment {
  id: string
  dist_id: string
  name: string
  mobile_no: string
  commission_total: number
  paid_amount: number
  due_amount: number
  payment_status: string
  updated_at: string
  account_holder_name: string
  account_number: string
  ifsc_code: string
  bank_name: string
  upi_id: string
  qr_code_url: string
}

interface Transaction {
  id: string
  transaction_id: string
  amount: number
  payment_mode: string
  payment_date: string
  status: string
  created_at: string
}

// Initials avatar component
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  const colors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  )
}

// Simple QR code SVG placeholder
function QRCodeSvg() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className="border border-slate-200 rounded-lg">
      <rect width="160" height="160" fill="white" />
      {/* Finder patterns */}
      <rect x="10" y="10" width="40" height="40" fill="black" />
      <rect x="15" y="15" width="30" height="30" fill="white" />
      <rect x="20" y="20" width="20" height="20" fill="black" />
      <rect x="110" y="10" width="40" height="40" fill="black" />
      <rect x="115" y="15" width="30" height="30" fill="white" />
      <rect x="120" y="20" width="20" height="20" fill="black" />
      <rect x="10" y="110" width="40" height="40" fill="black" />
      <rect x="15" y="115" width="30" height="30" fill="white" />
      <rect x="20" y="120" width="20" height="20" fill="black" />
      {/* Data modules */}
      {[60,70,80,90,100].map(x => [60,70,80,90,100].map(y =>
        (x + y) % 20 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="black" /> : null
      ))}
      <rect x="60" y="10" width="8" height="8" fill="black" />
      <rect x="75" y="10" width="8" height="8" fill="black" />
      <rect x="90" y="10" width="8" height="8" fill="black" />
      <rect x="60" y="25" width="8" height="8" fill="black" />
      <rect x="90" y="25" width="8" height="8" fill="black" />
      <rect x="10" y="60" width="8" height="8" fill="black" />
      <rect x="10" y="75" width="8" height="8" fill="black" />
      <rect x="10" y="90" width="8" height="8" fill="black" />
      <rect x="25" y="60" width="8" height="8" fill="black" />
      <rect x="40" y="60" width="8" height="8" fill="black" />
      <rect x="60" y="60" width="8" height="8" fill="black" />
      <rect x="75" y="70" width="8" height="8" fill="black" />
      <rect x="90" y="60" width="8" height="8" fill="black" />
      <rect x="105" y="75" width="8" height="8" fill="black" />
      <rect x="120" y="60" width="8" height="8" fill="black" />
      <rect x="135" y="70" width="8" height="8" fill="black" />
      <rect x="60" y="90" width="8" height="8" fill="black" />
      <rect x="80" y="100" width="8" height="8" fill="black" />
      <rect x="100" y="90" width="8" height="8" fill="black" />
      <rect x="115" y="110" width="8" height="8" fill="black" />
      <rect x="130" y="120" width="8" height="8" fill="black" />
      <rect x="140" y="130" width="8" height="8" fill="black" />
    </svg>
  )
}

export default function DistributorPaymentPage() {
  const [distributors, setDistributors] = useState<DistributorPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Payment modal
  const [payingDist, setPayingDist] = useState<DistributorPayment | null>(null)
  const [paymentMode, setPaymentMode] = useState<'Bank' | 'UPI' | 'QR Code'>('Bank')
  const [payAmount, setPayAmount] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txnLoading, setTxnLoading] = useState(false)

  const fetchDistributors = useCallback(async (page = 1, search = '', status = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const res = await fetch(`/api/admin/distributors/payments?${params}`)
      const data = await res.json()
      if (data.success) {
        setDistributors(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load distributor payments')
      }
    } catch {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTransactions = async (distId: string) => {
    setTxnLoading(true)
    try {
      const res = await fetch(`/api/admin/distributors/${distId}/pay`)
      const data = await res.json()
      if (data.success) setTransactions(data.data)
    } catch {
      setTransactions([])
    } finally {
      setTxnLoading(false)
    }
  }

  useEffect(() => {
    fetchDistributors(currentPage, searchText, statusFilter)
  }, [currentPage, searchText, statusFilter, fetchDistributors])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const handleOpenPayModal = (dist: DistributorPayment) => {
    setPayingDist(dist)
    setPaymentMode('Bank')
    setPayAmount('')
    fetchTransactions(dist.id)
  }

  const handlePay = async () => {
    if (!payingDist) return
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error('Please enter a valid pay amount')
      return
    }
    if (parseFloat(payAmount) > payingDist.due_amount) {
      toast.error('Pay amount cannot exceed due amount')
      return
    }

    setPayLoading(true)
    try {
      const res = await fetch(`/api/admin/distributors/${payingDist.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payAmount, payment_mode: paymentMode })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Payment recorded successfully!')
        setPayAmount('')
        fetchTransactions(payingDist.id)
        fetchDistributors(currentPage, searchText, statusFilter)
      } else {
        toast.error(data.error || 'Payment failed')
      }
    } catch {
      toast.error('Error processing payment')
    } finally {
      setPayLoading(false)
    }
  }

  const formatDate = (d: string) => {
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-GB').replace(/\//g, '/') + '\n' + dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch { return d }
  }

  const formatPaymentDate = (d: string) => {
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return d }
  }

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
  const readonlyCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed focus:outline-none"

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Distributer Payment</h1>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Mobile no."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400"
              />
            </form>
            <button className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-teal-500/10">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          {/* Filters Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer w-44"
              >
                <option value="">Select an Option</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Mb. no., Email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400"
              />
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-12">S. No.</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Id No.</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Total Amount</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Paid Amount</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Due Amount</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">Invoice</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Updated At</th>
                  <th className="px-4 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                        Loading payments...
                      </div>
                    </td>
                  </tr>
                ) : distributors.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center text-slate-400 font-medium">No distributors found.</td>
                  </tr>
                ) : (
                  distributors.map((dist, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    const dt = new Date(dist.updated_at)
                    const dateStr = dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    const isPaid = dist.payment_status === 'Paid'
                    const isUnpaid = dist.payment_status === 'Unpaid'
                    const isPending = dist.payment_status === 'Pending'

                    return (
                      <tr key={dist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-550">{rowNum}.</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={dist.name} />
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{dist.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-bold text-xs">{dist.dist_id}</td>
                        <td className="px-4 py-4 text-slate-650 dark:text-slate-300 text-sm font-medium">{dist.mobile_no}</td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-bold text-sm">{Number(dist.commission_total).toFixed(2)}</td>
                        <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">{Number(dist.paid_amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-red-600 dark:text-red-400 font-bold text-sm">{Number(Math.max(0, dist.due_amount)).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Paid
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> Unpaid
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-600">
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <div>📅 {dateStr}</div>
                          <div>🕐 {timeStr}</div>
                        </td>
                        <td className="px-4 py-4">
                          {!isPaid ? (
                            <button
                              onClick={() => handleOpenPayModal(dist)}
                              className="px-4 py-1.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Pay Now
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && distributors.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 flex-wrap gap-4">
              <span className="text-xs font-bold text-slate-500">Showing {startEntry}-{endEntry} of {totalCount} Entries</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map(num => (
                  <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === num ? 'bg-[#0F9E8F] text-white shadow-md' : 'border border-slate-200 dark:border-slate-600 text-slate-600 hover:bg-slate-50'}`}>
                    {num}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {payingDist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPayingDist(null) }}
        >
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pay — {payingDist.name}</h2>
              <button onClick={() => setPayingDist(null)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6 bg-[#EBF6F6]/30 dark:bg-slate-800">
              {/* Payment Mode */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Payment Mode</h3>
                <div className="flex items-center gap-8">
                  {(['Bank', 'UPI', 'QR Code'] as const).map(mode => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === mode}
                        onChange={() => setPaymentMode(mode)}
                        className="accent-teal-600 w-4 h-4"
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  {paymentMode === 'Bank' ? 'Bank Details' : paymentMode === 'UPI' ? 'UPI Details' : 'QR Details'}
                </h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
              </div>

              {/* Bank Mode */}
              {paymentMode === 'Bank' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Account No.</label>
                      <input readOnly value={payingDist.account_number || '—'} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">IFSC Code</label>
                      <input readOnly value={payingDist.ifsc_code || '—'} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Account Holder Name</label>
                      <input readOnly value={payingDist.account_holder_name || '—'} className={readonlyCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Due Amount</label>
                      <input readOnly value={Number(Math.max(0, payingDist.due_amount)).toFixed(2)} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pay Amount</label>
                      <input type="number" placeholder="Enter Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} min="0" step="0.01" />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Mode */}
              {paymentMode === 'UPI' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">UPI ID</label>
                      <input readOnly value={payingDist.upi_id || '—'} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Due Amount</label>
                      <input readOnly value={Number(Math.max(0, payingDist.due_amount)).toFixed(2)} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pay Amount</label>
                      <input type="number" placeholder="Enter Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} min="0" step="0.01" />
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Mode */}
              {paymentMode === 'QR Code' && (
                <div className="flex flex-col gap-4">
                  <QRCodeSvg />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Due Amount</label>
                      <input readOnly value={Number(Math.max(0, payingDist.due_amount)).toFixed(2)} className={readonlyCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pay Amount</label>
                      <input type="number" placeholder="Enter Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} min="0" step="0.01" />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handlePay}
                  disabled={payLoading}
                  className="px-16 py-3 bg-[#0F9E8F] hover:bg-[#0D8E80] disabled:bg-slate-300 text-white rounded-2xl font-bold text-base transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer"
                >
                  {payLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Pay Now
                </button>
              </div>

              {/* Transaction History */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Transaction History</h3>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                </div>
                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#EBF6F6]/60 dark:bg-slate-700/60">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Transaction ID</th>
                        <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Amount</th>
                        <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Mode</th>
                        <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Date</th>
                        <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                      {txnLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs font-medium">No transaction history found</td>
                        </tr>
                      ) : (
                        transactions.map(txn => (
                          <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs font-bold">{txn.transaction_id}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-bold">{Number(txn.amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{txn.payment_mode}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{formatPaymentDate(txn.payment_date)}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
