'use client'

import React, { useState, useEffect } from 'react'
import { Search, UploadCloud, Filter, CheckCircle2, Trash2, CreditCard, Download } from 'lucide-react'
import Link from 'next/link'

interface PayrollRecord {
  id: number
  userType: 'Teacher' | 'Employee' | 'Driver'
  name: string
  paidLeave: number
  nonPaidLeave: number
  leaveDeduction: string
  netSalary: string
  status: 'Paid' | 'Unpaid'
}

const INITIAL_PAYROLL: PayrollRecord[] = [
]

export default function PayrollDashboardPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>(INITIAL_PAYROLL)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Teacher' | 'Employee' | 'Driver'>('All')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('payroll_records')
    if (saved) {
      try {
        setPayroll(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('payroll_records', JSON.stringify(INITIAL_PAYROLL))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this payroll entry?')) {
      const updated = payroll.filter(p => p.id !== id)
      setPayroll(updated)
      localStorage.setItem('payroll_records', JSON.stringify(updated))
      setToastMsg('Payroll record deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  // Count helper
  const getCount = (type: 'All' | 'Teacher' | 'Employee' | 'Driver') => {
    if (type === 'All') return payroll.length
    return payroll.filter(p => p.userType === type).length
  }

  const filtered = payroll.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.userType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'All' || p.userType === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Payroll</h1>
        <p className="text-xs text-slate-400">Track, calculate, and disburse employee and driver monthly salaries</p>
      </div>

      {/* Control Actions (Screenshot 2) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by User type, name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            onClick={() => alert('Exporting payroll statement data...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white"
          >
            <UploadCloud className="w-4 h-4 text-teal-650" />
          </button>
          <button 
            type="button"
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-655 hover:bg-slate-50 bg-white"
          >
            <Filter className="w-4 h-4 text-teal-600" />
          </button>
        </div>

      </div>

      {/* Role filter buttons bar (Screenshot 2, 3, & 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {([
            { id: 'All', label: 'All', color: 'border-pink-200 bg-pink-50/15 text-pink-700 hover:bg-pink-50/30' },
            { id: 'Teacher', label: 'Teacher', color: 'border-indigo-200 bg-indigo-50/15 text-indigo-700 hover:bg-indigo-50/30' },
            { id: 'Employee', label: 'Employee', color: 'border-emerald-200 bg-emerald-50/15 text-emerald-700 hover:bg-emerald-50/30' },
            { id: 'Driver', label: 'Driver', color: 'border-sky-200 bg-sky-50/15 text-sky-700 hover:bg-sky-50/30' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[10px] uppercase font-black tracking-wider transition-all ${
                activeTab === tab.id 
                  ? tab.color
                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] ${
                activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{getCount(tab.id).toString().padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        <select className="border border-slate-250 rounded-xl px-3 py-1.5 text-xs outline-none bg-white font-bold w-36 shadow-sm">
          <option value="All">All</option>
        </select>
      </div>

      {/* Grid listing table (Screenshot 2, 3, & 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">User Type</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4">Paid Leave</th>
                <th className="px-4 py-4">Non-Paid Leave</th>
                <th className="px-4 py-4">Leave Deduction</th>
                <th className="px-4 py-4">Net Salary</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Payslip</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.userType}</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.paidLeave}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.nonPaidLeave}</td>
                  <td className="px-4 py-3.5 text-slate-655 font-bold">{item.leaveDeduction}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">{item.netSalary}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.status === 'Paid' ? (
                      <button 
                        onClick={() => alert(`Downloading payslip statement invoice for ${item.name}...`)}
                        className="p-1.5 rounded hover:bg-slate-100 text-teal-600 transition-colors"
                        title="Download Payslip"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-350">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {item.status === 'Unpaid' ? (
                      <Link 
                        href={`/institute/payroll/pay?id=${item.id}&name=${encodeURIComponent(item.name)}&type=${item.userType}&salary=${encodeURIComponent(item.netSalary)}`}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors shadow-sm inline-block"
                      >
                        Pay Now
                      </Link>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-bold">No payroll logs found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}
