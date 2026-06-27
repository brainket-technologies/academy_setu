'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DispatchFormData {
  id?: string
  school_name: string
  address: string
  name: string
  mobile_no: string
  product_name: string
  product_description?: string
  quantity: string | number
  size?: string
  dispatch_date?: string
  status: string
  price?: string | number
  tax_percent?: string | number
  total_amount?: string | number
}

interface DispatchFormProps {
  initialData?: DispatchFormData
  isEdit?: boolean
}

export function DispatchForm({ initialData, isEdit = false }: DispatchFormProps) {
  const router = useRouter()
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

  // Price Section
  const [price, setPrice] = useState('')
  const [taxPercent, setTaxPercent] = useState('')

  // Status
  const [status, setStatus] = useState('Order Generated')
  const [dispatchDate, setDispatchDate] = useState('')

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setSchoolName(initialData.school_name || '')
      setAddress(initialData.address || '')
      setContactPerson(initialData.name || '')
      setMobileNo(initialData.mobile_no || '')
      setProductName(initialData.product_name || '')
      setProductDescription(initialData.product_description || '')
      setQuantity(String(initialData.quantity || ''))
      setSize(initialData.size || '')
      setPrice(initialData.price !== undefined ? String(initialData.price) : '')
      setTaxPercent(initialData.tax_percent !== undefined ? String(initialData.tax_percent) : '')
      setStatus(initialData.status || 'Order Generated')
      if (initialData.dispatch_date) {
        setDispatchDate(initialData.dispatch_date.split('T')[0])
      }
    }
  }, [initialData])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolName) return toast.error('School Name is required')
    if (!address) return toast.error('Address is required')
    if (!contactPerson) return toast.error('Contact Person is required')
    if (!mobileNo) return toast.error('Mobile No. is required')
    if (!productName) return toast.error('Product Name is required')
    if (!productDescription) return toast.error('Product Description is required')
    if (!quantity || isNaN(parseInt(quantity))) return toast.error('Valid Quantity is required')

    setSubmitting(true)
    try {
      const url = isEdit ? `/api/admin/shop/dispatches/${initialData?.id}` : '/api/admin/shop/dispatches'
      const method = isEdit ? 'PUT' : 'POST'

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
          dispatch_date: dispatchDate || new Date().toISOString().split('T')[0],
          status,
          price: parseFloat(price) || 0,
          tax_percent: parseFloat(taxPercent) || 0,
          total_amount: totalAmount
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'Dispatch record updated' : 'Dispatch record created')
        router.push('/admin/shop/dispatch')
        router.refresh()
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/shop/dispatch')}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100 font-bold">
            {isEdit ? 'Edit Dispatch' : 'Dispatch'}
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* School Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            School Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter School Name"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Person Name"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Mobile No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Mobile No."
                value={mobileNo}
                onChange={e => setMobileNo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Product Name"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Product Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Product Description"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                No. of Product Piece
              </label>
              <input
                type="number"
                placeholder="Enter Number of Piece"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Size
              </label>
              <input
                type="text"
                placeholder="Enter Size"
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200 cursor-pointer"
              >
                <option value="Payment Pending">Payment Pending</option>
                <option value="Order Generated">Order Generated</option>
                <option value="Working">Working</option>
                <option value="Order Dispatched">Order Dispatched</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Dispatch/Update Date
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={e => setDispatchDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Product Price */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Price
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Product Price
              </label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Tax (In Percentage)
              </label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={taxPercent}
                onChange={e => setTaxPercent(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">
                Total Amount
              </label>
              <input
                type="text"
                disabled
                placeholder="Amount + Tax"
                value={totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : ''}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Buttons Panel */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/shop/dispatch')}
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </form>
  )
}
