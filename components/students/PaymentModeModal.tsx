'use client'

import React, { useState } from 'react'
import { X, CheckSquare, Square, CheckCircle2, Percent, Check, Download, Share2, Receipt } from 'lucide-react'

interface PaymentModeModalProps {
  onClose: () => void;
}

export default function PaymentModeModal({ onClose }: PaymentModeModalProps) {
  const [paymentMode, setPaymentMode] = useState('Online Manual')
  const [accountType, setAccountType] = useState('School Account')
  
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const [submitStep, setSubmitStep] = useState<'form' | 'confirm' | 'success'>('form')

  // Dummy cart data based on screenshot
  const cartData = [
    {
      month: 'Jan 2026',
      checked: true,
      items: [
        { id: 1, type: 'Class Fee', amount: 1000, lateFee: 20, total: 1020 },
        { id: 2, type: 'Hostel Fee', amount: 1000, lateFee: 0, total: 1000 },
      ]
    },
    {
      month: 'Feb 2026',
      checked: true,
      items: [
        { id: 3, type: 'Registration Fee', amount: 1000, lateFee: 20, total: 1020 },
        { id: 4, type: 'Admission Fee', amount: 1000, lateFee: 0, total: 1000 },
        { id: 5, type: 'Class Fee', amount: 1000, lateFee: 0, total: 1000 },
        { id: 6, type: 'Library Fee', amount: 1000, lateFee: 0, total: 1000 },
        { id: 7, type: 'Exam Fee', amount: 1000, lateFee: 0, total: 1000 },
        { id: 8, type: 'Hostel Fee', amount: 1000, lateFee: 0, total: 1000 },
        { id: 9, type: 'Extra Curr. Fee', amount: 1000, lateFee: 0, total: 1000 },
      ]
    }
  ]

  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const grandTotal = cartData.reduce((sum, group) => {
    return group.checked ? sum + calculateSubtotal(group.items) : sum
  }, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col md:flex-row relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* Close Button Top Right (Overlay) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Payment Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">Payment Mode</h2>
           
           {/* Radio Buttons */}
           <div className="flex items-center gap-8 mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMode === 'Online Manual' ? 'border-teal-600' : 'border-slate-400'}`}>
                    {paymentMode === 'Online Manual' && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">Online Manual</span>
                 <input type="radio" className="hidden" checked={paymentMode === 'Online Manual'} onChange={() => setPaymentMode('Online Manual')} />
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMode === 'Offline' ? 'border-teal-600' : 'border-slate-400'}`}>
                    {paymentMode === 'Offline' && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">Offline</span>
                 <input type="radio" className="hidden" checked={paymentMode === 'Offline'} onChange={() => setPaymentMode('Offline')} />
              </label>
           </div>

           {/* Dynamic Fields based on Payment Mode */}
           {paymentMode === 'Online Manual' ? (
             <>
               {/* Account Type */}
               <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Type</label>
                  <select 
                    value={accountType} 
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full max-w-[280px] p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                     <option>School Account</option>
                     <option>Trust Account</option>
                  </select>
               </div>

               {/* Bank Details Divider */}
               <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Bank Details</h3>
                  <div className="h-px bg-slate-300 dark:bg-slate-700 w-full"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account No.</label>
                     <input type="text" value="1234567890" readOnly className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">IFSC Code</label>
                     <input type="text" value="ABCD1234567890" readOnly className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none" />
                  </div>
                  <div className="md:col-span-1">
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Holder Name</label>
                     <input type="text" value="Ashok Kumar" readOnly className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none" />
                  </div>
               </div>

               {/* UPI Payment Divider */}
               <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">UPI Payment</h3>
                  <div className="h-px bg-slate-300 dark:bg-slate-700 w-full"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 items-end">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">UPI ID</label>
                     <input type="text" value="abcd123@okbank" readOnly className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">QR Code</label>
                     <button className="text-teal-600 font-bold hover:underline">Generate QR Code</button>
                  </div>
               </div>
             </>
           ) : (
             <>
               {/* Offline Mode Fields */}
               <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Receiver Name</label>
                  <select 
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                     <option>Select a Name</option>
                  </select>
               </div>
               
               <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date</label>
                     <input type="text" placeholder="DD-MM-YYYY" className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time</label>
                     <input type="text" placeholder="HH:MM" className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
               </div>
               
               <div className="mb-12">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea rows={4} placeholder="Enter Description" className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
               </div>
             </>
           )}

           <div className="flex items-center gap-4">
              <button onClick={onClose} className="px-10 py-3 border border-teal-600 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-colors">Cancel</button>
              <button onClick={() => setSubmitStep('confirm')} className="px-10 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">Submit</button>
           </div>
        </div>

        {/* RIGHT COLUMN: Cart Summary */}
        <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto">
           <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {cartData.map((group, idx) => (
                  <div key={idx} className="mb-8">
                     {/* Group Header (Month) */}
                     <div className="flex items-center gap-3 mb-4">
                        {group.checked ? (
                          <CheckSquare className="w-5 h-5 text-teal-600 cursor-pointer" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 cursor-pointer" />
                        )}
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{group.month}</h4>
                        <div className="flex-1 h-px bg-slate-800 dark:bg-slate-100 ml-2" />
                     </div>

                     {/* Table */}
                     <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
                        <table className="w-full text-[13px] text-center">
                           <thead>
                              <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                 <th className="py-3 px-2 font-bold text-slate-700 text-left">Fee Type</th>
                                 <th className="py-3 px-2 font-bold text-slate-700">Amount</th>
                                 <th className="py-3 px-2 font-bold text-slate-700">Late Fee</th>
                                 <th className="py-3 px-2 font-bold text-slate-700">Total Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {group.items.map((item, iIdx) => (
                                <tr key={iIdx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 transition-colors">
                                   <td className="py-3 px-2 text-left flex items-center gap-2">
                                      <button className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center hover:bg-slate-100">
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                      <span className="font-semibold text-slate-600">{item.type}</span>
                                   </td>
                                   <td className="py-3 px-2 text-slate-600">{item.amount}/-</td>
                                   <td className="py-3 px-2 text-slate-600">{item.lateFee}/-</td>
                                   <td className="py-3 px-2 text-slate-600 font-semibold">{item.total}/-</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Subtotal */}
                     <div className="flex justify-end p-3 border border-slate-200 border-t-0 rounded-b-xl bg-slate-50/50 -mt-2">
                        <div className="flex gap-6 items-center">
                           <span className="font-bold text-slate-800">Final Amount</span>
                           <span className="font-black text-slate-800 w-20 text-center">{calculateSubtotal(group.items)}/-</span>
                        </div>
                     </div>
                  </div>
                ))}
              </div>

              {/* Promo Code & Grand Total */}
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-4 mb-6">
                    <label 
                      onClick={(e) => {
                         e.preventDefault();
                         if (!appliedPromo) setShowPromoModal(true);
                         else setAppliedPromo(null);
                      }} 
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                       {appliedPromo ? (
                         <CheckSquare className="w-5 h-5 text-teal-600" />
                       ) : (
                         <Square className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                       )}
                       <span className="font-bold text-slate-700 dark:text-slate-300">Apply Promo Code</span>
                    </label>

                    {appliedPromo && (
                      <div className="flex items-center gap-2 px-4 py-1.5 border border-pink-200 bg-white rounded-lg shadow-sm">
                         <span className="text-pink-600 font-bold text-sm">{appliedPromo}</span>
                         <Percent className="w-4 h-4 text-teal-600 ml-2" />
                      </div>
                    )}
                 </div>

                 <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-center items-center gap-4">
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">Grand Total</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">{grandTotal}/-</span>
                 </div>
              </div>

           </div>
        </div>
        
        {/* PROMO CODE MODAL */}
        {showPromoModal && (
           <PromoCodeSelectionModal 
              onClose={() => setShowPromoModal(false)} 
              onApply={(code) => {
                 setAppliedPromo(code)
                 setShowPromoModal(false)
              }} 
           />
        )}
        
        {/* CONFIRMATION & SUCCESS MODALS (OVERLAYS) */}
        {(submitStep === 'confirm' || submitStep === 'success') && (
           <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in">
              {submitStep === 'confirm' && (
                 <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in-95">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Are your Sure ?</h2>
                    <div className="flex items-center gap-6">
                       <button onClick={() => setSubmitStep('success')} className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900">
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Check className="w-4 h-4" /></div>
                          Yes
                       </button>
                       <button onClick={() => setSubmitStep('form')} className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600"><X className="w-4 h-4" /></div>
                          No
                       </button>
                    </div>
                 </div>
              )}
              
              {submitStep === 'success' && (
                 <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Completed</h2>
                    <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white mb-6">
                       <Check className="w-12 h-12" />
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <div className="flex items-center justify-center gap-3 w-full mb-8">
                       <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-teal-600 hover:bg-slate-50">
                          <Receipt className="w-3 h-3" /> Fee Receipt
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-teal-600 hover:bg-slate-50">
                          <Download className="w-3 h-3" /> Download
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-amber-500 hover:bg-slate-50">
                          <Share2 className="w-3 h-3" /> Share
                       </button>
                    </div>
                    <button onClick={onClose} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
                       Continue
                    </button>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  )
}

function PromoCodeSelectionModal({ onClose, onApply }: { onClose: () => void, onApply: (code: string) => void }) {
  const [activeTab, setActiveTab] = useState<'amount' | 'percentage'>('amount')

  const amountPromos = [
    { name: 'Promo Code Name', desc: 'Admission Time (All Fee)', amount: 'Amount 1000/- Off', color: 'bg-emerald-600' },
    { name: 'Promo Code Name', desc: 'Fee Collection Time (Class Fee)', amount: 'Amount 1000/- Off', color: 'bg-fuchsia-600' },
    { name: 'Promo Code Name', desc: 'Admission Time (Admission Fee)', amount: 'Amount 1000/- Off', color: 'bg-violet-600' },
    { name: 'Promo Code Name', desc: 'Fee Collection Time (Extra Curriculum Fee)', amount: 'Amount 1000/- Off', color: 'bg-red-600' },
    { name: 'Promo Code Name', desc: 'Fee Collection Time (Transportation Fee)', amount: 'Amount 1000/- Off', color: 'bg-teal-700' },
    { name: 'Promo Code Name', desc: 'Admission Time (Registration Fee)', amount: 'Amount 1000/- Off', color: 'bg-lime-600' },
  ]
  
  const percentagePromos = [
    { name: 'Special Promo', desc: 'Admission Time (All Fee)', amount: '10% Off', color: 'bg-indigo-600' },
    { name: 'Summer Promo', desc: 'Fee Collection Time (Class Fee)', amount: '15% Off', color: 'bg-amber-500' },
    { name: 'Welcome Promo', desc: 'Admission Time (Admission Fee)', amount: '20% Off', color: 'bg-pink-600' },
    { name: 'Sports Promo', desc: 'Fee Collection Time (Extra Curriculum Fee)', amount: '5% Off', color: 'bg-blue-600' },
  ]

  const currentPromos = activeTab === 'amount' ? amountPromos : percentagePromos

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
       <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
          <button onClick={onClose} className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
             <X className="w-4 h-4" />
          </button>
          
          {/* Tabs */}
          <div className="flex items-center justify-center gap-4 mb-8">
             <button 
                onClick={() => setActiveTab('amount')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === 'amount' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
                Amount Discount 
                <span className={activeTab === 'amount' ? 'bg-white text-indigo-600 px-2 py-0.5 rounded text-xs' : 'border border-slate-200 text-indigo-600 px-2 py-0.5 rounded text-xs'}>06</span>
             </button>
             <button 
                onClick={() => setActiveTab('percentage')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === 'percentage' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
                Percentage Discount 
                <span className={activeTab === 'percentage' ? 'bg-white text-pink-500 px-2 py-0.5 rounded text-xs' : 'border border-slate-200 text-pink-500 px-2 py-0.5 rounded text-xs'}>04</span>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[300px] content-start">
             {currentPromos.map((p, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden flex bg-white hover:shadow-lg transition-shadow">
                   <div className={`${p.color} p-4 flex items-center justify-center text-white shrink-0`}>
                      <Percent className="w-8 h-8" />
                   </div>
                   <div className="p-4 flex-1 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-500">{p.desc.split('(')[0]}</p>
                      <h4 className={`text-sm font-bold ${p.color.replace('bg-', 'text-')}`}>{p.name}</h4>
                      <p className="text-[10px] text-slate-400">({p.desc.split('(')[1]}</p>
                      <div className="flex items-center justify-between mt-2">
                         <span className="text-[10px] font-bold text-slate-600">{p.amount}</span>
                         <button onClick={() => onApply(p.name)} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center">
                            Apply <span className="ml-1">→</span>
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}
