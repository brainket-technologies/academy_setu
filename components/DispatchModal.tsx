'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
          courier_id: status === 'Order Dispatched' ? courierId : ''
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
                  <input
                    type="text"
                    placeholder="Enter School Name"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
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
