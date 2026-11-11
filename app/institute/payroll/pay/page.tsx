'use client'

import React, { useState, Suspense, useEffect, useMemo } from 'react'
import {
  CheckCircle2, ArrowLeft, Upload, Eye, X, Paperclip, CheckCircle,
  Coins, Clock, CreditCard, RefreshCw, AlertCircle, FileText, Printer,
  ArrowRight, ShieldCheck, Check, Copy, Building2, QrCode, Banknote,
  Sparkles, Wallet, Info, Lock
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  fetchPayrollRecordById,
  recordPayrollTransaction,
  PayrollItem,
  PayrollTransactionItem
} from '../actions'

function PayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const payrollId = searchParams.get('id') || ''
  const staffNameParam = searchParams.get('name') || 'Staff Member'
  const staffTypeParam = searchParams.get('type') || 'Teacher'
  const initialSalaryParam = searchParams.get('salary') || '45,000/-'

  // Payroll Data
  const [payroll, setPayroll] = useState<PayrollItem | null>(null)
  const [transactions, setTransactions] = useState<PayrollTransactionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Tab State: Bank Account vs UPI ID vs Cash
  const [paymentMode, setPaymentMode] = useState<'Bank' | 'UPI' | 'Cash'>('Bank')

  // Bank Info States
  const [accountNo, setAccountNo] = useState('1234567890')
  const [ifscCode, setIfscCode] = useState('SBIN0001234')
  const [bankName, setBankName] = useState('State Bank of India')
  const [holderName, setHolderName] = useState(staffNameParam)

  // UPI Info States
  const [upiId, setUpiId] = useState('staff@oksbi')

  // Cash / Cheque Info States
  const [chequeNo, setChequeNo] = useState('')

  // Edit Mode toggle for Account Details
  const [isEditingAccount, setIsEditingAccount] = useState(false)

  // Copy Feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Pay Amount State
  const [payAmount, setPayAmount] = useState<string>('')

  // Modals
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Attach modal inputs
  const [txnRefNumber, setTxnRefNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [attachedScreenshotName, setAttachedScreenshotName] = useState('')
  const [lastPaymentSummary, setLastPaymentSummary] = useState<{ amount: number; txnId: string } | null>(null)

  // Receipt Modal
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState<PayrollTransactionItem | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  // Load record and transactions from database
  const loadData = async () => {
    if (!payrollId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetchPayrollRecordById(payrollId)
      if (res.success && res.payroll) {
        setPayroll(res.payroll)
        setTransactions(res.transactions || [])
        setHolderName(res.payroll.name)
        // Set default payAmount to pending/left amount
        if (res.payroll.pendingAmount > 0) {
          setPayAmount(String(res.payroll.pendingAmount))
        } else {
          setPayAmount('0')
        }
      } else {
        // Fallback to URL params
        const cleanNum = parseInt(initialSalaryParam.replace(/[^0-9]/g, ''), 10) || 45000
        setPayAmount(String(cleanNum))
      }
    } catch (err) {
      console.error('Error fetching payroll record:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [payrollId])

  // Calculation values
  const totalSalary = useMemo(() => {
    if (payroll) return payroll.netSalary
    return parseInt(initialSalaryParam.replace(/[^0-9]/g, ''), 10) || 45000
  }, [payroll, initialSalaryParam])

  const paidAmount = useMemo(() => {
    if (payroll) return payroll.paidAmount
    const txSum = transactions.reduce((sum, t) => sum + t.amount, 0)
    return txSum
  }, [payroll, transactions])

  const leftAmount = useMemo(() => {
    if (payroll) return payroll.pendingAmount
    return Math.max(0, totalSalary - paidAmount)
  }, [payroll, totalSalary, paidAmount])

  const percentPaid = useMemo(() => {
    if (totalSalary <= 0) return 100
    return Math.min(100, Math.round((paidAmount / totalSalary) * 100))
  }, [paidAmount, totalSalary])

  const displayName = payroll?.name || staffNameParam
  const displayRole = payroll ? `${payroll.role} (${payroll.userType})` : staffTypeParam
  const payrollMonth = payroll ? payroll.monthYear : 'Current Month'

  // Presets
  const handleSelectFullPayment = () => {
    setPayAmount(String(leftAmount))
  }

  const handleSelectHalfPayment = () => {
    setPayAmount(String(Math.round(leftAmount / 2)))
  }

  const handleSelectQuarterPayment = () => {
    setPayAmount(String(Math.round(leftAmount / 4)))
  }

  // Trigger Pay -> Open Attach/Verification Modal
  const handlePayTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) {
      alert('Please enter a valid payment amount greater than ₹0')
      return
    }
    if (amt > leftAmount) {
      if (!confirm(`The entered amount (₹${amt.toLocaleString('en-IN')}) exceeds the remaining left balance (₹${leftAmount.toLocaleString('en-IN')}). Do you want to proceed with paying ₹${leftAmount.toLocaleString('en-IN')}?`)) {
        return
      }
      setPayAmount(String(leftAmount))
    }
    setTxnRefNumber(`UTR${Date.now().toString().slice(-8)}`)
    setAttachModalOpen(true)
  }

  // Submit Payment Transaction
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) return

    setIsSubmitting(true)
    try {
      const res = await recordPayrollTransaction({
        payrollId,
        amount: amt,
        paymentMethod: paymentMode === 'Bank' ? 'Bank Transfer' : (paymentMode === 'UPI' ? 'UPI' : 'Cash'),
        transactionId: txnRefNumber || `TXN-${Date.now().toString().slice(-6)}`,
        accountDetails: {
          accountNo,
          ifscCode,
          bankName,
          holderName,
          upiId,
          chequeNo
        },
        notes: notes || `Salary payment for ${payrollMonth}`
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to record transaction')
      }

      setLastPaymentSummary({
        amount: amt,
        txnId: res.transaction?.transactionId || txnRefNumber
      })

      setAttachModalOpen(false)
      setSuccessModalOpen(true)

      // Reload fresh data from database
      await loadData()
    } catch (err: any) {
      console.error('Payment transaction error:', err)
      alert(err.message || 'Payment submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToMain = () => {
    setSuccessModalOpen(false)
    router.push('/institute/payroll')
  }

  // Staff Initials Avatar
  const staffInitials = useMemo(() => {
    return displayName
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST'
  }, [displayName])

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER BANNER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/institute/payroll"
            className="w-11 h-11 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all bg-white dark:bg-slate-800 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Back to Payroll Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-[#0f766e] text-white font-black flex items-center justify-center text-base shadow-sm shrink-0 tracking-wider">
              {staffInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Disburse Salary
                </h1>
                <span className="text-[11px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] dark:text-teal-300 px-2.5 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800/60">
                  {payrollMonth}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{displayName}</span>
                <span>&bull;</span>
                <span className="text-teal-700 dark:text-teal-400 uppercase font-black tracking-wider text-[11px]">{displayRole}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Action & Status Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
            leftAmount <= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : paidAmount > 0
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              leftAmount <= 0 ? 'bg-emerald-500 animate-pulse' : (paidAmount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500')
            }`} />
            <span>{leftAmount <= 0 ? 'Fully Disbursed' : (paidAmount > 0 ? 'Partially Paid' : 'Unpaid')}</span>
          </span>
        </div>
      </div>

      {/* ── 3 METRIC HERO CARDS: TOTAL, PAID, LEFT ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 w-full">
        {/* Box 1: TOTAL SALARY */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Total Net Salary
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 block tracking-tight">
                ₹{totalSalary.toLocaleString('en-IN')}/-
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>Gross: ₹{(payroll?.grossSalary || totalSalary).toLocaleString('en-IN')}</span>
            {payroll && payroll.leaveDeduction > 0 && (
              <span className="text-rose-500 font-extrabold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                -{payroll.formattedLeaveDeduction} leave
              </span>
            )}
          </div>
        </div>

        {/* Box 2: PAID AMOUNT */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all bg-gradient-to-br from-emerald-50/20 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Amount Disbursed
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block tracking-tight">
                ₹{paidAmount.toLocaleString('en-IN')}/-
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pt-3 mt-1 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700/80 dark:text-emerald-400/90">
              <span>{transactions.length} transaction{transactions.length === 1 ? '' : 's'}</span>
              <span className="font-black">{percentPaid}% Cleared</span>
            </div>
          </div>
        </div>

        {/* Box 3: LEFT / REMAINING */}
        <div className={`rounded-3xl p-6 border shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all ${
          leftAmount > 0 
            ? 'bg-white dark:bg-slate-800 border-amber-200/90 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/20 to-transparent'
            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-[11px] font-black uppercase tracking-wider block ${
                leftAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                Remaining Balance
              </span>
              <span className={`text-3xl font-black mt-1.5 block tracking-tight ${
                leftAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                ₹{leftAmount.toLocaleString('en-IN')}/-
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              leftAmount > 0 
                ? 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold">
            <span className={leftAmount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-600'}>
              {leftAmount <= 0 ? '✓ All Dues Cleared' : 'Pending Disbursal'}
            </span>
            {leftAmount > 0 && (
              <button
                type="button"
                onClick={handleSelectFullPayment}
                className="text-[10px] font-black uppercase tracking-wider text-[#0f766e] hover:underline cursor-pointer"
              >
                Clear Full Left &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN PAYMENT DISBURSEMENT CARD ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
        
        {/* Payment mode switcher tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Disbursal Mode
            </label>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Secure Audit Trail
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl font-bold text-xs">
            <button 
              type="button" 
              onClick={() => setPaymentMode('Bank')}
              className={`py-3 px-4 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMode === 'Bank'
                  ? 'bg-[#0f766e] text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank Account Transfer</span>
            </button>
            <button 
              type="button" 
              onClick={() => setPaymentMode('UPI')}
              className={`py-3 px-4 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMode === 'UPI'
                  ? 'bg-[#0f766e] text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>UPI / QR Transfer</span>
            </button>
            <button 
              type="button" 
              onClick={() => setPaymentMode('Cash')}
              className={`py-3 px-4 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMode === 'Cash'
                  ? 'bg-[#0f766e] text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash / Cheque Voucher</span>
            </button>
          </div>
        </div>

        {/* ── BENEFICIARY DETAILS CARD ── */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {paymentMode === 'Bank' && 'Beneficiary Bank Account Details'}
                {paymentMode === 'UPI' && 'Staff UPI Transfer Details'}
                {paymentMode === 'Cash' && 'Cash / Cheque Voucher Details'}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified Staff Record
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAccount(prev => !prev)}
                className="text-[11px] font-bold text-[#0f766e] hover:underline cursor-pointer pl-1"
              >
                {isEditingAccount ? 'Done Editing' : 'Edit'}
              </button>
            </div>
          </div>
          
          {/* Mode 1: Bank Account */}
          {paymentMode === 'Bank' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Account Number */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs group">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Account Number
                </span>
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={accountNo}
                    onChange={e => setAccountNo(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 font-mono"
                  />
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 tracking-wider">
                      {accountNo}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountNo, 'accountNo')}
                      className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedField === 'accountNo' ? (
                        <span className="text-[10px] font-black text-teal-600">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* IFSC Code */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs group">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  IFSC Code
                </span>
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 font-mono uppercase"
                  />
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      {ifscCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ifscCode, 'ifscCode')}
                      className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                      title="Copy IFSC Code"
                    >
                      {copiedField === 'ifscCode' ? (
                        <span className="text-[10px] font-black text-teal-600">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Bank Name */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Bank Name
                </span>
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900"
                  />
                ) : (
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mt-1">
                    {bankName}
                  </span>
                )}
              </div>

              {/* Beneficiary Name */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Account Holder Name
                </span>
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={holderName}
                    onChange={e => setHolderName(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900"
                  />
                ) : (
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mt-1">
                    {holderName}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: UPI */}
          {paymentMode === 'UPI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Beneficiary UPI ID / VPA
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black font-mono text-[#0f766e] dark:text-teal-400">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(upiId, 'upiId')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copiedField === 'upiId' ? (
                      <span className="text-teal-600 font-black">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    Instant Mobile QR Code
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Scan with GPay, PhonePe, Paytm or BHIM
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Cash / Cheque */}
          {paymentMode === 'Cash' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Cheque / Voucher Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-928194 or VCH-102"
                  value={chequeNo}
                  onChange={e => setChequeNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Cash Payment Recording
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cash vouchers are automatically logged in the audit ledger.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── PAYROLL STATEMENT DETAILS TABLE ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Payroll Statement Details</span>
              <span className="text-slate-400 font-normal">&mdash;</span>
              <span className="text-teal-700 dark:text-teal-400">{payrollMonth}</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Salary Month: {payrollMonth}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 text-left">Salary Period</th>
                  <th className="px-4 py-3.5">Gross Salary</th>
                  <th className="px-4 py-3.5">Leave Deduction</th>
                  <th className="px-4 py-3.5">Net Payable</th>
                  <th className="px-4 py-3.5">Total Paid</th>
                  <th className="px-4 py-3.5">Remaining Left</th>
                  <th className="px-4 py-3.5 w-36 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-4 text-left font-black text-slate-900 dark:text-white">
                    {payrollMonth}
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-semibold">
                    ₹{(payroll ? payroll.grossSalary : totalSalary).toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-4 text-rose-500 font-bold">
                    {payroll ? payroll.formattedLeaveDeduction : '₹0'}
                  </td>
                  <td className="px-4 py-4 font-black text-slate-900 dark:text-white text-sm">
                    ₹{totalSalary.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-4 font-black text-emerald-600 text-sm">
                    ₹{paidAmount.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-4 font-black text-amber-600 text-sm">
                    ₹{leftAmount.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-4 text-center">
                    {leftAmount > 0 ? (
                      <button 
                        type="button" 
                        onClick={handleSelectFullPayment}
                        className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Pay Left</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Fully Cleared
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MAKE PAYMENT ACTION BAR (FIXED TRUNCATION & SLEEK INTERACTION) ── */}
        {leftAmount > 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/20 dark:from-slate-900/60 dark:to-teal-950/10 border border-teal-200/60 dark:border-teal-900/40 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight block">
                  Disburse Payment (Full or Installment)
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Choose a quick percentage chip or specify custom installment amount
                </span>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectFullPayment}
                  className="px-3 py-1.5 rounded-xl border border-teal-300/80 bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] dark:text-teal-300 text-xs font-black hover:bg-teal-100/70 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  100% Left (₹{leftAmount.toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  onClick={handleSelectHalfPayment}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  50% Half (₹{Math.round(leftAmount / 2).toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  onClick={handleSelectQuarterPayment}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-2xs active:scale-95 hidden sm:inline-block"
                >
                  25% (₹{Math.round(leftAmount / 4).toLocaleString('en-IN')})
                </button>
              </div>
            </div>

            {/* Input & Big Action Button */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Remaining Info Pill */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Current Left Balance
                  </span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                    ₹{leftAmount.toLocaleString('en-IN')}/-
                  </span>
                </div>
                <Clock className="w-5 h-5 text-amber-500/80" />
              </div>

              {/* Enter Amount Input */}
              <div className="lg:col-span-4">
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-black text-slate-400 text-lg pointer-events-none">
                    ₹
                  </span>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    placeholder="Enter amount" 
                    className="w-full pl-9 pr-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-black text-slate-900 dark:text-white text-base focus:border-[#0f766e] transition-colors shadow-2xs" 
                  />
                </div>
              </div>

              {/* Big Bold Pay Button - NEVER TRUNCATED */}
              <div className="lg:col-span-4">
                <button 
                  type="button" 
                  onClick={handlePayTrigger}
                  className="w-full px-6 py-4 bg-[#0f766e] hover:bg-teal-700 text-white font-black rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm active:scale-98 tracking-wide"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    Proceed to Pay {payAmount ? `₹${Number(payAmount).toLocaleString('en-IN')}` : ''}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Validation / Helper Text */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
              <span>
                Remaining after this disbursal:{' '}
                <strong className={Math.max(0, leftAmount - (parseFloat(payAmount) || 0)) === 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}>
                  ₹{Math.max(0, leftAmount - (parseFloat(payAmount) || 0)).toLocaleString('en-IN')}/-
                </strong>
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Multi-factor transaction confirmation
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                This payroll statement has been fully disbursed!
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                Total ₹{totalSalary.toLocaleString('en-IN')}/- has been cleared across {transactions.length} transaction{transactions.length === 1 ? '' : 's'}. You can review the ledger receipts below.
              </p>
            </div>
          </div>
        )}

        {/* ── TRANSACTION LEDGER HISTORY TABLE ── */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Payment Transaction History
              </h3>
              <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                {transactions.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live DB records
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5 text-left">Transaction ID</th>
                  <th className="px-4 py-3.5">Salary Period</th>
                  <th className="px-4 py-3.5">Date &amp; Time</th>
                  <th className="px-4 py-3.5">Amount Disbursed</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 w-32 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {transactions.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 font-bold">{idx + 1}.</td>
                    <td className="px-4 py-3.5 text-left font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{record.transactionId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(record.transactionId, `txn-${record.id}`)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Copy Transaction ID"
                        >
                          {copiedField === `txn-${record.id}` ? (
                            <span className="text-[10px] text-teal-600 font-black">Copied</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-bold">{record.monthYear}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{record.paymentDate}</td>
                    <td className="px-4 py-3.5 font-black text-emerald-600 text-sm">
                      ₹{record.amount.toLocaleString('en-IN')}/-
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {record.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/80">
                        ● Paid
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button 
                        type="button" 
                        onClick={() => setSelectedTxnForReceipt(record)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-[#0f766e] dark:text-teal-300 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold shadow-2xs active:scale-95"
                        title="View printable receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-slate-300" />
                      <p>No payment transactions recorded yet for this payroll statement.</p>
                      <p className="text-[11px] text-slate-400 font-normal">When you disburse an installment, records will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: ATTACH SCREENSHOT / VERIFY PAYMENT TRANSACTION
      ═══════════════════════════════════════════════════════════════════ */}
      {attachModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <form 
            onSubmit={handleSubmitTransaction}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4.5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    Confirm &amp; Record Disbursal
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {displayName} &bull; {payrollMonth}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAttachModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Payment Summary Header */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Disbursal Amount
                  </span>
                  <span className="text-2xl font-black text-[#0f766e] dark:text-teal-300 block tracking-tight">
                    ₹{parseFloat(payAmount).toLocaleString('en-IN')}/-
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold mt-0.5 block">
                    Mode: {paymentMode === 'Bank' ? 'Bank Transfer' : (paymentMode === 'UPI' ? 'UPI Transfer' : 'Cash Voucher')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Balance After Disbursal
                  </span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
                    ₹{Math.max(0, leftAmount - parseFloat(payAmount)).toLocaleString('en-IN')}/-
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {Math.max(0, leftAmount - parseFloat(payAmount)) === 0 ? 'Full Settlement' : 'Partial Installment'}
                  </span>
                </div>
              </div>

              {/* Transaction Reference Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between">
                  <span>Transaction / UTR Reference ID *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-generated, editable</span>
                </label>
                <input 
                  type="text" 
                  value={txnRefNumber}
                  onChange={e => setTxnRefNumber(e.target.value)}
                  placeholder="e.g. UTR123456789 or UPI-TXN-9021"
                  className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono font-bold text-slate-800 dark:text-slate-100 text-xs focus:border-teal-500 shadow-2xs" 
                  required
                />
              </div>

              {/* Attach Screenshot / Receipt */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Attach Payment Proof / Bank Slip (Optional)
                </label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-2xs">
                  <input 
                    type="text" 
                    placeholder={attachedScreenshotName || "No file chosen (Click browse to attach slip)"}
                    readOnly 
                    className="flex-1 px-4 py-3 outline-none font-semibold text-slate-500 text-xs bg-transparent" 
                  />
                  <label className="px-4 py-3 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 font-bold">
                    <Upload className="w-4 h-4" />
                    <span>Browse</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) setAttachedScreenshotName(file.name)
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Transaction Notes / Remarks
                </label>
                <input 
                  type="text" 
                  placeholder={`e.g. Disbursed via ${paymentMode} for ${payrollMonth}`}
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 text-xs focus:border-teal-500 shadow-2xs" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setAttachModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm &amp; Record Disbursal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: SUBMIT SUCCESS DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-7 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0f766e] flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-800">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Recorded!
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Salary installment successfully saved in the ledger.
              </p>
            </div>

            {lastPaymentSummary && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Amount Disbursed
                </span>
                <p className="font-black text-emerald-600 dark:text-emerald-400 text-2xl font-mono">
                  ₹{lastPaymentSummary.amount.toLocaleString('en-IN')}/-
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Ref: {lastPaymentSummary.txnId}
                </p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Remaining left:</span>
                  <span className="text-amber-600 font-black">₹{leftAmount.toLocaleString('en-IN')}/-</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button 
                type="button"
                onClick={() => setSuccessModalOpen(false)}
                className="w-full py-3 bg-[#0f766e] hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                View History &amp; Receipts
              </button>
              <button 
                type="button"
                onClick={handleBackToMain}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Payroll Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 3: VIEW PRINTABLE TRANSACTION VOUCHER / RECEIPT
      ═══════════════════════════════════════════════════════════════════ */}
      {selectedTxnForReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 space-y-6">
            
            {/* Voucher Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0f766e] block">
                    Official Payment Voucher
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Salary Disbursement Receipt
                  </h3>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedTxnForReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Body Details */}
            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Staff Beneficiary</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{selectedTxnForReceipt.staffName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Transaction Reference ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTxnForReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Payment Date &amp; Time</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Salary Period</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.monthYear}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Payment Channel</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.paymentMethod}</span>
              </div>
              
              {/* Grand Total Box */}
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 mt-2">
                <span className="font-black uppercase tracking-wider text-xs">Amount Disbursed</span>
                <span className="font-black text-lg font-mono">₹{selectedTxnForReceipt.amount.toLocaleString('en-IN')}/-</span>
              </div>
            </div>

            {/* Voucher Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>Status: <strong className="text-emerald-600 font-bold">● Cleared / Authorized</strong></span>
              <span>Academy Setu Finance Ledger</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedTxnForReceipt(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] text-white text-xs font-black shadow-sm hover:bg-teal-700 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 4: SHOW UPI QR CODE
      ═══════════════════════════════════════════════════════════════════ */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-black text-[#0f766e] uppercase tracking-wider">
                UPI QR Code
              </span>
              <button 
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Scan to pay <strong className="text-slate-900 dark:text-white">{displayName}</strong>
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-teal-500 inline-block shadow-inner mx-auto">
              {/* Visual simulated QR graphic */}
              <div className="w-44 h-44 bg-slate-900 p-2 rounded-xl flex items-center justify-center relative">
                <QrCode className="w-36 h-36 text-white" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#0f766e] font-black text-xs shadow-md">
                    ₹
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {upiId}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(upiId, 'upi-modal')}
              className="w-full py-2.5 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-xs transition-colors cursor-pointer active:scale-95"
            >
              {copiedField === 'upi-modal' ? 'Copied VPA!' : 'Copy UPI ID'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default function DisburseSalaryPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs font-bold text-slate-400 animate-pulse">Loading payroll disbursal screen...</div>}>
      <PayContent />
    </Suspense>
  )
}
