'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, Users, UserCheck, UserMinus, Search, DollarSign,
  MessageSquare, Banknote, Download, History, CreditCard,
  PhoneCall, Timer, Clock, Hourglass, MoreHorizontal,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { redirect } from 'next/navigation'

// Dummy Data for Charts
const feesData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
  { name: 'Aug', value: 0 },
  { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 },
  { name: 'Nov', value: 0 },
  { name: 'Dec', value: 0 },
]

const empAttendanceData = [
  { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 }, { name: 'Aug', value: 0 }, { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 }, { name: 'Nov', value: 0 }, { name: 'Dec', value: 0 },
]

const stdAttendanceData = [
  { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 }, { name: 'Aug', value: 0 }, { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 }, { name: 'Nov', value: 0 }, { name: 'Dec', value: 0 },
]

const financeData = [
  { name: 'Jun', income: 0, expense: 0 },
  { name: 'Feb', income: 0, expense: 0 },
  { name: 'Mar', income: 0, expense: 0 },
  { name: 'Apr', income: 0, expense: 0 },
  { name: 'May', income: 0, expense: 0 },
  { name: 'Jun', income: 0, expense: 0 },
  { name: 'Jul', income: 0, expense: 0 },
  { name: 'Aug', income: 0, expense: 0 },
  { name: 'Sep', income: 0, expense: 0 },
  { name: 'Oct', income: 0, expense: 0 },
  { name: 'Nov', income: 0, expense: 0 },
  { name: 'Dec', income: 0, expense: 0 },
]

const smsData = [
  { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 }, { name: 'Aug', value: 0 }, { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 }, { name: 'Nov', value: 0 }, { name: 'Dec', value: 0 },
]

export default function InstituteDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/institute/dashboard/stats')
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

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10">
      
      {/* Top Section: Metrics & Fee Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: 9 Metrics */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard icon={<MessageSquare />} label="SMS" value={stats?.metrics?.sms?.used?.toString() ?? "0"} subValue={`Used - ${stats?.metrics?.sms?.used ?? 0} Available - ${stats?.metrics?.sms?.available ?? 0}`} color="bg-blue-50 text-blue-600" />
          <MetricCard icon={<UserCheck />} label="Teachers" value={stats?.metrics?.teachers?.toString() ?? "0"} color="bg-orange-50 text-orange-500" />
          <MetricCard icon={<Search />} label="No. of Enquiry" value={stats?.metrics?.enquiries?.toString() ?? "0"} color="bg-rose-50 text-rose-500" />
          
          <MetricCard icon={<Users />} label="Students" value={stats?.metrics?.students?.toString() ?? "0"} color="bg-purple-50 text-purple-600" />
          <MetricCard icon={<UserCheck />} label="Paid Students" value={stats?.metrics?.paidStudents?.toString() ?? "0"} color="bg-emerald-50 text-emerald-500" />
          <MetricCard icon={<UserMinus />} label="Unpaid Students" value={stats?.metrics?.unpaidStudents?.toString() ?? "0"} color="bg-orange-50 text-orange-500" />
          
          <MetricCard icon={<Banknote />} label="Total Income" value={`₹${(stats?.metrics?.totalIncome ?? 0).toLocaleString()}`} color="bg-green-50 text-green-500" />
          <MetricCard icon={<Banknote />} label="Total Expenses" value={`₹${(stats?.metrics?.totalExpenses ?? 0).toLocaleString()}`} color="bg-cyan-50 text-cyan-500" />
          <MetricCard icon={<Download />} label="App Installed By" value={stats?.metrics?.appInstalls?.toString() ?? "0"} color="bg-pink-50 text-pink-500" />
        </div>

        {/* Right: Fee Overview */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Fee Overview</h3>
            <div className="flex gap-2">
              <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                <option>2023-2024</option>
              </select>
              <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                <option>Annual</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 h-full">
            <FeeOverviewCard label="Total Amount" value={`₹${(stats?.feeOverview?.totalAmount ?? 0).toLocaleString()}`} trend="+0%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
            <FeeOverviewCard label="Total Hostel" value={`₹${(stats?.feeOverview?.totalHostel ?? 0).toLocaleString()}`} trend="+0%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
            <FeeOverviewCard label="Total Tution" value={`₹${(stats?.feeOverview?.totalTution ?? 0).toLocaleString()}`} trend="+0%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
            <FeeOverviewCard label="Total Day-Boarding" value={`₹${(stats?.feeOverview?.totalDayBoarding ?? 0).toLocaleString()}`} trend="+0%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
          </div>
        </div>

      </div>

      {/* Fees Management */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Fees Management</h2>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Fees Collection</h3>
              <div className="flex gap-2 items-center">
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>Annual</option>
                </select>
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Fee Status</h3>
              <div className="flex gap-2 items-center">
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>Annual</option>
                </select>
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
            </div>
            <FeeStatusCard count="1,335" label="Paid" color="emerald" />
            <FeeStatusCard count="4,366" label="Pending" color="amber" />
            <FeeStatusCard count="208" label="Overdue" color="rose" />
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Attendance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Employee Attendance</h3>
              <div className="flex gap-2 items-center">
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>Annual</option>
                </select>
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={empAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Students Attendance</h3>
              <div className="flex gap-2 items-center">
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>Annual</option>
                </select>
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stdAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorStd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Earnings</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>Income</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-400"></div>Expense</div>
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer ml-2" />
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `${val}K`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Line type="monotone" dataKey="income" stroke="#22d3ee" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expense" stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex justify-end">
              <div className="flex gap-2 items-center">
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                  <option>Annual</option>
                </select>
              </div>
            </div>
            <FeeOverviewCard label="Total Income" value="₹29,545,000" trend="+12%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
            <FeeOverviewCard label="Total Expenses" value="₹19,291,266" trend="+6.4%" gradient="from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/10" text="text-cyan-700 dark:text-cyan-400" />
          </div>
        </div>
      </div>

      {/* SMS Tracking */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">SMS</h2>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">SMS</h3>
            <div className="flex gap-2 items-center">
              <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                <option>2023-2024</option>
              </select>
              <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
                <option>Annual</option>
              </select>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={smsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="value" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#colorSms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  )
}

function MetricCard({ icon, label, value, subValue, color }: { icon: React.ReactNode, label: string, value: string, subValue?: string, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
        {subValue && <span className="text-[10px] font-semibold text-slate-400 mt-1">{subValue}</span>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      </div>
    </div>
  )
}

function FeeOverviewCard({ label, value, trend, gradient, text }: { label: string, value: string, trend: string, gradient: string, text: string }) {
  return (
    <div className={`rounded-2xl p-5 border border-white/50 dark:border-slate-700 bg-gradient-to-br ${gradient} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
      {/* Decorative Wavy SVG background */}
      <svg className="absolute right-0 top-0 h-full text-white/40 dark:text-white/5 opacity-50 translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor"/>
        <path d="M0,70 Q25,45 50,70 T100,70 L100,100 L0,100 Z" fill="currentColor" opacity="0.5"/>
      </svg>
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm ${text}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="px-2 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shadow-sm">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <div className="flex flex-col">
          <span className={`text-xl font-extrabold ${text} tracking-tight`}>{value}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      </div>
    </div>
  )
}

function FeeStatusCard({ count, label, color }: { count: string, label: string, color: 'emerald' | 'amber' | 'rose' }) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/50',
  }
  const dotColorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{count}</span>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorMap[color]} text-xs font-bold`}>
        <div className={`w-1.5 h-1.5 rounded-full ${dotColorMap[color]}`}></div>
        {label}
      </div>
    </div>
  )
}
