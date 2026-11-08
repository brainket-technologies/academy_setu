'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, UploadCloud, Filter, CheckCircle2, Trash2, CreditCard, Download,
  RefreshCw, Eye, X, Printer, Calendar, Info, FileText, CheckCircle, ArrowRight,
  Clock, Coins, Edit2, AlertCircle, Sparkles, Check
} from 'lucide-react'
import Link from 'next/link'
import {
  fetchPayrollRecords,
  generatePayrollForMonth,
  updatePayrollStatus,
  deletePayrollRecord,
  updatePayrollItemDetails,
  PayrollItem
} from './actions'

export default function PayrollDashboardPage() {
  const [payroll, setPayroll] = useState<PayrollItem[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Teacher' | 'Employee' | 'Driver'>('All')

  // Calculation Basis: 'attendance_days' (pro-rata based on days present) vs 'monthly_fixed' (deduct absent only)
  const [calcBasis, setCalcBasis] = useState<'attendance_days' | 'monthly_fixed'>('attendance_days')

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

  // Edit / Adjust Days & Salary Modal State
  const [editModalItem, setEditModalItem] = useState<PayrollItem | null>(null)
  const [editPresentDays, setEditPresentDays] = useState<number>(0)
  const [editPaidDays, setEditPaidDays] = useState<number>(0)
  const [editPaidLeaves, setEditPaidLeaves] = useState<number>(0)
  const [editNonPaidLeaves, setEditNonPaidLeaves] = useState<number>(0)
  const [editAbsentDays, setEditAbsentDays] = useState<number>(0)
  const [editDeduction, setEditDeduction] = useState<number>(0)
  const [editNetSalary, setEditNetSalary] = useState<number>(0)
  const [savingEdit, setSavingEdit] = useState(false)

  const openEditModal = (item: PayrollItem) => {
    setEditModalItem(item)
    setEditPresentDays(item.presentDays)
    setEditPaidDays(item.paidDays)
    setEditPaidLeaves(item.paidLeave)
    setEditNonPaidLeaves(item.nonPaidLeave)
    setEditAbsentDays(item.absentDays)
    setEditDeduction(item.leaveDeduction)
    setEditNetSalary(item.netSalary)
  }

  // Recalculate edit values when present days or deduction change
  const handleEditPresentDaysChange = (val: number) => {
    setEditPresentDays(val)
    if (!editModalItem) return
    const totalDays = editModalItem.totalDays || 30
    const pDays = Math.min(totalDays, Number((val + editPaidLeaves).toFixed(1)))
    setEditPaidDays(pDays)
    const unpaid = Math.max(0, totalDays - pDays)
    setEditAbsentDays(unpaid)
    const dailyRate = editModalItem.grossSalary / totalDays
    const ded = Math.round(unpaid * dailyRate)
    setEditDeduction(ded)
    setEditNetSalary(Math.max(0, Math.round(editModalItem.grossSalary - ded)))
  }

  const handleEditDeductionChange = (val: number) => {
    setEditDeduction(val)
    if (!editModalItem) return
    setEditNetSalary(Math.max(0, Math.round(editModalItem.grossSalary - val)))
  }

  const handleSaveEdit = async () => {
    if (!editModalItem) return
    setSavingEdit(true)
    try {
      const res = await updatePayrollItemDetails({
        payrollId: editModalItem.id,
        presentDays: editPresentDays,
        paidDays: editPaidDays,
        paidLeaves: editPaidLeaves,
        nonPaidLeaves: editNonPaidLeaves,
        absentDays: editAbsentDays,
        leaveDeduction: editDeduction,
        netSalary: editNetSalary
      })
      if (!res.success) throw new Error(res.error || 'Failed to update record')
      showToast(`Payroll adjusted for ${editModalItem.name}!`)
      setEditModalItem(null)
      await loadPayroll(selectedMonth)
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

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
  const handleRecalculatePayroll = async (overrideBasis?: 'attendance_days' | 'monthly_fixed') => {
    const basis = overrideBasis || calcBasis
    setCalculating(true)
    try {
      const res = await generatePayrollForMonth(
        selectedMonth === 'All' ? undefined : selectedMonth,
        basis
      )
      if (!res.success) {
        throw new Error(res.error || 'Failed to calculate payroll')
      }
      showToast(`Payroll recalculated on attendance (${basis === 'attendance_days' ? 'Days Present' : 'Fixed Monthly'}) for ${res.count} staff members!`)
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

  // Summary Metrics for the three boxes
  const totalNetSalary = useMemo(() => {
    return filtered.reduce((sum, p) => sum + p.netSalary, 0)
  }, [filtered])

  const totalPaidAmount = useMemo(() => {
    return filtered.reduce((sum, p) => sum + p.paidAmount, 0)
  }, [filtered])

  const totalLeftAmount = useMemo(() => {
    return filtered.reduce((sum, p) => sum + p.pendingAmount, 0)
  }, [filtered])

  const paidCount = useMemo(() => {
    return filtered.filter(p => p.status === 'Paid').length
  }, [filtered])

  const unpaidCount = useMemo(() => {
    return filtered.filter(p => p.status !== 'Paid').length
  }, [filtered])

  // Helper for month formatting display
  const formatMonthTitle = (ym: string) => {
    if (!ym || ym === 'All') return 'All Months'
    const [y, m] = ym.split('-')
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Export CSV statement
  const handleExportCSV = () => {
    const headers = [
      'S. No.', 'User Type', 'Employee ID', 'Name', 'Role', 'Department',
      'Month', 'Total Days', 'Present Days', 'Paid Days', 'Paid Leaves', 'Non-Paid / Absent Days',
      'Gross Salary', 'Leave Deduction', 'Net Salary', 'Paid Amount', 'Left Amount', 'Status'
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
      p.paidDays,
      p.paidLeave,
      p.absentDays,
      p.grossSalary,
      p.leaveDeduction,
      p.netSalary,
      p.paidAmount,
      p.pendingAmount,
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

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Payroll</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {formatMonthTitle(selectedMonth)}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Track, calculate, and disburse employee, teacher and driver monthly salaries based on attendance &amp; salary structures
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Calculation Basis Segmented Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setCalcBasis('attendance_days')
                handleRecalculatePayroll('attendance_days')
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                calcBasis === 'attendance_days'
                  ? 'bg-white dark:bg-slate-800 text-[#0f766e] dark:text-teal-300 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Calculate salary strictly based on Present Days + Paid Leaves (unworked days deducted)"
            >
              Days Present (Attendance)
            </button>
            <button
              type="button"
              onClick={() => {
                setCalcBasis('monthly_fixed')
                handleRecalculatePayroll('monthly_fixed')
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                calcBasis === 'monthly_fixed'
                  ? 'bg-white dark:bg-slate-800 text-[#0f766e] dark:text-teal-300 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Full monthly salary minus only marked absences and unpaid leaves"
            >
              Fixed Monthly
            </button>
          </div>

          {/* Sync with attendance button */}
          <button
            type="button"
            disabled={calculating}
            onClick={() => handleRecalculatePayroll()}
            className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 font-black text-xs hover:bg-teal-100 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Recalculate payroll using latest attendance records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
            <span>{calculating ? 'Calculating...' : 'Recalculate on Attendance'}</span>
          </button>
        </div>
      </div>

      {/* ── 3 SUMMARY METRIC BOXES (TOTAL, PAID, LEFT) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BOX 1: TOTAL PAYROLL */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-teal-500/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              TOTAL PAYROLL
            </span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{totalNetSalary.toLocaleString('en-IN')}/-
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              Total payable net salary ({filtered.length} staff)
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* BOX 2: TOTAL PAID */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-emerald-500 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              PAID AMOUNT
            </span>
            <div className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
              ₹{totalPaidAmount.toLocaleString('en-IN')}/-
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              {paidCount} of {filtered.length} staff disbursed
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* BOX 3: TOTAL LEFT / PENDING */}
        <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-amber-500 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              LEFT / DUE
            </span>
            <div className="text-2xl md:text-3xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
              ₹{totalLeftAmount.toLocaleString('en-IN')}/-
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              {unpaidCount} staff pending payment
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
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
            onClick={() => handleRecalculatePayroll()}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">
              Payroll Statement &mdash; {formatMonthTitle(selectedMonth)}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Attendance basis: <span className="font-bold text-[#0f766e]">{calcBasis === 'attendance_days' ? 'Days Present (Pro-Rata)' : 'Fixed Monthly'}</span>
            </p>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            Showing {filtered.length} entries
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold no-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-3 py-4">User Type</th>
                <th className="px-4 py-4 text-left">Staff Name</th>
                <th className="px-3 py-4">Total Days</th>
                <th className="px-3 py-4 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">Present Days</th>
                <th className="px-3 py-4">Paid Leave</th>
                <th className="px-3 py-4 text-rose-600 dark:text-rose-400">Absent / Unpaid</th>
                <th className="px-3 py-4 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/20 font-black">Paid Days</th>
                <th className="px-3 py-4">Gross Salary</th>
                <th className="px-3 py-4 text-rose-600 dark:text-rose-400">Deduction</th>
                <th className="px-4 py-4 font-black">Net Salary</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Payment</th>
                <th className="px-3 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                      <span>Loading payroll records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span>No payroll logs found for this period.</span>
                      <button
                        type="button"
                        onClick={() => handleRecalculatePayroll()}
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
                    <td className="px-3 py-3.5 text-slate-500 font-medium">
                      {idx + 1}.
                    </td>

                    {/* User Type */}
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
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

                    {/* Total Days */}
                    <td className="px-3 py-3.5 text-slate-500 font-semibold">
                      {item.totalDays}
                    </td>

                    {/* Present Days */}
                    <td className="px-3 py-3.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-200/50 dark:border-emerald-800/50">
                        {item.presentDays}
                      </span>
                    </td>

                    {/* Paid Leave */}
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-bold">
                      {item.paidLeave}
                    </td>

                    {/* Absent / Unpaid Days */}
                    <td className="px-3 py-3.5 text-rose-600 dark:text-rose-400 font-bold">
                      {item.absentDays}
                    </td>

                    {/* Paid Days */}
                    <td className="px-3 py-3.5 bg-teal-50/30 dark:bg-teal-950/10">
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-100/80 dark:bg-teal-900/50 text-[#0f766e] dark:text-teal-200 font-black text-xs border border-teal-200 dark:border-teal-700">
                        {item.paidDays}
                      </span>
                    </td>

                    {/* Gross Salary */}
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-400 font-medium text-xs">
                      {item.formattedGrossSalary || `₹${item.grossSalary.toLocaleString('en-IN')}/-`}
                    </td>

                    {/* Leave Deduction */}
                    <td className="px-3 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                      {item.leaveDeduction > 0 ? `-₹${item.leaveDeduction.toLocaleString('en-IN')}/-` : '₹0'}
                    </td>

                    {/* Net Salary */}
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900 dark:text-white text-xs">
                        {item.formattedNetSalary}
                      </div>
                      {item.paidAmount > 0 && item.pendingAmount > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                          Paid: ₹{item.paidAmount.toLocaleString('en-IN')} &bull; Left: ₹{item.pendingAmount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          item.status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Partial'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                        title="Click to toggle Paid/Unpaid"
                      >
                        ● {item.status}
                      </button>
                    </td>

                    {/* Payment Button */}
                    <td className="px-3 py-3.5">
                      {item.status === 'Paid' ? (
                        <Link
                          href={`/institute/payroll/pay?id=${item.id}&name=${encodeURIComponent(item.name)}&type=${encodeURIComponent(item.userType)}&salary=${encodeURIComponent(item.formattedNetSalary)}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Receipt</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/institute/payroll/pay?id=${item.id}&name=${encodeURIComponent(item.name)}&type=${encodeURIComponent(item.userType)}&salary=${encodeURIComponent(item.formattedNetSalary)}`}
                          className="px-3 py-1.5 rounded-lg bg-[#0f766e] text-white font-black text-[10px] uppercase tracking-wider hover:bg-teal-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>{item.status === 'Partial' ? `Pay Left (₹${item.pendingAmount.toLocaleString('en-IN')})` : 'Pay Now'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* Breakdown */}
                        <button
                          type="button"
                          onClick={() => setBreakdownModalItem(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View Attendance & Salary Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Days / Deduction */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0f766e] hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
                          title="Edit Present Days & Deduction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Payslip */}
                        <button
                          type="button"
                          onClick={() => setPayslipModalItem(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                          title="Generate / Print Payslip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete payroll record"
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

      {/* ── EDIT DAYS & SALARY MODAL ── */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  Adjust Attendance &amp; Deduction
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {editModalItem.name} ({editModalItem.role}) &bull; {formatMonthTitle(editModalItem.monthYear)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Total Month Days</label>
                <input
                  type="text"
                  disabled
                  value={editModalItem.totalDays}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Present Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={editModalItem.totalDays}
                  value={editPresentDays}
                  onChange={e => handleEditPresentDaysChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 font-black text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Paid Leaves
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editPaidLeaves}
                  onChange={e => {
                    const l = parseFloat(e.target.value) || 0
                    setEditPaidLeaves(l)
                    const pDays = Math.min(editModalItem.totalDays, Number((editPresentDays + l).toFixed(1)))
                    setEditPaidDays(pDays)
                    const unpaid = Math.max(0, editModalItem.totalDays - pDays)
                    setEditAbsentDays(unpaid)
                    const dailyRate = editModalItem.grossSalary / editModalItem.totalDays
                    const ded = Math.round(unpaid * dailyRate)
                    setEditDeduction(ded)
                    setEditNetSalary(Math.max(0, Math.round(editModalItem.grossSalary - ded)))
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-teal-700 dark:text-teal-300 font-bold mb-1">
                  Paid Days (Calculated)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={editModalItem.totalDays}
                  value={editPaidDays}
                  onChange={e => {
                    const pd = parseFloat(e.target.value) || 0
                    setEditPaidDays(pd)
                    const unpaid = Math.max(0, editModalItem.totalDays - pd)
                    setEditAbsentDays(unpaid)
                    const dailyRate = editModalItem.grossSalary / editModalItem.totalDays
                    const ded = Math.round(unpaid * dailyRate)
                    setEditDeduction(ded)
                    setEditNetSalary(Math.max(0, Math.round(editModalItem.grossSalary - ded)))
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700 font-black text-teal-800 dark:text-teal-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Gross Salary (₹)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${editModalItem.grossSalary.toLocaleString('en-IN')}`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-rose-600 dark:text-rose-400 font-bold mb-1">
                  Deduction (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  max={editModalItem.grossSalary}
                  value={editDeduction}
                  onChange={e => handleEditDeductionChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 font-black text-rose-600 dark:text-rose-400 outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Calculated Net Salary Banner */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Updated Net Payable
                </span>
                <div className="text-xl font-black text-[#0f766e] dark:text-teal-300">
                  ₹{editNetSalary.toLocaleString('en-IN')}/-
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-medium">
                <div>Gross: ₹{editModalItem.grossSalary.toLocaleString('en-IN')}</div>
                <div className="text-rose-500 font-bold">- Deduction: ₹{editDeduction.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save & Update Payroll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BREAKDOWN MODAL ── */}
      {breakdownModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  Attendance &amp; Salary Breakdown
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {breakdownModalItem.name} &bull; {breakdownModalItem.role} ({breakdownModalItem.userType})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBreakdownModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance breakdown pills */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Days</span>
                <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{breakdownModalItem.totalDays}</div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Present</span>
                <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{breakdownModalItem.presentDays}</div>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Paid Leave</span>
                <div className="text-sm font-black text-indigo-700 dark:text-indigo-300 mt-0.5">{breakdownModalItem.paidLeave}</div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] uppercase font-bold text-rose-600">Absent / Unpaid</span>
                <div className="text-sm font-black text-rose-700 dark:text-rose-300 mt-0.5">{breakdownModalItem.absentDays}</div>
              </div>
            </div>

            {/* Salary Calculation Lines */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Gross Monthly Salary</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{breakdownModalItem.grossSalary.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Paid Days</span>
                <span className="font-bold text-teal-700 dark:text-teal-300">{breakdownModalItem.paidDays} Days</span>
              </div>
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                <span>Leave &amp; Absent Deduction</span>
                <span className="font-black">-{breakdownModalItem.formattedLeaveDeduction}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-[#0f766e] dark:text-teal-300">
                <span>Net Payable Salary</span>
                <span>{breakdownModalItem.formattedNetSalary}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setBreakdownModalItem(null)
                  openEditModal(breakdownModalItem)
                }}
                className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] font-black text-xs hover:bg-teal-100 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjust Days &amp; Deduction</span>
              </button>

              <Link
                href={`/institute/payroll/pay?id=${breakdownModalItem.id}&name=${encodeURIComponent(breakdownModalItem.name)}&type=${encodeURIComponent(breakdownModalItem.userType)}&salary=${encodeURIComponent(breakdownModalItem.formattedNetSalary)}`}
                className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYSLIP PRINT MODAL ── */}
      {payslipModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  Payslip &mdash; {formatMonthTitle(payslipModalItem.monthYear)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayslipModalItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Payslip Card */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{payslipModalItem.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{payslipModalItem.role} &bull; {payslipModalItem.department}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{payslipModalItem.employeeId && `EMP ID: ${payslipModalItem.employeeId}`}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    payslipModalItem.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {payslipModalItem.status}
                  </span>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">Period: {formatMonthTitle(payslipModalItem.monthYear)}</div>
                </div>
              </div>

              {/* Attendance metrics */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Days</span>
                  <div className="font-black text-slate-800 dark:text-slate-200">{payslipModalItem.totalDays}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-emerald-600 uppercase font-bold">Present</span>
                  <div className="font-black text-emerald-600">{payslipModalItem.presentDays}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-[#0f766e] uppercase font-bold">Paid Days</span>
                  <div className="font-black text-[#0f766e]">{payslipModalItem.paidDays}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-rose-500 uppercase font-bold">Absent / Deducted</span>
                  <div className="font-black text-rose-600">{payslipModalItem.absentDays}</div>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Earnings</div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Gross Salary</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{payslipModalItem.grossSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deductions</div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Leave / Attendance</span>
                    <span className="font-bold text-rose-600">{payslipModalItem.formattedLeaveDeduction}</span>
                  </div>
                </div>
              </div>

              {/* Total Net */}
              <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex justify-between items-center text-sm font-black">
                <span className="text-[#0f766e] dark:text-teal-300">Net Payable Salary</span>
                <span className="text-base text-[#0f766e] dark:text-teal-200">{payslipModalItem.formattedNetSalary}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
            toastType === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}>
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

    </div>
  )
}
