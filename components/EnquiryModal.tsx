'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Save,
  ShoppingBag,
  School,
  User,
  Phone,
  MapPin,
  Calendar,
  Tag,
  FileText,
  IndianRupee,
  CreditCard,
  Layers,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'

export interface EnquiryRecord {
  id: string
  school_name: string
  address: string
  name: string
  mobile_no: string
  product_name: string
  quantity: number
  enquiry_date: string
  status?: string
  remarks?: string
  price?: number | string
  total_amount?: number | string
  admin_remarks?: string
  size?: string
  color?: string
  payment_status?: string
}

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  enquiry: EnquiryRecord | null
}

const STATUS_OPTIONS = [
  { value: 'Enquired', label: 'Enquired', color: 'bg-amber-500' },
  { value: 'Ready to Pay', label: 'Ready to Pay (To Pay)', color: 'bg-emerald-500' },
  { value: 'Order Generated', label: 'Order Generated / Paid', color: 'bg-indigo-500' },
  { value: 'Closed', label: 'Closed', color: 'bg-slate-500' },
]

export function EnquiryModal({ isOpen, onClose, onSuccess, enquiry }: EnquiryModalProps) {
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [schoolName, setSchoolName] = useState('')
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState<number | string>(1)
  const [enquiryDate, setEnquiryDate] = useState('')
  const [status, setStatus] = useState('Enquired')
  const [remarks, setRemarks] = useState('')

  // New Quotation & Amount editing fields for Admin
  const [price, setPrice] = useState<number | string>(0)
  const [totalAmount, setTotalAmount] = useState<number | string>(0)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')

  // Auxiliary data
  const [schoolsList, setSchoolsList] = useState<any[]>([])
  const [productsList, setProductsList] = useState<any[]>([])

  useEffect(() => {
    // Fetch registered schools
    fetch('/api/admin/institute?simple=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSchoolsList(data.data || [])
        }
      })
      .catch(err => console.error('Failed to load schools', err))

    // Fetch shop products
    fetch('/api/admin/shop/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProductsList(data.data || [])
        }
      })
      .catch(err => console.error('Failed to load products', err))
  }, [])

  useEffect(() => {
    if (enquiry) {
      setSchoolName(enquiry.school_name || '')
      setAddress(enquiry.address || '')
      setName(enquiry.name || '')
      setMobileNo(enquiry.mobile_no || '')
      setProductName(enquiry.product_name || '')
      const q = enquiry.quantity || 1
      setQuantity(q)
      
      const p = enquiry.price !== undefined ? parseFloat(String(enquiry.price)) : 0
      setPrice(p)
      const tot = enquiry.total_amount !== undefined && Number(enquiry.total_amount) > 0
        ? parseFloat(String(enquiry.total_amount))
        : p * Number(q)
      setTotalAmount(tot)

      setAdminRemarks(enquiry.admin_remarks || '')
      setSize(enquiry.size || '')
      setColor(enquiry.color || '')
      
      // Format date for <input type="date" /> (YYYY-MM-DD)
      let dateVal = ''
      if (enquiry.enquiry_date) {
        try {
          const d = new Date(enquiry.enquiry_date)
          if (!isNaN(d.getTime())) {
            dateVal = d.toISOString().split('T')[0]
          } else {
            dateVal = enquiry.enquiry_date
          }
        } catch {
          dateVal = enquiry.enquiry_date
        }
      }
      setEnquiryDate(dateVal || new Date().toISOString().split('T')[0])
      setStatus(enquiry.status || 'Enquired')
      setRemarks(enquiry.remarks || '')
    } else {
      setSchoolName('')
      setAddress('')
      setName('')
      setMobileNo('')
      setProductName('')
      setQuantity(1)
      setPrice(0)
      setTotalAmount(0)
      setAdminRemarks('')
      setSize('')
      setColor('')
      setEnquiryDate(new Date().toISOString().split('T')[0])
      setStatus('Enquired')
      setRemarks('')
    }
  }, [enquiry, isOpen])

  const handleSchoolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchoolName = e.target.value
    setSchoolName(selectedSchoolName)

    const foundSchool = schoolsList.find(s => s.name === selectedSchoolName)
    if (foundSchool) {
      if (foundSchool.address) setAddress(foundSchool.address)
      if (foundSchool.contact_person) setName(foundSchool.contact_person)
      if (foundSchool.mobile_no) setMobileNo(foundSchool.mobile_no)
    }
  }

  // Handle Product select to auto populate sell_price
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selName = e.target.value
    setProductName(selName)
    const matched = productsList.find(p => p.name === selName)
    if (matched) {
      const sellPrice = parseFloat(matched.sell_price || 0)
      setPrice(sellPrice)
      const q = Number(quantity) || 1
      setTotalAmount(sellPrice * q)
    }
  }

  // Auto calculate total when unit price or quantity changes
  const handlePriceChange = (val: string) => {
    setPrice(val)
    const p = parseFloat(val) || 0
    const q = Number(quantity) || 1
    setTotalAmount((p * q).toFixed(2))
  }

  const handleQuantityChange = (val: string) => {
    setQuantity(val)
    const q = Number(val) || 1
    const p = parseFloat(String(price)) || 0
    setTotalAmount((p * q).toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolName.trim()) {
      toast.error('School name is required')
      return
    }
    if (!name.trim()) {
      toast.error('Contact person name is required')
      return
    }
    if (!mobileNo.trim()) {
      toast.error('Mobile number is required')
      return
    }
    if (!productName.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!quantity || Number(quantity) <= 0) {
      toast.error('Quantity must be at least 1')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        school_name: schoolName.trim(),
        address: address.trim(),
        name: name.trim(),
        mobile_no: mobileNo.trim(),
        product_name: productName.trim(),
        quantity: Number(quantity),
        enquiry_date: enquiryDate || new Date().toISOString().split('T')[0],
        status,
        remarks: remarks.trim(),
        price: parseFloat(String(price || 0)),
        total_amount: parseFloat(String(totalAmount || 0)),
        admin_remarks: adminRemarks.trim(),
        size: size.trim(),
        color: color.trim()
      }

      const url = enquiry
        ? `/api/admin/shop/enquiries/${enquiry.id}`
        : '/api/admin/shop/enquiries'
      const method = enquiry ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        toast.success(enquiry ? 'Enquiry & Quotation updated successfully!' : 'Enquiry created successfully!')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to save enquiry')
      }
    } catch (err) {
      console.error('Error saving enquiry:', err)
      toast.error('An error occurred while saving the enquiry')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                {enquiry ? 'Manage Enquiry & Quotation' : 'New Product Enquiry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set price quotation, update status to "Ready to Pay", and manage order dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Status Selection (Highlighted) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Enquiry Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const isSelected = status === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : s.color}`} />
                    {s.label}
                  </button>
                )
              })}
            </div>
            {status === 'Ready to Pay' && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
                ✓ Institute will now see the "Pay Now" button with the total quoted amount on their shop portal.
              </p>
            )}
          </div>

          {/* Pricing & Quotation Details (Editable by Admin) */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
            <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
              Quotation & Amount Settings (Editable by Admin)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Unit Price Quoted (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Amount for Institute to Pay (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-sm font-black text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-xs">₹</span>
                </div>
              </div>

              {/* Admin Remarks / Quotation Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Admin Remarks / Quotation Notes (Visible to Institute)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quoted after 10% institutional discount. Valid for 7 days."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-indigo-500" /> School & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* School Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  School Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter School Name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  />
                  {schoolsList.length > 0 && (
                    <select
                      onChange={handleSchoolSelect}
                      value=""
                      className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      title="Select from registered schools"
                    >
                      <option value="" disabled>Pick</option>
                      {schoolsList.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter Contact Person Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Enter Mobile No."
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Address / Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Campus, Admin Block"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Product & Quantity Information */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" /> Product Details & Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  />
                  {productsList.length > 0 && (
                    <select
                      onChange={handleProductSelect}
                      value=""
                      className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      title="Select product from shop catalogue"
                    >
                      <option value="" disabled>Catalogue</option>
                      {productsList.map((p) => (
                        <option key={p.id || p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 32, XL, Standard"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" /> Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navy Blue, White"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Enquiry Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Enquiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={enquiryDate}
                  onChange={(e) => setEnquiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 cursor-pointer"
                />
              </div>

              {/* Institute Query / Requirement Remarks */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Institute's Query / Requirement Note
                </label>
                <input
                  type="text"
                  placeholder="Institute requirement remarks or questions..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {enquiry ? 'Update Enquiry & Amount' : 'Create Enquiry'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
