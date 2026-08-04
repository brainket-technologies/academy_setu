'use client'

import React, { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ─── Constants ────────────────────────────────────────────────────────────────

const SEGMENT_OPTIONS = ['School', 'College', 'Coaching', 'Student', 'Teacher', 'Principal', 'Staff', 'Manager', 'Parents', 'Influencer']
const APPLIED_BY_OPTIONS = ['Website Purchase', 'Only Admin', 'BDM', 'Manager']

interface BillingItem {
  serial_no: number
  item_description: string
  price: string
  tax_percentage: string
}

const calcTaxPrice = (price: string, tax: string) => {
  const p = parseFloat(price) || 0
  const t = parseFloat(tax) || 0
  return (p + (p * t) / 100).toFixed(2)
}

const calcTotals = (items: BillingItem[]) => {
  let totalPrice = 0; let totalTax = 0; let totalTaxPct = 0
  items.forEach(item => {
    const p = parseFloat(item.price) || 0
    const t = parseFloat(item.tax_percentage) || 0
    totalPrice += p; totalTax += (p * t) / 100; totalTaxPct = t
  })
  return { price: totalPrice.toFixed(2), taxPct: totalTaxPct, taxPrice: totalTax.toFixed(2), total: (totalPrice + totalTax).toFixed(2) }
}

const emptyBillingItem = (serial_no: number): BillingItem => ({ serial_no, item_description: '', price: '', tax_percentage: '' })

const rawItemToBillingItem = (raw: Record<string, unknown>, idx: number): BillingItem => ({
  serial_no: idx + 1,
  item_description: String(raw.item_description ?? ''),
  price: String(raw.price ?? ''),
  tax_percentage: String(raw.tax_percentage ?? ''),
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function CustomSelect({ label, required, options, value, onChange, placeholder }: {
  label: string; required?: boolean; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer">
        <span className={value ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>{value || placeholder || 'Select'}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer ${value === opt ? 'text-indigo-600 font-bold bg-indigo-50/50 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomMultiSelect({ label, required, options, value, onChange, placeholder }: {
  label: string
  required?: boolean
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const toggleOption = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter(x => x !== opt))
    } else {
      onChange([...value, opt])
    }
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
      >
        <span className={value.length > 0 ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500'}>
          {value.length > 0 ? value.join(', ') : (placeholder ?? 'Select')}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
          {options.map(opt => {
            const isChecked = value.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOption(opt)}
                className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span>{opt}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BillingTable({ items, onChange, onRemove, onAdd }: {
  items: BillingItem[]
  onChange: (index: number, field: keyof BillingItem, value: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
}) {
  const { price, taxPct, taxPrice, total } = calcTotals(items)
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700">
              <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-16">S.No.</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Item Description <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-36">Price <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-36">Tax (%) <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-36">Tax Price</th>
              <th className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((item, idx) => {
              const taxPrice = calcTaxPrice(item.price, item.tax_percentage)
              return (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 align-middle">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.serial_no}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="text" value={item.item_description} onChange={e => onChange(idx, 'item_description', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Enter item description" />
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" value={item.price} onChange={e => onChange(idx, 'price', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="0.00" />
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" value={item.tax_percentage} onChange={e => onChange(idx, 'tax_percentage', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="0" />
                  </td>
                  <td className="px-4 py-2.5 align-middle">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{taxPrice !== '0.00' ? taxPrice : '-'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => onRemove(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer" title="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Line Item
        </button>
        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-5 py-2.5 border border-slate-200 dark:border-slate-600">
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block leading-tight">Subtotal</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">₹{price}</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block leading-tight">Tax @{taxPct}%</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">₹{taxPrice}</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
          <div className="text-right">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 block leading-tight font-bold">Total</span>
            <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300">₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Plan Page ────────────────────────────────────────────────────────────

interface EditPlanPageProps {
  params: Promise<{ id: string }>
}

export default function EditPlanPage({ params }: EditPlanPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [segment, setSegment] = useState('')
  const [selectedMenus, setSelectedMenus] = useState<string[]>([])
  const [segmentMenus, setSegmentMenus] = useState<string[]>([])
  const [brochureUrl, setBrochureUrl] = useState('')

  const [availableSegments, setAvailableSegments] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/segment')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAvailableSegments(data.data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (segment && availableSegments.length > 0) {
      const segObj = availableSegments.find(s => s.name === segment)
      if (segObj) {
        setSegmentMenus(segObj.menus || [])
      }
    }
  }, [segment, availableSegments])

  const handleSegmentChange = (selectedSegName: string) => {
    setSegment(selectedSegName)
    const segObj = availableSegments.find(s => s.name === selectedSegName)
    if (segObj) {
      setSegmentMenus(segObj.menus || [])
      setSelectedMenus(segObj.menus || [])
    } else {
      setSegmentMenus([])
      setSelectedMenus([])
    }
  }

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setBrochureUrl(reader.result as string)
      toast.success('Brochure uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const [appliedBy, setAppliedBy] = useState<string[]>([])
  const [planFor, setPlanFor] = useState<'All User' | 'New User'>('All User')
  const [planName, setPlanName] = useState('')
  const [description, setDescription] = useState('')
  const [noOfStudents, setNoOfStudents] = useState('')
  const [studentsRelaxation, setStudentsRelaxation] = useState('')
  const [additionalCharge, setAdditionalCharge] = useState('')
  const [firstDuration, setFirstDuration] = useState('')
  const [firstItems, setFirstItems] = useState<BillingItem[]>([emptyBillingItem(1)])
  const [renewalDuration, setRenewalDuration] = useState('')
  const [preBillDays, setPreBillDays] = useState('')
  const [paymentRelaxation, setPaymentRelaxation] = useState('')
  const [renewalItems, setRenewalItems] = useState<BillingItem[]>([emptyBillingItem(1)])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/plan/${id}`)
        const data = await res.json()
        if (data.success) {
          const p = data.data
          setSegment(p.segment || '')
          setAppliedBy(Array.isArray(p.applied_by) ? p.applied_by : (p.applied_by ? p.applied_by.split(',') : []))
          setPlanFor(p.plan_for === 'New User' ? 'New User' : 'All User')
          setPlanName(p.plan_name || '')
          setDescription(p.description || '')
          setNoOfStudents(p.no_of_students != null ? String(p.no_of_students) : '')
          setStudentsRelaxation(p.students_fee_relaxation != null ? String(p.students_fee_relaxation) : '')
          setAdditionalCharge(p.additional_charge_per_student != null ? String(p.additional_charge_per_student) : '')
          setFirstDuration(p.first_billing_duration != null ? String(p.first_billing_duration) : '')
          setRenewalDuration(p.renewal_billing_duration != null ? String(p.renewal_billing_duration) : '')
          setPreBillDays(p.renewal_pre_bill_generate_days != null ? String(p.renewal_pre_bill_generate_days) : '')
          setPaymentRelaxation(p.renewal_payment_relaxation != null ? String(p.renewal_payment_relaxation) : '')
          setSelectedMenus(p.menus || [])
          setBrochureUrl(p.brochure_url || '')

          const fItems = Array.isArray(p.first_billing_items) && p.first_billing_items.length > 0
            ? p.first_billing_items.map(rawItemToBillingItem)
            : [emptyBillingItem(1)]
          setFirstItems(fItems)
          const rItems = Array.isArray(p.renewal_billing_items) && p.renewal_billing_items.length > 0
            ? p.renewal_billing_items.map(rawItemToBillingItem)
            : [emptyBillingItem(1)]
          setRenewalItems(rItems)
        } else {
          toast.error('Failed to load plan')
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const updateFirstItem = useCallback((index: number, field: keyof BillingItem, value: string) => {
    setFirstItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }, [])
  const addFirstItem = () => setFirstItems(prev => [...prev, emptyBillingItem(prev.length + 1)])
  const removeFirstItem = (index: number) =>
    setFirstItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, serial_no: i + 1 })))

  const updateRenewalItem = useCallback((index: number, field: keyof BillingItem, value: string) => {
    setRenewalItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }, [])
  const addRenewalItem = () => setRenewalItems(prev => [...prev, emptyBillingItem(prev.length + 1)])
  const removeRenewalItem = (index: number) =>
    setRenewalItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, serial_no: i + 1 })))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!segment) { toast.error('Segment is required'); return }
    if (appliedBy.length === 0) { toast.error('Applied By is required'); return }
    if (!planName.trim()) { toast.error('Plan Name is required'); return }

    setSubmitting(true)
    try {
      const payload = {
        segment, applied_by: appliedBy, plan_for: planFor,
        plan_name: planName.trim(), description: description.trim(),
        no_of_students: noOfStudents ? parseInt(noOfStudents) : null,
        students_fee_relaxation: studentsRelaxation ? parseInt(studentsRelaxation) : null,
        additional_charge_per_student: additionalCharge ? parseFloat(additionalCharge) : null,
        first_billing_duration: firstDuration ? parseInt(firstDuration) : null,
        first_billing_items: firstItems.map(item => ({
          serial_no: item.serial_no, item_description: item.item_description,
          price: parseFloat(item.price) || 0, tax_percentage: parseFloat(item.tax_percentage) || 0,
          tax_price: parseFloat(calcTaxPrice(item.price, item.tax_percentage))
        })),
        renewal_billing_duration: renewalDuration ? parseInt(renewalDuration) : null,
        renewal_pre_bill_generate_days: preBillDays ? parseInt(preBillDays) : null,
        renewal_payment_relaxation: paymentRelaxation ? parseFloat(paymentRelaxation) : null,
        renewal_billing_items: renewalItems.map(item => ({
          serial_no: item.serial_no, item_description: item.item_description,
          price: parseFloat(item.price) || 0, tax_percentage: parseFloat(item.tax_percentage) || 0,
          tax_price: parseFloat(calcTaxPrice(item.price, item.tax_percentage))
        })),
        menus: selectedMenus,
        brochure_url: brochureUrl
      }
      const res = await fetch(`/api/admin/plan/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan updated successfully!')
        router.push('/admin/plan')
      } else {
        toast.error(data.error || 'Failed to update plan')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Plan...</p>
        </div>
    </>
  )

  return (
    <>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
        {/* Title */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Edit Plan</h1>
          <button onClick={() => router.push('/admin/plan')}
            className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Plan Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-7">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Plan Details</h2>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <CustomSelect label="Segment" required options={availableSegments.map(s => s.name)} value={segment} onChange={handleSegmentChange} placeholder="Select Segment" />
                <CustomMultiSelect label="Applied By" required options={APPLIED_BY_OPTIONS} value={appliedBy} onChange={setAppliedBy} placeholder="Select Options" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Plan For<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex items-center gap-6 mt-2.5">
                    {(['All User', 'New User'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                        <input type="radio" name="plan_for" value={opt} checked={planFor === opt} onChange={() => setPlanFor(opt)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Plan Name<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Enter Plan Name"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter Description"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'No. of Students', val: noOfStudents, set: setNoOfStudents, ph: 'Enter No. of Students' },
                  { label: 'Students Eligible for Fee Relaxation', val: studentsRelaxation, set: setStudentsRelaxation, ph: 'Enter No. of Students' },
                  { label: 'Additional Charge per Student', val: additionalCharge, set: setAdditionalCharge, ph: 'Enter Amount' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}<span className="text-red-500 ml-0.5">*</span></label>
                    <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  </div>
                ))}
              </div>

              {/* Row 4: Menus & Brochure Upload */}
              {segment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-700/50 pt-5 mt-2">
                  {/* Included Menus/Services Checklist */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Included Menus / Features
                    </label>
                    {segmentMenus.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No menus defined for this segment.</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                        {segmentMenus.map(m => {
                          const isChecked = selectedMenus.includes(m)
                          return (
                            <label key={m} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                value={m}
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedMenus(prev => prev.filter(x => x !== m))
                                  } else {
                                    setSelectedMenus(prev => [...prev, m])
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                              />
                              {m}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Plan Brochure Upload Card */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan Brochure
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="h-32 w-52 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        {brochureUrl ? (
                          <>
                            {brochureUrl.startsWith('data:application/pdf') ? (
                              <div className="flex flex-col items-center gap-2 p-4 text-center">
                                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[160px]">PDF Document</span>
                              </div>
                            ) : (
                              <img src={brochureUrl} alt="Brochure Preview" className="w-full h-full object-contain" />
                            )}
                            <button
                              type="button"
                              onClick={() => setBrochureUrl('')}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                              title="Remove Brochure"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-slate-400 p-4 text-center">
                            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-slate-400 italic">No brochure uploaded</span>
                          </div>
                        )}
                      </div>
                      <label className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 text-center transition-colors cursor-pointer block shadow-sm">
                        Upload Brochure
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={handleBrochureUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1st Billing */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-7 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">1st Billing Details</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Duration (in days)</span>
                <input type="number" value={firstDuration} onChange={e => setFirstDuration(e.target.value)} placeholder="Enter Duration"
                  className="w-32 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
            </div>
            <BillingTable
              items={firstItems}
              onChange={updateFirstItem}
              onRemove={removeFirstItem}
              onAdd={addFirstItem}
            />
          </div>

          {/* Renewal Billing */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-7 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Renewal Billing Details</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Duration (in days)</span>
                <input type="number" value={renewalDuration} onChange={e => setRenewalDuration(e.target.value)} placeholder="Enter Duration"
                  className="w-32 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pre Bill Generate in Days<span className="text-red-500 ml-0.5">*</span></label>
                <input type="number" value={preBillDays} onChange={e => setPreBillDays(e.target.value)} placeholder="Enter Days"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment Relaxation After Plan Expire<span className="text-red-500 ml-0.5">*</span></label>
                <input type="number" value={paymentRelaxation} onChange={e => setPaymentRelaxation(e.target.value)} placeholder="Enter Percentage"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
            </div>
            <BillingTable
              items={renewalItems}
              onChange={updateRenewalItem}
              onRemove={removeRenewalItem}
              onAdd={addRenewalItem}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pb-4">
            <button type="button" onClick={() => router.push('/admin/plan')}
              className="px-10 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-12 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
