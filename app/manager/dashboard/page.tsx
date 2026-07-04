'use client'

import React, { useState } from 'react'
import { ManagerLayout } from '@/components/layout/ManagerLayout'
import { MoreHorizontal, FileText, CheckCircle, Clock, CalendarDays, Key, MonitorPlay, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const lineChartData = [
  { name: 'Jan', value: 3000 },
  { name: 'Feb', value: 4500 },
  { name: 'Mar', value: 3800 },
  { name: 'Apr', value: 5000 },
  { name: 'May', value: 5500 },
  { name: 'Jun', value: 3200 },
  { name: 'Jul', value: 4800 },
  { name: 'Aug', value: 2100 },
  { name: 'Sep', value: 3900 },
  { name: 'Oct', value: 4500 },
  { name: 'Nov', value: 3800 },
  { name: 'Dec', value: 2000 },
]

const bdmData = [
  { id: 1, name: 'Riya', totalFollowUp: 200, todayFollowUp: 30, status: 'Online' },
  { id: 2, name: 'Alok', totalFollowUp: 250, todayFollowUp: 25, status: 'Offline' },
  { id: 3, name: 'Shivam', totalFollowUp: 125, todayFollowUp: 18, status: 'Offline' },
]

export default function ManagerDashboardPage() {
  const [graphFilter, setGraphFilter] = useState('2023-2024')
  const [graphType, setGraphType] = useState('Annual')

  return (
    <ManagerLayout>
      <div className="flex flex-col gap-6 lg:gap-8 max-w-7xl mx-auto">
        
        {/* TOP ROW: Lead & Followup | Call & Login Time */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Lead & Followup Section */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-[28px] p-6 lg:p-8 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Lead &amp; Followup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {/* Total Lead */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Lead</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">700</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
              
              {/* Total Application */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Application</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">8000</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400" />
                </div>
              </div>

              {/* Total Pending Followup */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Pending Followup</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">2000</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>

              {/* Today Pending Followup */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Today Pending Followup</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">25</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Call & Login Time Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-[28px] p-6 lg:p-8 shadow-sm border border-indigo-100/50 dark:border-indigo-900/30">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Call &amp; Login Time</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {/* Total Call Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Call Time</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">2000</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>

              {/* Total Login Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Login Time</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">25</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                  <Key className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
              </div>

              {/* Total Login Duration */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Login Duration</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">700</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <MonitorPlay className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>

              {/* Inactive Time */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Inactive Time (in min.)</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">8000</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Payment History | Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Payment History */}
          <div className="xl:col-span-1 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Payment History</h2>
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* Total Payment */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Payment</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">35000.00</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <span className="text-emerald-500 font-bold text-xl">₹</span>
                </div>
              </div>

              {/* Today Payment */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Today Payment</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">5000.00</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <span className="text-amber-500 font-bold text-xl">₹</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="xl:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Analytics Section</h2>
            <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50 h-[320px] flex flex-col">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Collection Graph</h3>
                <div className="flex items-center gap-3">
                  <select 
                    value={graphFilter}
                    onChange={(e) => setGraphFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
                  <select 
                    value={graphType}
                    onChange={(e) => setGraphType(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      ticks={[0, 1000, 2500, 5000, 7500]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: BDM Data Table */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">BDM Data Table</h2>
          <div className="bg-white dark:bg-slate-800 rounded-[28px] p-2 shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto rounded-[24px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">S. No.</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Total Follow up</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Today Follow up</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {bdmData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-5 px-6 text-sm font-medium text-slate-500 dark:text-slate-400">{row.id}.</td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-700 dark:text-slate-200">{row.name}</td>
                      <td className="py-5 px-6 text-sm font-medium text-slate-600 dark:text-slate-300 text-center">{row.totalFollowUp}</td>
                      <td className="py-5 px-6 text-sm font-medium text-slate-600 dark:text-slate-300 text-center">{row.todayFollowUp}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          row.status === 'Online' 
                            ? 'bg-green-50 text-green-600 border-green-200/60 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' 
                            : 'bg-red-50 text-red-500 border-red-200/60 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Log in
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </ManagerLayout>
  )
}
