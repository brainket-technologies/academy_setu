import os
import re

file_path = r'c:\Users\fammu\Desktop\academic-app\app\admin\billing\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '{wizardStep === 2 && ('
end_marker = '{/* ================= TRANSACTION HISTORY TAB ================= */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Could not find markers')
    exit(1)

# Extract everything between them
block = content[start_idx:end_idx]

# We want to replace the `grid grid-cols-1 lg:grid-cols-5` with `flex flex-col gap-6 max-w-2xl mx-auto w-full`
# And move the institute header and Plan Summary from the right column to the top and bottom of the single column.

# Wait, instead of complex regex, let's just write the full new block manually since we know exactly what we want.
new_block = """{wizardStep === 2 && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 lg:p-8 relative animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => {
                      setWizardStep(1)
                      if (purchaseMode === 'renew') {
                        setPurchaseMode('new')
                      }
                    }}
                    className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Complete Purchase</h3>
                  
                  <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                    
                    {/* 1. Plan Detail & Institute Header */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Purchasing Plan For</p>
                          <h2 className="text-base font-black leading-tight">{selectedSchool || '—'}</h2>
                        </div>
                        {selectedSegment && (
                          <span className="self-start sm:self-auto px-3 py-1 bg-white/20 text-white border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">{selectedSegment}</span>
                        )}
                      </div>
                      {selectedPlan && (
                        <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedPlan.plan_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">Validity: {selectedPlan.first_billing_duration || 365} days</span>
                              <span className="text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md">{dates.validFrom} → {dates.validTo}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Plan Price</p>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              ₹{getPlanPrice(selectedPlan).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Promo Code */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <Percent className="w-4 h-4 text-indigo-500" /> Promo Code
                      </h3>
                      <div className="relative">
                        <input
                          type="text" readOnly placeholder="Click to select a promo code (optional)"
                          onClick={() => setPromoModalOpen(true)}
                          value={appliedPromo ? `${appliedPromo.code} – ${appliedPromo.discount_type === 'Fixed' ? `₹${appliedPromo.discount_value} Off` : `${appliedPromo.discount_value}% Off`}` : ''}
                          className="w-full px-4 py-3.5 pr-12 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer placeholder:text-slate-400"
                        />
                        <button onClick={() => setPromoModalOpen(true)} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer transition-colors border border-indigo-100/50">
                          <Percent className="w-4 h-4" />
                        </button>
                      </div>
                      {appliedPromo && (
                        <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-[10px]">✓</span> 
                            Promo applied: {appliedPromo.code}
                          </span>
                          <button onClick={() => setAppliedPromo(null)} className="text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">Remove</button>
                        </div>
                      )}
                    </div>

                    {/* 3. Payment Mode */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                        Payment Mode
                      </h3>

                      {/* Mode pill tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['gateway', 'bank', 'upi', 'qr'] as const).map(mode => (
                          <button key={mode} type="button" onClick={() => setPaymentModeOption(mode)}
                            className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${paymentModeOption === mode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/30'}`}
                          >
                            <span className="text-xl leading-none">{mode === 'gateway' ? '💳' : mode === 'bank' ? '🏦' : mode === 'upi' ? '📱' : '📷'}</span>
                            {mode === 'gateway' ? 'Gateway' : mode === 'bank' ? 'Bank' : mode === 'upi' ? 'UPI' : 'QR Code'}
                          </button>
                        ))}
                      </div>

                      <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5">
                        {/* 1. Payment Gateway */}
                        {paymentModeOption === 'gateway' && (
                          <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Razorpay Gateway 1</span>
                              <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full text-[10px] font-bold">Pending</span>
                                <button type="button" onClick={() => handleGenerateLink('Razorpay')} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm">Generate Link</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">PhonePe Gateway 1</span>
                              <button type="button" onClick={() => handleGenerateLink('Phonepe')} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm">Generate Link</button>
                            </div>
                          </div>
                        )}

                        {/* 2. Bank */}
                        {paymentModeOption === 'bank' && (
                          <div className="flex flex-col gap-5">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Bank Account Details</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div><span className="text-slate-400 text-xs font-semibold block mb-0.5">Account No.</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankAccountNo}</span></div>
                                <div><span className="text-slate-400 text-xs font-semibold block mb-0.5">IFSC Code</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankIfsc}</span></div>
                                <div><span className="text-slate-400 text-xs font-semibold block mb-0.5">Holder Name</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankHolderName}</span></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                                <div className="relative">
                                  <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_bank_txn.png')} className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. UPI */}
                        {paymentModeOption === 'upi' && (
                          <div className="flex flex-col gap-5">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">UPI Details</p>
                              <div className="text-sm"><span className="text-slate-400 text-xs font-semibold block mb-0.5">UPI ID</span><span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                                <div className="relative">
                                  <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_upi_txn.png')} className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. QR Code */}
                        {paymentModeOption === 'qr' && (
                          <div className="flex flex-col gap-5">
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm shrink-0">
                                <svg className="w-24 h-24 text-slate-900 dark:text-white" viewBox="0 0 100 100" fill="currentColor">
                                  <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" /><path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" /><path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                                  <rect x="40" y="5" width="10" height="15" /><rect x="55" y="15" width="10" height="10" /><rect x="45" y="40" width="15" height="15" /><rect x="15" y="45" width="10" height="10" /><rect x="75" y="45" width="15" height="10" /><rect x="40" y="70" width="15" height="10" /><rect x="55" y="85" width="10" height="10" /><rect x="75" y="75" width="15" height="15" /><rect x="85" y="60" width="10" height="10" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">Scan QR to Pay</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use any UPI app to scan and pay, then enter the transaction ID below.</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                              </div>
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                                <div className="relative">
                                  <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_qr_txn.png')} className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* 4. Final Summary & Submit */}
                    {selectedPlan && (
                      <div className="bg-slate-800 dark:bg-slate-900/80 rounded-2xl p-6 shadow-md text-white mt-2">
                        <div className="flex flex-col gap-3 text-sm font-semibold mb-5">
                          <div className="flex justify-between text-slate-300">
                            <span>Plan Price</span>
                            <span>₹{getPlanPrice(selectedPlan).toLocaleString('en-IN')}</span>
                          </div>
                          {appliedPromo && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Discount ({appliedPromo.code})</span>
                              <span>− ₹{getPromoDiscountAmount(selectedPlan, appliedPromo).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-black text-xl border-t border-slate-600 pt-4 mt-2">
                            <span>Total Payable</span>
                            <span className="text-indigo-400">
                              ₹{(paymentModeOption === 'gateway' ? getFinalAmount() : parseFloat(manualAmount || '0')).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          form="checkout-form"
                          disabled={submitting}
                          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white font-black text-base rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                          ) : (
                            paymentModeOption === 'gateway' ? '🚀 Submit Request' : '✅ Create Bill'
                          )}
                        </button>

                        <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-4">
                          A request will be created under the <strong className="text-slate-300">Request</strong> menu for review.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
"""

content = content[:start_idx] + new_block + '\n        </div>\n      )}\n\n      ' + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated successfully")
