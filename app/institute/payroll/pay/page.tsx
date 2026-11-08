'use client'

import React, { useState, Suspense, useEffect, useMemo } from 'react'
import {
  CheckCircle2, ArrowLeft, Upload, Eye, X, Paperclip, CheckCircle,
  Coins, Clock, CreditCard, RefreshCw, AlertCircle, FileText, Printer,
  ArrowRight, ShieldCheck, Check
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

  // Pay Amount State
  const [payAmount, setPayAmount] = useState<string>('')

  // Modals
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Attach modal inputs
  const [txnRefNumber, setTxnRefNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [attachedScreenshotName, setAttachedScreenshotName] = useState('')
  const [lastPaymentSummary, setLastPaymentSummary] = useState<{ amount: number; txnId: string } | null>(null)

  // Receipt Modal
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState<PayrollTransactionItem | null>(null)

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

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/payroll"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 shadow-2xs cursor-pointer"
            title="Back to Payroll Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              Disburse Salary
            </h1>
            <p className="text-xs text-[#0f766e] font-black uppercase tracking-wider mt-0.5">
              {displayName} &bull; <span className="text-slate-500 dark:text-slate-400 font-semibold">{displayRole}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            leftAmount <= 0
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : paidAmount > 0
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            ● {leftAmount <= 0 ? 'Fully Paid' : (paidAmount > 0 ? 'Partially Paid' : 'Unpaid')}
          </span>
        </div>
      </div>

      {/* ── 3 METRIC BOXES: TOTAL, PAID, LEFT ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* Box 1: TOTAL */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Total Salary
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block tracking-tight">
              ₹{totalSalary.toLocaleString('en-IN')}/-
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              Period: {payrollMonth}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Box 2: PAID */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800/80 shadow-xs flex items-center justify-between bg-emerald-50/15">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
              Paid Amount
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block tracking-tight">
              ₹{paidAmount.toLocaleString('en-IN')}/-
            </span>
            <span className="text-[11px] font-semibold text-emerald-700/80 mt-0.5 block">
              {transactions.length} transaction{transactions.length === 1 ? '' : 's'} recorded
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Box 3: LEFT */}
        <div className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border shadow-xs flex items-center justify-between ${
          leftAmount > 0 
            ? 'border-amber-200 dark:border-amber-800/80 bg-amber-50/15'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50/40'
        }`}>
          <div>
            <span className={`text-[11px] font-black uppercase tracking-wider block ${
              leftAmount > 0 ? 'text-amber-600' : 'text-slate-400'
            }`}>
              Left / Remaining
            </span>
            <span className={`text-2xl sm:text-3xl font-black mt-1 block tracking-tight ${
              leftAmount > 0 ? 'text-amber-600' : 'text-slate-400'
            }`}>
              ₹{leftAmount.toLocaleString('en-IN')}/-
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              {leftAmount <= 0 ? 'Fully Disbursed' : 'Balance to be cleared'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            leftAmount > 0 
              ? 'bg-amber-100/60 dark:bg-amber-950/60 text-amber-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── MAIN PAYMENT CONTAINER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Payment mode switcher toggles */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-md font-bold text-xs select-none">
          <button 
            type="button" 
            onClick={() => setPaymentMode('Bank')}
            className={`flex-1 py-2.5 text-center rounded-xl transition-all cursor-pointer ${
              paymentMode === 'Bank'
                ? 'bg-[#0f766e] text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bank Account
          </button>
          <button 
            type="button" 
            onClick={() => setPaymentMode('UPI')}
            className={`flex-1 py-2.5 text-center rounded-xl transition-all cursor-pointer ${
              paymentMode === 'UPI'
                ? 'bg-[#0f766e] text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            UPI ID
          </button>
          <button 
            type="button" 
            onClick={() => setPaymentMode('Cash')}
            className={`flex-1 py-2.5 text-center rounded-xl transition-all cursor-pointer ${
              paymentMode === 'Cash'
                ? 'bg-[#0f766e] text-white font-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cash / Cheque
          </button>
        </div>

        {/* Account Details Form Fields */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-2 uppercase tracking-wider text-[#1b3a60] dark:text-teal-400">
            {paymentMode === 'Bank' ? 'Staff Bank Account Details' : (paymentMode === 'UPI' ? 'Staff UPI Transfer Details' : 'Cash / Cheque Payment Details')}
          </h3>
          
          {paymentMode === 'Bank' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">Account No.</label>
                <input 
                  type="text" 
                  value={accountNo} 
                  onChange={e => setAccountNo(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">IFSC Code</label>
                <input 
                  type="text" 
                  value={ifscCode} 
                  onChange={e => setIfscCode(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 uppercase" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">Bank Name</label>
                <input 
                  type="text" 
                  value={bankName} 
                  onChange={e => setBankName(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">Account Holder Name</label>
                <input 
                  type="text" 
                  value={holderName} 
                  onChange={e => setHolderName(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500" 
                />
              </div>
            </div>
          )}

          {paymentMode === 'UPI' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">UPI ID / VPA</label>
                <input 
                  type="text" 
                  value={upiId} 
                  onChange={e => setUpiId(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500" 
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <button 
                  type="button" 
                  onClick={() => alert(`Showing QR code for UPI ID: ${upiId}`)}
                  className="flex items-center gap-1.5 text-xs text-[#0f766e] font-black pb-2 cursor-pointer hover:underline"
                >
                  <Eye className="w-4 h-4" /> View QR Code for Scanning
                </button>
              </div>
            </div>
          )}

          {paymentMode === 'Cash' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">Cheque / Voucher No. (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. CHQ-928194"
                  value={chequeNo} 
                  onChange={e => setChequeNo(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Outstanding Balance Breakdown Table */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Payroll Statement Details &mdash; {payrollMonth}
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Salary For: {payrollMonth}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 no-scrollbar">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Salary For</th>
                  <th className="px-4 py-3">Gross Salary</th>
                  <th className="px-4 py-3">Leave Deduction</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Left / Balance</th>
                  <th className="px-4 py-3 w-32">Quick Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 font-semibold hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-bold">
                    {payrollMonth}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    ₹{(payroll ? payroll.grossSalary : totalSalary).toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-3.5 text-rose-500 font-bold">
                    {payroll ? payroll.formattedLeaveDeduction : '₹0'}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    ₹{totalSalary.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">
                    ₹{paidAmount.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-3.5 font-black text-amber-600">
                    ₹{leftAmount.toLocaleString('en-IN')}/-
                  </td>
                  <td className="px-4 py-3.5">
                    {leftAmount > 0 ? (
                      <button 
                        type="button" 
                        onClick={handleSelectFullPayment}
                        className="px-3 py-1.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer"
                      >
                        Pay Left
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-black text-xs flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment submission bar: Single or Multiple Partial Payment */}
          {leftAmount > 0 ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Make Payment (One-Time Full or Partial Installment):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectFullPayment}
                    className="px-3 py-1 rounded-lg border border-teal-200 text-[#0f766e] text-xs font-bold hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    100% Left (₹{leftAmount.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectHalfPayment}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    50% Left (₹{Math.round(leftAmount / 2).toLocaleString('en-IN')})
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2 text-xs font-semibold">
                <div className="flex flex-col gap-1 w-full sm:w-64">
                  <label className="text-slate-500 font-bold">Remaining Left Balance</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`₹${leftAmount.toLocaleString('en-IN')}/-`} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl outline-none font-black text-sm" 
                  />
                </div>

                <div className="flex flex-col gap-1 w-full sm:w-80">
                  <label className="text-slate-500 font-bold">Enter Pay Amount (₹)</label>
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden focus-within:border-teal-500 shadow-2xs">
                    <input 
                      type="number" 
                      value={payAmount} 
                      onChange={e => setPayAmount(e.target.value)} 
                      placeholder="e.g. 10000 or full" 
                      className="flex-1 px-4 py-2.5 outline-none font-black text-slate-800 dark:text-slate-100 text-sm bg-transparent" 
                    />
                    <button 
                      type="button" 
                      onClick={handlePayTrigger}
                      className="px-6 py-2.5 bg-[#0f766e] hover:bg-teal-700 text-white font-black transition-colors text-xs border-l border-teal-700 shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Proceed to Pay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                This payroll statement has been fully disbursed! Total of ₹{totalSalary.toLocaleString('en-IN')}/- has been cleared across {transactions.length} transaction{transactions.length === 1 ? '' : 's'}.
              </p>
            </div>
          )}
        </div>

        {/* ── TRANSACTION HISTORY SECTION (All individual payments for this payroll) ── */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[#1b3a60] dark:text-teal-400">
              Payment Transaction History ({transactions.length})
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Live database records
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 no-scrollbar">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">S. No.</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Salary For</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Receipt / Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((record, idx) => (
                  <tr key={record.id} className="border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}.</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{record.transactionId}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-bold">{record.monthYear}</td>
                    <td className="px-4 py-3 text-slate-500">{record.paymentDate}</td>
                    <td className="px-4 py-3 font-black text-emerald-600">₹{record.amount.toLocaleString('en-IN')}/-</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200">
                        ● Paid
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        type="button" 
                        onClick={() => setSelectedTxnForReceipt(record)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-[#0f766e] transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                        title="View receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No payment transactions recorded yet for this payroll statement.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: ATTACH SCREENSHOT / VERIFY PAYMENT TRANSACTION
      ═══════════════════════════════════════════════════════════════════ */}
      {attachModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <form 
            onSubmit={handleSubmitTransaction}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-teal-400 uppercase tracking-wider">
                Confirm &amp; Record Transaction
              </span>
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
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Transaction Amount</span>
                  <span className="text-xl font-black text-[#0f766e] dark:text-teal-300 block">
                    ₹{parseFloat(payAmount).toLocaleString('en-IN')}/-
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mode: {paymentMode === 'Bank' ? 'Bank Transfer' : (paymentMode === 'UPI' ? 'UPI' : 'Cash')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Remaining After This</span>
                  <span className="text-base font-black text-amber-600 block">
                    ₹{Math.max(0, leftAmount - parseFloat(payAmount)).toLocaleString('en-IN')}/-
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {Math.max(0, leftAmount - parseFloat(payAmount)) === 0 ? 'Full Settlement' : 'Partial Payment'}
                  </span>
                </div>
              </div>

              {/* Transaction Reference Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 dark:text-slate-300 font-bold">
                  Transaction / UTR Reference ID *
                </label>
                <input 
                  type="text" 
                  value={txnRefNumber}
                  onChange={e => setTxnRefNumber(e.target.value)}
                  placeholder="e.g. UTR123456789 or UPI-TXN-9021"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-800 dark:text-slate-100 text-xs focus:border-teal-500" 
                  required
                />
              </div>

              {/* Attach Screenshot / Receipt */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-300">
                  Attach Payment Screenshot / Receipt (Optional)
                </label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden">
                  <input 
                    type="text" 
                    placeholder={attachedScreenshotName || "No file attached (Click icon to choose)"}
                    readOnly 
                    className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-500 text-xs bg-transparent" 
                  />
                  <label className="px-4 py-2.5 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 font-bold">
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
                <label className="font-bold text-slate-600 dark:text-slate-300">
                  Transaction Notes / Remarks
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. November 1st installment paid via NEFT"
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 text-xs focus:border-teal-500" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setAttachModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit &amp; Record Payment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: SUBMIT SUCCESS DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-center space-y-5">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Payment Recorded Successfully!
            </h2>

            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0f766e] flex items-center justify-center shadow-inner border border-emerald-100">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>

            {lastPaymentSummary && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
                <p className="font-black text-slate-900 dark:text-white text-base">
                  ₹{lastPaymentSummary.amount.toLocaleString('en-IN')}/-
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ref: {lastPaymentSummary.txnId}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold pt-1">
                  Remaining left: <strong className="text-amber-600">₹{leftAmount.toLocaleString('en-IN')}/-</strong>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button 
                type="button"
                onClick={() => setSuccessModalOpen(false)}
                className="w-full py-2.5 bg-[#0f766e] hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                Make Another Payment / View History
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
          MODAL: VIEW SINGLE TRANSACTION RECEIPT
      ═══════════════════════════════════════════════════════════════════ */}
      {selectedTxnForReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0f766e]">
                  Payment Voucher
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Salary Disbursement Receipt
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedTxnForReceipt(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 font-bold">Staff Name</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedTxnForReceipt.staffName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 font-bold">Transaction ID</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 font-bold">Date</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 font-bold">Salary Period</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.monthYear}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 font-bold">Payment Method</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTxnForReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 px-3 rounded-xl mt-2">
                <span>Amount Disbursed</span>
                <span>₹{selectedTxnForReceipt.amount.toLocaleString('en-IN')}/-</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedTxnForReceipt(null)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-black shadow-xs hover:bg-teal-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function DisburseSalaryPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs font-bold text-slate-400">Loading payroll payment screen...</div>}>
      <PayContent />
    </Suspense>
  )
}
