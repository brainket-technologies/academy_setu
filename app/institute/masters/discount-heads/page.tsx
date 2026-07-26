'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Search, Filter } from 'lucide-react'

interface DiscountHeadRecord {
  id: number
  name: string
  promoCode: string
  applicableType: string
  continuity: 'One Time' | 'Every Month'
  valueType: 'Fixed amount' | 'Percentage'
  amount: string
  percentage: string
  startDate: string
  expireDate: string
  createdAt: string
  deleted: boolean
}

const INITIAL_DISCOUNTS: DiscountHeadRecord[] = [
  { id: 1, name: 'Holi Discount', promoCode: 'Holi 20', applicableType: 'Admission Time', continuity: 'One Time', valueType: 'Percentage', amount: '—', percentage: '25%', startDate: '01/01/2026', expireDate: '28/02/2026', createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 2, name: 'Monthly Concession', promoCode: 'Every Month', applicableType: 'Fee Collection', continuity: 'Every Month', valueType: 'Fixed amount', amount: '500', percentage: '—', startDate: '15/01/2025', expireDate: '10/02/2027', createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 3, name: 'Early Bird', promoCode: 'One Time', applicableType: 'Fee Collection', continuity: 'One Time', valueType: 'Percentage', amount: '—', percentage: '2%', startDate: '01/09/2025', expireDate: '10/10/2026', createdAt: '15/09/2025\n11:00 AM', deleted: false },
]

export default function DiscountHeadsPage() {
  const [discounts, setDiscounts] = useState<DiscountHeadRecord[]>(INITIAL_DISCOUNTS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountHeadRecord | null>(null)

  // Form State
  const [discountName, setDiscountName] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [valueType, setValueType] = useState<'Fixed amount' | 'Percentage'>('Fixed amount')
  const [discountAmountVal, setDiscountAmountVal] = useState('')
  const [applicableType, setApplicableType] = useState('Admission Time')
  const [continuity, setContinuity] = useState<'One Time' | 'Every Month'>('One Time')
  const [applicableFee, setApplicableFee] = useState('All Fee')
  const [startDate, setStartDate] = useState('')
  const [expireDate, setExpireDate] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_masters_discounts')
    if (saved) {
      try {
        setDiscounts(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_discounts', JSON.stringify(INITIAL_DISCOUNTS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!discountName || !promoCode || !discountAmountVal) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newDiscount: DiscountHeadRecord = {
      id: Date.now(),
      name: discountName.trim(),
      promoCode: promoCode.trim(),
      applicableType,
      continuity,
      valueType,
      amount: valueType === 'Fixed amount' ? discountAmountVal : '—',
      percentage: valueType === 'Percentage' ? discountAmountVal + '%' : '—',
      startDate: startDate || '—',
      expireDate: expireDate || '—',
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }

    const updated = [newDiscount, ...discounts]
    setDiscounts(updated)
    localStorage.setItem('school_masters_discounts', JSON.stringify(updated))

    // Reset Form
    setDiscountName('')
    setPromoCode('')
    setDiscountAmountVal('')
    setStartDate('')
    setExpireDate('')
    setAddModalOpen(false)
    showToast('Discount Head added successfully!')
  }

  const handleOpenEdit = (item: DiscountHeadRecord) => {
    setSelectedDiscount(item)
    setDiscountName(item.name)
    setPromoCode(item.promoCode)
    setValueType(item.valueType)
    setDiscountAmountVal(item.valueType === 'Fixed amount' ? item.amount : item.percentage.replace('%', ''))
    setApplicableType(item.applicableType)
    setContinuity(item.continuity)
    setStartDate(item.startDate === '—' ? '' : item.startDate)
    setExpireDate(item.expireDate === '—' ? '' : item.expireDate)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDiscount || !discountName || !promoCode) return

    const updated = discounts.map(d => {
      if (d.id === selectedDiscount.id) {
        return {
          ...d,
          name: discountName.trim(),
          promoCode: promoCode.trim(),
          applicableType,
          continuity,
          valueType,
          amount: valueType === 'Fixed amount' ? discountAmountVal : '—',
          percentage: valueType === 'Percentage' ? discountAmountVal + '%' : '—',
          startDate: startDate || '—',
          expireDate: expireDate || '—'
        }
      }
      return d
    })

    setDiscounts(updated)
    localStorage.setItem('school_masters_discounts', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedDiscount(null)
    setDiscountName('')
    setPromoCode('')
    setDiscountAmountVal('')
    showToast('Discount Head updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = discounts.map(d => d.id === id ? { ...d, deleted: true } : d)
    setDiscounts(updated)
    localStorage.setItem('school_masters_discounts', JSON.stringify(updated))
    showToast('Discount Head moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = discounts.map(d => d.id === id ? { ...d, deleted: false } : d)
    setDiscounts(updated)
    localStorage.setItem('school_masters_discounts', JSON.stringify(updated))
    showToast('Discount Head restored successfully!')
  }

  const tabCountAll = discounts.filter(d => !d.deleted).length
  const tabCountDeleted = discounts.filter(d => d.deleted).length

  // Filter logic
  const filtered = discounts.filter(d => {
    const matchesTab = activeTab === 'All' ? !d.deleted : d.deleted
    const matchesSearch = searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const matchesType = typeFilter ? d.valueType === typeFilter : true
    return matchesTab && matchesSearch && matchesType
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Discount Heads</h1>
        <button
          onClick={() => {
            setDiscountName('')
            setPromoCode('')
            setDiscountAmountVal('')
            setStartDate('')
            setExpireDate('')
            setAddModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Discount Head</span>
        </button>
      </div>

      {/* Tabs and Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('All')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
          >
            All <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'All' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountAll).padStart(2, '0')}</span>
          </button>
          <button
            onClick={() => setActiveTab('Deleted')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'Deleted' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
          >
            Deleted <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'Deleted' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountDeleted).padStart(2, '0')}</span>
          </button>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Toggleable Filters Panel */}
      {showFilters && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Search Discount / Code</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or promo code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Discount Value Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
            >
              <option value="">All Types</option>
              <option value="Fixed amount">Fixed Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Discount Name</th>
                <th className="px-3 py-4">Promo Code</th>
                <th className="px-3 py-4">continuity</th>
                <th className="px-3 py-4">Amount / %</th>
                <th className="px-3 py-4">Start Date</th>
                <th className="px-3 py-4">Expire Date</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.name}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold text-[10px] tracking-wide bg-slate-50 py-0.5 rounded border inline-block mt-3">{item.promoCode}</td>
                  <td className="px-3 py-3.5 text-slate-500">{item.continuity}</td>
                  <td className="px-3 py-3.5 font-bold text-teal-600">
                    {item.valueType === 'Percentage' ? item.percentage : `₹${item.amount}`}
                  </td>
                  <td className="px-3 py-3.5 text-slate-550">{item.startDate}</td>
                  <td className="px-3 py-3.5 text-slate-550">{item.expireDate}</td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-3.5">
                    {activeTab === 'All' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(item.id)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 mx-auto"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                    No discount heads found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD DISCOUNT MODAL ===== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Discount Head</h3>
              <button onClick={() => setAddModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddDiscount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Holi Discount"
                    value={discountName}
                    onChange={e => setDiscountName(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Promo Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. HOLI20"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Value Type</label>
                  <select
                    value={valueType}
                    onChange={e => setValueType(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="Fixed amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    {valueType === 'Fixed amount' ? 'Discount Amount *' : 'Discount Percentage *'}
                  </label>
                  <input
                    type="text"
                    placeholder={valueType === 'Fixed amount' ? 'e.g. 500' : 'e.g. 20'}
                    value={discountAmountVal}
                    onChange={e => setDiscountAmountVal(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Applicable Type</label>
                  <select
                    value={applicableType}
                    onChange={e => setApplicableType(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="Admission Time">Admission Time</option>
                    <option value="Fee Collection">Fee Collection Time</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Continuity</label>
                  <div className="flex items-center gap-6 h-10">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="add_continuity"
                        checked={continuity === 'One Time'}
                        onChange={() => setContinuity('One Time')}
                        className="accent-teal-600"
                      />
                      <span>One Time</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="add_continuity"
                        checked={continuity === 'Every Month'}
                        onChange={() => setContinuity('Every Month')}
                        className="accent-teal-600"
                      />
                      <span>Every Month</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Applicable on</label>
                  <select
                    value={applicableFee}
                    onChange={e => setApplicableFee(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="All Fee">All Fee</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Registration Fee">Registration Fee</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Expire Date</label>
                  <input
                    type="date"
                    value={expireDate}
                    onChange={e => setExpireDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white text-slate-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT DISCOUNT MODAL ===== */}
      {editModalOpen && selectedDiscount && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Discount Head</h3>
              <button onClick={() => setEditModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Holi Discount"
                    value={discountName}
                    onChange={e => setDiscountName(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Promo Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. HOLI20"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Value Type</label>
                  <select
                    value={valueType}
                    onChange={e => setValueType(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="Fixed amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    {valueType === 'Fixed amount' ? 'Discount Amount *' : 'Discount Percentage *'}
                  </label>
                  <input
                    type="text"
                    placeholder={valueType === 'Fixed amount' ? 'e.g. 500' : 'e.g. 20'}
                    value={discountAmountVal}
                    onChange={e => setDiscountAmountVal(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Applicable Type</label>
                  <select
                    value={applicableType}
                    onChange={e => setApplicableType(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="Admission Time">Admission Time</option>
                    <option value="Fee Collection">Fee Collection Time</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Continuity</label>
                  <div className="flex items-center gap-6 h-10">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_continuity"
                        checked={continuity === 'One Time'}
                        onChange={() => setContinuity('One Time')}
                        className="accent-teal-600"
                      />
                      <span>One Time</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_continuity"
                        checked={continuity === 'Every Month'}
                        onChange={() => setContinuity('Every Month')}
                        className="accent-teal-600"
                      />
                      <span>Every Month</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Discount Applicable on</label>
                  <select
                    value={applicableFee}
                    onChange={e => setApplicableFee(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700"
                  >
                    <option value="All Fee">All Fee</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Registration Fee">Registration Fee</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Start Date</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 font-bold">Expire Date</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={expireDate}
                    onChange={e => setExpireDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg outline-none font-bold bg-white text-slate-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
