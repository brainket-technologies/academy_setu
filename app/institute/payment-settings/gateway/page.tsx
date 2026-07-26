'use client'

import React, { useState } from 'react'
import { Save, CheckCircle2, AlertTriangle, Check } from 'lucide-react'

export default function PaymentGatewaySettingsPage() {
  const [gatewayEnabled, setGatewayEnabled] = useState(true)
  const [useLiveKey, setUseLiveKey] = useState('Yes')
  const [paymentKey, setPaymentKey] = useState('')
  const [paymentSecret, setPaymentSecret] = useState('')

  const [addCharge, setAddCharge] = useState(true)
  const [chargePercentage, setChargePercentage] = useState('0')
  const [agreed, setAgreed] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentKey || !paymentSecret) {
      alert('Please enter Razorpay Payment Key and Secret.')
      return
    }
    if (!agreed) {
      alert('Please agree to the live key terms and conditions.')
      return
    }

    setToastMsg('Payment Gateway credentials updated!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Payment Gateway Settings</h1>
        <p className="text-xs text-slate-400">Configure operational payment gateways and surcharges</p>
      </div>

      {/* Configuration Form Card (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">
        
        {/* Toggle switch */}
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-xs font-black text-slate-905 uppercase tracking-wider">Payment Gateway</span>
          <button 
            type="button" 
            onClick={() => setGatewayEnabled(!gatewayEnabled)}
            className={`w-9 h-5 rounded-full relative transition-colors ${gatewayEnabled ? 'bg-teal-600' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${gatewayEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
          </button>
        </div>

        {/* Razorpay configurations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider">Razor Pay</h3>
            <span className="px-3 py-1 rounded bg-red-50 text-red-500 font-bold text-[10px] border border-red-100">
              Note: Don't use the Test Key on LIVE, you'll be fully responsive for any wrong payment/transaction.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Are you using LIVE key?</label>
              <div className="flex items-center gap-4 mt-2 font-bold text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="useLiveKey" value="Yes" checked={useLiveKey === 'Yes'} onChange={e => setUseLiveKey(e.target.value)} className="accent-teal-600 w-4 h-4" />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="useLiveKey" value="No" checked={useLiveKey === 'No'} onChange={e => setUseLiveKey(e.target.value)} className="accent-teal-600 w-4 h-4" />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Razorpay Payment Key *</label>
              <input 
                type="text" 
                placeholder="Enter Payment Key" 
                value={paymentKey} 
                onChange={e => setPaymentKey(e.target.value)} 
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Razorpay Payment Secret *</label>
              <input 
                type="text" 
                placeholder="Enter Payment Secret" 
                value={paymentSecret} 
                onChange={e => setPaymentSecret(e.target.value)} 
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" 
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Payment Gateway Charges */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider">Payment Gateway Charges</h3>
          
          <div className="flex items-center gap-4 bg-slate-50 p-4 border rounded-2xl">
            <button 
              type="button" 
              onClick={() => setAddCharge(!addCharge)}
              className={`w-9 h-5 rounded-full relative transition-colors ${addCharge ? 'bg-teal-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${addCharge ? 'left-4.5' : 'left-0.5'}`}></div>
            </button>
            <span className="text-xs font-bold text-slate-700">Do you want to add payment gateway charge on student?</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              How many percentage do you want to charge when a student pay through the payment gateway?
              <br />
              <span className="text-[10px] text-slate-400 font-medium">(Usually the payment gateway companies charge 2-3%, it'll be additionally added with the fees)(in %)</span>
            </p>
            <div className="w-full md:w-32">
              <input 
                type="number" 
                value={chargePercentage} 
                onChange={e => setChargePercentage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-center font-black text-slate-900 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-4">
            <input 
              type="checkbox" 
              id="agreeCheck" 
              checked={agreed} 
              onChange={e => setAgreed(e.target.checked)} 
              className="accent-teal-600 w-4 h-4 rounded" 
            />
            <label htmlFor="agreeCheck" className="text-xs text-slate-650 cursor-pointer font-bold">
              I agree that I'm using the <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded uppercase font-black">LIVE</span> key and I'm fully responsible for all the transactions.
            </label>
          </div>
        </div>

        {/* Proceed Action Button */}
        <div className="flex justify-center pt-4">
          <button 
            type="button" 
            onClick={handleProceed}
            className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            Proceed
          </button>
        </div>

        <hr className="border-slate-200" />

        {/* Verification Status Progress timeline (Screenshot 3) */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider">Verification Status</h3>
          
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-3xl mx-auto">
            <div className="relative flex items-center justify-between">
              
              {/* Connector Horizontal Lines */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
              <div className="absolute left-0 w-1/2 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0"></div>

              {/* Node 1 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">Verification Send</span>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-[10px] text-slate-450 font-bold">Wed, 2 Jan 2026</span>
              </div>

              {/* Node 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">Under Process</span>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-[10px] text-slate-450 font-bold">Wed, 2 Jan 2026</span>
              </div>

              {/* Node 3 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Completed</span>
                <div className="w-6 h-6 rounded-full bg-slate-300 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                </div>
                <span className="text-[10px] text-slate-450 font-bold">Thu, 3 Jan 2026</span>
              </div>

            </div>
          </div>
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
