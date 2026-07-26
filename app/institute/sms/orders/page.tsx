'use client'

import React, { useState } from 'react'
import { Plus, ShoppingCart, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface OrderRecord {
  id: number
  quantity: number
  amount: number
  tax: string
  total: number
  paidAmount: number
  balance: number
  orderDate: string
  status: 'Delivered' | 'Failed'
}

const CURRENT_ORDERS: OrderRecord[] = [
  { id: 1, quantity: 100, amount: 50.00, tax: '18%', total: 55.00, paidAmount: 55.00, balance: 0.00, orderDate: '15/09/2025 11:00 AM', status: 'Delivered' },
]

const PREVIOUS_ORDERS: OrderRecord[] = [
  { id: 1, quantity: 100, amount: 50.00, tax: '18%', total: 55.00, paidAmount: 55.00, balance: 0.00, orderDate: '15/09/2025 11:00 AM', status: 'Delivered' },
  { id: 2, quantity: 50, amount: 20.00, tax: '18%', total: 23.00, paidAmount: 23.00, balance: 0.00, orderDate: '12/09/2025 11:00 AM', status: 'Failed' },
]

export default function SmsOrdersPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current')

  // Buy SMS Modal
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [buyQuantity, setBuyQuantity] = useState('')
  const rate = 0.15
  const taxPercent = 18

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const qty = parseInt(buyQuantity) || 0
  const subtotal = qty * rate
  const taxAmount = subtotal * (taxPercent / 100)
  const totalPayable = subtotal + taxAmount

  const activeOrders = activeTab === 'current' ? CURRENT_ORDERS : PREVIOUS_ORDERS

  const handleProceedPay = () => {
    if (qty < 100) {
      alert('Minimum purchase quantity is 100 SMS.')
      return
    }
    setBuyModalOpen(false)
    setToastMsg(`Order placed! ₹${totalPayable.toFixed(2)} payment initiated.`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">SMS Order</h1>
          <p className="text-xs text-slate-400">Manage SMS credit purchases and order history</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/institute/sms/new-template"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </Link>
          <button
            onClick={() => setBuyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Buy SMS
          </button>
        </div>
      </div>

      {/* Tabs (Screenshots 3-4) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'current' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          Current Order <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'current' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'}`}>{CURRENT_ORDERS.length.toString().padStart(2, '0')}</span>
        </button>
        <button
          onClick={() => setActiveTab('previous')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'previous' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          Previous Order <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'previous' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'}`}>{PREVIOUS_ORDERS.length.toString().padStart(2, '0')}</span>
        </button>
      </div>

      {/* Order table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">Quantity</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Tax</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Paid Amount</th>
                <th className="px-4 py-4">Balance</th>
                <th className="px-4 py-4 w-44">Order Date</th>
                <th className="px-4 py-4 w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.amount.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.tax}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.total.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.paidAmount.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.balance.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>📅</span><span>{item.orderDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {activeOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Buy SMS Modal (Screenshot 2) ===== */}
      {buyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-5">

            <button
              onClick={() => setBuyModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-3 uppercase tracking-wider">SMS Order</h2>

            {/* Info banners */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-[10px] text-yellow-700 font-bold">
              Minimum purchase quantity is 100 SMS.
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-lg px-4 py-2 text-[10px] text-sky-700 font-bold leading-relaxed">
              Rate is ₹0.15 per SMS for orders of ₹5000 or more. For orders below 5000, the rate is ₹0.18 per SMS.
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Enter SMS Quantity (Min. 100)"
                  value={buyQuantity}
                  onChange={e => setBuyQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                />
                {/* Quick select buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[500, 1000, 2000, 5000].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setBuyQuantity(q.toString())}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded text-[10px] font-black hover:bg-teal-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Rate <span className="text-red-500">*</span></label>
                <div className="px-4 py-2.5 border rounded-lg bg-white font-bold text-slate-800">₹ {rate.toFixed(2)}</div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Tax</label>
                <div className="px-4 py-2.5 bg-slate-100 rounded-lg font-bold text-slate-800">{taxPercent}%</div>
              </div>
            </div>

            <button
              onClick={handleProceedPay}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
            >
              Proceed To Pay {totalPayable > 0 ? `₹${totalPayable.toFixed(2)}` : ''}
            </button>

          </div>
        </div>
      )}

      {/* TOAST */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}
