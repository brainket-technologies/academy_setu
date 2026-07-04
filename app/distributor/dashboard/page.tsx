'use client'

import React, { useState, useEffect } from 'react'
import { MoreHorizontal, Download, FileText, CheckCircle, Clock, CalendarDays, Key, MonitorPlay, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'

export default function DistributorDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes, txnsRes] = await Promise.all([
          fetch('/api/distributor/stats').then(r => r.json()),
          fetch('/api/distributor/analytics').then(r => r.json()),
          fetch('/api/distributor/transactions').then(r => r.json())
        ])

        if (statsRes.success) setStats(statsRes.data)
        if (analyticsRes.success) setAnalytics(analyticsRes.data)
        if (txnsRes.success) setTransactions(txnsRes.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.totalAmount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Paid Amount</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.paidAmount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Due Amount</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.dueAmount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Collaborated College</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.collaboratedColleges || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">Analytics Section</h2>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Collection Graph</h3>
              <div className="flex gap-2">
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1">
                  <option>2023-2024</option>
                  <option>2024-2025</option>
                </select>
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1">
                  <option>Annual</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.collectionGraph || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Payment Overview</h3>
              <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1">
                <option>Annual</option>
                <option>Monthly</option>
              </select>
            </div>
            
            <div className="h-[200px] flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: analytics?.paymentOverview?.paidAmount || 1 },
                      { name: 'Due', value: analytics?.paymentOverview?.dueAmount || 1 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#a855f7" /> {/* Purple for Paid in screenshot */}
                    <Cell fill="#ca8a04" /> {/* Yellow for Due in screenshot */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between mt-4 px-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  <span className="inline-block w-3 h-1 bg-purple-500 mr-2 rounded-full"></span>Paid Amount
                </p>
                <p className="text-sm font-bold">{analytics?.paymentOverview?.paidAmount || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  Due Amount<span className="inline-block w-3 h-1 bg-yellow-500 ml-2 rounded-full"></span>
                </p>
                <p className="text-sm font-bold">{analytics?.paymentOverview?.dueAmount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">Transaction History</h2>

        {/* TRANSACTIONS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 min-w-[150px]">
                <option>Select an Option</option>
                <option>Paid</option>
                <option>Pending</option>
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
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
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
                {transactions.slice(0, 3).map((txn: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{idx + 1}.</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{txn.transaction_id || '-'}</td>
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
                ))}
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
        </div>

      </div>
    </>
  )
}
