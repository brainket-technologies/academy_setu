'use client'

import React, { useState, useEffect } from 'react'
import { DistributorLayout } from '@/components/layout/DistributorLayout'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function DistributorTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Pagination (mock client side for now)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txnsRes, statsRes] = await Promise.all([
          fetch('/api/distributor/transactions').then(r => r.json()),
          fetch('/api/distributor/stats').then(r => r.json())
        ])
        if (txnsRes.success) setTransactions(txnsRes.data)
        if (statsRes.success) setStats(statsRes.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize))
  const displayedTxns = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) {
    return (
      <DistributorLayout>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DistributorLayout>
    )
  }

  return (
    <DistributorLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Transaction</h2>
          
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 min-w-[150px]">
                <option>Select an Option</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Mode</label>
              <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 min-w-[150px]">
                <option>Select Payment Mode</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Date</label>
              <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 min-w-[150px]">
                <option>Select an Option</option>
                <option>Last Week</option>
                <option>Last 15 Days</option>
                <option>Custom Date</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f8fafc] text-[#64748b] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">S. No.</th>
                  <th className="px-6 py-4 font-semibold">Transaction ID</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold">Paid Amount</th>
                  <th className="px-6 py-4 font-semibold">Due Amount</th>
                  <th className="px-6 py-4 font-semibold">Payment Mode</th>
                  <th className="px-6 py-4 font-semibold">Payment Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {displayedTxns.map((txn: any, idx: number) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{sNo}.</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{txn.transaction_id || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(stats?.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(txn.amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600">{(Number(stats?.totalAmount || 0) - Number(txn.amount || 0)).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-500">{txn.payment_mode || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {txn.payment_date ? new Date(txn.payment_date).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {txn.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                            Paid
                          </span>
                        )}
                        {txn.status === 'Unpaid' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700">
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                            Unpaid
                          </span>
                        )}
                        {txn.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-100 text-orange-700">
                            <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                            Pending
                          </span>
                        )}
                        {!['Paid', 'Unpaid', 'Pending'].includes(txn.status) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                            {txn.status || 'Pending'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 bg-[#f8fafc] p-3 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, transactions.length)} of {transactions.length} Entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border-indigo-600'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DistributorLayout>
  )
}
