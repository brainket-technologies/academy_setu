'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Building2, GraduationCap, School, FileText, Calendar, 
  Tag, IndianRupee, Receipt, Users, Clock, 
  Timer, Hourglass, PhoneCall, History
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

export default function AdminDashboardPage() {
  const kpiData = [
    { title: 'School', subtitle: '(Segment)', value: '50', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'College', subtitle: '(Segment)', value: '20', icon: GraduationCap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Institute', subtitle: '(Segment)', value: '12', icon: School, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Application', subtitle: '', value: '700', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'No. of Plan', subtitle: '', value: '20', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'No. of Promo Code', subtitle: '', value: '10', icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Total Income', subtitle: '', value: '200K', icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Expenses', subtitle: '', value: '150K', icon: Receipt, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { title: 'Distributers', subtitle: '', value: '10', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
  ]

  const collectionData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 5000 },
    { name: 'Mar', value: 4000 },
    { name: 'Apr', value: 5500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 3500 },
    { name: 'Jul', value: 5000 },
    { name: 'Aug', value: 2500 },
    { name: 'Sep', value: 4000 },
    { name: 'Oct', value: 5000 },
    { name: 'Nov', value: 4000 },
    { name: 'Dec', value: 2000 },
  ]

  const earningsData = [
    { name: 'Jan', income: 6000, expense: 4000 },
    { name: 'Feb', income: 7000, expense: 5000 },
    { name: 'Mar', income: 6500, expense: 4500 },
    { name: 'Apr', income: 5500, expense: 4000 },
    { name: 'May', income: 6000, expense: 3500 },
    { name: 'Jun', income: 7000, expense: 5000 },
    { name: 'Jul', income: 8000, expense: 5000 },
    { name: 'Aug', income: 6000, expense: 4500 },
    { name: 'Sep', income: 6500, expense: 6000 },
    { name: 'Oct', income: 7000, expense: 4000 },
    { name: 'Nov', income: 6500, expense: 3500 },
    { name: 'Dec', income: 7500, expense: 4000 },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in-up">
        
        {/* Top Section */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main KPIs Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiData.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <div key={i} className="glass-card p-5 flex items-center justify-between group">
                  <div>
                    <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider flex gap-1">
                      {kpi.title} <span className="text-slate-400 dark:text-slate-500 normal-case">{kpi.subtitle}</span>
                    </h3>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 tracking-tight">{kpi.value}</p>
                    <p className="text-xs text-emerald-500 font-semibold mt-1.5 flex items-center gap-1">
                      <span>↑ 12%</span><span className="text-slate-400 font-normal">vs last month</span>
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} dark:opacity-90 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Collection Overview */}
          <div className="w-full xl:w-[390px] shrink-0 glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Collection Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Annual financial summary</p>
              </div>
              <div className="flex gap-2">
                <select className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none backdrop-blur-sm">
                  <option>2023-2024</option>
                </select>
                <select className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none backdrop-blur-sm">
                  <option>Annual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Income', value: '₹3,500,000', pct: '↑ 15%', gradient: 'from-emerald-500 to-teal-400', light: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { label: 'Total Expense', value: '₹1,200,000', pct: '↑ 17%', gradient: 'from-blue-500 to-cyan-400', light: 'bg-blue-50 dark:bg-blue-950/30' },
                { label: 'Distributor Amt', value: '₹2,000,000', pct: '↑ 12%', gradient: 'from-violet-500 to-purple-400', light: 'bg-violet-50 dark:bg-violet-950/30' },
                { label: 'Total Due Amt', value: '₹300,000', pct: '↑ 12%', gradient: 'from-rose-500 to-pink-400', light: 'bg-rose-50 dark:bg-rose-950/30' },
              ].map((c, i) => (
                <div key={i} className={`${c.light} rounded-2xl p-4 relative overflow-hidden`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow`}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <span className="bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{c.pct}</span>
                  </div>
                  <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{c.value}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead & Call Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Lead & Followup */}
          <div className="flex-1 glass-card p-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Lead & Followup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Total Lead', value: '700', Icon: Users, bg: 'bg-emerald-100 dark:bg-emerald-950/40', ic: 'text-emerald-600' },
                { label: 'Total Application', value: '8000', Icon: FileText, bg: 'bg-pink-100 dark:bg-pink-950/40', ic: 'text-pink-600' },
                { label: 'Pending Followup', value: '2000', Icon: History, bg: 'bg-amber-100 dark:bg-amber-950/40', ic: 'text-amber-600' },
                { label: "Today's Followup", value: '25', Icon: Calendar, bg: 'bg-red-100 dark:bg-red-950/40', ic: 'text-red-600' },
              ].map(({ label, value, Icon, bg, ic }, j) => (
                <div key={j} className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${ic}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call & Login Time */}
          <div className="flex-1 glass-card p-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Call & Login Time</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Call Time</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">2000</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Login Time</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">25</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Login Dur.</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">700</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Inactive Time (min.)</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">8000</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                  <Hourglass className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Management Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Collection Management</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 glass-card p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Collection Graph</h3>
                <div className="flex items-center gap-2">
                  <select className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                    <option>2023-2024</option>
                  </select>
                  <select className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                    <option>Annual</option>
                  </select>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={collectionData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} ticks={[0, 1000, 2500, 5000, 7500]} />
                    <Tooltip cursor={{ stroke: 'rgba(79,70,229,0.15)', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(79,70,229,0.12)' }} />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full lg:w-[260px] shrink-0 glass-card p-6 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Collect Status</h3>
                <select className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                  <option>Annual</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {[
                  { count: '1,335', label: 'Paid', dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
                  { count: '4,366', label: 'Pending', dot: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
                  { count: '208', label: 'Overdue', dot: 'bg-red-500', badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl flex items-center justify-between px-5 py-4 border border-white/60 dark:border-white/10">
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{s.count}</span>
                    <span className={`${s.badge} text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Financial Overview</h2>
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex-1 glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Earnings</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E0E7FF]"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Expense</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">...</button>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C7D2FE" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#C7D2FE" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} ticks={[0, 250000, 500000, 750000, 1000000]} tickFormatter={(val) => val === 0 ? '0' : val/1000 + 'K'} />
                    <Tooltip cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="income" stroke="#818CF8" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#C7D2FE" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-end gap-2">
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                  <option>2023-2024</option>
                </select>
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                  <option>Annual</option>
                </select>
              </div>
              <div className="bg-teal-200 dark:bg-teal-900/50 rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded bg-white/40 dark:bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-800 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <span className="bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">↑ 12%</span>
                </div>
                <p className="text-3xl font-bold text-teal-950 dark:text-teal-100 relative z-10">₹29,545,000</p>
                <p className="text-sm font-medium text-teal-800 dark:text-teal-300 mt-1 relative z-10">Total Income</p>
                {/* Decorative lines */}
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                    <path d="M0 100 C 20 80 50 100 100 0" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    <path d="M0 80 C 20 60 50 80 100 -20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="bg-cyan-200 dark:bg-cyan-900/50 rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded bg-white/40 dark:bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-800 dark:text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <span className="bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">↑ 0.5%</span>
                </div>
                <p className="text-3xl font-bold text-cyan-950 dark:text-cyan-100 relative z-10">₹19,291,266</p>
                <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300 mt-1 relative z-10">Total Expenses</p>
                 {/* Decorative lines */}
                 <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                    <path d="M0 100 C 20 80 50 100 100 0" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    <path d="M0 80 C 20 60 50 80 100 -20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
