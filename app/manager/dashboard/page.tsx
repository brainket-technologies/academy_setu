'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, FileText, CheckCircle, Clock, CalendarDays, Key, MonitorPlay, Activity, ShieldCheck } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ManagerDashboardPage() {
  const [graphFilter, setGraphFilter] = useState('2026-2027')
  const [graphType, setGraphType] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Monthly')
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalApplications: 0,
    totalPendingFollowup: 0,
    todayPendingFollowup: 0,
    totalCallTime: 0,
    totalCallTimeFormatted: '0 min',
    todayLoginTime: '09:00 AM',
    totalLoginDuration: 0,
    totalLoginDurationFormatted: '0 min',
    inactiveTime: 0,
    totalPayment: '0.00',
    todayPayment: '0.00',
    lineChartData: [] as { name: string; value: number }[],
    bdmData: []
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const displayChartData = React.useMemo(() => {
    const raw = stats.lineChartData || []
    if (graphType === 'Quarterly') {
      const q1 = (raw[0]?.value || 0) + (raw[1]?.value || 0) + (raw[2]?.value || 0)
      const q2 = (raw[3]?.value || 0) + (raw[4]?.value || 0) + (raw[5]?.value || 0)
      const q3 = (raw[6]?.value || 0) + (raw[7]?.value || 0) + (raw[8]?.value || 0)
      const q4 = (raw[9]?.value || 0) + (raw[10]?.value || 0) + (raw[11]?.value || 0)
      return [
        { name: 'Q1 (Jan-Mar)', value: q1 },
        { name: 'Q2 (Apr-Jun)', value: q2 },
        { name: 'Q3 (Jul-Sep)', value: q3 },
        { name: 'Q4 (Oct-Dec)', value: q4 },
      ]
    } else if (graphType === 'Annual') {
      const total = raw.reduce((sum, item) => sum + (item.value || 0), 0)
      return [
        { name: 'FY 2024', value: 0 },
        { name: 'FY 2025', value: 0 },
        { name: 'FY 2026', value: total },
      ]
    }
    return raw
  }, [stats.lineChartData, graphType])

  return (
    <>
      <div className="flex flex-col gap-6 lg:gap-8 w-full pb-10">
        
        {/* TOP ROW: Lead & Followup | Call & Login Time */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* Lead & Followup Section */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-[28px] p-6 lg:p-8 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Lead &amp; Followup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 flex-1">
              {/* Total Lead */}
              <Link
                href="/manager/lead"
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Total Lead</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.totalLeads}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
              </Link>
              
              {/* Total Application */}
              <Link
                href="/manager/application"
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">Total Application</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.totalApplications}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400" />
                </div>
              </Link>

              {/* Total Pending Followup */}
              <Link
                href="/manager/crm/followup"
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Total Pending Followup</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.totalPendingFollowup}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
              </Link>

              {/* Today Pending Followup */}
              <Link
                href="/manager/crm/followup?filter=today"
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Today Pending Followup</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.todayPendingFollowup}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* Call & Login Time Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-[28px] p-6 lg:p-8 shadow-sm border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Call &amp; Login Time</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 flex-1">
              {/* Total Call Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Call Time (min)</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.totalCallTime}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>

              {/* Login Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Login Time</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.todayLoginTime}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                  <Key className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
              </div>

              {/* Total Login Duration */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Login Duration (min)</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.totalLoginDuration}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <MonitorPlay className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>

              {/* Inactive Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Inactive Time (in min.)</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{loading ? '...' : stats.inactiveTime}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Payment History | Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Payment History Section */}
          <div className="xl:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[28px] p-6 lg:p-8 shadow-sm border border-emerald-100/60 dark:border-emerald-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Payment History</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Total Payment */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Payment</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      {loading ? '...' : stats.totalPayment}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">₹</span>
                  </div>
                </div>

                {/* Today Payment */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Today Payment</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      {loading ? '...' : stats.todayPayment}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-xl">₹</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Direct Collections</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="xl:col-span-2 bg-gradient-to-br from-blue-50/40 to-sky-50/40 dark:from-slate-900 dark:to-slate-900 rounded-[28px] p-6 lg:p-8 shadow-sm border border-blue-100/50 dark:border-slate-700/50 flex flex-col justify-between min-h-[360px]">
            
            {/* Header with Title, Year and Period Dropdowns */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4">Analytics Section</h2>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Collection Graph</h3>

                  <div className="flex items-center gap-2">
                    <select 
                      value={graphFilter}
                      onChange={(e) => setGraphFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="2026-2027">2026-2027</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>

                    <select 
                      value={graphType}
                      onChange={(e) => setGraphType(e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>

                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Smooth Area Chart */}
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValueManager" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        dy={8} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '14px', 
                          border: '1px solid rgba(226, 232, 240, 0.8)', 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          padding: '8px 12px'
                        }}
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Collections']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValueManager)" 
                        dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }} 
                        activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  )
}
