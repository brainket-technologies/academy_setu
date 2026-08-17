'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  amount: string
  date: string
  txnId: string
  screenshot: string
}

interface DispatchRecord {
  id: string
  school_name: string
  address: string
  name: string
  mobile_no: string
  product_name: string
  product_description?: string
  quantity: number
  size?: string
  product_as?: string
  dispatch_date: string
  status: string
  price?: string | number
  tax_percent?: string | number
  total_amount?: string | number
  courier_name?: string
  courier_id?: string
  transactions?: Transaction[]
}

interface DispatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dispatch: DispatchRecord | null
}

export function DispatchModal({ isOpen, onClose, onSuccess, dispatch }: DispatchModalProps) {
  const [submitting, setSubmitting] = useState(false)

  // School Details
  const [schoolName, setSchoolName] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobileNo, setMobileNo] = useState('')

  // Product Details
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [size, setSize] = useState('')
  const [productAs, setProductAs] = useState<'Gift' | 'Amount'>('Gift')

  // Price Section
  const [price, setPrice] = useState('')
  const [taxPercent, setTaxPercent] = useState('')

  // Status
  const [status, setStatus] = useState('Order Generated')
  const [dispatchDate, setDispatchDate] = useState('')

  // Courier details
  const [courierName, setCourierName] = useState('')
  const [courierId, setCourierId] = useState('')

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Institutes
  const [institutes, setInstitutes] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/institute?simple=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInstitutes(data.data)
      })
      .catch(console.error)
  }, [])

  // Sync data when modal opens or active record changes
  useEffect(() => {
    if (isOpen) {
      if (dispatch) {
        setSchoolName(dispatch.school_name || '')
        setAddress(dispatch.address || '')
        setContactPerson(dispatch.name || '')
        setMobileNo(dispatch.mobile_no || '')
        setProductName(dispatch.product_name || '')
        setProductDescription(dispatch.product_description || '')
        setQuantity(String(dispatch.quantity || ''))
        setSize(dispatch.size || '')
        setProductAs((dispatch.product_as as 'Gift' | 'Amount') || 'Gift')
        setPrice(dispatch.price !== undefined ? String(dispatch.price) : '')
        setTaxPercent(dispatch.tax_percent !== undefined ? String(dispatch.tax_percent) : '')
        setStatus(dispatch.status || 'Order Generated')
        setCourierName(dispatch.courier_name || '')
        setCourierId(dispatch.courier_id || '')
        setTransactions(dispatch.transactions || [])
        if (dispatch.dispatch_date) {
          setDispatchDate(dispatch.dispatch_date.split('T')[0])
        }
      } else {
        // Reset for new creation
        setSchoolName('')
        setAddress('')
        setContactPerson('')
        setMobileNo('')
        setProductName('')
        setProductDescription('')
        setQuantity('')
        setSize('')
        setProductAs('Gift')
        setPrice('')
        setTaxPercent('')
        setStatus('Order Generated')
        setCourierName('')
        setCourierId('')
        setTransactions([])
        setDispatchDate(new Date().toISOString().split('T')[0])
      }
    }
  }, [isOpen, dispatch])

  // Computed total amount
  const totalAmount = React.useMemo(() => {
    const p = parseFloat(price)
    const t = parseFloat(taxPercent)
    if (!isNaN(p)) {
      const taxAmt = !isNaN(t) ? (p * t) / 100 : 0
      return p + taxAmt
    }
    return 0
  }, [price, taxPercent])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolName) return toast.error('School Name is required')
    if (!address) return toast.error('Address is required')
    if (!contactPerson) return toast.error('Contact Person is required')
    if (!mobileNo) return toast.error('Mobile No. is required')
    if (!productName) return toast.error('Product Name is required')
    if (!productDescription) return toast.error('Product Description is required')
    if (!quantity || isNaN(parseInt(quantity))) return toast.error('Valid Quantity is required')

    if (status === 'Order Dispatched') {
      if (!courierName) return toast.error('Courier Name is required when dispatched')
      if (!courierId) return toast.error('Courier ID is required when dispatched')
    }

    setSubmitting(true)
    try {
      const url = dispatch ? `/api/admin/shop/dispatches/${dispatch.id}` : '/api/admin/shop/dispatches'
      const method = dispatch ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName,
          address,
          name: contactPerson,
          mobile_no: mobileNo,
          product_name: productName,
          product_description: productDescription,
          quantity: parseInt(quantity),
          size,
          product_as: productAs,
          dispatch_date: dispatchDate || new Date().toISOString().split('T')[0],
          status,
          price: productAs === 'Amount' ? (parseFloat(price) || 0) : 0,
          tax_percent: productAs === 'Amount' ? (parseFloat(taxPercent) || 0) : 0,
          total_amount: productAs === 'Amount' ? totalAmount : 0,
          courier_name: status === 'Order Dispatched' ? courierName : '',
          courier_id: status === 'Order Dispatched' ? courierId : '',
          transactions
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(dispatch ? 'Dispatch record updated' : 'Dispatch record created')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to save dispatch record')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            {dispatch ? 'Edit Dispatch' : 'Instant Dispatch'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-55 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-6">
            
            {/* School Details */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                School Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={schoolName}
                    onChange={e => {
                      const val = e.target.value
                      setSchoolName(val)
                      const inst = institutes.find(i => i.name === val)
                      if (inst) {
                        setContactPerson(inst.contact_person || '')
                        setMobileNo(inst.mobile_no || '')
                        const fullAddr = [inst.address, inst.district, inst.state].filter(Boolean).join(', ')
                        if (fullAddr) setAddress(fullAddr)
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  >
                    <option value="">Select School</option>
                    {institutes.map(inst => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Person Name"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Mobile No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile No."
                    value={mobileNo}
                    onChange={e => setMobileNo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Product Description"
                    value={productDescription}
                    onChange={e => setProductDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    No. of Product Piece
                  </label>
                  <input
                    type="number"
                    placeholder="Enter Number of Piece"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Size
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Size"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Product As Selector */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center gap-6">
                <span className="text-xs font-bold text-slate-655 dark:text-slate-400">Product as:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={productAs === 'Gift'}
                      onChange={() => setProductAs('Gift')}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    Gift
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={productAs === 'Amount'}
                      onChange={() => setProductAs('Amount')}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    Amount
                  </label>
                </div>
              </div>
            </div>

            {/* Product Price (Conditional) */}
            {productAs === 'Amount' && (
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65 animate-in slide-in-from-top-4 duration-200">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                  Product Price
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Product Price
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Tax (In Percentage)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={taxPercent}
                      onChange={e => setTaxPercent(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Total Amount
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Amount + Tax"
                      value={totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : ''}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status & Date */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Order Generated">Order Generated</option>
                    <option value="Working">Working</option>
                    <option value="Order Dispatched">Order Dispatched</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Dispatch/Update Date
                  </label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={e => setDispatchDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Dispatch Details (Conditional on Order Dispatched Status) */}
            {status === 'Order Dispatched' && (
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65 animate-in slide-in-from-top-4 duration-200">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                  Dispatch Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Courier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Courier Name"
                      value={courierName}
                      onChange={e => setCourierName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                      Courier ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Courier ID"
                      value={courierId}
                      onChange={e => setCourierId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Section */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/65">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Transactions & Screenshots
                </h3>
                <button
                  type="button"
                  onClick={() => setTransactions([...transactions, { amount: '', date: new Date().toISOString().split('T')[0], txnId: '', screenshot: '' }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wide rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Transaction
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  No transactions added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((txn, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl relative">
                      <button
                        type="button"
                        onClick={() => setTransactions(transactions.filter((_, i) => i !== index))}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">Amount</label>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={txn.amount}
                            onChange={(e) => {
                              const newTxns = [...transactions]
                              newTxns[index].amount = e.target.value
                              setTransactions(newTxns)
                            }}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">Transaction ID</label>
                          <input
                            type="text"
                            placeholder="Txn ID"
                            value={txn.txnId}
                            onChange={(e) => {
                              const newTxns = [...transactions]
                              newTxns[index].txnId = e.target.value
                              setTransactions(newTxns)
                            }}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">Date</label>
                          <input
                            type="date"
                            value={txn.date}
                            onChange={(e) => {
                              const newTxns = [...transactions]
                              newTxns[index].date = e.target.value
                              setTransactions(newTxns)
                            }}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">Screenshot</label>
                        <div className="flex items-center gap-3">
                          {txn.screenshot ? (
                            <div className="relative group">
                              <img src={txn.screenshot} alt="Screenshot" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newTxns = [...transactions]
                                  newTxns[index].screenshot = ''
                                  setTransactions(newTxns)
                                }}
                                className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                              <Upload className="w-5 h-5 text-slate-400" />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    // Use local URL for simulation (or base64 if needed)
                                    const url = URL.createObjectURL(file)
                                    const newTxns = [...transactions]
                                    newTxns[index].screenshot = url
                                    setTransactions(newTxns)
                                  }
                                }}
                              />
                            </label>
                          )}
                          {!txn.screenshot && <span className="text-xs text-slate-400 font-medium">Click to upload screenshot</span>}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-750 flex gap-3 justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
