'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
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

interface Application {
  id: string
  school_name: string
  plan: string
}

interface Plan {
  id: string
  plan_name: string
  segment: string
  description?: string
  first_billing_duration?: number
  first_billing_items?: Array<{
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

const defaultPromoCodes = [
  { id: 'm1', code: 'WELCOME500', discount_name: 'Welcome Discount', discount_type: 'Fixed', discount_value: 500, created_at: '2025-11-01', category: 'First Time', color: 'bg-green-600 text-green-600 border-green-600/10 text-green-700' },
  { id: 'm2', code: 'RENEW1000', discount_name: 'Renewal Offer', discount_type: 'Fixed', discount_value: 1000, created_at: '2025-11-01', category: 'Renewal', color: 'bg-purple-600 text-purple-600 border-purple-600/10 text-purple-700' },
  { id: 'm3', code: 'ADVANCE1500', discount_name: 'Advance Pay', discount_type: 'Fixed', discount_value: 1500, created_at: '2025-11-01', category: 'Advance Payment', color: 'bg-violet-600 text-violet-600 border-violet-600/10 text-violet-700' },
  { id: 'm4', code: 'FESTIVE800', discount_name: 'Festival Bonus', discount_type: 'Fixed', discount_value: 800, created_at: '2025-11-01', category: 'First Time', color: 'bg-rose-600 text-rose-600 border-rose-600/10 text-rose-700' },
  { id: 'm5', code: 'CORP1200', discount_name: 'Corporate Code', discount_type: 'Fixed', discount_value: 1200, created_at: '2025-11-01', category: 'Renewal', color: 'bg-teal-700 text-teal-700 border-teal-700/10 text-teal-800' },
  { id: 'm6', code: 'SPECIAL2000', discount_name: 'Special Deal', discount_type: 'Fixed', discount_value: 2000, created_at: '2025-11-01', category: 'Advance Payment', color: 'bg-lime-600 text-lime-600 border-lime-600/10 text-lime-700' },

  { id: 'p1', code: 'FIRST10', discount_name: 'First Time 10%', discount_type: 'Percentage', discount_value: 10, created_at: '2025-11-01', category: 'First Time', color: 'bg-green-600 text-green-600 border-green-600/10 text-green-700' },
  { id: 'p2', code: 'RENEW15', discount_name: 'Renewal 15%', discount_type: 'Percentage', discount_value: 15, created_at: '2025-11-01', category: 'Renewal', color: 'bg-purple-600 text-purple-600 border-purple-600/10 text-purple-700' },
  { id: 'p3', code: 'ADVANCE20', discount_name: 'Advance 20%', discount_type: 'Percentage', discount_value: 20, created_at: '2025-11-01', category: 'Advance Payment', color: 'bg-violet-600 text-violet-600 border-violet-600/10 text-violet-700' },
  { id: 'p4', code: 'MEGA25', discount_name: 'Mega 25% Off', discount_type: 'Percentage', discount_value: 25, created_at: '2025-11-01', category: 'First Time', color: 'bg-rose-600 text-rose-600 border-rose-600/10 text-rose-700' }
]

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
  const [schools, setSchools] = useState<Application[]>([])
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
  const [status, setStatus] = useState('Paid')
  const [submitting, setSubmitting] = useState(false)

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

      const schoolRes = await fetch('/api/admin/application')
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
      const res = await fetch(`/api/admin/plan?pageSize=50`)
      const data = await res.json()
      if (data.success) {
        const segmentPlans = data.data.filter((p: any) => p.segment === segmentName)
        
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
  const handleSelectionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSegment) { toast.error('Segment is required'); return }
    if (!selectedSchool) { toast.error('School Name is required'); return }
    
    setIsSubmitted(true)
    fetchPlansWithDetails(selectedSegment)
  }

  // Calculate pricing values
  const getPlanPrice = (plan: Plan | null) => {
    if (!plan) return 0
    if (!plan.first_billing_items || plan.first_billing_items.length === 0) {
      return 1200 // Default fallback base price
    }
    return plan.first_billing_items.reduce((sum, item) => sum + Number(item.price) + Number(item.tax_price || 0), 0)
  }

  // Calculate plan validity dates
  const getPlanDates = (plan: Plan | null) => {
    const from = new Date()
    const duration = plan?.first_billing_duration || 365
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

  // Get active list of promo codes
  const getPromoCodesList = () => {
    const dbMapped = allPromoCodes.map((pc: DBPromoCode, idx: number) => {
      const colors = [
        'bg-green-600 text-green-600 border-green-600/10 text-green-700',
        'bg-purple-600 text-purple-600 border-purple-600/10 text-purple-700',
        'bg-violet-600 text-violet-600 border-violet-600/10 text-violet-700',
        'bg-rose-600 text-rose-600 border-rose-600/10 text-rose-700',
        'bg-teal-700 text-teal-700 border-teal-700/10 text-teal-800',
        'bg-lime-600 text-lime-600 border-lime-600/10 text-lime-700'
      ]
      return {
        id: pc.id,
        code: pc.code,
        discount_name: pc.discount_name || 'Promo Code Name',
        discount_type: pc.discount_type,
        discount_value: parseFloat(pc.discount_value),
        created_at: pc.created_at ? pc.created_at.substring(0, 10) : '2025-11-01',
        category: pc.applicable_by || 'Promo Offer',
        color: colors[idx % colors.length]
      }
    })

    const combined = [...dbMapped]
    defaultPromoCodes.forEach(def => {
      if (!combined.some(c => c.code === def.code)) {
        combined.push(def)
      }
    })

    return combined
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
  }, [selectedPlan, appliedPromo])

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
      const finalStatus = paymentModeOption === 'gateway' ? 'Pending' : 'Paid'

      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: selectedSegment,
          school_name: selectedSchool,
          plan_name: selectedPlan.plan_name,
          payment_mode: modeLabel,
          payment_date: new Date().toISOString().substring(0, 10),
          amount: finalVal,
          transaction_id: finalTxn,
          status: finalStatus
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(paymentModeOption === 'gateway' ? 'Payment request submitted successfully!' : 'Bill created successfully!')
        setWizardStep(1)
        setIsSubmitted(false)
        setSelectedPlan(null)
        setAppliedPromo(null)
        setTxnId('')
        setScreenshotName('')
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

  const filteredSchools = schools.filter(app => {
    if (!formSegment) return true
    const appPlan = plans.find(p => p.plan_name === app.plan)
    return appPlan ? appPlan.segment === formSegment : true
  })

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
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15'
                : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            Purchase Plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15'
                : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
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
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
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
                          setSelectedSchool(e.target.value)
                          setIsSubmitted(false)
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                        required
                        disabled={!selectedSegment}
                      >
                        <option value="">Select School</option>
                        {Array.from(new Set(schools.filter(s => {
                          const appPlan = plans.find(p => p.plan_name === s.plan)
                          return !selectedSegment || (appPlan ? appPlan.segment === selectedSegment : true)
                        }).map(s => s.school_name))).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 hover:shadow-teal-600/20 cursor-pointer h-[42px] shrink-0"
                  >
                    Submit
                  </button>
                </form>
              </div>

              {/* Step 1: Plans Display Grid */}
              {isSubmitted && (
                <div className="flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 px-1">Available Plans</h2>
                  {loadingPlans ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
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
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
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
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EBF6F6] dark:bg-slate-750 hover:bg-[#EBF6F6]/80 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-bold transition-all border border-teal-100 dark:border-slate-600 cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                                View Plan
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPlan(p)
                                  setWizardStep(2)
                                }}
                                className="flex-1 md:flex-none px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
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
            </>
          ) : (
            /* Step 2: Redesigned Checkout View */
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setWizardStep(1)}
                className="self-start flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                &larr; Back to plan list
              </button>

              {/* Promo Code section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm max-w-xl w-full mx-auto flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Promo Code</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select Promo Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      placeholder="Select Promo Code"
                      onClick={() => setPromoModalOpen(true)}
                      value={appliedPromo ? `${appliedPromo.code} - Applied (${appliedPromo.discount_type === 'Fixed' ? `₹${appliedPromo.discount_value} Off` : `${appliedPromo.discount_value}% Off`})` : ''}
                      className="w-full px-4 py-3 pr-12 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => setPromoModalOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 flex items-center justify-center text-teal-600 cursor-pointer transition-colors border border-teal-100/50"
                    >
                      <Percent className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Redesigned Payment Form Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-6">
                  {/* Payment Mode Heading */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Payment Mode</h3>
                    
                    {/* Radio Options Grid */}
                    <div className="flex flex-wrap items-center gap-6 mt-4">
                      <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentModeOption === 'gateway'}
                          onChange={() => setPaymentModeOption('gateway')}
                          className="w-4.5 h-4.5 text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        Payment Gateway
                      </label>
                      <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentModeOption === 'bank'}
                          onChange={() => setPaymentModeOption('bank')}
                          className="w-4.5 h-4.5 text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        Bank
                      </label>
                      <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentModeOption === 'upi'}
                          onChange={() => setPaymentModeOption('upi')}
                          className="w-4.5 h-4.5 text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        UPI
                      </label>
                      <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentModeOption === 'qr'}
                          onChange={() => setPaymentModeOption('qr')}
                          className="w-4.5 h-4.5 text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        QR Code
                      </label>
                    </div>
                  </div>

                  {/* Dynamic sections based on radio */}

                  {/* 1. Payment Gateway Option */}
                  {paymentModeOption === 'gateway' && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-700/80 pt-5">
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Razorpay Payment Gateway 1</span>
                          <button
                            type="button"
                            onClick={() => handleGenerateLink('Razorpay')}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-650 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
                          >
                            Generate Link
                          </button>
                        </div>

                        {/* Status pending badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-450 dark:text-slate-400">Status</span>
                          <span className="bg-[#FEF9C3] dark:bg-yellow-950/20 text-[#A16207] dark:text-yellow-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-1.5 shrink-0 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Phonepay Payment Gateway 1</span>
                        <button
                          type="button"
                          onClick={() => handleGenerateLink('Phonepe')}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-650 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
                        >
                          Generate Link
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Bank Option */}
                  {paymentModeOption === 'bank' && (
                    <div className="flex flex-col gap-5 border-t border-slate-100 dark:border-slate-700/80 pt-5">
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Bank Details</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Account No.</label>
                          <input
                            type="text"
                            value={bankAccountNo}
                            onChange={e => setBankAccountNo(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-850 dark:text-slate-150"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">IFSC Code</label>
                          <input
                            type="text"
                            value={bankIfsc}
                            onChange={e => setBankIfsc(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-850 dark:text-slate-150"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Account Holder Name</label>
                          <input
                            type="text"
                            value={bankHolderName}
                            onChange={e => setBankHolderName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-850 dark:text-slate-150"
                          />
                        </div>
                      </div>

                      {/* Payment Details Input Fields */}
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1 mt-3">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Payment Details</h4>
                      </div>

                      <div className="flex flex-col md:flex-row items-end gap-5">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID</label>
                            <input
                              type="text"
                              placeholder="Enter Transaction ID"
                              value={txnId}
                              onChange={e => setTxnId(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Attach a file"
                                readOnly
                                value={screenshotName}
                                onClick={() => setScreenshotName('screenshot_bank_txn.png')}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-pointer"
                              />
                              <Paperclip className="w-4 h-4 text-teal-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</label>
                            <input
                              type="number"
                              placeholder="Enter Amount"
                              value={manualAmount}
                              onChange={e => setManualAmount(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Plus button */}
                        <div
                          onClick={() => toast.success('Payment Details line added')}
                          className="w-11 h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-colors shrink-0 shadow-sm shadow-teal-600/10"
                        >
                          +
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. UPI Option */}
                  {paymentModeOption === 'upi' && (
                    <div className="flex flex-col gap-5 border-t border-slate-100 dark:border-slate-700/80 pt-5">
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">UPI Details</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-850 dark:text-slate-150"
                          />
                        </div>
                      </div>

                      {/* Payment Details Input Fields */}
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1 mt-3">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Payment Details</h4>
                      </div>

                      <div className="flex flex-col md:flex-row items-end gap-5">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID</label>
                            <input
                              type="text"
                              placeholder="Enter Transaction ID"
                              value={txnId}
                              onChange={e => setTxnId(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Attach a file"
                                readOnly
                                value={screenshotName}
                                onClick={() => setScreenshotName('screenshot_upi_txn.png')}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-pointer"
                              />
                              <Paperclip className="w-4 h-4 text-teal-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</label>
                            <input
                              type="number"
                              placeholder="Enter Amount"
                              value={manualAmount}
                              onChange={e => setManualAmount(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Plus button */}
                        <div
                          onClick={() => toast.success('Payment Details line added')}
                          className="w-11 h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-colors shrink-0 shadow-sm shadow-teal-600/10"
                        >
                          +
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. QR Code Option */}
                  {paymentModeOption === 'qr' && (
                    <div className="flex flex-col gap-5 border-t border-slate-100 dark:border-slate-700/80 pt-5">
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">QR Details</h4>
                      </div>

                      {/* Mockup QR Code SVG */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-48 h-48 flex items-center justify-center shadow-sm">
                        <svg className="w-40 h-40 text-slate-900 dark:text-white" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Squares */}
                          <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                          <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                          <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                          {/* Random noise squares mimicking QR code content */}
                          <rect x="40" y="5" width="10" height="15" />
                          <rect x="55" y="15" width="10" height="10" />
                          <rect x="45" y="40" width="15" height="15" />
                          <rect x="15" y="45" width="10" height="10" />
                          <rect x="75" y="45" width="15" height="10" />
                          <rect x="40" y="70" width="15" height="10" />
                          <rect x="55" y="85" width="10" height="10" />
                          <rect x="75" y="75" width="15" height="15" />
                          <rect x="85" y="60" width="10" height="10" />
                        </svg>
                      </div>

                      {/* Payment Details Input Fields */}
                      <div className="border-b border-slate-150 dark:border-slate-700 pb-1 mt-3">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Payment Details</h4>
                      </div>

                      <div className="flex flex-col md:flex-row items-end gap-5">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID</label>
                            <input
                              type="text"
                              placeholder="Enter Transaction ID"
                              value={txnId}
                              onChange={e => setTxnId(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Attach a file"
                                readOnly
                                value={screenshotName}
                                onClick={() => setScreenshotName('screenshot_qr_txn.png')}
                                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-pointer"
                              />
                              <Paperclip className="w-4 h-4 text-teal-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</label>
                            <input
                              type="number"
                              placeholder="Enter Amount"
                              value={manualAmount}
                              onChange={e => setManualAmount(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Plus button */}
                        <div
                          onClick={() => toast.success('Payment Details line added')}
                          className="w-11 h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-colors shrink-0 shadow-sm shadow-teal-600/10"
                        >
                          +
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Plan Details Summary Table */}
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="border-b border-slate-150 dark:border-slate-700 pb-1">
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Plan Details</h4>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                      <table className="w-full border-collapse text-left text-xs bg-slate-50/20 dark:bg-slate-900/10">
                        <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                          <tr>
                            <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Name</th>
                            <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Descritpion</th>
                            <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid From</th>
                            <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid To</th>
                            <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80">
                          <tr className="text-slate-700 dark:text-slate-300 font-medium">
                            <td className="px-5 py-4 font-bold">{selectedPlan?.plan_name}</td>
                            <td className="px-5 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {selectedPlan?.description || 'Auto-generated plan breakdown description.'}
                            </td>
                            <td className="px-5 py-4 font-semibold">{dates.validFrom}</td>
                            <td className="px-5 py-4 font-semibold">{dates.validTo}</td>
                            <td className="px-5 py-4 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                              ₹{paymentModeOption === 'gateway' ? getFinalAmount().toFixed(2) : parseFloat(manualAmount || '0').toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-3 bg-[#E8F5F5] dark:bg-slate-750 text-teal-800 dark:text-teal-400 border border-teal-100 dark:border-slate-650 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white transition-all shadow-sm cursor-pointer min-w-[180px] text-center"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        paymentModeOption === 'gateway' ? 'Submit Request' : 'Create Bill'
                      )}
                    </button>
                  </div>

                </form>
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select School</option>
                      {Array.from(new Set(filteredSchools.map(s => s.school_name))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select
                      value={planName}
                      onChange={e => setPlanName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
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
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
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
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center gap-2"
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
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
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
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  >
                    <option value="">Select School</option>
                    {Array.from(new Set(schools.map(s => s.school_name))).map(name => (
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
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
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
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
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
                          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
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
                              className="w-8 h-8 inline-flex items-center justify-center bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-lg transition-colors cursor-pointer border border-teal-100 dark:border-teal-900/40"
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
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'<<'}
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchBills(currentPage - 1)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchBills(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pg === currentPage
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchBills(currentPage + 1)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchBills(totalPages)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
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
              <div className="flex justify-between items-center bg-[#EBF6F6]/40 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100/50 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Subscription Price</span>
                <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">₹{getPlanPrice(showViewPlanModal)}</span>
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
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Amount Discount
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  promoActiveTab === 'amount'
                    ? 'bg-white text-teal-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {amountPromoCodes.length.toString().padStart(2, '0')}
                </span>
              </button>
              <button
                onClick={() => setPromoActiveTab('percentage')}
                className={`flex items-center px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  promoActiveTab === 'percentage'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Percentage Discount
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  promoActiveTab === 'percentage'
                    ? 'bg-white text-teal-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {percentagePromoCodes.length.toString().padStart(2, '0')}
                </span>
              </button>
            </div>

            {/* Promo Codes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
                        Create At : {pc.created_at.split('-').reverse().join('/')}
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
                      className="text-xs font-extrabold text-slate-500 hover:text-teal-600 transition-colors self-end mt-4 cursor-pointer flex items-center gap-1.5"
                    >
                      Apply &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default function AllBillsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }>
        <BillingDashboardContent />
      </Suspense>
    </AdminLayout>
  )
}
