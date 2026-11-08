'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, UploadCloud, Filter, CheckCircle2, Trash2, CreditCard, Download,
  RefreshCw, Eye, X, Printer, Calendar, Info, FileText, CheckCircle, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import {
  fetchPayrollRecords,
  generatePayrollForMonth,
  updatePayrollStatus,
  deletePayrollRecord,
  PayrollItem
} from './actions'

export default function PayrollDashboardPage() {
  const [payroll, setPayroll] = useState<PayrollItem[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Teacher' | 'Employee' | 'Driver'>('All')

  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Toast State
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg)
    setToastType(type)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3500)
  }

  // Modals
  const [payslipModalItem, setPayslipModalItem] = useState<PayrollItem | null>(null)
  const [breakdownModalItem, setBreakdownModalItem] = useState<PayrollItem | null>(null)

  // Load payroll data for the selected month
  const loadPayroll = async (monthYm?: string) => {
    setLoading(true)
    try {
      const ym = monthYm !== undefined ? monthYm : selectedMonth
      const res = await fetchPayrollRecords({ monthYear: ym, userType: 'All' })
      if (res.success && Array.isArray(res.data)) {
        setPayroll(res.data)
      } else {
        setPayroll([])
      }
    } catch (e: any) {
      console.error('Error loading payroll records:', e)
      showToast(e.message || 'Failed to load payroll records', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayroll(selectedMonth)
  }, [selectedMonth])

  // Recalculate / Sync with attendance and salary for this month
  const handleRecalculatePayroll = async () => {
    setCalculating(true)
    try {
      const res = await generatePayrollForMonth(selectedMonth === 'All' ? undefined : selectedMonth)
      if (!res.success) {
        throw new Error(res.error || 'Failed to calculate payroll')
      }
      showToast(`Payroll calculated successfully for ${res.count} staff members!`)
      await loadPayroll(selectedMonth)
    } catch (e: any) {
      console.error('Recalculation error:', e)
      showToast(e.message || 'Calculation failed', 'error')
    } finally {
      setCalculating(false)
    }
  }

  // Toggle Paid / Unpaid Status directly
  const handleToggleStatus = async (item: PayrollItem) => {
    const newStatus = item.status === 'Paid' ? 'Unpaid' : 'Paid'
    try {
      const res = await updatePayrollStatus({
        payrollId: item.id,
        status: newStatus,
        paymentMethod: 'Bank Transfer'
      })
      if (!res.success) throw new Error(res.error || 'Failed to update status')
      showToast(`Status updated to ${newStatus} for ${item.name}!`)
      await loadPayroll(selectedMonth)
      if (breakdownModalItem && breakdownModalItem.id === item.id) {
        setBreakdownModalItem(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (e: any) {
      showToast(e.message || 'Update failed', 'error')
    }
  }

  // Delete single payroll entry
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the payroll entry for ${name}?`)) {
      try {
        const res = await deletePayrollRecord(id)
        if (!res.success) throw new Error(res.error || 'Failed to delete record')
        setPayroll(prev => prev.filter(p => p.id !== id))
        showToast(`Payroll record for ${name} deleted successfully!`)
      } catch (e: any) {
        showToast(e.message || 'Deletion failed', 'error')
      }
    }
  }

  // Export CSV statement
  const handleExportCSV = () => {
    const headers = [
      'S. No.', 'User Type', 'Employee ID', 'Name', 'Role', 'Department',
      'Month', 'Total Days', 'Present Days', 'Paid Leaves', 'Non-Paid Leaves',
      'Absent Days', 'Basic Salary', 'Gross Salary', 'Leave Deduction', 'Net Salary', 'Status'
    ]

    const rows = filtered.map((p, idx) => [
      idx + 1,
      `"${p.userType}"`,
      `"${p.employeeId || ''}"`,
      `"${p.name}"`,
      `"${p.role}"`,
      `"${p.department}"`,
      `"${p.monthYear}"`,
      p.totalDays,
      p.presentDays,
      p.paidLeave,
      p.nonPaidLeave,
      p.absentDays,
      p.basicSalary,
      p.grossSalary,
      p.leaveDeduction,
      p.netSalary,
      `"${p.status}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `payroll_statement_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Payroll statement CSV exported!')
  }

  // Count helper
  const getCount = (type: 'All' | 'Teacher' | 'Employee' | 'Driver') => {
    if (type === 'All') return payroll.length
    return payroll.filter(p => p.userType === type).length
  }

  // Filtered listing
  const filtered = useMemo(() => {
    return payroll.filter(p => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.userType.toLowerCase().includes(q) ||
        (p.role && p.role.toLowerCase().includes(q)) ||
        (p.employeeId && p.employeeId.toLowerCase().includes(q))

      const matchesTab = activeTab === 'All' || p.userType === activeTab
      return matchesSearch && matchesTab
    })
  }, [payroll, searchQuery, activeTab])

  // Helper for month formatting display
  const formatMonthTitle = (ym: string) => {
    if (!ym || ym === 'All') return 'All Months'
    const [y, m] = ym.split('-')
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            Payroll
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Track, calculate, and disburse employee, teacher and driver monthly salaries based on attendance &amp; salary structures
          </p>
        </div>

        {/* Sync with attendance button */}
        <button
          type="button"
          disabled={calculating}
          onClick={handleRecalculatePayroll}
          className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 font-black text-xs hover:bg-teal-100 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
          title="Recalculate payroll using latest attendance records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
          <span>{calculating ? 'Calculating...' : 'Recalculate on Attendance'}</span>
        </button>
      </div>

      {/* ── CONTROL ACTIONS BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by User type, name, EMP ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
            title="Export CSV Statement"
          >
            <UploadCloud className="w-4 h-4 text-[#0f766e]" />
          </button>
          <button
            type="button"
            onClick={handleRecalculatePayroll}
            className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-[#0f766e] hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
            title="Sync with Attendance"
          >
            <Filter className="w-4 h-4 text-[#0f766e]" />
          </button>
        </div>
      </div>

      {/* ── ROLE FILTER TABS & MONTH SELECTOR BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2.5">
          {([
            { id: 'All', label: 'All', color: 'border-pink-200 bg-pink-50/20 text-pink-700 hover:bg-pink-50/40' },
            { id: 'Teacher', label: 'Teacher', color: 'border-indigo-200 bg-indigo-50/20 text-indigo-700 hover:bg-indigo-50/40' },
            { id: 'Employee', label: 'Employee', color: 'border-emerald-200 bg-emerald-50/20 text-emerald-700 hover:bg-emerald-50/40' },
            { id: 'Driver', label: 'Driver', color: 'border-sky-200 bg-sky-50/20 text-sky-700 hover:bg-sky-50/40' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? tab.color
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                activeTab === tab.id ? 'bg-[#0f766e] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {getCount(tab.id).toString().padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0f766e]" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-slate-250 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs outline-none bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer focus:border-teal-500"
          >
            <option value="2026-11">November 2026 (Current)</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="All">All Months</option>
          </select>
        </div>
      </div>

      {/* ── PAYROLL TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">
            Payroll Statement &mdash; {formatMonthTitle(selectedMonth)}
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            Showing {filtered.length} entries
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold no-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
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
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                      <span>Loading payroll records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span>No payroll logs found for this period.</span>
                      <button
                        type="button"
                        onClick={handleRecalculatePayroll}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-[#0f766e] text-white text-xs font-bold hover:bg-teal-700"
                      >
                        Generate Payroll Now
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors font-semibold"
                  >
                    {/* S. No. */}
                    <td className="px-4 py-3.5 text-slate-500 font-medium">
                      {idx + 1}.
                    </td>

                    {/* User Type */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.userType === 'Teacher'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : item.userType === 'Employee'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                      }`}>
                        {item.userType}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-black text-slate-800 dark:text-slate-100 text-xs">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.role} &bull; {item.department} {item.employeeId && `• ${item.employeeId}`}
                      </div>
                    </td>

                    {/* Paid Leave */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-bold">
                      {item.paidLeave}
                    </td>

                    {/* Non-Paid Leave */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-bold">
                      {item.nonPaidLeave + (item.absentDays > 0 ? item.absentDays : 0)}
                    </td>

                    {/* Leave Deduction */}
                    <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                      {item.formattedLeaveDeduction}
                    </td>

                    {/* Net Salary */}
                    <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">
                      {item.formattedNetSalary}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          item.status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                        title="Click to toggle Paid/Unpaid"
                      >
                        ● {item.status}
                      </button>
                    </td>

                    {/* Payslip */}
                    <td className="px-4 py-3.5">
                      {item.status === 'Paid' ? (
                        <button
                          type="button"
                          onClick={() => setPayslipModalItem(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0f766e] transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="View / Download Payslip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5">
                      {item.status === 'Unpaid' ? (
                        <Link
                          href={`/institute/payroll/pay?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}&type=${encodeURIComponent(item.userType)}&salary=${encodeURIComponent(item.formattedNetSalary)}`}
                          className="px-3 py-1.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors shadow-xs inline-block"
                        >
                          Pay Now
                        </Link>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Breakdown info */}
                        <button
                          type="button"
                          onClick={() => setBreakdownModalItem(item)}
                          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] hover:bg-teal-100 transition-colors cursor-pointer"
                          title="View calculation breakdown"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: PROFESSIONAL PAYSLIP VIEW & PRINT
      ═══════════════════════════════════════════════════════════════════ */}
      {payslipModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700 my-8">
            {/* Payslip Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0f766e]">
                  Official Salary Slip
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  Cosmopolitan Inter School
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Pay Period: {formatMonthTitle(payslipModalItem.monthYear)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayslipModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Staff Name</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{payslipModalItem.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Employee ID</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{payslipModalItem.employeeId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Designation</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{payslipModalItem.role} ({payslipModalItem.userType})</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Department</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{payslipModalItem.department}</span>
              </div>
            </div>

            {/* Attendance & Days Summary */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Attendance Breakdown
              </span>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <span className="text-base font-black text-slate-900 dark:text-white block">{payslipModalItem.totalDays}</span>
                  <span className="text-[10px] text-slate-500 font-bold">Month Days</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <span className="text-base font-black text-emerald-600 block">{payslipModalItem.presentDays}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Present</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                  <span className="text-base font-black text-amber-600 block">{payslipModalItem.paidLeave}</span>
                  <span className="text-[10px] text-amber-700 font-bold">Paid Leave</span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                  <span className="text-base font-black text-rose-600 block">
                    {payslipModalItem.nonPaidLeave + (payslipModalItem.absentDays > 0 ? payslipModalItem.absentDays : 0)}
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold">Non-Paid Days</span>
                </div>
              </div>
            </div>

            {/* Salary Calculation Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span>Basic Salary</span>
                <span className="font-bold">₹{payslipModalItem.basicSalary.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span>Allowances &amp; Other Components</span>
                <span className="font-bold">₹{Math.max(0, payslipModalItem.grossSalary - payslipModalItem.basicSalary).toLocaleString('en-IN')}/-</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                <span>Gross Monthly Salary</span>
                <span>₹{payslipModalItem.grossSalary.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 text-rose-600 font-bold">
                <span>Leave / Absence Deduction</span>
                <span>-{payslipModalItem.formattedLeaveDeduction}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-[#0f766e] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 rounded-xl mt-2">
                <span>Net Salary Payable</span>
                <span>{payslipModalItem.formattedNetSalary}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayslipModalItem(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: BREAKDOWN & CALCULATION LOGIC
      ═══════════════════════════════════════════════════════════════════ */}
      {breakdownModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Salary &amp; Attendance Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    {breakdownModalItem.name} &bull; {breakdownModalItem.monthYear}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBreakdownModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl space-y-2">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                  Formula Applied:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[11px]">
                  Daily Rate = Gross Salary (₹{breakdownModalItem.grossSalary}) / {breakdownModalItem.totalDays} Days = ₹{Math.round(breakdownModalItem.grossSalary / breakdownModalItem.totalDays)}/day
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[11px]">
                  Deduction = (Absents [{breakdownModalItem.absentDays}] + Non-Paid Leaves [{breakdownModalItem.nonPaidLeave}] + Half-Days [{breakdownModalItem.halfDays * 0.5}]) &times; Daily Rate = {breakdownModalItem.formattedLeaveDeduction}
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[11px]">
                  Net Salary = ₹{breakdownModalItem.grossSalary} - {breakdownModalItem.formattedLeaveDeduction} = {breakdownModalItem.formattedNetSalary}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold">Current Payment Status:</span>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(breakdownModalItem)}
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-colors cursor-pointer ${
                    breakdownModalItem.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  ● {breakdownModalItem.status} (Click to toggle)
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBreakdownModalItem(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ALERT ── */}
      {toastOpen && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-white animate-in slide-in-from-bottom-5 duration-300 ${
          toastType === 'success' ? 'bg-[#0f766e]' : 'bg-red-600'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-teal-200" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}
