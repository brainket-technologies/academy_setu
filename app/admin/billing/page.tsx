'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Plus, Edit3, Trash2, FileText, Download, Loader2, 
  ChevronLeft, ChevronRight, X, Percent, Tag, Ticket, Check, Paperclip
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Bill {
  id: string
  segment: string
  school_name: string
  plan_name: string
  payment_mode: string
  payment_date: string
  amount: number
  transaction_id: string
  status: string
  created_at: string
}

interface Segment {
  id: string
  name: string
}

interface InstituteOption {
  id: string
  name: string
  segment_name?: string | null
}

interface Plan {
  id: string
  plan_name: string
  segment: string
  description?: string
  first_billing_duration?: number
  renewal_billing_duration?: number
  first_billing_items?: Array<{
    item_description: string
    price: number
    tax_price: number
    tax_percentage: number
  }>
  renewal_billing_items?: Array<{
    item_description: string
    price: number
    tax_price: number
    tax_percentage: number
  }>
}

interface DBPromoCode {
  id: string
  code: string
  description: string
  applicable_by: string
  discount_name: string
  discount_type: string
  discount_value: string
  created_at: string
}

const formatDateOnly = (dateStr: string | null) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}


function BillingDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createParam = searchParams.get('create')

  // Top-Level Navigation Tabs
  const [activeTab, setActiveTab] = useState<'purchase' | 'history'>('purchase')

  // Purchase Wizard States (Tab 1)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [selectedSegment, setSelectedSegment] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [filteredPlansList, setFilteredPlansList] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoModalOpen, setPromoModalOpen] = useState(false)
  const [promoActiveTab, setPromoActiveTab] = useState<'amount' | 'percentage'>('amount')
  const [allPromoCodes, setAllPromoCodes] = useState<any[]>([])
  const [showViewPlanModal, setShowViewPlanModal] = useState<Plan | null>(null)

  // Payment Mode selections & fields (Step 2)
  const [paymentModeOption, setPaymentModeOption] = useState<'gateway' | 'bank' | 'upi' | 'qr'>('gateway')
  
  // Bank transfer inputs
  const [bankAccountNo, setBankAccountNo] = useState('1234567890')
  const [bankIfsc, setBankIfsc] = useState('ABCD1234567890')
  const [bankHolderName, setBankHolderName] = useState('Ashok Kumar')

  // UPI transfer inputs
  const [upiId, setUpiId] = useState('abcd1234567890')

  // Manual payment inputs
  const [txnId, setTxnId] = useState('')
  const [screenshotName, setScreenshotName] = useState('')
  const [manualAmount, setManualAmount] = useState('')

  // Transaction History States (Tab 2)
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filter States
  const [filterSegment, setFilterSegment] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterPaymentMode, setFilterPaymentMode] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('')

  // Options States
  const [segments, setSegments] = useState<Segment[]>([])
  const [schools, setSchools] = useState<InstituteOption[]>([])
  const [plans, setPlans] = useState<Plan[]>([])

  // Inline editing inside History
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formSegment, setFormSegment] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [planName, setPlanName] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().substring(0, 10))
  const [amount, setAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [status, setStatus] = useState('Pending')
  const [submitting, setSubmitting] = useState(false)
  const [instPlansLoading, setInstPlansLoading] = useState(false)
  const [instActivePlan, setInstActivePlan] = useState<any>(null)
  const [instUpcomingPlans, setInstUpcomingPlans] = useState<any[]>([])
  const [instPlanHistory, setInstPlanHistory] = useState<any[]>([])
  const [showAllPlansOverride, setShowAllPlansOverride] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState<'new' | 'renew' | 'change' | 'upcoming'>('new')

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)

  // Fetch Bills log (History tab)
  const fetchBills = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (filterSegment) params.append('segment', filterSegment)
      if (filterSchool) params.append('school_name', filterSchool)
      if (filterPaymentMode) params.append('payment_mode', filterPaymentMode)
      if (filterDateRange) params.append('date_range', filterDateRange)

      const res = await fetch(`/api/admin/billing?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setBills(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load transaction history')
      }
    } catch {
      toast.error('Something went wrong loading bills')
    } finally {
      setLoading(false)
    }
  }, [filterSegment, filterSchool, filterPaymentMode, filterDateRange])

  // Fetch database dropdown options
  const fetchOptions = useCallback(async () => {
    try {
      const segmentRes = await fetch('/api/admin/segment')
      const segmentData = await segmentRes.json()
      if (segmentData.success) {
        setSegments(segmentData.data)
      }

      const schoolRes = await fetch('/api/admin/institute?simple=true')
      const schoolData = await schoolRes.json()
      if (schoolData.success) {
        setSchools(schoolData.data)
      }

      const planRes = await fetch('/api/admin/plan')
      const planData = await planRes.json()
      if (planData.success) {
        setPlans(planData.data)
      }
    } catch (e) {
      console.error('Failed to fetch billing options', e)
    }
  }, [])

  // Fetch promo codes configured in the database
  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-code?pageSize=100')
      const data = await res.json()
      if (data.success) {
        setAllPromoCodes(data.data)
      }
    } catch (e) {
      console.error('Failed to fetch promo codes', e)
    }
  }, [])

  // Dynamic detailed plans fetcher for the selected segment
  const fetchPlansWithDetails = async (segmentName: string) => {
    setLoadingPlans(true)
    try {
      const res = await fetch(`/api/admin/plan?segment=${encodeURIComponent(segmentName)}&pageSize=100`)
      const data = await res.json()
      if (data.success) {
        const segmentPlans = data.data
        
        const detailed = await Promise.all(segmentPlans.map(async (p: any) => {
          try {
            const detailRes = await fetch(`/api/admin/plan/${p.id}`)
            const detailData = await detailRes.json()
            if (detailData.success) {
              return detailData.data
            }
          } catch (e) {
            console.error('Detail fetch error:', e)
          }
          return p
        }))
        setFilteredPlansList(detailed)
      } else {
        toast.error('Failed to load plans for the segment')
      }
    } catch {
      toast.error('Error fetching plan specifications')
    } finally {
      setLoadingPlans(false)
    }
  }

  // Handle segment/school form submission
  const handleSelectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSegment) { toast.error('Segment is required'); return }
    if (!selectedSchool) { toast.error('School Name is required'); return }
    
    setIsSubmitted(true)
    setInstPlansLoading(true)
    setInstActivePlan(null)
    setInstUpcomingPlans([])
    setInstPlanHistory([])

    const schoolObj = schools.find(s => s.name === selectedSchool)
    if (schoolObj) {
      try {
        const res = await fetch(`/api/admin/billing/institute-plans?institution_id=${schoolObj.id}`)
        const data = await res.json()
        if (data.success) {
          setInstActivePlan(data.activePlan)
          setInstUpcomingPlans(data.upcomingPlans || [])
          setInstPlanHistory(data.planHistory || [])
        }
      } catch (err) {
        console.error('Failed to load institute plans', err)
      }
    }
    setInstPlansLoading(false)
    fetchPlansWithDetails(selectedSegment)
  }

  // Calculate pricing values
  const getPlanPrice = (plan: Plan | null) => {
    if (!plan) return 0
    const items = purchaseMode === 'renew' && plan.renewal_billing_items?.length ? plan.renewal_billing_items : plan.first_billing_items
    if (!items || items.length === 0) {
      return 1200 // Default fallback base price
    }
    return items.reduce((sum: number, item: any) => sum + Number(item.price) + Number(item.tax_price || 0), 0)
  }

  // Calculate plan validity dates
  const getPlanDates = (plan: Plan | null) => {
    const from = new Date()
    const duration = purchaseMode === 'renew' ? (plan?.renewal_billing_duration || 365) : (plan?.first_billing_duration || 365)
    const to = new Date()
    to.setDate(from.getDate() + duration)
    
    const pad = (n: number) => String(n).padStart(2, '0')
    const format = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    
    return {
      validFrom: format(from),
      validTo: format(to)
    }
  }

  // Format features layout neatly (8 points)
  const getPlanFeatures = (plan: Plan) => {
    const dbFeatures = (plan.first_billing_items || []).map(item => item.item_description)
    const defaultFeatures = [
      '24/7 Dedicated Support Link',
      'Real-time Analytics Dashboard',
      'Automated Weekly PDF Reports',
      'Unlimited Student Logins',
      'Custom Domain Integration',
      'Secure SSL Data Encryption',
      'API Access & Integration Keys',
      'Data Backups & Export XLS'
    ]
    const merged = Array.from(new Set([...dbFeatures, ...defaultFeatures]))
    return merged.slice(0, 8)
  }

  // Get active list of promo codes (DB only)
  const getPromoCodesList = () => {
    const colors = [
      'bg-green-600 text-green-600 border-green-600/10 text-green-700',
      'bg-purple-600 text-purple-600 border-purple-600/10 text-purple-700',
      'bg-violet-600 text-violet-600 border-violet-600/10 text-violet-700',
      'bg-rose-600 text-rose-600 border-rose-600/10 text-rose-700',
      'bg-indigo-700 text-indigo-700 border-indigo-700/10 text-indigo-800',
      'bg-lime-600 text-lime-600 border-lime-600/10 text-lime-700',
      'bg-orange-600 text-orange-600 border-orange-600/10 text-orange-700',
      'bg-cyan-600 text-cyan-600 border-cyan-600/10 text-cyan-700'
    ]
    return allPromoCodes.map((pc: DBPromoCode, idx: number) => ({
      id: pc.id,
      code: pc.code,
      discount_name: pc.discount_name || 'Promo Code',
      discount_type: pc.discount_type,
      discount_value: parseFloat(pc.discount_value),
      created_at: pc.created_at ? pc.created_at.substring(0, 10) : '',
      category: pc.applicable_by || 'Promo Offer',
      color: colors[idx % colors.length]
    }))
  }

  // Calculate discount figures
  const getPromoDiscountAmount = (plan: Plan | null, promo: any) => {
    if (!plan || !promo) return 0
    const price = getPlanPrice(plan)
    if (promo.discount_type === 'Percentage') {
      return Math.round((price * Number(promo.discount_value)) / 100)
    }
    return Number(promo.discount_value)
  }

  // Get final calculated payment amount
  const getFinalAmount = () => {
    if (!selectedPlan) return 0
    const planPrice = getPlanPrice(selectedPlan)
    const discount = getPromoDiscountAmount(selectedPlan, appliedPromo)
    return Math.max(0, planPrice - discount)
  }

  // Pre-fill manual amount field when plan or promo changes
  useEffect(() => {
    if (selectedPlan) {
      setManualAmount(String(getFinalAmount()))
    }
  }, [selectedPlan, appliedPromo, purchaseMode])

  // Trigger checkout creation
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    // If manual mode, require some validation
    if (paymentModeOption !== 'gateway') {
      if (!txnId) { toast.error('Transaction ID is required'); return }
      if (!manualAmount || parseFloat(manualAmount) <= 0) { toast.error('Amount is required'); return }
    }

    setSubmitting(true)
    try {
      const modeLabel = {
        gateway: 'Payment Gateway',
        bank: 'Bank Transfer',
        upi: 'UPI ID',
        qr: 'QR Code'
      }[paymentModeOption]

      const finalVal = paymentModeOption === 'gateway' ? getFinalAmount() : parseFloat(manualAmount)
      const finalTxn = paymentModeOption === 'gateway' ? `TXN${Math.floor(100000 + Math.random() * 900000)}` : txnId
      const finalStatus = 'Pending'

      // Resolve institution_id from loaded schools list
      const selectedSchoolObj = schools.find(s => s.name === selectedSchool)
      const institutionId = selectedSchoolObj?.id || null

      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_id: institutionId,
          plan_id: selectedPlan.id,
          segment: selectedSegment,
          school_name: selectedSchool,
          plan_name: selectedPlan.plan_name,
          payment_mode: modeLabel,
          payment_date: new Date().toISOString().substring(0, 10),
          amount: finalVal,
          transaction_id: finalTxn,
          status: finalStatus,
          promo_code_id: appliedPromo?.id || null
        })
      })

      const data = await res.json()
      if (data.success) {
        if (purchaseMode === 'change' && data.data?.id && institutionId) {
          // Instantly activate it
          await fetch('/api/admin/billing/institute-plans', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bill_id: data.data.id, institution_id: institutionId })
          })
        }
        
        toast.success(paymentModeOption === 'gateway' ? 'Payment request submitted successfully!' : 'Bill created successfully!')
        setWizardStep(1)
        setIsSubmitted(false)
        setShowAllPlansOverride(false)
        setPurchaseMode('new')
        setSelectedPlan(null)
        setAppliedPromo(null)
        setTxnId('')
        setManualAmount('')
        setScreenshotName('')
        // Reload the institute plans so the dashboard refreshes
        if (institutionId) {
          setInstPlansLoading(true)
          const plRes = await fetch(`/api/admin/billing/institute-plans?institution_id=${institutionId}`)
          const plData = await plRes.json()
          if (plData.success) {
            setInstActivePlan(plData.activePlan)
            setInstUpcomingPlans(plData.upcomingPlans || [])
            setInstPlanHistory(plData.planHistory || [])
          }
          setInstPlansLoading(false)
          setIsSubmitted(true)
        }
        fetchBills(1)
      } else {
        toast.error(data.error || 'Failed to complete payment checkout')
      }
    } catch {
      toast.error('Something went wrong during checkout submission')
    } finally {
      setSubmitting(false)
    }
  }

  // Setup mount loads
  useEffect(() => {
    fetchBills(1)
    fetchOptions()
    fetchPromoCodes()
  }, [fetchBills, fetchOptions, fetchPromoCodes])

  // Track create Param for redirection
  useEffect(() => {
    if (createParam === 'true') {
      setActiveTab('purchase')
      setWizardStep(1)
      setIsSubmitted(false)
    }
  }, [createParam])

  // Inline editing in history table
  const handleStartEdit = (bill: Bill) => {
    setActiveTab('history')
    setEditingId(bill.id)
    setFormSegment(bill.segment || '')
    setSchoolName(bill.school_name || '')
    setPlanName(bill.plan_name || '')
    setPaymentMode(bill.payment_mode || '')
    setPaymentDate(bill.payment_date ? bill.payment_date.substring(0, 10) : '')
    setAmount(String(bill.amount || ''))
    setTransactionId(bill.transaction_id || '')
    setStatus(bill.status || 'Paid')
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleResetForm = () => {
    setEditingId(null)
    setFormSegment('')
    setSchoolName('')
    setPlanName('')
    setPaymentMode('')
    setPaymentDate(new Date().toISOString().substring(0, 10))
    setAmount('')
    setTransactionId('')
    setStatus('Paid')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSegment) { toast.error('Segment is required'); return }
    if (!schoolName) { toast.error('School Name is required'); return }
    if (!planName) { toast.error('Plan Name is required'); return }
    if (!paymentMode) { toast.error('Payment Mode is required'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Valid Amount is required'); return }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/billing/${editingId}` : '/api/admin/billing'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: formSegment,
          school_name: schoolName,
          plan_name: planName,
          payment_mode: paymentMode,
          payment_date: paymentDate,
          amount: parseFloat(amount),
          transaction_id: transactionId,
          status
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Bill updated successfully!' : 'Bill created successfully!')
        handleResetForm()
        fetchBills(currentPage)
      } else {
        toast.error(data.error || 'Failed to save bill')
      }
    } catch {
      toast.error('Something went wrong saving bill')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/billing/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Bill deleted successfully')
        fetchBills(currentPage)
      } else {
        toast.error(data.error || 'Failed to delete bill')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const handleExport = () => {
    toast.success('Exporting transactions to CSV log...')
  }

  const handleDownloadPDF = (bill: Bill) => {
    toast.success(`Downloading PDF invoice for ${bill.school_name}...`)
  }

  const handleGenerateLink = (gatewayName: string) => {
    toast.info(`Generating checkout link for ${gatewayName}...`)
  }


  const filteredPlans = plans.filter(p => !formSegment || p.segment === formSegment)

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const promoCodes = getPromoCodesList()
  const amountPromoCodes = promoCodes.filter(c => c.discount_type === 'Fixed')
  const percentagePromoCodes = promoCodes.filter(c => c.discount_type === 'Percentage')
  const activePromoList = promoActiveTab === 'amount' ? amountPromoCodes : percentagePromoCodes

  const dates = getPlanDates(selectedPlan)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Title Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Billing</h1>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'purchase'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Purchase Plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Transaction History
          </button>
        </div>
      </div>

      {/* ================= PURCHASE PLAN TAB ================= */}
      {activeTab === 'purchase' && (
        <div className="flex flex-col gap-6">
          {wizardStep === 1 ? (
            <>
              {/* Step 1: Selection Form Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <form onSubmit={handleSelectionSubmit} className="flex items-end justify-between flex-wrap gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-w-0">
                    {/* Segment Select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Segment<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        value={selectedSegment}
                        onChange={e => {
                          setSelectedSegment(e.target.value)
                          setSelectedSchool('')
                          setIsSubmitted(false)
                          setInstActivePlan(null)
                          setInstUpcomingPlans([])
                          setInstPlanHistory([])
                          setShowAllPlansOverride(false)
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                        required
                      >
                        <option value="">Select Segment</option>
                        {segments.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* School Select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        School/College Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        value={selectedSchool}
                        onChange={e => {
                          const val = e.target.value
                          setSelectedSchool(val)
                          setIsSubmitted(false)
                          setInstActivePlan(null)
                          setInstUpcomingPlans([])
                          setInstPlanHistory([])
                          setShowAllPlansOverride(false)
                          const found = schools.find(s => s.name === val)
                          if (found && found.segment_name) {
                            setSelectedSegment(found.segment_name)
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                        required
                      >
                        <option value="">Select School</option>
                        {schools
                          .filter(s => !selectedSegment || s.segment_name === selectedSegment)
                          .map(s => (
                            <option key={s.id} value={s.name}>
                              {s.name} {s.segment_name ? `(${s.segment_name})` : '(No Segment)'}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer h-[42px] shrink-0"
                  >
                    Submit
                  </button>
                </form>
              </div>

              {/* Step 1: Plans Display Grid or Institute Plans Dashboard */}
              {isSubmitted && (
                <div className="flex flex-col gap-6">
                  {instPlansLoading ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading institute plans...</p>
                    </div>
                  ) : (instActivePlan || instUpcomingPlans.length > 0 || instPlanHistory.length > 0) && !showAllPlansOverride ? (
                    /* Institute Plans Dashboard */
                    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                      
                      {/* Header Summary */}
                      <div className="flex items-center justify-between flex-wrap gap-3 bg-indigo-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-indigo-100/40 dark:border-slate-700">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedSchool}</h3>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Segment: {selectedSegment}</p>
                        </div>
                        <button
                          onClick={() => setShowAllPlansOverride(true)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                        >
                          + Purchase New Plan
                        </button>
                      </div>

                      {/* Active Plan Detail */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
                        <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Active Plan</h4>
                          {instActivePlan ? (
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              No Active Plan
                            </span>
                          )}
                        </div>

                        {instActivePlan ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{instActivePlan.plan_name}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valid From</span>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">📅 {formatDateOnly(instActivePlan.start_date)}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renewal Date / Expires</span>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">📅 {formatDateOnly(instActivePlan.end_date)}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-4">
                                <button
                                  onClick={() => {
                                    setPurchaseMode('renew')
                                    const fullPlan = plans.find(p => p.id === instActivePlan.plan_id)
                                    if (fullPlan) {
                                      setSelectedPlan(fullPlan)
                                      setWizardStep(2)
                                    } else {
                                      toast.error('Plan details not found')
                                    }
                                  }}
                                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                                >
                                  Renew Plan
                                </button>
                                <button
                                  onClick={() => {
                                    setPurchaseMode('change')
                                    setShowAllPlansOverride(true)
                                  }}
                                  className="px-5 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Change Plan (Instant)
                                </button>
                                <button
                                  onClick={() => {
                                    setPurchaseMode('upcoming')
                                    setShowAllPlansOverride(true)
                                  }}
                                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Create Upcoming Plan
                                </button>
                              </div>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 text-[100px] font-black pointer-events-none">₹</div>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">Amount Paid</span>
                                <p className="text-3xl font-black mt-1">₹{instActivePlan.amount}</p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-indigo-400/30 text-xs font-semibold text-indigo-100 flex flex-col gap-1">
                                <div>Method: <span className="text-white uppercase">{instActivePlan.payment_mode}</span></div>
                                <div className="truncate">Txn ID: <span className="text-white font-mono text-[10px]">{instActivePlan.transaction_id || '—'}</span></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm font-medium flex flex-col items-center justify-center gap-3">
                            <p>This institute has no currently running plan.</p>
                            <button
                              onClick={() => setShowAllPlansOverride(true)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                            >
                              Create Institute Plan
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Upcoming Plans */}
                      {instUpcomingPlans.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
                          <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                            Upcoming Plans ({instUpcomingPlans.length})
                          </h4>
                          <div className="flex flex-col gap-4">
                            {instUpcomingPlans.map((plan: any) => (
                              <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-150">{plan.plan_name}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Queue Start: {formatDateOnly(plan.start_date)} | Queue End: {formatDateOnly(plan.end_date)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-slate-150">₹{plan.amount}</span>
                                  </div>
                                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Queued
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Plan History */}
                      {instPlanHistory.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
                          <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                            Plan History
                          </h4>
                          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
                            <table className="w-full border-collapse text-left text-xs font-semibold">
                              <thead className="bg-[#EBF6F6]/40 dark:bg-slate-700/40">
                                <tr>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Period</th>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Amount</th>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Method</th>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Txn ID</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                                {instPlanHistory.map((h: any) => (
                                  <tr key={h.id}>
                                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{h.plan_name}</td>
                                    <td className="px-4 py-3">
                                      {formatDateOnly(h.start_date)} - {formatDateOnly(h.end_date)}
                                    </td>
                                    <td className="px-4 py-3 font-bold">₹{h.amount}</td>
                                    <td className="px-4 py-3 uppercase">{h.payment_mode}</td>
                                    <td className="px-4 py-3 font-mono text-[10px]">{h.transaction_id || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Step 1: Available Plans List Grid */
                    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                      
                      {/* Back button and Alert for empty state */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 px-1">
                          {showAllPlansOverride ? `Select Plan to Purchase for ${selectedSchool}` : 'Create Institute Plan'}
                        </h2>
                        {showAllPlansOverride && (
                          <button
                            onClick={() => setShowAllPlansOverride(false)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            &larr; Back to Dashboard
                          </button>
                        )}
                      </div>

                      {!(instActivePlan || instUpcomingPlans.length > 0 || instPlanHistory.length > 0) && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl text-xs font-medium text-amber-700 dark:text-amber-400 flex flex-col gap-1">
                          <p className="font-extrabold uppercase tracking-wider text-[10px]">No Plan Found</p>
                          <p>This institute currently does not have any active, upcoming, or historical subscription. Please select one of the available plans below to create an institute plan proper.</p>
                        </div>
                      )}

                      {loadingPlans ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading plan specifications...</p>
                        </div>
                      ) : filteredPlansList.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 shadow-sm">
                          No matching plans found for Segment "{selectedSegment}".
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {filteredPlansList.map((p) => (
                            <div
                              key={p.id}
                              className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{p.plan_name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mt-1">
                                  {p.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
                                </p>
                                
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-4" />
                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Plan Features</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                                  {getPlanFeatures(p).map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                      <span className="truncate">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row md:flex-col gap-4 items-stretch md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center shrink-0">
                                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Validity</span>
                                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{p.first_billing_duration || 365} Days</span>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 flex-1 md:flex-none">
                                  <button
                                    onClick={() => setShowViewPlanModal(p)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EBF6F6] dark:bg-slate-750 hover:bg-[#EBF6F6]/80 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-100 dark:border-slate-600 cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Plan
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPlan(p)
                                      setWizardStep(2)
                                    }}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                                  >
                                    Buy Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Step 2: Checkout – Two-Column Layout */
            <div className="flex flex-col gap-5">

              {/* Back link */}
              <button
                onClick={() => {
                  setWizardStep(1)
                  if (purchaseMode === 'renew') {
                    setPurchaseMode('new')
                  }
                }}
                className="self-start flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                &larr; {purchaseMode === 'renew' ? 'Cancel Renewal' : 'Back to plan list'}
              </button>

              {/* Two-column grid: form left, summary right */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                {/* ── LEFT: Promo + Payment Mode Form ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">

                  {/* Promo Code */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <Percent className="w-4 h-4 text-indigo-500" /> Promo Code
                    </h3>
                    <div className="relative">
                      <input
                        type="text" readOnly placeholder="Click to select a promo code (optional)"
                        onClick={() => setPromoModalOpen(true)}
                        value={appliedPromo ? `${appliedPromo.code} – ${appliedPromo.discount_type === 'Fixed' ? `₹${appliedPromo.discount_value} Off` : `${appliedPromo.discount_value}% Off`}` : ''}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer placeholder:text-slate-400"
                      />
                      <button onClick={() => setPromoModalOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer transition-colors border border-indigo-100/50">
                        <Percent className="w-4 h-4" />
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Promo applied: {appliedPromo.code}</span>
                        <button onClick={() => setAppliedPromo(null)} className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Payment Mode Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                      Payment Mode
                    </h3>

                    {/* Mode pill tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['gateway', 'bank', 'upi', 'qr'] as const).map(mode => (
                        <button key={mode} type="button" onClick={() => setPaymentModeOption(mode)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${paymentModeOption === mode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                        >
                          <span className="text-lg">{mode === 'gateway' ? '💳' : mode === 'bank' ? '🏦' : mode === 'upi' ? '📱' : '📷'}</span>
                          {mode === 'gateway' ? 'Gateway' : mode === 'bank' ? 'Bank' : mode === 'upi' ? 'UPI' : 'QR Code'}
                        </button>
                      ))}
                    </div>

                    <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5">

                      {/* 1. Payment Gateway */}
                      {paymentModeOption === 'gateway' && (
                        <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Razorpay Payment Gateway 1</span>
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full text-[10px] font-bold">Pending</span>
                              <button type="button" onClick={() => handleGenerateLink('Razorpay')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">Generate Link</button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Phonepay Payment Gateway 1</span>
                            <button type="button" onClick={() => handleGenerateLink('Phonepe')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">Generate Link</button>
                          </div>
                        </div>
                      )}

                      {/* 2. Bank */}
                      {paymentModeOption === 'bank' && (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Bank Account Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div><span className="text-slate-400 font-semibold block">Account No.</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankAccountNo}</span></div>
                              <div><span className="text-slate-400 font-semibold block">IFSC Code</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankIfsc}</span></div>
                              <div><span className="text-slate-400 font-semibold block">Holder Name</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankHolderName}</span></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                              <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                              <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                              <div className="relative">
                                <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_bank_txn.png')} className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. UPI */}
                      {paymentModeOption === 'upi' && (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">UPI Details</p>
                            <div className="text-xs"><span className="text-slate-400 font-semibold block">UPI ID</span><span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                              <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                              <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                              <div className="relative">
                                <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_upi_txn.png')} className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. QR Code */}
                      {paymentModeOption === 'qr' && (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm shrink-0">
                              <svg className="w-24 h-24 text-slate-900 dark:text-white" viewBox="0 0 100 100" fill="currentColor">
                                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" /><path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" /><path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                                <rect x="40" y="5" width="10" height="15" /><rect x="55" y="15" width="10" height="10" /><rect x="45" y="40" width="15" height="15" /><rect x="15" y="45" width="10" height="10" /><rect x="75" y="45" width="15" height="10" /><rect x="40" y="70" width="15" height="10" /><rect x="55" y="85" width="10" height="10" /><rect x="75" y="75" width="15" height="15" /><rect x="85" y="60" width="10" height="10" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Scan QR to Pay</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Use any UPI app to scan and pay, then enter the transaction ID below.</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                              <input type="text" placeholder="Enter Transaction ID" value={txnId} onChange={e => setTxnId(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                              <input type="number" placeholder="Enter Amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                              <div className="relative">
                                <input type="text" placeholder="Attach a file" readOnly value={screenshotName} onClick={() => setScreenshotName('screenshot_qr_txn.png')} className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                <Paperclip className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </form>
                  </div>
                </div>

                {/* ── RIGHT: Order Summary (Sticky) ── */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden sticky top-4">

                    {/* Institute header banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Purchasing Plan For</p>
                      <h2 className="text-base font-black leading-tight">{selectedSchool || '—'}</h2>
                      {selectedSegment && (
                        <span className="mt-2 inline-block px-2.5 py-0.5 bg-white/20 text-white border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-wider">{selectedSegment}</span>
                      )}
                    </div>

                    {/* Summary body */}
                    <div className="p-5 flex flex-col gap-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Summary</p>

                      {selectedPlan && (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedPlan.plan_name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Validity: {selectedPlan.first_billing_duration || 365} days</p>
                              <p className="text-[11px] text-slate-400">{dates.validFrom} → {dates.validTo}</p>
                            </div>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 shrink-0">
                              ₹{getPlanPrice(selectedPlan).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex flex-col gap-2 text-xs font-semibold">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span>Plan Price</span>
                              <span>₹{getPlanPrice(selectedPlan).toLocaleString('en-IN')}</span>
                            </div>
                            {appliedPromo && (
                              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                <span>Discount ({appliedPromo.code})</span>
                                <span>− ₹{getPromoDiscountAmount(selectedPlan, appliedPromo).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-800 dark:text-slate-100 font-extrabold text-sm border-t border-slate-100 dark:border-slate-700 pt-2 mt-1">
                              <span>Total Payable</span>
                              <span className="text-indigo-600 dark:text-indigo-400">
                                ₹{(paymentModeOption === 'gateway' ? getFinalAmount() : parseFloat(manualAmount || '0')).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Submit button tied to the form */}
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={submitting}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
                      >
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          paymentModeOption === 'gateway' ? '🚀 Submit Request' : '✅ Create Bill'
                        )}
                      </button>

                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        A request will be created under the <strong>Request</strong> menu for review.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TRANSACTION HISTORY TAB ================= */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-6">
          {/* Edit Inline Form Box */}
          {editingId && (
            <div ref={formRef} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-7 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Edit Bill</h2>
                <button
                  onClick={handleResetForm}
                  className="p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Segment<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select
                      value={formSegment}
                      onChange={e => {
                        setFormSegment(e.target.value)
                        setSchoolName('')
                        setPlanName('')
                      }}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select Segment</option>
                      {segments.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      School/Application<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select School</option>
                      {schools
                        .filter(s => !formSegment || s.segment_name === formSegment || !s.segment_name)
                        .map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select
                      value={planName}
                      onChange={e => setPlanName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select Plan</option>
                      {filteredPlans.map(p => (
                        <option key={p.id} value={p.plan_name}>{p.plan_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Payment Mode<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="Bank Account">Bank Account</option>
                      <option value="UPI ID">UPI ID</option>
                      <option value="QR Mode">QR Mode</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Amount (₹)<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Payment Date<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID / Ref</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN998877"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Bill
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter and Log Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-0">
                {/* Segment Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Segment</option>
                    {segments.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* School Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">School</label>
                  <select
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select School</option>
                    {Array.from(new Set(schools.map(s => s.name))).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Mode Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={filterPaymentMode}
                    onChange={(e) => setFilterPaymentMode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Bank Account">Bank Account</option>
                    <option value="UPI ID">UPI ID</option>
                    <option value="QR Mode">QR Mode</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="QR Code">QR Code</option>
                  </select>
                </div>

                {/* Select Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Date</label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Option</option>
                    <option value="Last Week">Last Week</option>
                    <option value="Last 15 Days">Last 15 Days</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                title="Export bills"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Mode</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Date</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Bill</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                          Loading transaction records...
                        </div>
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-semibold">{bill.segment}</td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-semibold">{bill.school_name}</td>
                          <td className="px-5 py-4 text-slate-650 dark:text-slate-400">{bill.plan_name}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
                              {bill.payment_mode}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{formatDateOnly(bill.payment_date)}</td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDownloadPDF(bill)}
                              className="w-8 h-8 inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-900/40"
                              title="Download Invoice (PDF)"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStartEdit(bill)}
                                className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Bill"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(bill.id)}
                                className="w-7 h-7 flex items-center justify-center bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Bill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Showing {startEntry}-{endEntry} of {totalCount} Entries
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchBills(1)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'<<'}
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchBills(currentPage - 1)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchBills(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pg === currentPage
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchBills(currentPage + 1)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchBills(totalPages)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'>>'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Bill"
        description="Are you sure you want to delete this transaction record? This action cannot be undone."
      />

      {/* ================= VIEW PLAN MODAL ================= */}
      {showViewPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowViewPlanModal(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-55 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              Plan Breakdown: {showViewPlanModal.plan_name}
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showViewPlanModal.description || 'Check billing components details of the selected plan below.'}
              </p>
              <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                    <tr>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Price</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Tax</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                    {showViewPlanModal.first_billing_items && showViewPlanModal.first_billing_items.length > 0 ? (
                      showViewPlanModal.first_billing_items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">{item.item_description}</td>
                          <td className="p-3 text-right">₹{item.price}</td>
                          <td className="p-3 text-right">₹{item.tax_price} ({item.tax_percentage}%)</td>
                          <td className="p-3 text-right font-extrabold text-slate-800 dark:text-slate-100">
                            ₹{Number(item.price) + Number(item.tax_price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">Base Subscription Fee</td>
                        <td className="p-3 text-right">₹1000</td>
                        <td className="p-3 text-right">₹200 (20%)</td>
                        <td className="p-3 text-right font-extrabold text-slate-800 dark:text-slate-100">₹1200</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center bg-[#EBF6F6]/40 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Subscription Price</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">₹{getPlanPrice(showViewPlanModal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROMO CODE SELECTION MODAL ================= */}
      {promoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-4xl w-full p-8 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setPromoModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Tabs Header */}
            <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 pb-5 justify-center">
              <button
                onClick={() => setPromoActiveTab('amount')}
                className={`flex items-center px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  promoActiveTab === 'amount'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Amount Discount
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  promoActiveTab === 'amount'
                    ? 'bg-white text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {amountPromoCodes.length.toString().padStart(2, '0')}
                </span>
              </button>
              <button
                onClick={() => setPromoActiveTab('percentage')}
                className={`flex items-center px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  promoActiveTab === 'percentage'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Percentage Discount
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  promoActiveTab === 'percentage'
                    ? 'bg-white text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {percentagePromoCodes.length.toString().padStart(2, '0')}
                </span>
              </button>
            </div>

            {/* Promo Codes Grid */}
            <div className="mt-8">
              {activePromoList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Ticket className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No promo codes found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {promoActiveTab === 'amount' ? 'No fixed amount promo codes created yet.' : 'No percentage discount promo codes created yet.'}
                  </p>
                  <a href="/admin/promo-code" className="mt-4 text-xs font-bold text-indigo-600 hover:underline cursor-pointer">+ Create Promo Code</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activePromoList.map((pc) => (
                    <div
                      key={pc.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl flex overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Left Stripe Indicator */}
                      <div className={`w-24 shrink-0 flex items-center justify-center ${pc.color.split(' ')[0]}`}>
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center text-white">
                          <Percent className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Right Details content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            {pc.category}
                          </span>
                          <h4 className={`text-sm font-extrabold mt-0.5 ${pc.color.split(' ')[1]}`}>
                            {pc.code}
                          </h4>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                            Created: {pc.created_at ? pc.created_at.split('-').reverse().join('/') : '—'}
                          </span>
                          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-2">
                            {pc.discount_type === 'Fixed' ? `Amount ₹${pc.discount_value}/- Off` : `${pc.discount_value}% Off`}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setAppliedPromo(pc)
                            setPromoModalOpen(false)
                            toast.success(`Promo code ${pc.code} applied!`)
                          }}
                          className="text-xs font-extrabold text-slate-500 hover:text-indigo-600 transition-colors self-end mt-4 cursor-pointer flex items-center gap-1.5"
                        >
                          Apply &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default function AllBillsPage() {
  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }>
        <BillingDashboardContent />
      </Suspense>
    </>
  )
}
