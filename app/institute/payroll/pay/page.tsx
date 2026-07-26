'use client'

import React, { useState, Suspense } from 'react'
import { CheckCircle2, ArrowLeft, Upload, Eye, X, Paperclip, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface SalaryRow {
  id: number
  month: string
  net: string
  gross: string
  deduction: string
  final: string
}

interface HistoryRow {
  id: number
  invoiceId: string
  month: string
  date: string
  net: string
  method: string
  status: string
}

function PayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const staffName = searchParams.get('name') || 'Ashok Kumar'
  const staffType = searchParams.get('type') || 'Teacher'
  const initialSalary = searchParams.get('salary') || '20,000/-'

  // Tab State
  const [paymentMode, setPaymentMode] = useState<'Bank' | 'UPI'>('Bank')

  // Bank Info States
  const [accountNo, setAccountNo] = useState('1234567890')
  const [ifscCode, setIfscCode] = useState('ABCD1234567890')
  const [bankName, setBankName] = useState('State Bank of India')
  const [holderName, setHolderName] = useState(staffName)

  // UPI Info States
  const [upiId, setUpiId] = useState('abcd@oksbi')

  // Unpaid Invoices List State (Screenshot 1 & 4)
  const [unpaidInvoices, setUnpaidInvoices] = useState<SalaryRow[]>([
    { id: 1, month: 'Jan 2025', net: '20,000', gross: '2,000', deduction: '1,000', final: '19,000' },
    { id: 2, month: 'Feb 2025', net: '20,000', gross: '2,000', deduction: '1,000', final: '19,000' },
    { id: 3, month: 'Mar 2025', net: '20,000', gross: '2,000', deduction: '1,000', final: '19,000' },
  ])

  // Paid Invoices (Transaction History)
  const [history, setHistory] = useState<HistoryRow[]>([
    { id: 1, invoiceId: 'ABC1234', month: 'Jan 2025', date: '05/01/2025', net: '20,000', method: 'Bank', status: 'Paid' },
    { id: 2, invoiceId: 'ABC1234', month: 'Feb 2025', date: '03/02/2025', net: '20,000', method: 'Bank', status: 'Paid' },
    { id: 3, invoiceId: 'ABC1234', month: 'Mar 2025', date: '03/03/2025', net: '20,000', method: 'Online', status: 'Paid' },
  ])

  // Payment calculator
  const totalAmount = unpaidInvoices.reduce((sum, item) => sum + parseInt(item.final.replace(/,/g, '')), 0)
  const [payAmount, setPayAmount] = useState(totalAmount.toString())

  // Modal Steppers
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  // Attach screenshot fields state
  const [screenshotAmount, setScreenshotAmount] = useState('50,000')
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [customAmount, setCustomAmount] = useState('')

  const handleRemoveInvoice = (id: number) => {
    setUnpaidInvoices(unpaidInvoices.filter(i => i.id !== id))
  }

  const handlePayTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    setScreenshotAmount(payAmount)
    setAttachModalOpen(true)
  }

  const handleSubmitScreenshot = (e: React.FormEvent) => {
    e.preventDefault()
    setAttachModalOpen(false)
    setSuccessModalOpen(true)
  }

  const handleBackToMain = () => {
    setSuccessModalOpen(false)
    router.push('/institute/payroll')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/payroll"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Disburse Salary</h1>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider text-teal-655">{staffName} ({staffType})</p>
          </div>
        </div>
      </div>

      {/* Main Payment container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Payment mode switcher toggles (Screenshot 1 & 4) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-sm font-bold text-xs select-none">
          <button 
            type="button" 
            onClick={() => setPaymentMode('Bank')}
            className={`flex-1 py-2 text-center rounded-xl transition-all ${
              paymentMode === 'Bank' ? 'bg-teal-650 text-white font-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank Account
          </button>
          <button 
            type="button" 
            onClick={() => setPaymentMode('UPI')}
            className={`flex-1 py-2 text-center rounded-xl transition-all ${
              paymentMode === 'UPI' ? 'bg-teal-650 text-white font-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            UPI ID
          </button>
        </div>

        {/* Bank details input fields (Screenshot 1 & 4) */}
        <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-black text-slate-800 border-b pb-2 uppercase tracking-wider text-[#1b3a60]">Bank Details</h3>
          
          {paymentMode === 'Bank' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-655">Account No.</label>
                <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-655">IFSC Code</label>
                <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-655">Bank Name</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-655">Account Holder Name</label>
                <input type="text" value={holderName} onChange={e => setHolderName(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-655">UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <button 
                  type="button" 
                  onClick={() => alert('Opening QR receipt dialog...')}
                  className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-extrabold pb-2"
                >
                  <Eye className="w-4 h-4" /> View QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unpaid Invoice Table (Screenshot 1 & 4) */}
        <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 font-black text-slate-600 border-b">
                <tr>
                  <th className="px-4 py-3 w-16"></th>
                  <th className="px-4 py-3">S. No.</th>
                  <th className="px-4 py-3">Salary For</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Gross Salary</th>
                  <th className="px-4 py-3">Deduction Amount</th>
                  <th className="px-4 py-3">Final Amount</th>
                  <th className="px-4 py-3 w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                    <td className="px-2 py-3 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveInvoice(invoice.id)}
                        className="text-slate-350 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}.</td>
                    <td className="px-4 py-3 text-slate-800 font-bold">{invoice.month}</td>
                    <td className="px-4 py-3 text-slate-550 font-bold">{invoice.net}</td>
                    <td className="px-4 py-3 text-slate-550 font-bold">{invoice.gross}</td>
                    <td className="px-4 py-3 text-red-500 font-bold">{invoice.deduction}</td>
                    <td className="px-4 py-3 text-slate-900 font-black">{invoice.final}</td>
                    <td className="px-4 py-3">
                      <button 
                        type="button"
                        onClick={() => setPayAmount(invoice.final.replace(/,/g, ''))}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
                {unpaidInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No outstanding salaries for this user.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pay parameters submission box (Screenshot 1 & 4) */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4 text-xs font-semibold text-slate-700">
            <div className="flex flex-col gap-1.5 w-64">
              <label className="text-slate-500">Total Payment Amount</label>
              <input type="text" readOnly value={`${totalAmount.toLocaleString()}/-`} className="px-4 py-2.5 bg-slate-100 rounded-lg outline-none font-bold" />
            </div>

            <div className="flex flex-col gap-1.5 w-64">
              <label className="text-slate-500">Pay Amount</label>
              <div className="flex items-center border rounded-lg bg-white overflow-hidden focus-within:border-teal-500">
                <input 
                  type="number" 
                  value={payAmount} 
                  onChange={e => setPayAmount(e.target.value)} 
                  placeholder="Enter Amount" 
                  className="flex-1 px-4 py-2.5 outline-none font-bold text-slate-700 text-xs" 
                />
                <button 
                  type="button" 
                  onClick={handlePayTrigger}
                  className="px-6 py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-bold transition-colors text-xs border-l shrink-0"
                >
                  Pay
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Transaction History Section (Screenshot 1 & 4) */}
        <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-black text-slate-800 border-b pb-2 uppercase tracking-wider text-[#1b3a60]">Transaction History</h3>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 font-black text-slate-600 border-b">
                <tr>
                  <th className="px-4 py-3">S. No.</th>
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Salary For</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, idx) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}.</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">{record.invoiceId}</td>
                    <td className="px-4 py-3 text-slate-800 font-bold">{record.month}</td>
                    <td className="px-4 py-3 text-slate-500">{record.date}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{record.net}</td>
                    <td className="px-4 py-3 text-slate-600">{record.method}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600">
                        ● {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="p-1 rounded hover:bg-slate-100 text-teal-650">
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================================== ATTACH SCREENSHOT MODAL (Screenshot 2) ================================== */}
      {attachModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSubmitScreenshot}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">
                Attach Screenshot
              </span>
              <button 
                type="button"
                onClick={() => setAttachModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-slate-500 font-bold">Paid Amount</label>
                <input 
                  type="text" 
                  value={`${parseInt(screenshotAmount).toLocaleString()}/-`} 
                  disabled 
                  className="px-4 py-2.5 bg-slate-100 rounded-lg outline-none font-bold text-slate-655" 
                />
              </div>

              {/* Attach widget row */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 relative flex flex-wrap gap-4 items-center justify-between">
                <button 
                  type="button" 
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border flex items-center justify-center text-slate-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-1.5 w-full sm:w-48">
                  <label className="font-bold text-slate-655">Amount</label>
                  <input type="text" placeholder="Enter Amount" className="px-4 py-2 border rounded-lg font-bold bg-white" />
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:w-64">
                  <label className="font-bold text-slate-655">Screenshot</label>
                  <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                    <input type="text" placeholder="Attach Transaction Screenshot" readOnly className="flex-1 px-4 py-2 outline-none font-semibold text-slate-400 text-xs" />
                    <button type="button" className="p-2 border-l bg-slate-50 text-slate-500 hover:bg-slate-100"><Upload className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  type="button" 
                  onClick={() => alert('Added additional transaction split row.')}
                  className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 shadow-sm transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-slate-500 font-bold">Enter Amount</label>
                <input 
                  type="text" 
                  placeholder="Enter Amount" 
                  value={customAmount} 
                  onChange={e => setCustomAmount(e.target.value)} 
                  className="px-4 py-2.5 border rounded-lg outline-none font-bold" 
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setAttachModalOpen(false)}
                className="px-6 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================== SUBMIT SUCCESS MODAL (Screenshot 5) ================================== */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 text-center space-y-6">
            
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Submit Succesfully</h2>

            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-teal-600 flex items-center justify-center shadow-inner border border-emerald-100">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-500 font-semibold px-4">
              Payment screenshot uploaded successfully. Transaction under verification. Final receipt will appear in Transaction History after confirmation.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button 
                onClick={handleBackToMain}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Back to Main Screen
              </button>
              <button 
                onClick={() => setSuccessModalOpen(false)}
                className="w-full py-2.5 border border-teal-650 hover:bg-slate-50 text-teal-655 rounded-xl text-xs font-bold transition-colors bg-white"
              >
                Transaction History
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
    <Suspense fallback={<div className="py-8 text-center text-xs font-bold text-slate-400">Loading payroll disbursal screen...</div>}>
      <PayContent />
    </Suspense>
  )
}
