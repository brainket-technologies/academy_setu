'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Trash2, CheckCircle2, X, Landmark, Plus, Upload } from 'lucide-react'

interface ReceiverRecord {
  id: number
  accountType: string
  receiverRole: string
  receiverName: string
  walletBalance: string
  receiveDate: string
}

const INITIAL_RECEIVERS: ReceiverRecord[] = [
  { id: 1, accountType: 'School Bank Account', receiverRole: 'Employee', receiverName: 'Abhay Singh', walletBalance: '25000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 2, accountType: 'Other Bank Account', receiverRole: 'Employee', receiverName: 'Ashok Singh', walletBalance: '14000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 3, accountType: 'Other Bank Account', receiverRole: 'Teacher', receiverName: 'Priya Kumari', walletBalance: '25000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 4, accountType: 'Other Bank Account', receiverRole: 'Employee', receiverName: 'Sneha Pandey', walletBalance: '14000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 5, accountType: 'Other Bank Account', receiverRole: 'Teacher', receiverName: 'Alok Tiwari', walletBalance: '8000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 6, accountType: 'Other Bank Account', receiverRole: 'Employee', receiverName: 'Divya Prajapati', walletBalance: '25000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 7, accountType: 'Other Bank Account', receiverRole: 'Teacher', receiverName: 'Garima', walletBalance: '14000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 8, accountType: 'Other Bank Account', receiverRole: 'Teacher', receiverName: 'Rahul', walletBalance: '8000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 9, accountType: 'Other Bank Account', receiverRole: 'Employee', receiverName: 'Anamika', walletBalance: '25000/-', receiveDate: '15/09/2025 11:00 AM' },
  { id: 10, accountType: 'Other Bank Account', receiverRole: 'Employee', receiverName: 'Tanu', walletBalance: '14000/-', receiveDate: '15/09/2025 11:00 AM' },
]

export default function OnlineManualPaymentPage() {
  const [receivers, setReceivers] = useState<ReceiverRecord[]>(INITIAL_RECEIVERS)
  const [searchQuery, setSearchQuery] = useState('')

  // Toggle & configurations
  const [receiveViaApp, setReceiveViaApp] = useState(true)
  const [selectedReceiver, setSelectedReceiver] = useState('')

  // Modal Dialog states
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [addReceiverModalOpen, setAddReceiverModalOpen] = useState(false)
  const [activeReceiver, setActiveReceiver] = useState<ReceiverRecord | null>(null)

  // Withdraw Form fields (Screenshot 5)
  const [withdrawDate, setWithdrawDate] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawDescription, setWithdrawDescription] = useState('')

  // Add Receiver Form fields (Screenshot 4)
  const [addAccountType, setAddAccountType] = useState('')
  const [addVerifierRole, setAddVerifierRole] = useState('')
  const [addVerifierName, setAddVerifierName] = useState('')
  const [addHolderName, setAddHolderName] = useState('')
  const [addAccountNo, setAddAccountNo] = useState('')
  const [addIfsc, setAddIfsc] = useState('')
  const [addBankName, setAddBankName] = useState('')
  const [addUpiId, setAddUpiId] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('manual_receivers')
    if (saved) {
      try {
        setReceivers(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('manual_receivers', JSON.stringify(INITIAL_RECEIVERS))
    }
  }, [])

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!addAccountType || !addVerifierRole || !addVerifierName) {
      alert('Please fill in Account Type, Verifier Role, and Verifier Name.')
      return
    }

    const payload: ReceiverRecord = {
      id: Date.now(),
      accountType: addAccountType,
      receiverRole: addVerifierRole,
      receiverName: addVerifierName,
      walletBalance: '0/-',
      receiveDate: new Date().toLocaleDateString('en-GB') + ' 11:00 AM'
    }

    const updated = [...receivers, payload]
    setReceivers(updated)
    localStorage.setItem('manual_receivers', JSON.stringify(updated))
    
    setToastMsg(`Added verifier receiver: ${addVerifierName}`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)

    // Clear form states
    setAddAccountType('')
    setAddVerifierRole('')
    setAddVerifierName('')
    setAddHolderName('')
    setAddAccountNo('')
    setAddIfsc('')
    setAddBankName('')
    setAddUpiId('')
    setAddReceiverModalOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this manual receiver log?')) {
      const updated = receivers.filter(r => r.id !== id)
      setReceivers(updated)
      localStorage.setItem('manual_receivers', JSON.stringify(updated))
      setToastMsg('Receiver entry deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawDate || !withdrawAmount) {
      alert('Please fill in Date and Amount.')
      return
    }

    if (activeReceiver) {
      const currentBal = parseInt(activeReceiver.walletBalance.replace(/[^\d]/g, '')) || 0
      const subVal = parseInt(withdrawAmount) || 0
      if (subVal > currentBal) {
        alert('Insufficient wallet balance to withdraw.')
        return
      }

      const updated = receivers.map(r => {
        if (r.id === activeReceiver.id) {
          return {
            ...r,
            walletBalance: `${(currentBal - subVal).toLocaleString()}/-`
          }
        }
        return r
      })

      setReceivers(updated)
      localStorage.setItem('manual_receivers', JSON.stringify(updated))
      setToastMsg(`Successfully withdrew ${subVal.toLocaleString()}/-!`)
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }

    setWithdrawModalOpen(false)
    setWithdrawDate('')
    setWithdrawAmount('')
    setWithdrawDescription('')
  }

  const filtered = receivers.filter(r => 
    r.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.receiverRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Online Manual Payment Settings</h1>
          <p className="text-xs text-slate-400 font-medium">Verify online payment receipts and wallet balances</p>
        </div>
        <button 
          onClick={() => setAddReceiverModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Receiver
        </button>
      </div>

      {/* Main Settings Card (Screenshot 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Toggle Switch */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => setReceiveViaApp(!receiveViaApp)}
              className={`w-9 h-5 rounded-full relative transition-colors ${receiveViaApp ? 'bg-teal-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${receiveViaApp ? 'left-4.5' : 'left-0.5'}`}></div>
            </button>
            <span className="text-xs font-black text-[#1b3a60]">Are You Receive Fee Payment via student/parent Mobile App?</span>
          </div>
          <span className="text-[10px] text-red-500 font-bold ml-13">Manual Verification & Payment Review Required.</span>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-1.5 max-w-sm text-xs font-semibold text-slate-700">
          <label className="text-slate-500 font-bold">Select Receiver *</label>
          <select value={selectedReceiver} onChange={e => setSelectedReceiver(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
            <option value="">Select an option</option>
            <option value="School Bank Account">School Bank Account</option>
            <option value="Receiver 1">Receiver 1</option>
            <option value="Receiver 2">Receiver 2</option>
            <option value="Receiver 3">Receiver 3</option>
          </select>
        </div>

        {/* Form buttons */}
        <div className="flex justify-start border-t pt-4">
          <button 
            type="button"
            onClick={() => alert('Online manual collections verifier confirmed successfully!')}
            className="px-8 py-2 bg-teal-650 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>

      {/* Manual Receiver Data (Screenshot 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-[#1b3a60]">Manual Receiver Data</h3>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search by receiver name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold w-full bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Account Type</th>
                <th className="px-4 py-4">Receiver Role</th>
                <th className="px-4 py-4 text-left">Receiver Name</th>
                <th className="px-4 py-4">Wallet Balance</th>
                <th className="px-4 py-4">Receive Date</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-700">{item.accountType}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.receiverRole}</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.receiverName}</td>
                  <td className="px-4 py-3.5 font-black text-teal-650">{item.walletBalance}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.receiveDate}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => alert('Editing verification details...')}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Log"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Configuration"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          setActiveReceiver(item)
                          setWithdrawModalOpen(true)
                        }}
                        className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 transition-colors"
                        title="Withdraw Wallet Balance"
                      >
                        <Landmark className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No manual receivers logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================== WITHDRAW DIALOG MODAL (Screenshot 5) ================================== */}
      {withdrawModalOpen && activeReceiver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-6 space-y-6">
            <button 
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-black text-[#1b3a60] border-b pb-2 uppercase tracking-wider">
              Withdraw — {activeReceiver.receiverName}
            </h3>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Date *</label>
                <input 
                  type="date" 
                  value={withdrawDate} 
                  onChange={e => setWithdrawDate(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Amount *</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={withdrawAmount} 
                  onChange={e => setWithdrawAmount(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description</label>
                <textarea 
                  placeholder="Enter Description" 
                  value={withdrawDescription} 
                  onChange={e => setWithdrawDescription(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none h-20 resize-none" 
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="submit"
                  className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  Amount Withdraw
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================================== ADD NEW RECEIVER MODAL (Screenshot 4) ================================== */}
      {addReceiverModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-6">
            
            <button 
              onClick={() => setAddReceiverModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 uppercase tracking-wider">
              Add New Receiver
            </h2>

            <form onSubmit={handleAddNewSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Account Type *</label>
                  <select value={addAccountType} onChange={e => setAddAccountType(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                    <option value="">Select an option</option>
                    <option value="School Bank Account">School Bank Account</option>
                    <option value="Other Bank Account">Other Bank Account</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Payment Verifier Role *</label>
                  <select value={addVerifierRole} onChange={e => setAddVerifierRole(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                    <option value="">Select a Role</option>
                    <option value="Employee">Employee</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Verifier Name *</label>
                  <select value={addVerifierName} onChange={e => setAddVerifierName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                    <option value="">Select a Name</option>
                    <option value="Abhay Singh">Abhay Singh</option>
                    <option value="Ashok Singh">Ashok Singh</option>
                    <option value="Priya Kumari">Priya Kumari</option>
                    <option value="Rahul Rawat">Rahul Rawat</option>
                  </select>
                </div>
              </div>

              {/* Bank Details section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 border-b pb-1">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Account Holder Name</label>
                    <input type="text" placeholder="Enter Account Holder Name" value={addHolderName} onChange={e => setAddHolderName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Bank Account No.</label>
                    <input type="text" placeholder="Enter Bank Account No." value={addAccountNo} onChange={e => setAddAccountNo(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">IFSC Code</label>
                    <input type="text" placeholder="Enter IFSC Code" value={addIfsc} onChange={e => setAddIfsc(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Bank Name</label>
                    <input type="text" placeholder="Enter Bank Name" value={addBankName} onChange={e => setAddBankName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" />
                  </div>
                </div>
              </div>

              {/* UPI Payment Details section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 border-b pb-1">UPI Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">UPI ID</label>
                    <input type="text" placeholder="Enter UPI ID" value={addUpiId} onChange={e => setAddUpiId(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold animate-none" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">QR Code</label>
                    <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                      <input type="text" placeholder="Upload QR" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                      <button type="button" className="p-2.5 border-l bg-slate-100 text-slate-500 hover:bg-slate-200"><Upload className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-center pt-4">
                <button 
                  type="submit"
                  className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  Add Receiver
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
