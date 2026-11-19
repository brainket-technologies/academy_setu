'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import {
  Search, UploadCloud, Filter, CheckCircle2, Trash2, CreditCard, Download,
  RefreshCw, Eye, X, Printer, Calendar, Info, FileText, CheckCircle, ArrowRight,
  Clock, Coins, Edit2, AlertCircle, Sparkles, Check, ChevronRight, ArrowLeft,
  Wallet, Building2, User, Phone, Mail, RotateCcw, DollarSign, ShieldCheck,
  Layers, CheckSquare, Square, Receipt, Copy
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  fetchEmployeePayrollDirectory,
  fetchStaffAllMonthsPayroll,
  fetchPayrollRecordById,
  fetchStaffAllTransactions,
  recordPayrollTransaction,
  recordMultiMonthPayrollTransaction,
  updatePayrollStatus,
  deletePayrollRecord,
  updatePayrollItemDetails,
  generatePayrollForMonth,
  EmployeePayrollSummary,
  PayrollItem,
  PayrollTransactionItem
} from './actions'

function PayrollDashboardContent() {
  const searchParams = useSearchParams()

  // ── VIEW MODE: 'directory' (main employee list) vs 'staff_payroll' (full all-month view) ──
  const [selectedStaff, setSelectedStaff] = useState<EmployeePayrollSummary | null>(null)

  // ── DIRECTORY DATA STATE ──
  const [employees, setEmployees] = useState<EmployeePayrollSummary[]>([])
  const [directoryStats, setDirectoryStats] = useState({
    totalStaff: 0,
    teachersCount: 0,
    employeesCount: 0,
    driversCount: 0,
    totalGrossPayrollScale: 0,
    currentMonthDisbursed: 0,
    currentMonthPending: 0,
    currentMonthPaidCount: 0,
    currentMonthUnpaidCount: 0,
    currentMonthYear: ''
  })
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [directorySearch, setDirectorySearch] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Teacher' | 'Employee' | 'Driver'>('All')

  // ── ALL-MONTHS PAYROLL VIEW DATA STATE ──
  const [staffRecords, setStaffRecords] = useState<PayrollItem[]>([])
  const [loadingStaffRecords, setLoadingStaffRecords] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>(['2026'])
  const [staffSummary, setStaffSummary] = useState<{
    totalGross: number
    totalNet: number
    totalPaid: number
    totalPending: number
    totalDeduction: number
    totalMonths: number
    paidMonths: number
    unpaidMonths: number
  } | null>(null)

  // All-Months View Filters
  const [filterYear, setFilterYear] = useState<string>('All')
  const [filterMonth, setFilterMonth] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All')
  const [recordSearch, setRecordSearch] = useState<string>('')

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

  // ── MODALS STATE ──
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

  // Pay Modal State
  const [payModalItem, setPayModalItem] = useState<PayrollItem | null>(null)
  const [payAmount, setPayAmount] = useState<string>('')
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque'>('Bank Transfer')
  const [payTxnId, setPayTxnId] = useState<string>('')
  const [payBankName, setPayBankName] = useState('State Bank of India')
  const [payAccountNo, setPayAccountNo] = useState('1234567890')
  const [payIfsc, setPayIfsc] = useState('SBIN0001234')
  const [payUpiId, setPayUpiId] = useState('staff@oksbi')
  const [payChequeNo, setPayChequeNo] = useState('')
  const [payRemarks, setPayRemarks] = useState('')
  const [recordingPayment, setRecordingPayment] = useState(false)

  // ── MULTI-MONTH SELECTION & SINGLE TRANSACTION PAYMENT STATE ──
  const [selectedMonthIds, setSelectedMonthIds] = useState<string[]>([])
  const [multiPayModalOpen, setMultiPayModalOpen] = useState(false)
  const [multiPayItems, setMultiPayItems] = useState<Array<{
    payrollId: string
    monthYear: string
    netSalary: number
    paidAmount: number
    pendingAmount: number
    payAmount: number
  }>>([])
  const [multiPaymentMode, setMultiPaymentMode] = useState<'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque'>('Bank Transfer')
  const [multiPayTxnId, setMultiPayTxnId] = useState('')
  const [multiPayBankName, setMultiPayBankName] = useState('State Bank of India')
  const [multiPayAccountNo, setMultiPayAccountNo] = useState('1234567890')
  const [multiPayIfsc, setMultiPayIfsc] = useState('SBIN0001234')
  const [multiPayUpiId, setMultiPayUpiId] = useState('staff@oksbi')
  const [multiPayChequeNo, setMultiPayChequeNo] = useState('')
  const [multiPayRemarks, setMultiPayRemarks] = useState('')
  const [recordingMultiPayment, setRecordingMultiPayment] = useState(false)
  const [lumpSumInput, setLumpSumInput] = useState('')

  // ── TRANSACTION DETAILS MODAL STATE ──
  const [txnModalOpen, setTxnModalOpen] = useState(false)
  const [txnModalRecord, setTxnModalRecord] = useState<PayrollItem | null>(null)
  const [txnModalList, setTxnModalList] = useState<PayrollTransactionItem[]>([])
  const [loadingTxns, setLoadingTxns] = useState(false)
  const [txnModalTitle, setTxnModalTitle] = useState('')
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null)

  // Calculation Basis toggle
  const [calcBasis, setCalcBasis] = useState<'attendance_days' | 'monthly_fixed'>('attendance_days')
  const [recalculating, setRecalculating] = useState(false)

  // ── LOAD EMPLOYEE DIRECTORY ──
  const loadDirectory = async () => {
    setLoadingEmployees(true)
    try {
      const res = await fetchEmployeePayrollDirectory()
      if (res.success) {
        setEmployees(res.employees || [])
        setDirectoryStats(res.stats)
      } else {
        showToast(res.error || 'Failed to load employee directory', 'error')
      }
    } catch (e: any) {
      console.error('Error loading employee directory:', e)
      showToast(e.message || 'Directory load failed', 'error')
    } finally {
      setLoadingEmployees(false)
    }
  }

  // ── LOAD SPECIFIC STAFF ALL-MONTH PAYROLL ──
  const loadStaffPayroll = async (staffId: string, staffName?: string, year?: string) => {
    setLoadingStaffRecords(true)
    setSelectedMonthIds([])
    setMultiPayModalOpen(false)
    try {
      const res = await fetchStaffAllMonthsPayroll({ staffId, staffName, year })
      if (res.success) {
        setStaffRecords(res.records || [])
        setAvailableYears(res.availableYears || ['2026'])
        setStaffSummary(res.summary)
      } else {
        showToast(res.error || 'Failed to load staff payroll history', 'error')
      }
    } catch (e: any) {
      console.error('Error loading staff payroll history:', e)
      showToast(e.message || 'Staff payroll load failed', 'error')
    } finally {
      setLoadingStaffRecords(false)
    }
  }

  useEffect(() => {
    loadDirectory()
  }, [])

  // Check URL query param on mount or URL change
  useEffect(() => {
    const staffIdParam = searchParams.get('staffId')
    if (staffIdParam && employees.length > 0) {
      const found = employees.find(e => e.id === staffIdParam)
      if (found) {
        setSelectedStaff(found)
        loadStaffPayroll(found.id, found.name)
      }
    }
  }, [searchParams, employees])

  // Open Full All-Months View for an employee
  const handleOpenStaffPayroll = (emp: EmployeePayrollSummary) => {
    setSelectedStaff(emp)
    setFilterYear('All')
    setFilterMonth('All')
    setFilterStatus('All')
    setRecordSearch('')
    loadStaffPayroll(emp.id, emp.name)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('staffId', emp.id)
      window.history.pushState(null, '', url.toString())
    }
  }

  // Back to Directory
  const handleBackToDirectory = () => {
    setSelectedStaff(null)
    setStaffRecords([])
    setSelectedMonthIds([])
    setMultiPayModalOpen(false)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('staffId')
      window.history.pushState(null, '', url.toString())
    }
    loadDirectory()
  }

  // Filtered Employees in Directory
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = directorySearch.toLowerCase().trim()
      const matchesSearch = !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.userType.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        (emp.phone && emp.phone.includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q))

      const matchesTab = activeTab === 'All' || emp.userType === activeTab
      return matchesSearch && matchesTab
    })
  }, [employees, directorySearch, activeTab])

  // Filtered Records in All-Months View
  const filteredStaffRecords = useMemo(() => {
    return staffRecords.filter(rec => {
      const [recYear, recMonthNum] = rec.monthYear.split('-')

      // Year filter
      if (filterYear !== 'All' && recYear !== filterYear) return false

      // Month filter
      if (filterMonth !== 'All' && recMonthNum !== filterMonth) return false

      // Status filter
      if (filterStatus !== 'All' && rec.status !== filterStatus) return false

      // Search
      const q = recordSearch.toLowerCase().trim()
      if (q) {
        const matchesQ =
          rec.monthYear.toLowerCase().includes(q) ||
          formatMonthTitle(rec.monthYear).toLowerCase().includes(q) ||
          (rec.transactionId && rec.transactionId.toLowerCase().includes(q)) ||
          (rec.paymentMethod && rec.paymentMethod.toLowerCase().includes(q))
        if (!matchesQ) return false
      }

      return true
    })
  }, [staffRecords, filterYear, filterMonth, filterStatus, recordSearch])

  // Recalculate attendance across directory
  const handleRecalculateAttendance = async () => {
    setRecalculating(true)
    try {
      const res = await generatePayrollForMonth(undefined, calcBasis)
      if (!res.success) throw new Error(res.error || 'Failed to sync')
      showToast('Payroll refreshed based on latest attendance records!')
      await loadDirectory()
      if (selectedStaff) {
        await loadStaffPayroll(selectedStaff.id, selectedStaff.name)
      }
    } catch (e: any) {
      showToast(e.message || 'Recalculation failed', 'error')
    } finally {
      setRecalculating(false)
    }
  }

  // Open Edit Days & Deductions Modal
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
      if (selectedStaff) {
        await loadStaffPayroll(selectedStaff.id, selectedStaff.name)
      }
      await loadDirectory()
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  // Open Pay Modal
  const openPayModal = (item: PayrollItem) => {
    setPayModalItem(item)
    setPayAmount(String(item.pendingAmount > 0 ? item.pendingAmount : item.netSalary))
    setPaymentMode('Bank Transfer')
    setPayTxnId(`TXN-${Date.now().toString().slice(-6)}`)
    setPayRemarks('')
  }

  // Confirm Record Payment
  const handleConfirmPayment = async () => {
    if (!payModalItem) return
    const amountNum = parseFloat(payAmount)
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid disbursement amount greater than 0', 'error')
      return
    }

    setRecordingPayment(true)
    try {
      const res = await recordPayrollTransaction({
        payrollId: payModalItem.id,
        amount: amountNum,
        paymentMethod: paymentMode,
        transactionId: payTxnId,
        accountDetails: {
          bankName: payBankName,
          accountNo: payAccountNo,
          ifscCode: payIfsc,
          upiId: payUpiId,
          chequeNo: payChequeNo
        },
        notes: payRemarks
      })

      if (!res.success) throw new Error(res.error || 'Payment record failed')
      showToast(`Payment of ₹${amountNum.toLocaleString('en-IN')} recorded for ${payModalItem.name}!`)
      setPayModalItem(null)
      if (selectedStaff) {
        await loadStaffPayroll(selectedStaff.id, selectedStaff.name)
      }
      await loadDirectory()
    } catch (e: any) {
      showToast(e.message || 'Payment failed', 'error')
    } finally {
      setRecordingPayment(false)
    }
  }

  // ── MULTI-MONTH PAYMENT LOGIC & SELECTION HANDLERS ──
  // Payable records among the currently filtered records
  const payableRecords = useMemo(() => {
    return filteredStaffRecords.filter(r => r.status !== 'Paid')
  }, [filteredStaffRecords])

  const isAllSelected = payableRecords.length > 0 && payableRecords.every(r => selectedMonthIds.includes(r.id))

  const handleToggleSelectMonth = (id: string) => {
    setSelectedMonthIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllMonths = () => {
    if (isAllSelected) {
      setSelectedMonthIds([])
    } else {
      setSelectedMonthIds(payableRecords.map(r => r.id))
    }
  }

  // Total pending amount across all currently checked rows
  const totalSelectedPending = useMemo(() => {
    return staffRecords
      .filter(r => selectedMonthIds.includes(r.id))
      .reduce((acc, r) => acc + (r.pendingAmount > 0 ? r.pendingAmount : r.netSalary), 0)
  }, [staffRecords, selectedMonthIds])

  // Computed totals for the Multi-Month Pay Modal
  const totalMultiPayAmount = useMemo(() => {
    return multiPayItems.reduce((acc, it) => acc + (it.payAmount || 0), 0)
  }, [multiPayItems])

  const totalMultiPayPending = useMemo(() => {
    return multiPayItems.reduce((acc, it) => acc + (it.pendingAmount || 0), 0)
  }, [multiPayItems])

  // Open Multi-Month Modal
  const openMultiPayModal = (idsToPay?: string[]) => {
    const ids = idsToPay && idsToPay.length > 0 ? idsToPay : selectedMonthIds
    const targetRecords = staffRecords.filter(r => ids.includes(r.id) && r.status !== 'Paid')
    if (targetRecords.length === 0) {
      showToast('Please select at least one unpaid or partial month to pay', 'error')
      return
    }

    // Sort chronologically (oldest first)
    const sorted = [...targetRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear))

    const items = sorted.map(r => {
      const pending = r.pendingAmount > 0 ? r.pendingAmount : r.netSalary
      return {
        payrollId: r.id,
        monthYear: r.monthYear,
        netSalary: r.netSalary,
        paidAmount: r.paidAmount,
        pendingAmount: pending,
        payAmount: pending // defaults to full pending, but user can edit to any less amount!
      }
    })

    setMultiPayItems(items)
    setMultiPayTxnId(`TXN-MULTI-${Date.now().toString().slice(-6)}`)
    setMultiPaymentMode('Bank Transfer')
    setMultiPayRemarks(`Combined salary disbursement for ${items.length} months (${items.map(i => i.monthYear).join(', ')})`)
    setLumpSumInput('')
    setMultiPayModalOpen(true)
  }

  // Handle amount change for an individual month inside multi-month modal (for less / partial payments)
  const handleMultiPayItemAmountChange = (payrollId: string, val: number) => {
    setMultiPayItems(prev => prev.map(item => {
      if (item.payrollId === payrollId) {
        return { ...item, payAmount: Math.max(0, val) }
      }
      return item
    }))
  }

  // Quick lump sum allocator across selected months
  const handleApplyLumpSum = (sumVal: number) => {
    if (isNaN(sumVal) || sumVal <= 0) return
    let remaining = sumVal
    setMultiPayItems(prev => prev.map(item => {
      if (remaining <= 0) {
        return { ...item, payAmount: 0 }
      }
      const allocate = Math.min(remaining, item.pendingAmount)
      remaining -= allocate
      return { ...item, payAmount: allocate }
    }))
  }

  // Confirm and record multi-month single transaction
  const handleConfirmMultiPayment = async () => {
    if (!selectedStaff) return
    const validItems = multiPayItems.filter(it => it.payAmount > 0)
    if (validItems.length === 0) {
      showToast('Please enter an amount greater than 0 for at least one month', 'error')
      return
    }

    setRecordingMultiPayment(true)
    try {
      const res = await recordMultiMonthPayrollTransaction({
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        items: validItems.map(it => ({
          payrollId: it.payrollId,
          monthYear: it.monthYear,
          amount: it.payAmount
        })),
        paymentMethod: multiPaymentMode,
        transactionId: multiPayTxnId,
        accountDetails: {
          bankName: multiPayBankName,
          accountNo: multiPayAccountNo,
          ifscCode: multiPayIfsc,
          upiId: multiPayUpiId,
          chequeNo: multiPayChequeNo
        },
        notes: multiPayRemarks
      })

      if (!res.success) throw new Error(res.error || 'Multi-month payment failed')
      showToast(`Payment of ₹${(res.totalPaid || 0).toLocaleString('en-IN')}/- disbursed across ${res.itemsUpdated} months in single transaction (${res.transactionId})!`)
      setMultiPayModalOpen(false)
      setSelectedMonthIds([])
      await loadStaffPayroll(selectedStaff.id, selectedStaff.name)
      await loadDirectory()
    } catch (e: any) {
      showToast(e.message || 'Payment failed', 'error')
    } finally {
      setRecordingMultiPayment(false)
    }
  }

  // ── TRANSACTION DETAILS HANDLERS ──
  // Copy TXN ID to clipboard
  const handleCopyTxn = (txnId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txnId)
      setCopiedTxnId(txnId)
      showToast(`Copied ${txnId} to clipboard!`)
      setTimeout(() => setCopiedTxnId(null), 2500)
    }
  }

  // Open Transaction Details for a specific month record
  const handleOpenTransactionDetails = async (item: PayrollItem) => {
    setTxnModalRecord(item)
    setTxnModalTitle(formatMonthTitle(item.monthYear))
    setTxnModalList([])
    setTxnModalOpen(true)
    setLoadingTxns(true)

    try {
      const res = await fetchPayrollRecordById(item.id)
      if (res.success && res.transactions && res.transactions.length > 0) {
        setTxnModalList(res.transactions)
      } else if (item.transactionId || item.paidAmount > 0) {
        // Fallback synthetic entry if no dedicated rows in tx table yet
        setTxnModalList([{
          id: item.id,
          payrollId: item.id,
          staffId: item.staffId,
          staffName: item.name,
          monthYear: item.monthYear,
          amount: item.paidAmount > 0 ? item.paidAmount : item.netSalary,
          formattedAmount: item.formattedPaidAmount || item.formattedNetSalary,
          paymentMethod: item.paymentMethod || 'Bank Transfer',
          transactionId: item.transactionId || 'TXN-RECORDED',
          paymentDate: item.paymentDate || 'Recorded',
          createdAt: ''
        }])
      }
    } catch (e: any) {
      console.error('Error fetching transactions:', e)
    } finally {
      setLoadingTxns(false)
    }
  }

  // Open Transaction History for the entire staff across all months
  const handleOpenAllStaffTransactions = async () => {
    if (!selectedStaff) return
    setTxnModalRecord(null)
    setTxnModalTitle(`All Transactions — ${selectedStaff.name}`)
    setTxnModalList([])
    setTxnModalOpen(true)
    setLoadingTxns(true)

    try {
      const res = await fetchStaffAllTransactions({ staffId: selectedStaff.id, staffName: selectedStaff.name })
      if (res.success && res.transactions) {
        setTxnModalList(res.transactions)
      }
    } catch (e: any) {
      console.error('Error fetching all staff transactions:', e)
    } finally {
      setLoadingTxns(false)
    }
  }

  // Format month title (e.g. 2026-11 -> November 2026)
  const formatMonthTitle = (ym: string) => {
    if (!ym || ym === 'All') return 'All Months'
    const [y, m] = ym.split('-')
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Export Staff All-Months CSV
  const handleExportStaffCSV = () => {
    if (!selectedStaff) return
    const headers = [
      'S. No.', 'Staff Name', 'Employee ID', 'User Type', 'Month-Year',
      'Total Days', 'Present Days', 'Paid Leaves', 'Absent/Unpaid Days', 'Paid Days',
      'Gross Salary (₹)', 'Deduction (₹)', 'Net Salary (₹)', 'Paid Amount (₹)', 'Pending (₹)',
      'Status', 'Payment Method', 'Transaction ID', 'Payment Date'
    ]

    const rows = filteredStaffRecords.map((r, idx) => [
      idx + 1,
      `"${r.name}"`,
      `"${r.employeeId || ''}"`,
      `"${r.userType}"`,
      `"${formatMonthTitle(r.monthYear)}"`,
      r.totalDays,
      r.presentDays,
      r.paidLeave,
      r.absentDays,
      r.paidDays,
      r.grossSalary,
      r.leaveDeduction,
      r.netSalary,
      r.paidAmount,
      r.pendingAmount,
      `"${r.status}"`,
      `"${r.paymentMethod || ''}"`,
      `"${r.transactionId || ''}"`,
      `"${r.paymentDate || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `payroll_${selectedStaff.name.replace(/\s+/g, '_')}_all_months.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Employee payroll history exported!')
  }

  // Export Directory CSV
  const handleExportDirectoryCSV = () => {
    const headers = [
      'S. No.', 'Employee ID', 'Name', 'User Type', 'Role', 'Department',
      'Phone', 'Email', 'Joining Date', 'Monthly Gross Scale (₹)', 'Basic Salary (₹)',
      'Latest Month Status', 'Total Months Logged', 'Total Paid Months', 'Total Disbursed (₹)', 'Total Pending (₹)'
    ]

    const rows = filteredEmployees.map((e, idx) => [
      idx + 1,
      `"${e.employeeId}"`,
      `"${e.name}"`,
      `"${e.userType}"`,
      `"${e.role}"`,
      `"${e.department}"`,
      `"${e.phone || ''}"`,
      `"${e.email || ''}"`,
      `"${e.joiningDate || ''}"`,
      e.grossSalary,
      e.basicSalary,
      `"${e.latestMonthStatus}"`,
      e.totalMonthsLogged,
      e.totalPaidMonths,
      e.totalPaidAmount,
      e.totalPendingAmount
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `employee_payroll_directory.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Employee directory exported!')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">

      {/* ── TOAST NOTIFICATION ── */}
      {toastOpen && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white border transition-all duration-300 animate-in slide-in-from-bottom-3 ${
          toastType === 'success'
            ? 'bg-emerald-700 border-emerald-500 shadow-emerald-500/20'
            : 'bg-rose-700 border-rose-500 shadow-rose-500/20'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-200" /> : <AlertCircle className="w-4 h-4 text-rose-200" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── VIEW 1: MAIN EMPLOYEE DETAILS DIRECTORY (NO PAY NOW, ONLY PAYROLL) ── */}
      {/* ========================================================================= */}
      {!selectedStaff ? (
        <>
          {/* HEADER */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-[#0f766e]" />
                  <span>Payroll Management</span>
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Staff Directory
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Select any employee to view their full-year month-by-month payroll statement, attendance deductions, and payment disbursement
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCalcBasis('attendance_days')
                    handleRecalculateAttendance()
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    calcBasis === 'attendance_days'
                      ? 'bg-white dark:bg-slate-800 text-[#0f766e] dark:text-teal-300 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Calculate salary strictly based on Present Days + Paid Leaves"
                >
                  Days Present (Attendance)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcBasis('monthly_fixed')
                    handleRecalculateAttendance()
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    calcBasis === 'monthly_fixed'
                      ? 'bg-white dark:bg-slate-800 text-[#0f766e] dark:text-teal-300 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Full monthly salary minus only marked absences"
                >
                  Fixed Monthly
                </button>
              </div>

              <button
                type="button"
                disabled={recalculating}
                onClick={handleRecalculateAttendance}
                className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 font-black text-xs hover:bg-teal-100 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>{recalculating ? 'Recalculating...' : 'Sync Attendance'}</span>
              </button>
            </div>
          </div>

          {/* 3 SUMMARY KPI METRIC BOXES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BOX 1: TOTAL STAFF */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex items-center justify-between group hover:border-teal-500/40 transition-all">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  TOTAL ACTIVE STAFF
                </span>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {directoryStats.totalStaff} Members
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {directoryStats.teachersCount} Teachers &bull; {directoryStats.employeesCount} Staff &bull; {directoryStats.driversCount} Drivers
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
            </div>

            {/* BOX 2: TOTAL MONTHLY SALARY SCALE */}
            <div className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-5 shadow-xs flex items-center justify-between group hover:border-teal-500 transition-all">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0f766e] dark:text-teal-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  MONTHLY SALARY BUDGET
                </span>
                <div className="text-2xl md:text-3xl font-black text-[#0f766e] dark:text-teal-300 tracking-tight">
                  ₹{directoryStats.totalGrossPayrollScale.toLocaleString('en-IN')}/-
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Combined monthly gross salary scale
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-300 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* BOX 3: CURRENT MONTH STATUS */}
            <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs flex items-center justify-between group hover:border-amber-500 transition-all">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  CURRENT MONTH ({formatMonthTitle(directoryStats.currentMonthYear)})
                </span>
                <div className="text-2xl md:text-3xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
                  ₹{directoryStats.currentMonthPending.toLocaleString('en-IN')}/-
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {directoryStats.currentMonthPaidCount} Disbursed &bull; {directoryStats.currentMonthUnpaidCount} Pending Disbursement
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by User type, name, EMP ID..."
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
              />
            </div>

            {/* Tabs & Export */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              <div className="flex flex-wrap gap-2">
                {([
                  { id: 'All', label: 'All', count: employees.length, color: 'border-pink-200 bg-pink-50/20 text-pink-700' },
                  { id: 'Teacher', label: 'Teacher', count: directoryStats.teachersCount, color: 'border-indigo-200 bg-indigo-50/20 text-indigo-700' },
                  { id: 'Employee', label: 'Employee', count: directoryStats.employeesCount, color: 'border-emerald-200 bg-emerald-50/20 text-emerald-700' },
                  { id: 'Driver', label: 'Driver', count: directoryStats.driversCount, color: 'border-sky-200 bg-sky-50/20 text-sky-700' }
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? tab.color
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                      activeTab === tab.id ? 'bg-[#0f766e] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {tab.count.toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportDirectoryCSV}
                className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-[#0f766e] hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
                title="Export Staff Directory CSV"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── EMPLOYEE DETAILS TABLE (SHOWS ONLY EMPLOYEE DETAILS + PAYROLL BUTTON) ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">
                  Staff Members &amp; Employees Directory
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Click the <span className="font-bold text-[#0f766e]">Payroll</span> button to view the full multi-month statement and disbursement records
                </p>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                Showing {filteredEmployees.length} of {employees.length} employees
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold no-scrollbar">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-4 w-12">S. No.</th>
                    <th className="px-3 py-4">User Type</th>
                    <th className="px-4 py-4 text-left">Staff / Employee Name</th>
                    <th className="px-4 py-4 text-left">Department &amp; Role</th>
                    <th className="px-4 py-4 text-left">Contact Info</th>
                    <th className="px-4 py-4 text-right">Monthly Scale</th>
                    <th className="px-4 py-4">Payroll Overview</th>
                    <th className="px-4 py-4 w-36">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEmployees ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                          <span>Loading employee directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span>No staff members match the selected filter.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDirectorySearch('')
                              setActiveTab('All')
                            }}
                            className="mt-1 px-4 py-1.5 rounded-lg bg-[#0f766e] text-white text-xs font-bold hover:bg-teal-700"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, idx) => (
                      <tr
                        key={emp.id}
                        className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors font-semibold"
                      >
                        {/* S. No. */}
                        <td className="px-3 py-4 text-slate-500 font-medium">
                          {idx + 1}.
                        </td>

                        {/* User Type Badge */}
                        <td className="px-3 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            emp.userType === 'Teacher'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50'
                              : emp.userType === 'Employee'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                              : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/50'
                          }`}>
                            {emp.userType}
                          </span>
                        </td>

                        {/* Staff / Employee Details */}
                        <td className="px-4 py-4 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  {emp.employeeId}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                Applicable: {emp.applicableStartDate || emp.joiningDate || 'Active'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Role */}
                        <td className="px-4 py-4 text-left">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {emp.role}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            Dept: {emp.department}
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-4 py-4 text-left">
                          {emp.phone || emp.email ? (
                            <div className="space-y-0.5">
                              {emp.phone && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{emp.phone}</span>
                                </div>
                              )}
                              {emp.email && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-[140px]">{emp.email}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Monthly Salary Scale */}
                        <td className="px-4 py-4 text-right">
                          <div className="font-black text-slate-900 dark:text-white text-xs">
                            {emp.formattedGrossSalary}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Basic: {emp.formattedBasicSalary}
                          </div>
                        </td>

                        {/* Payroll Overview Status */}
                        <td className="px-4 py-4">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              emp.latestMonthStatus === 'Paid'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : emp.latestMonthStatus === 'Partial'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}>
                              ● Nov 2026: {emp.latestMonthStatus}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {emp.totalPaidMonths} of {emp.totalMonthsLogged} Months Disbursed
                            </span>
                          </div>
                        </td>

                        {/* ── PAYROLL ACTION BUTTON (NOT PAY NOW) ── */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleOpenStaffPayroll(emp)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md group"
                            title={`Open full multi-month payroll statement for ${emp.name}`}
                          >
                            <Wallet className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>Payroll</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* ── VIEW 2: FULL VIEW OF PAYROLL OF ALL MONTHS (PROPER WITH ALL FILTERS) ── */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* TOP NAVIGATION & STAFF PROFILE BANNER */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            {/* Top Bar with Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleBackToDirectory}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0f766e]" />
                <span>Back to All Staff</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAllStaffTransactions}
                  className="px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="View complete transaction history & payment receipts for this employee"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Transaction History</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportStaffCSV}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#0f766e] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export all-months statement to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Statement (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadStaffPayroll(selectedStaff.id, selectedStaff.name)}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Refresh records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStaffRecords ? 'animate-spin text-[#0f766e]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Staff Profile Card Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                      {selectedStaff.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      selectedStaff.userType === 'Teacher'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : selectedStaff.userType === 'Employee'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                    }`}>
                      {selectedStaff.userType}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      ID: {selectedStaff.employeeId}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5">
                    <span>{selectedStaff.role} &bull; {selectedStaff.department}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#0f766e]" />
                      <span>Applicable From: {selectedStaff.applicableStartDate || selectedStaff.joiningDate || 'Current Month'}</span>
                    </span>
                    {selectedStaff.phone && <span>📞 {selectedStaff.phone}</span>}
                    {selectedStaff.email && <span>✉️ {selectedStaff.email}</span>}
                  </div>
                </div>
              </div>

              {/* Salary Structure Box */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs font-semibold w-full md:w-auto justify-between md:justify-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Gross Scale</span>
                  <div className="text-base font-black text-[#0f766e] dark:text-teal-300">
                    {selectedStaff.formattedGrossSalary}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Basic Scale</span>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {selectedStaff.formattedBasicSalary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI CARDS FOR THIS EMPLOYEE'S MULTI-MONTH PAYROLL */}
          {staffSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" />
                  TOTAL EARNINGS (SCHEDULED)
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  ₹{staffSummary.totalNet.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Gross: ₹{staffSummary.totalGross.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TOTAL DISBURSED (PAID)
                </span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  ₹{staffSummary.totalPaid.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {staffSummary.paidMonths} Months Settled
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  TOTAL PENDING (DUE)
                </span>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                  ₹{staffSummary.totalPending.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {staffSummary.unpaidMonths} Months Awaiting Payment
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  TOTAL DEDUCTIONS
                </span>
                <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">
                  ₹{staffSummary.totalDeduction.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Loss of Pay &amp; Unpaid Leaves
                </span>
              </div>
            </div>
          )}

          {/* ── ALL-MONTHS FILTER BAR (PROPER WITH ALL FILTERS) ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Year:</span>
                <select
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="All">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Month:</span>
                <select
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="All">All Months</option>
                  <option value="11">November</option>
                  <option value="10">October</option>
                  <option value="09">September</option>
                  <option value="08">August</option>
                  <option value="07">July</option>
                  <option value="06">June</option>
                  <option value="05">May</option>
                  <option value="04">April</option>
                  <option value="03">March</option>
                  <option value="02">February</option>
                  <option value="01">January</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Unpaid">Unpaid Only</option>
                  <option value="Partial">Partial Only</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              {(filterYear !== 'All' || filterMonth !== 'All' || filterStatus !== 'All' || recordSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterYear('All')
                    setFilterMonth('All')
                    setFilterStatus('All')
                    setRecordSearch('')
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Search inside records */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search month, TXN ID..."
                value={recordSearch}
                onChange={e => setRecordSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* ── ALL-MONTHS PAYROLL STATEMENT TABLE ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Payroll Statement &mdash; From Applicable Date</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0f766e] border border-teal-200">
                    {filteredStaffRecords.length} {filteredStaffRecords.length === 1 ? 'Month' : 'Months'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Showing monthly salary statement starting from staff profile payroll applicable date ({selectedStaff.applicableStartDate || selectedStaff.joiningDate || 'Current Month'})
                </p>
              </div>

              {/* Pay Multiple Months Button */}
              {payableRecords.length > 0 && (
                <button
                  type="button"
                  onClick={() => openMultiPayModal(payableRecords.map(r => r.id))}
                  className="px-3.5 py-2 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all shrink-0"
                  title="Pay all pending months in a single consolidated transaction"
                >
                  <Layers className="w-4 h-4" />
                  <span>Pay Multiple Months ({payableRecords.length})</span>
                </button>
              )}
            </div>

            {/* ── FLOATING / IN-TABLE SELECTION BAR ── */}
            {selectedMonthIds.length > 0 && (
              <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-teal-500/40 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/25 border border-teal-400/50 flex items-center justify-center font-black text-teal-300 text-sm">
                    {selectedMonthIds.length}
                  </div>
                  <div>
                    <div className="font-black text-sm flex items-center gap-2">
                      <span>{selectedMonthIds.length} {selectedMonthIds.length === 1 ? 'Month' : 'Months'} Selected</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 font-bold border border-teal-500/30">
                        Single Transaction
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">
                      Total Pending Dues: <span className="font-black text-teal-300">₹{totalSelectedPending.toLocaleString('en-IN')}/-</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMonthIds([])}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                  <button
                    type="button"
                    onClick={() => openMultiPayModal()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>Pay Selected ({selectedMonthIds.length}) in Single Transaction</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold no-scrollbar">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAllMonths}
                        disabled={payableRecords.length === 0}
                        title={payableRecords.length === 0 ? 'No payable months' : isAllSelected ? 'Deselect all' : 'Select all pending months'}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#0f766e] disabled:opacity-40"
                      />
                    </th>
                    <th className="px-3 py-4 w-12">S. No.</th>
                    <th className="px-4 py-4 text-left">Month &amp; Period</th>
                    <th className="px-3 py-4">Total Days</th>
                    <th className="px-3 py-4 text-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20">Present</th>
                    <th className="px-3 py-4">Paid Leave</th>
                    <th className="px-3 py-4 text-rose-600">Absent / Unpaid</th>
                    <th className="px-3 py-4 text-teal-700 bg-teal-50/50 dark:bg-teal-950/20 font-black">Paid Days</th>
                    <th className="px-3 py-4">Gross Salary</th>
                    <th className="px-3 py-4 text-rose-600">Deduction</th>
                    <th className="px-4 py-4 font-black">Net Salary</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Payment</th>
                    <th className="px-3 py-4 w-28">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStaffRecords ? (
                    <tr>
                      <td colSpan={14} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                          <span>Loading all-month payroll records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStaffRecords.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span>No payroll records found matching the filters.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFilterYear('All')
                              setFilterMonth('All')
                              setFilterStatus('All')
                              setRecordSearch('')
                            }}
                            className="mt-1 px-4 py-1.5 rounded-lg bg-[#0f766e] text-white text-xs font-bold hover:bg-teal-700"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStaffRecords.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors font-semibold ${
                          selectedMonthIds.includes(item.id)
                            ? 'bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/60'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-750'
                        }`}
                      >
                        {/* Multi-Select Checkbox */}
                        <td className="px-3 py-3.5 text-center">
                          {item.status === 'Paid' ? (
                            <div className="flex items-center justify-center" title="Month already settled">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedMonthIds.includes(item.id)}
                              onChange={() => handleToggleSelectMonth(item.id)}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-[#0f766e]"
                              title={`Select ${formatMonthTitle(item.monthYear)} for single transaction disbursement`}
                            />
                          )}
                        </td>

                        {/* S. No. */}
                        <td className="px-3 py-3.5 text-slate-500 font-medium">
                          {idx + 1}.
                        </td>

                        {/* Month & Period */}
                        <td className="px-4 py-3.5 text-left">
                          <div className="font-black text-slate-900 dark:text-slate-100 text-xs">
                            {formatMonthTitle(item.monthYear)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>{item.monthYear}</span>
                            {item.transactionId && (
                              <button
                                type="button"
                                onClick={() => handleOpenTransactionDetails(item)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono font-bold text-[10px] hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all cursor-pointer shadow-2xs"
                                title="Click to view full transaction receipt & payment details"
                              >
                                <Receipt className="w-3 h-3 text-[#0f766e]" />
                                <span>{item.transactionId}</span>
                              </button>
                            )}
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
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            item.status === 'Paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : item.status === 'Partial'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}>
                            ● {item.status}
                          </span>
                        </td>

                        {/* Payment Action */}
                        <td className="px-3 py-3.5">
                          {item.status === 'Paid' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPayslipModalItem(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="View Payslip & Receipt"
                              >
                                <Check className="w-3 h-3" />
                                <span>Paid Slip</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenTransactionDetails(item)}
                                className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 font-bold text-[11px] border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="View Payment Transaction Details"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>TXN</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openPayModal(item)}
                                className="px-3 py-1.5 rounded-lg bg-[#0f766e] text-white font-black text-[10px] uppercase tracking-wider hover:bg-teal-700 transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <span>{item.status === 'Partial' ? `Pay Left (₹${item.pendingAmount.toLocaleString('en-IN')})` : 'Pay Now'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              {item.paidAmount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenTransactionDetails(item)}
                                  className="px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                                  title="View Partial Transactions So Far"
                                >
                                  <Receipt className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            {/* Transaction Details */}
                            {item.status !== 'Unpaid' && (
                              <button
                                type="button"
                                onClick={() => handleOpenTransactionDetails(item)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
                                title="View Transaction Details & Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                            )}

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
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── PAY MODAL (OPENS DIRECTLY FROM FULL ALL-MONTH VIEW) ── */}
      {/* ========================================================================= */}
      {payModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0f766e]" />
                  <span>Disburse Salary &mdash; {formatMonthTitle(payModalItem.monthYear)}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {payModalItem.name} ({payModalItem.role}) &bull; {payModalItem.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick summary box */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Net Payable</span>
                <div className="text-xl font-black text-[#0f766e]">
                  {payModalItem.formattedNetSalary}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-600">Pending Amount</span>
                <div className="text-lg font-black text-amber-600">
                  ₹{payModalItem.pendingAmount > 0 ? payModalItem.pendingAmount.toLocaleString('en-IN') : payModalItem.netSalary.toLocaleString('en-IN')}/-
                </div>
              </div>
            </div>

            {/* Payment Mode Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Bank Transfer', 'UPI', 'Cash', 'Cheque'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMode(m)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all cursor-pointer border ${
                      paymentMode === m
                        ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">
                    Amount to Disburse (₹)
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    (Pay full or enter any less amount)
                  </span>
                </div>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                />

                {/* Quick Presets & Live Feedback for Less Amount */}
                {(() => {
                  const targetPending = payModalItem.pendingAmount > 0 ? payModalItem.pendingAmount : payModalItem.netSalary
                  const amtNum = parseFloat(payAmount) || 0
                  const isLess = amtNum > 0 && amtNum < targetPending
                  const isFull = amtNum >= targetPending && targetPending > 0
                  const remainingAfter = Math.max(0, targetPending - amtNum)

                  return (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPayAmount(String(targetPending))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                            amtNum === targetPending
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Full Pending: ₹{targetPending.toLocaleString('en-IN')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayAmount(String(Math.round(targetPending / 2)))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                            amtNum === Math.round(targetPending / 2)
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          50% Less Amount: ₹{Math.round(targetPending / 2).toLocaleString('en-IN')}
                        </button>
                      </div>

                      {/* Live Feedback */}
                      {isLess && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Partial / Less Amount Disbursal:</span>
                            <p className="mt-0.5">
                              Paying <span className="font-black text-amber-800 dark:text-amber-300">₹{amtNum.toLocaleString('en-IN')}/-</span>. 
                              Remaining balance of <span className="font-black text-amber-900 dark:text-amber-200">₹{remainingAfter.toLocaleString('en-IN')}/-</span> will stay pending, and status will update to <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-[10px] font-black uppercase">PARTIAL</span>.
                            </p>
                          </div>
                        </div>
                      )}

                      {isFull && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Full Settlement: All remaining dues for {formatMonthTitle(payModalItem.monthYear)} will be cleared, status will be <span className="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-[10px] font-black uppercase">PAID</span>.
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {paymentMode === 'Bank Transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={payBankName}
                      onChange={e => setPayBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Account No.</label>
                    <input
                      type="text"
                      value={payAccountNo}
                      onChange={e => setPayAccountNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMode === 'UPI' && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={payUpiId}
                    onChange={e => setPayUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              )}

              {paymentMode === 'Cheque' && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Cheque Number &amp; Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-928192 (SBI)"
                    value={payChequeNo}
                    onChange={e => setPayChequeNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Transaction Ref ID</label>
                  <input
                    type="text"
                    value={payTxnId}
                    onChange={e => setPayTxnId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Salary transfer for Nov"
                    value={payRemarks}
                    onChange={e => setPayRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <Link
                href={`/institute/payroll/pay?id=${payModalItem.id}&name=${encodeURIComponent(payModalItem.name)}&type=${encodeURIComponent(payModalItem.userType)}&salary=${encodeURIComponent(payModalItem.formattedNetSalary)}`}
                className="text-xs font-bold text-[#0f766e] hover:underline flex items-center gap-1"
                onClick={() => setPayModalItem(null)}
              >
                <span>Open Full Pay Page</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={recordingPayment}
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{recordingPayment ? 'Recording...' : 'Confirm & Disburse'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MULTI-MONTH SINGLE TRANSACTION PAYMENT MODAL ── */}
      {/* ========================================================================= */}
      {multiPayModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl p-6 shadow-2xl relative space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#0f766e]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Pay Multiple Months &mdash; Single Transaction</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedStaff.name} ({selectedStaff.role}) &bull; ID: {selectedStaff.employeeId} &bull; {multiPayItems.length} Months Included
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMultiPayModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Scheduled Due</span>
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  ₹{totalMultiPayPending.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Across {multiPayItems.length} months</span>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] uppercase font-black text-[#0f766e] dark:text-teal-300 block">Disbursing in this Transaction</span>
                <div className="text-xl font-black text-[#0f766e] dark:text-teal-300 mt-0.5">
                  ₹{totalMultiPayAmount.toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                  {multiPayItems.filter(i => i.payAmount > 0).length} of {multiPayItems.length} months funded
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Remaining Due After Txn</span>
                <div className="text-lg font-black text-amber-600 mt-0.5">
                  ₹{Math.max(0, totalMultiPayPending - totalMultiPayAmount).toLocaleString('en-IN')}/-
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {totalMultiPayPending <= totalMultiPayAmount ? 'All selected cleared' : 'Partial balance pending'}
                </span>
              </div>
            </div>

            {/* Quick Lump Sum / Preset Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Quick Lump Sum Split:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={lumpSumInput}
                    onChange={e => setLumpSumInput(e.target.value)}
                    className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyLumpSum(parseFloat(lumpSumInput) || 0)}
                    className="px-3 py-1.5 rounded-xl bg-[#0f766e] text-white font-bold text-xs hover:bg-teal-700 cursor-pointer shadow-2xs"
                  >
                    Auto Split (Oldest First)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMultiPayItems(prev => prev.map(it => ({ ...it, payAmount: it.pendingAmount })))
                    setLumpSumInput('')
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 font-black text-xs border border-teal-200 dark:border-teal-800 hover:bg-teal-100 cursor-pointer"
                >
                  Pay All Full Due
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMultiPayItems(prev => prev.map(it => ({ ...it, payAmount: Math.round(it.pendingAmount / 2) })))
                    setLumpSumInput('')
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                >
                  Pay 50% Each
                </button>
              </div>
            </div>

            {/* Month-by-Month Editable Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Selected Months &mdash; Customize Amount Per Month</span>
                </label>
                <span className="text-[11px] text-slate-400 font-semibold">
                  (You can enter full or less amount for each month)
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-3 text-left">Month</th>
                      <th className="px-3 py-3">Net Due</th>
                      <th className="px-3 py-3">Already Paid</th>
                      <th className="px-3 py-3 text-amber-600">Pending</th>
                      <th className="px-3 py-3 text-right w-36">Amount to Pay (₹)</th>
                      <th className="px-3 py-3 text-right">Resulting Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {multiPayItems.map(item => {
                      const isFull = item.payAmount >= item.pendingAmount && item.pendingAmount > 0
                      const isPartial = item.payAmount > 0 && item.payAmount < item.pendingAmount
                      const isZero = item.payAmount === 0

                      return (
                        <tr key={item.payrollId} className="hover:bg-slate-50/50 dark:hover:bg-slate-750 font-semibold">
                          <td className="px-3 py-3 text-left">
                            <div className="font-black text-slate-800 dark:text-slate-100">
                              {formatMonthTitle(item.monthYear)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Period: {item.monthYear}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                            ₹{item.netSalary.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            ₹{item.paidAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-3 font-bold text-amber-600">
                            ₹{item.pendingAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              max={item.pendingAmount}
                              value={item.payAmount}
                              onChange={e => handleMultiPayItemAmountChange(item.payrollId, parseFloat(e.target.value) || 0)}
                              className="w-32 px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 font-black text-right text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 text-xs bg-white dark:bg-slate-900"
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            {isFull && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-block">
                                Full Paid
                              </span>
                            )}
                            {isPartial && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-block" title={`Left: ₹${(item.pendingAmount - item.payAmount).toLocaleString('en-IN')}`}>
                                Partial (Left: ₹{(item.pendingAmount - item.payAmount).toLocaleString('en-IN')})
                              </span>
                            )}
                            {isZero && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 inline-block">
                                Skip (₹0)
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Single Transaction Shared Details */}
            <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-700 pt-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Single Transaction &amp; Payment Details (Shared for all selected months)
              </label>

              {/* Payment Mode Tabs */}
              <div className="grid grid-cols-4 gap-2">
                {(['Bank Transfer', 'UPI', 'Cash', 'Cheque'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMultiPaymentMode(m)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all cursor-pointer border ${
                      multiPaymentMode === m
                        ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Mode-specific Fields */}
              {multiPaymentMode === 'Bank Transfer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-xs">Bank Name</label>
                    <input
                      type="text"
                      value={multiPayBankName}
                      onChange={e => setMultiPayBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-xs">Account No.</label>
                    <input
                      type="text"
                      value={multiPayAccountNo}
                      onChange={e => setMultiPayAccountNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-xs">IFSC Code</label>
                    <input
                      type="text"
                      value={multiPayIfsc}
                      onChange={e => setMultiPayIfsc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {multiPaymentMode === 'UPI' && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-xs">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={multiPayUpiId}
                    onChange={e => setMultiPayUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                  />
                </div>
              )}

              {multiPaymentMode === 'Cheque' && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-xs">Cheque Number &amp; Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-928192 (SBI)"
                    value={multiPayChequeNo}
                    onChange={e => setMultiPayChequeNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                  />
                </div>
              )}

              {/* Shared Transaction ID & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-xs">Single Transaction Ref ID</label>
                  <input
                    type="text"
                    value={multiPayTxnId}
                    onChange={e => setMultiPayTxnId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-100 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-xs">Notes / Transaction Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Consolidated multi-month salary disbursement"
                    value={multiPayRemarks}
                    onChange={e => setMultiPayRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer / Disburse Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMultiPayModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={recordingMultiPayment || totalMultiPayAmount <= 0}
                onClick={handleConfirmMultiPayment}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {recordingMultiPayment
                    ? 'Processing Transaction...'
                    : `Disburse ₹${totalMultiPayAmount.toLocaleString('en-IN')}/- in Single Transaction`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── EDIT DAYS & SALARY MODAL ── */}
      {/* ========================================================================= */}
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
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
                className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Save & Update Payroll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── ATTENDANCE & SALARY BREAKDOWN MODAL ── */}
      {/* ========================================================================= */}
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] font-black text-xs hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjust Days &amp; Deduction</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBreakdownModalItem(null)
                  openPayModal(breakdownModalItem)
                }}
                className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── PAYSLIP PRINT MODAL ── */}
      {/* ========================================================================= */}
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayslipModalItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-4 print:border-none print:p-0">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700 space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  COSMOPOLITAN INSTITUTE OF ACADEMICS
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Monthly Salary Slip &bull; Period: {formatMonthTitle(payslipModalItem.monthYear)}
                </p>
              </div>

              {/* Staff Details Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee Name</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{payslipModalItem.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Employee ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{payslipModalItem.employeeId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Role &amp; Dept</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{payslipModalItem.role} ({payslipModalItem.department})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">User Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{payslipModalItem.userType}</span>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Total Days</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{payslipModalItem.totalDays}</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-600 font-bold block">Present Days</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300">{payslipModalItem.presentDays}</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] text-indigo-600 font-bold block">Paid Leaves</span>
                  <span className="font-black text-indigo-700 dark:text-indigo-300">{payslipModalItem.paidLeave}</span>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">Paid Days</span>
                  <span className="font-black text-teal-700 dark:text-teal-300">{payslipModalItem.paidDays}</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-black text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-100 dark:border-slate-700 flex justify-between">
                    <span>Earnings</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                    <span>Basic Salary</span>
                    <span>₹{payslipModalItem.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                    <span>Allowances &amp; Other</span>
                    <span>₹{Math.max(0, payslipModalItem.grossSalary - payslipModalItem.basicSalary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between font-black text-slate-900 dark:text-white">
                    <span>Total Gross</span>
                    <span>{payslipModalItem.formattedGrossSalary}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-black text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-100 dark:border-slate-700 flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Leave / Absent Deduction</span>
                    <span>{payslipModalItem.formattedLeaveDeduction}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Tax / Other</span>
                    <span>₹0</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between font-black text-rose-600">
                    <span>Total Deductions</span>
                    <span>{payslipModalItem.formattedLeaveDeduction}</span>
                  </div>
                </div>
              </div>

              {/* Net Payable Banner */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-300 tracking-wider">
                    Net Salary Disbursed
                  </span>
                  <div className="text-xl font-black text-teal-800 dark:text-teal-200">
                    {payslipModalItem.formattedNetSalary}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    payslipModalItem.status === 'Paid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {payslipModalItem.status}
                  </span>
                  {payslipModalItem.paymentDate && (
                    <div className="text-[10px] text-slate-500 font-bold mt-1">
                      Date: {payslipModalItem.paymentDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction & Disbursement Receipt Details */}
              {payslipModalItem.transactionId && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#0f766e]" />
                      <span>Payment Transaction Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTxn(payslipModalItem.transactionId!)}
                      className="font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 hover:bg-teal-100 flex items-center gap-1 cursor-pointer"
                      title="Copy Transaction ID"
                    >
                      <span>{payslipModalItem.transactionId}</span>
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{payslipModalItem.paymentMethod || 'Bank Transfer'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Disbursement Date</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{payslipModalItem.paymentDate || 'Recorded'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount Disbursed</span>
                      <span className="font-black text-teal-700 dark:text-teal-300">{payslipModalItem.formattedPaidAmount || payslipModalItem.formattedNetSalary}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-semibold text-slate-400">
                <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
                  Authorized Signatory
                </div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
                  Employee Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TRANSACTION DETAILS & PAYMENT RECEIPT MODAL ── */}
      {/* ========================================================================= */}
      {txnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl p-6 shadow-2xl relative space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#0f766e]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Payment Transaction Details</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedStaff?.name || txnModalRecord?.name || 'Staff Member'} &bull; {txnModalTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxnModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Status / Net Info if single record */}
            {txnModalRecord && (
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Payable Due</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100">
                    {txnModalRecord.formattedNetSalary}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Disbursed</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {txnModalRecord.formattedPaidAmount || `₹${txnModalRecord.paidAmount.toLocaleString('en-IN')}/-`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Remaining Due</span>
                  <span className="text-base font-black text-amber-600">
                    {txnModalRecord.formattedPendingAmount || `₹${txnModalRecord.pendingAmount.toLocaleString('en-IN')}/-`}
                  </span>
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Transaction Records ({txnModalList.length})</span>
                <span className="text-[11px] text-slate-400 font-medium">Logged &amp; verified in ledger</span>
              </h4>

              {loadingTxns ? (
                <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                  <span>Loading transaction logs...</span>
                </div>
              ) : txnModalList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs">
                  No payment transactions found for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {txnModalList.map((tx, idx) => {
                    const accDetails = typeof tx.accountDetails === 'string'
                      ? JSON.parse(tx.accountDetails || '{}')
                      : (tx.accountDetails || {})

                    return (
                      <div
                        key={tx.id || idx}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-2xs space-y-3"
                      >
                        {/* Transaction Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                              TXN Ref:
                            </span>
                            <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              {tx.transactionId || 'N/A'}
                            </span>
                            {tx.transactionId && (
                              <button
                                type="button"
                                onClick={() => handleCopyTxn(tx.transactionId)}
                                className="w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Copy Transaction Ref ID"
                              >
                                {copiedTxnId === tx.transactionId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              ● Disbursed
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              {tx.paymentDate || tx.createdAt?.split('T')[0] || 'Today'}
                            </span>
                          </div>
                        </div>

                        {/* Amount & Method Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid</span>
                            <span className="font-black text-sm text-[#0f766e] dark:text-teal-300">
                              {tx.formattedAmount || `₹${tx.amount.toLocaleString('en-IN')}/-`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {tx.paymentMethod || 'Bank Transfer'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payroll Month</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatMonthTitle(tx.monthYear)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Disbursed To</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {tx.staffName}
                            </span>
                          </div>
                        </div>

                        {/* Banking / UPI / Cheque Details */}
                        {(accDetails.bankName || accDetails.accountNo || accDetails.ifscCode || accDetails.upiId || accDetails.chequeNo) && (
                          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Account / Destination Details:
                            </span>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300 font-semibold">
                              {accDetails.bankName && <span>Bank: <strong className="text-slate-900 dark:text-white">{accDetails.bankName}</strong></span>}
                              {accDetails.accountNo && <span>Account: <strong className="text-slate-900 dark:text-white font-mono">{accDetails.accountNo}</strong></span>}
                              {accDetails.ifscCode && <span>IFSC: <strong className="text-slate-900 dark:text-white font-mono">{accDetails.ifscCode}</strong></span>}
                              {accDetails.upiId && <span>UPI ID: <strong className="text-slate-900 dark:text-white font-mono">{accDetails.upiId}</strong></span>}
                              {accDetails.chequeNo && <span>Cheque No: <strong className="text-slate-900 dark:text-white font-mono">{accDetails.chequeNo}</strong></span>}
                            </div>
                          </div>
                        )}

                        {/* Notes / Remarks */}
                        {tx.notes && (
                          <div className="text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span><strong className="text-slate-600 dark:text-slate-300">Notes:</strong> {tx.notes}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-medium">
                Verified financial transaction record &bull; Academy Setu
              </span>
              <button
                type="button"
                onClick={() => setTxnModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function PayrollDashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-400 font-bold">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0f766e] mb-2" />
        <span>Loading payroll management...</span>
      </div>
    }>
      <PayrollDashboardContent />
    </Suspense>
  )
}
