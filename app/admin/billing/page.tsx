'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Plus, Edit3, Trash2, FileText, Download, Loader2, 
  ChevronLeft, ChevronRight, X, Percent, Tag, Ticket, Check, Paperclip, Calendar,
  Building2, Phone, Mail, User, MapPin, ShieldCheck, Award,
  CreditCard, Smartphone, QrCode, Building, Receipt, CheckCircle2, DollarSign, Clock, Sparkles, AlertCircle, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { SearchableDropdown } from '@/components/ui/SearchableDropdown'

interface Bill {
  id: string
  segment: string
  school_name: string
  plan_name: string
  plan_id?: string | null
  payment_mode: string
  payment_date: string
  amount: number
  transaction_id: string
  status: string
  created_at: string
  screenshots?: any
  institution_id?: string | null
}

interface Segment {
  id: string
  name: string
}

interface InstituteOption {
  id: string
  name: string
  code?: string
  contact_person?: string
  mobile_no?: string
  email_id?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
  segment_name?: string | null
  segment_id?: string | null
}

interface Plan {
  id: string
  plan_name: string
  segment: string
  description?: string
  brochure_url?: string
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
  menus?: string[]
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
  const [wizardStep, setWizardStep] = useState<0 | 1 | 2>(1)
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
  const [viewPlanTab, setViewPlanTab] = useState<'first' | 'renewal'>('first')

  // Payment Mode selections & fields (Step 2)
  const [paymentModeOption, setPaymentModeOption] = useState<'gateway' | 'bank' | 'upi' | 'qr'>('gateway')
  
  // Bank transfer inputs
  const [bankAccountNo, setBankAccountNo] = useState('1234567890')
  const [bankIfsc, setBankIfsc] = useState('ABCD1234567890')
  const [bankHolderName, setBankHolderName] = useState('Ashok Kumar')

  // UPI transfer inputs
  const [upiId, setUpiId] = useState('abcd1234567890')

  // Manual payment inputs
  const [payments, setPayments] = useState<{ id: number, txnId: string, amount: string, screenshot: string, screenshotData?: string }[]>([{ id: 1, txnId: '', amount: '', screenshot: '', screenshotData: '' }])
  const addPayment = () => setPayments([...payments, { id: Date.now(), txnId: '', amount: '', screenshot: '', screenshotData: '' }])
  const updatePayment = (id: number, field: string, value: string) => setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p))
  const removePayment = (id: number) => setPayments(payments.filter(p => p.id !== id))

  // Invoice Line Items & Metadata
  const [invoiceNo, setInvoiceNo] = useState(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().substring(0, 10))
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().substring(0, 10)
  })
  const [invoicePaymentTerms, setInvoicePaymentTerms] = useState('Due on Receipt')
  const [invoicePoNumber, setInvoicePoNumber] = useState('')
  const [invoiceNotes, setInvoiceNotes] = useState('Subscription & service charges for Academy Setu ERP Platform.')
  const [invoiceTerms, setInvoiceTerms] = useState('Payment is non-refundable. Validity starts upon service activation.')
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    id: string
    description: string
    quantity: number
    price: number
    tax_percentage: number
    tax_price: number
    total: number
  }>>([])

  const handleAddInvoiceItem = () => {
    setInvoiceItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        price: 0,
        tax_percentage: 0,
        tax_price: 0,
        total: 0
      }
    ])
  }

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceItems(prev => {
      if (prev.length <= 1) return prev
      return prev.filter(item => item.id !== id)
    })
  }

  const handleInvoiceItemChange = (id: string, field: 'description' | 'quantity' | 'price' | 'tax_percentage', value: any) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      const price = Number(field === 'price' ? value : item.price) || 0
      const qty = Number(field === 'quantity' ? value : item.quantity) || 1
      const taxPct = Number(field === 'tax_percentage' ? value : item.tax_percentage) || 0
      const sub = price * qty
      const taxPrice = (sub * taxPct) / 100
      return {
        ...updated,
        tax_price: taxPrice,
        total: sub + taxPrice
      }
    }))
  }

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
  const [instDetails, setInstDetails] = useState<any>(null)
  const [instActivePlan, setInstActivePlan] = useState<any>(null)
  const [instUpcomingPlans, setInstUpcomingPlans] = useState<any[]>([])
  const [instPlanHistory, setInstPlanHistory] = useState<any[]>([])
  const [instHasPendingRenewal, setInstHasPendingRenewal] = useState<boolean>(false)
  const [instHasPaidRenewal, setInstHasPaidRenewal] = useState<boolean>(false)
  const [segmentInstitutesList, setSegmentInstitutesList] = useState<any[]>([])
  const [showAllPlansOverride, setShowAllPlansOverride] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState<'new' | 'renew' | 'change' | 'upcoming' | 'edit'>('new')
  const [showActivePlanFeatures, setShowActivePlanFeatures] = useState(false)
  const [showRenewalFeatures, setShowRenewalFeatures] = useState(false)
  const [showUpcomingFeatures, setShowUpcomingFeatures] = useState<Record<string, boolean>>({})
  
  // Fully Editable Bill State Variables
  const [fromCompanyName, setFromCompanyName] = useState('Academy Setu Technologies Pvt. Ltd.')
  const [fromCompanySubtitle, setFromCompanySubtitle] = useState('Platform Accounts & Billing Support Desk')
  const [fromSegment, setFromSegment] = useState('')

  const [billInstName, setBillInstName] = useState('')
  const [billInstCode, setBillInstCode] = useState('')
  const [billInstContact, setBillInstContact] = useState('')
  const [billInstMobile, setBillInstMobile] = useState('')
  const [billInstEmail, setBillInstEmail] = useState('')
  const [billInstAddress, setBillInstAddress] = useState('')

  const [billPlanName, setBillPlanName] = useState('')
  const [billPlanBadge, setBillPlanBadge] = useState('New Plan')
  const [billPlanDuration, setBillPlanDuration] = useState('365')
  const [billValidFrom, setBillValidFrom] = useState(() => new Date().toISOString().substring(0, 10))
  const [billValidTo, setBillValidTo] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 365)
    return d.toISOString().substring(0, 10)
  })

  // Synchronize editable bill institute details
  useEffect(() => {
    if (instDetails) {
      setBillInstName(instDetails.name || selectedSchool || '')
      setBillInstCode(instDetails.code || '')
      setBillInstContact(instDetails.contact_person || '')
      setBillInstMobile(instDetails.mobile_no || '')
      setBillInstEmail(instDetails.email_id || '')
      const addr = [instDetails.address, instDetails.district, instDetails.state, instDetails.pincode].filter(Boolean).join(', ')
      setBillInstAddress(addr)
    } else if (selectedSchool) {
      setBillInstName(selectedSchool)
      const sch = schools.find(s => s.name === selectedSchool)
      if (sch) {
        setBillInstCode(sch.code || '')
        setBillInstContact(sch.contact_person || '')
        setBillInstMobile(sch.mobile_no || '')
        setBillInstEmail(sch.email_id || '')
        const addr = [sch.address, sch.district, sch.state, sch.pincode].filter(Boolean).join(', ')
        setBillInstAddress(addr)
      }
    }
  }, [instDetails, selectedSchool, schools])

  // Synchronize plan package fields
  useEffect(() => {
    if (selectedPlan) {
      setBillPlanName(selectedPlan.plan_name || '')
      if (purchaseMode !== 'edit') {
        setBillPlanBadge(
          purchaseMode === 'renew' ? 'Renewal Plan' :
          purchaseMode === 'change' ? 'Plan Upgrade' :
          purchaseMode === 'upcoming' ? 'Upcoming Plan' : 'New Plan'
        )
      }
      const dur = purchaseMode === 'renew' ? (selectedPlan.renewal_billing_duration || 365) : (selectedPlan.first_billing_duration || 365)
      setBillPlanDuration(String(dur))
      const from = new Date()
      const to = new Date()
      to.setDate(from.getDate() + Number(dur || 365))
      setBillValidFrom(from.toISOString().substring(0, 10))
      setBillValidTo(to.toISOString().substring(0, 10))
    }
  }, [selectedPlan, purchaseMode])

  useEffect(() => {
    if (selectedSegment) {
      setFromSegment(selectedSegment)
    }
  }, [selectedSegment])

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

      const planRes = await fetch('/api/admin/plan?pageSize=100')
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
    
    setIsSubmitted(true)
    setInstPlansLoading(true)
    setInstActivePlan(null)
    setInstUpcomingPlans([])
    setInstPlanHistory([])
    setInstDetails(null)

    if (selectedSchool) {
      setSegmentInstitutesList([])
      const schoolObj = schools.find(s => s.name === selectedSchool)
      if (schoolObj) {
        try {
          const res = await fetch(`/api/admin/billing/institute-plans?institution_id=${schoolObj.id}`)
          const data = await res.json()
          if (data.success) {
            setInstDetails(data.institutionDetails || schoolObj)
            setInstActivePlan(data.activePlan)
            setInstUpcomingPlans(data.upcomingPlans || [])
            setInstPlanHistory(data.planHistory || [])
            setInstHasPendingRenewal(data.hasPendingRenewal || false)
            setInstHasPaidRenewal(data.hasPaidRenewal || false)
          }
        } catch (err) {
          console.error('Failed to load institute plans', err)
        }
      }
    } else {
      try {
        const res = await fetch(`/api/admin/billing/institute-plans?segment=${encodeURIComponent(selectedSegment)}`)
        const data = await res.json()
        if (data.success) {
          setSegmentInstitutesList(data.institutesList || [])
        }
      } catch (err) {
        console.error('Failed to load segment institutes', err)
      }
    }

    setInstPlansLoading(false)
    fetchPlansWithDetails(selectedSegment)
  }

  // Helper functions for item price calculations
  const getItemTaxAmount = (item: any) => {
    const price = Number(item.price) || 0
    const taxPrice = Number(item.tax_price) || 0
    const taxPct = Number(item.tax_percentage) || 0
    if (taxPrice >= price && price > 0) {
      return taxPrice - price
    }
    if (taxPrice > 0) return taxPrice
    return (price * taxPct) / 100
  }

  const getItemTotal = (item: any) => {
    const price = Number(item.price) || 0
    const taxPrice = Number(item.tax_price) || 0
    if (taxPrice >= price && price > 0) {
      return taxPrice
    }
    return price + taxPrice
  }

  // Calculate pricing values
  const getPlanPrice = (plan: Plan | null) => {
    if (!plan) return 0
    const items = (purchaseMode === 'renew' || purchaseMode === 'upcoming') && plan.renewal_billing_items?.length ? plan.renewal_billing_items : plan.first_billing_items
    if (!items || items.length === 0) {
      if ((plan as any).amount) return Number((plan as any).amount)
      if ((plan as any).price) return Number((plan as any).price)
      return 0
    }
    return items.reduce((sum: number, item: any) => sum + getItemTotal(item), 0)
  }

  // Calculate plan validity dates
  const getPlanDates = (plan: Plan | null) => {
    const from = new Date()
    const duration = (purchaseMode === 'renew' || purchaseMode === 'upcoming') && plan?.renewal_billing_duration ? plan.renewal_billing_duration : (plan?.first_billing_duration || 365)
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
      description: pc.description,
      discount_name: pc.discount_name || 'Promo Code',
      discount_type: pc.discount_type,
      discount_value: parseFloat(pc.discount_value),
      created_at: pc.created_at ? pc.created_at.substring(0, 10) : '',
      category: pc.applicable_by || 'Promo Offer',
      color: colors[idx % colors.length]
    }))
  }

  // Helper for gross amount
  const getTotalEntered = () => payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  const getInvoiceSubtotal = () => {
    if (invoiceItems.length > 0) {
      return invoiceItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0)
    }
    return getPlanPrice(selectedPlan)
  }

  const getInvoiceTaxTotal = () => {
    if (invoiceItems.length > 0) {
      return invoiceItems.reduce((sum, item) => sum + Number(item.tax_price || 0), 0)
    }
    return 0
  }
  
  const getGrossAmount = () => {
    if (invoiceItems.length > 0) {
      return invoiceItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
    }
    if (!selectedPlan) return 0
    if (purchaseMode === 'edit') return getTotalEntered()
    return getPlanPrice(selectedPlan)
  }

  // Calculate discount figures
  const getPromoDiscountAmount = (plan: Plan | null, promo: any) => {
    if (!plan || !promo) return 0
    const price = getGrossAmount()
    if (promo.discount_type === 'Percentage') {
      return (price * Number(promo.discount_value)) / 100
    }
    return Number(promo.discount_value)
  }

  // Get final calculated payment amount
  const getFinalAmount = () => {
    if (!selectedPlan) return 0
    const grossPrice = getGrossAmount()
    const discount = getPromoDiscountAmount(selectedPlan, appliedPromo)
    return Math.max(0, grossPrice - discount)
  }

  // Pre-fill manual amount field and line items when plan or promo changes
  useEffect(() => {
    if (selectedPlan && purchaseMode !== 'edit') {
      const items = (purchaseMode === 'renew' || purchaseMode === 'upcoming') && selectedPlan.renewal_billing_items?.length ? selectedPlan.renewal_billing_items : selectedPlan.first_billing_items
      if (items && items.length > 0) {
        setInvoiceItems(items.map((it: any, idx: number) => {
          const price = Number(it.price) || 0
          const taxPct = Number(it.tax_percentage) || 0
          const taxPrice = getItemTaxAmount(it)
          const total = getItemTotal(it)
          return {
            id: String(idx + 1),
            description: it.item_description || selectedPlan.plan_name,
            quantity: 1,
            price: price,
            tax_percentage: taxPct,
            tax_price: taxPrice,
            total: total
          }
        }))
      } else {
        const basePrice = Number((selectedPlan as any).price) || 1200
        setInvoiceItems([{
          id: '1',
          description: `${selectedPlan.plan_name} Platform Subscription`,
          quantity: 1,
          price: basePrice,
          tax_percentage: 0,
          tax_price: 0,
          total: basePrice
        }])
      }

      setPayments(prev => {
        if (prev.length === 1 && !prev[0].txnId && !prev[0].screenshot) {
          return [{ ...prev[0], amount: String(getFinalAmount()) }]
        }
        return prev
      })
    }
  }, [selectedPlan, purchaseMode])

  // Trigger checkout creation
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    // If manual mode, require some validation (only for new plan purchases, not when editing from transaction history)
    if (purchaseMode !== 'edit' && paymentModeOption !== 'gateway') {
      if (payments.some(p => !p.txnId?.trim())) { 
        toast.error('Transaction ID / UTR is required for all attached payments')
        return 
      }
      if (payments.some(p => !p.amount || parseFloat(p.amount) <= 0)) { 
        toast.error('Valid amount is required for all attached payments')
        return 
      }
      if (payments.some(p => !p.screenshot?.trim() && !p.screenshotData?.trim())) { 
        toast.error('Payment proof screenshot / receipt is required for all attached payments')
        return 
      }
      
      const totalRequired = getFinalAmount()
      const totalAttached = getTotalEntered()
      if (totalAttached < totalRequired) {
        toast.error(`Attached payment amount (₹${totalAttached.toFixed(2)}) is less than total required (₹${totalRequired.toFixed(2)}). Please enter the full amount before submitting.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const modeLabel = {
        gateway: 'Payment Gateway',
        bank: 'Bank Transfer',
        upi: 'UPI ID',
        qr: 'QR Code'
      }[paymentModeOption]

      const finalVal = getFinalAmount()
      const isGateway = paymentModeOption === 'gateway'
      const finalTxn = isGateway ? `TXN${Math.floor(100000 + Math.random() * 900000)}` : payments.map(p => p.txnId).join(', ')
      const finalStatus = isGateway ? 'Paid' : 'Pending'

      // Resolve institution_id from loaded schools list or active edited state
      const selectedSchoolObj = schools.find(s => s.name === (billInstName || selectedSchool))
      const institutionId = selectedSchoolObj?.id || (instDetails?.id) || null

      const url = purchaseMode === 'edit' && editingId ? `/api/admin/billing/${editingId}` : '/api/admin/billing'
      const method = purchaseMode === 'edit' && editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_id: institutionId,
          plan_id: selectedPlan?.id || null,
          segment: fromSegment || selectedSegment,
          school_name: billInstName || selectedSchool,
          plan_name: billPlanName || selectedPlan?.plan_name,
          payment_mode: modeLabel,
          payment_date: invoiceDate || new Date().toISOString().substring(0, 10),
          amount: finalVal,
          transaction_id: finalTxn,
          status: finalStatus,
          promo_code_id: appliedPromo?.id || null,
          is_renewal: purchaseMode === 'renew' || billPlanBadge === 'Renewal Plan',
          bill_type: purchaseMode,
          screenshots: isGateway ? [] : payments.map(p => ({ amount: parseFloat(p.amount) || 0, filename: p.screenshot || '', dataUrl: p.screenshotData || '' }))
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
        if (purchaseMode === 'edit') {
          toast.success('Bill updated successfully!')
          setWizardStep(0)
          setEditingId(null)
          fetchBills(currentPage)
        } else {
          if (isGateway) {
            toast.success('Payment completed! Plan has been directly activated.')
          } else {
            toast.success('Payment request submitted! Admin approval required on the Request page.')
          }
          setWizardStep(1)
        }
        
        setIsSubmitted(false)
        setShowAllPlansOverride(false)
        setPurchaseMode('new')
        setSelectedPlan(null)
        setAppliedPromo(null)
        setPayments([{ id: Date.now(), txnId: '', amount: '', screenshot: '', screenshotData: '' }])
        // Reload the institute plans so the dashboard refreshes
        if (institutionId) {
          setInstPlansLoading(true)
          const plRes = await fetch(`/api/admin/billing/institute-plans?institution_id=${institutionId}`)
          const plData = await plRes.json()
          if (plData.success) {
            setInstActivePlan(plData.activePlan)
            setInstUpcomingPlans(plData.upcomingPlans || [])
            setInstPlanHistory(plData.planHistory || [])
            setInstHasPendingRenewal(plData.hasPendingRenewal || false)
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

  // Start editing a bill using the advanced modal
  const handleStartEdit = async (bill: Bill) => {
    setActiveTab('purchase')
    // 1. Open the wizard directly to Step 2
    setWizardStep(2)
    setPurchaseMode('edit')
    setEditingId(bill.id)
    
    // 2. Pre-fill the states needed for Step 2
    const inst = schools.find(i => i.id === bill.institution_id || i.name === bill.school_name)
    if (inst) {
      setSelectedSchool(inst.name)
      setBillInstName(inst.name || bill.school_name || '')
      setBillInstCode(inst.code || '')
      setBillInstContact(inst.contact_person || '')
      setBillInstMobile(inst.mobile_no || '')
      setBillInstEmail(inst.email_id || '')
      const addr = [inst.address, inst.district, inst.state, inst.pincode].filter(Boolean).join(', ')
      setBillInstAddress(addr)
    } else {
      setSelectedSchool(bill.school_name || '')
      setBillInstName(bill.school_name || '')
      if (bill.institution_id) {
        try {
          const instRes = await fetch(`/api/admin/institute/${bill.institution_id}`)
          const instData = await instRes.json()
          if (instData.success && instData.data) {
            const d = instData.data
            setBillInstName(d.name || bill.school_name || '')
            setBillInstCode(d.code || '')
            setBillInstContact(d.contact_person || '')
            setBillInstMobile(d.mobile_no || '')
            setBillInstEmail(d.email_id || '')
            const addr = [d.address, d.district, d.state, d.pincode].filter(Boolean).join(', ')
            setBillInstAddress(addr)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    
    const segment = segments.find(s => s.id === inst?.segment_id)?.name || bill.segment
    if (segment) {
      setSelectedSegment(segment)
      setFromSegment(segment)
    }
    
    const plan = plans.find(p => p.id === bill.plan_id || p.plan_name === bill.plan_name)
    if (plan) {
      setSelectedPlan(plan)
      setBillPlanName(plan.plan_name || bill.plan_name || '')
      const dur = plan.renewal_billing_duration || plan.first_billing_duration || 365
      setBillPlanDuration(String(dur))
    } else {
      setSelectedPlan({ id: bill.plan_id || 'custom', plan_name: bill.plan_name || 'Custom Plan' } as any)
      setBillPlanName(bill.plan_name || 'Custom Plan')
    }

    setBillPlanBadge('Active Plan')
    if (bill.payment_date) {
      const pDate = bill.payment_date.substring(0, 10)
      setInvoiceDate(pDate)
      setBillValidFrom(pDate)
      const to = new Date(pDate)
      to.setDate(to.getDate() + Number(billPlanDuration || 365))
      setBillValidTo(to.toISOString().substring(0, 10))
    }
    
    setInvoiceNo(`INV-${new Date(bill.payment_date || new Date()).getFullYear()}-${(bill.transaction_id ? bill.transaction_id.replace(/[^a-zA-Z0-9]/g, '').slice(-4) : String(Math.floor(1000 + Math.random() * 9000))).toUpperCase()}`)

    // Pre-fill invoice line items from bill or plan
    if (plan && plan.first_billing_items?.length) {
      setInvoiceItems(plan.first_billing_items.map((it: any, idx: number) => ({
        id: String(idx + 1),
        description: it.item_description || plan.plan_name,
        quantity: 1,
        price: Number(it.price) || 0,
        tax_percentage: Number(it.tax_percentage) || 0,
        tax_price: getItemTaxAmount(it),
        total: getItemTotal(it)
      })))
    } else {
      setInvoiceItems([{
        id: '1',
        description: bill.plan_name || 'Platform Subscription License',
        quantity: 1,
        price: Number(bill.amount) || 0,
        tax_percentage: 0,
        tax_price: 0,
        total: Number(bill.amount) || 0
      }])
    }
    
    // 3. Pre-fill payment mode
    const modeMap: Record<string, 'gateway' | 'bank' | 'upi' | 'qr'> = {
      'Payment Gateway': 'gateway',
      'Bank Transfer': 'bank',
      'UPI ID': 'upi',
      'QR Code': 'qr'
    }
    setPaymentModeOption(modeMap[bill.payment_mode] || 'gateway')
    
    // 4. Pre-fill payments
    const txnIds = (bill.transaction_id || '').split(',').map(s => s.trim()).filter(Boolean)
    const amountPerTxn = txnIds.length > 0 ? (bill.amount || 0) / txnIds.length : (bill.amount || 0)
    
    let parsedScreenshots: any[] = []
    if (bill.screenshots) {
      if (typeof bill.screenshots === 'string') {
        try { parsedScreenshots = JSON.parse(bill.screenshots) } catch (e) {}
      } else if (Array.isArray(bill.screenshots)) {
        parsedScreenshots = bill.screenshots
      }
    }
    
    const prefilledPayments = txnIds.map((id, index) => {
      const matched = parsedScreenshots[index]
      return {
        id: Date.now() + index,
        txnId: id,
        amount: matched?.amount ? String(matched.amount) : String(amountPerTxn),
        screenshot: matched?.filename || '',
        screenshotData: matched?.dataUrl || ''
      }
    })
    
    setPayments(prefilledPayments.length > 0 ? prefilledPayments : [{ id: Date.now(), txnId: '', amount: String(bill.amount || ''), screenshot: '', screenshotData: '' }])
    
    setAppliedPromo(null)
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

  const handleDownloadPDF = (schoolName: string, amount: number, planName: string, date: string, txnId: string, paymentMode: string) => {
    toast.success(`Preparing invoice for ${schoolName}...`)
    
    const fullPlan = plans.find(p => p.plan_name === planName) || filteredPlansList.find(p => p.plan_name === planName);
    const schoolInfo = schools.find(s => s.name === schoolName) || instDetails;
    const planDesc = fullPlan?.description || '';
    const planMenus = fullPlan?.menus || [];

    // Parse itemized line items if available
    const items = fullPlan?.first_billing_items && fullPlan.first_billing_items.length > 0
      ? fullPlan.first_billing_items
      : null;

    let subtotalNum = 0;
    let taxTotalNum = 0;
    let rowsHTML = '';

    if (items && items.length > 0) {
      items.forEach((item, idx) => {
        const p = Number(item.price) || 0;
        const taxP = getItemTaxAmount(item);
        const tot = getItemTotal(item);
        subtotalNum += p;
        taxTotalNum += taxP;
        rowsHTML += `
          <tr>
            <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #0f172a; font-size: 13px;">${item.item_description || `Item #${idx + 1}`}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Plan Component / Core Module Service</div>
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; font-size: 13px;">1</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155; font-size: 13px;">₹${p.toFixed(2)}</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${tot.toFixed(2)}</td>
          </tr>
        `;
      });
    } else {
      const gross = Number(amount) || 0;
      subtotalNum = gross;
      taxTotalNum = 0;
      rowsHTML = `
        <tr>
          <td style="padding: 14px; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #0f172a; font-size: 14px;">${planName || 'CRM Platform Subscription'}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
              ${planDesc || 'Academy Setu ERP & Cloud Management Software Subscription License'}
            </div>
            ${planMenus && planMenus.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
                ${planMenus.map((m: string) => `<span style="padding: 2px 6px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 10px; font-weight: 600;">${m}</span>`).join('')}
              </div>
            ` : ''}
          </td>
          <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; font-size: 13px;">1</td>
          <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155; font-size: 13px;">₹${gross.toFixed(2)}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${gross.toFixed(2)}</td>
        </tr>
      `;
    }

    const totalCalculated = Number(amount) || (subtotalNum + taxTotalNum);
    const invoiceNum = `INV-${new Date(date || new Date()).getFullYear()}-${(txnId ? txnId.replace(/[^a-zA-Z0-9]/g, '').slice(-4) : '1001').toUpperCase()}`;
    const formattedDate = new Date(date || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${schoolName}</title>
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; padding: 15px; }
          .invoice-card { 
            max-width: 820px; 
            margin: 0 auto; 
            background: #ffffff; 
            padding: 30px 34px; 
            border: 2px solid #0f172a; 
            border-radius: 10px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.06); 
            min-height: 268mm; 
            display: flex; 
            flex-direction: column; 
            box-sizing: border-box;
          }
          
          /* Top Header */
          .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 22px; }
          .logo-box { width: 140px; height: 70px; border: 1.5px dashed #94a3b8; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #475569; font-size: 12px; font-weight: 800; background: #f8fafc; margin-bottom: 12px; }
          .from-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #f8fafc; font-size: 12px; }
          .from-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 3px; display: block; }
          .from-name { font-weight: 800; color: #0f172a; font-size: 13px; }
          .from-sub { color: #64748b; font-size: 11px; margin-top: 2px; line-height: 1.35; }
          
          .invoice-right { display: flex; flex-direction: column; align-items: flex-end; }
          .invoice-title { font-size: 34px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin: 0 0 10px 0; text-transform: uppercase; }
          .inv-num-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .inv-num-label { font-size: 14px; font-weight: 800; color: #64748b; }
          .inv-num-val { border: 1.5px solid #0f172a; border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 800; color: #0f172a; background: #f8fafc; font-family: monospace; }
          
          .meta-grid { display: grid; grid-template-columns: 105px 140px; gap: 6px; font-size: 11px; }
          .meta-lbl { color: #64748b; font-weight: 700; text-align: right; padding-top: 4px; }
          .meta-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-weight: 700; color: #0f172a; background: #fff; }
          
          /* Bill To / Ship To */
          .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .addr-col { display: flex; flex-direction: column; gap: 4px; }
          .addr-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }
          .addr-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; min-height: 70px; background: #fff; }
          .addr-school { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
          .addr-text { font-size: 11px; color: #64748b; line-height: 1.35; }

          /* Line Items Table */
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #0f172a; }
          .items-table thead tr { background: #0f172a; color: #ffffff; }
          .items-table th { padding: 9px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: none; }
          .items-table tbody tr { background: #ffffff; }
          .items-table tbody tr:nth-child(even) { background: #f8fafc; }
          
          /* Bottom Split */
          .bottom-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: auto; }
          .section-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; display: block; }
          .notes-box, .terms-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #64748b; background: #f8fafc; margin-bottom: 10px; line-height: 1.35; }
          .pay-proof { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 11px; background: #f8fafc; margin-bottom: 10px; }
          .pay-proof strong { color: #0f172a; }

          /* Summary Calculations */
          .summary-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; background: #f8fafc; display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
          .sum-row { display: flex; justify-content: space-between; align-items: center; color: #475569; }
          .sum-val { font-weight: 700; color: #0f172a; }
          .sum-divider { height: 1px; background: #cbd5e1; margin: 3px 0; }
          .total-row { font-size: 15px; font-weight: 900; color: #0f172a; }
          
          .balance-due-box { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 8px; border-top: 2px solid #0f172a; }
          .bal-lbl { font-size: 15px; font-weight: 900; color: #0f172a; }
          .bal-val { font-size: 16px; font-weight: 900; color: #0f172a; }
          .paid-badge { display: inline-block; padding: 2px 8px; background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }

          @media print {
            body { padding: 0; background: #fff; margin: 0; }
            .invoice-card { 
              box-shadow: none; 
              border: 2px solid #0f172a !important; 
              border-radius: 8px; 
              padding: 20px 24px; 
              width: 100%; 
              max-width: 100%; 
              min-height: 268mm; 
              height: 268mm;
              margin: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .items-table thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #0f172a !important; color: #fff !important; }
            .paid-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          
          <!-- Header -->
          <div class="header-grid">
            <div>
              <div class="logo-box">
                <div style="font-size: 20px; margin-bottom: 2px;">🎓</div>
                <span>ACADEMY SETU</span>
              </div>
              <div class="from-box">
                <span class="from-title">Who is this from?</span>
                <div class="from-name">Academy Setu Technologies Pvt. Ltd.</div>
                <div class="from-sub">
                  Educational ERP &amp; Cloud Platform Solutions<br>
                  Email: support@academysetu.com | Ph: +91 98765 43210<br>
                  GSTIN: 07AAAAA0000A1Z5
                </div>
              </div>
            </div>

            <div class="invoice-right">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="inv-num-row">
                <span class="inv-num-label">#</span>
                <div class="inv-num-val">${invoiceNum}</div>
              </div>

              <div class="meta-grid">
                <span class="meta-lbl">Date</span>
                <div class="meta-box">${formattedDate}</div>
                <span class="meta-lbl">Payment Terms</span>
                <div class="meta-box">Due on Receipt</div>
                <span class="meta-lbl">Due Date</span>
                <div class="meta-box">${formattedDate}</div>
                <span class="meta-lbl">PO Number</span>
                <div class="meta-box">PO-${new Date().getFullYear()}</div>
              </div>
            </div>
          </div>

          <!-- Bill To & Ship To -->
          <div class="address-grid">
            <div class="addr-col">
              <span class="addr-lbl">Bill To</span>
              <div class="addr-box">
                <div class="addr-school">${schoolName}</div>
                <div class="addr-text">
                  ${schoolInfo?.contact_person ? `Attn: <strong>${schoolInfo.contact_person}</strong><br>` : ''}
                  ${schoolInfo?.mobile_no ? `Phone: ${schoolInfo.mobile_no}<br>` : ''}
                  ${schoolInfo?.email_id ? `Email: ${schoolInfo.email_id}<br>` : ''}
                  ${[schoolInfo?.address, schoolInfo?.district, schoolInfo?.state].filter(Boolean).join(', ') || 'Institution Registered Campus'}
                </div>
              </div>
            </div>
            
            <div class="addr-col">
              <span class="addr-lbl">Ship To <span style="font-weight: 400; color: #94a3b8;">(optional)</span></span>
              <div class="addr-box">
                <div class="addr-school">${schoolName}</div>
                <div class="addr-text">
                  Campus Software Provisioning &amp; Access<br>
                  ${[schoolInfo?.district, schoolInfo?.state].filter(Boolean).join(', ') || 'Headquarter Campus'}
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 55%;">Plan Name</th>
                <th style="text-align: center; width: 15%;">Quantity</th>
                <th style="text-align: right; width: 15%;">Rate</th>
                <th style="text-align: right; width: 15%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <!-- Bottom Row -->
          <div class="bottom-grid">
            <div>
              <div class="pay-proof">
                <span class="section-lbl">Payment Details</span>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <div>
                    <div><strong>Mode:</strong> ${paymentMode || 'Bank Transfer'}</div>
                    <div style="font-family: monospace; font-size: 11px; margin-top: 2px;"><strong>Txn / UTR:</strong> ${txnId || 'N/A'}</div>
                  </div>
                  <span class="paid-badge">✓ PAID</span>
                </div>
              </div>

              <span class="section-lbl">Notes</span>
              <div class="notes-box">
                Thank you for partnering with Academy Setu CRM. All software licenses and features are provisioned for your institute.
              </div>

              <span class="section-lbl">Terms</span>
              <div class="terms-box">
                Terms and conditions - 1. All payments are non-refundable. 2. Subscription access is granted for the contracted term. 3. System-generated electronic tax invoice.
              </div>
            </div>

            <div class="summary-card">
              <div class="sum-row">
                <span>Subtotal</span>
                <span class="sum-val">₹${subtotalNum.toFixed(2)}</span>
              </div>
              <div class="sum-row">
                <span>Tax / GST</span>
                <span class="sum-val">₹${taxTotalNum.toFixed(2)}</span>
              </div>
              <div class="sum-row" style="color: #059669;">
                <span>+ Discount</span>
                <span class="sum-val" style="color: #059669;">₹0.00</span>
              </div>
              <div class="sum-divider"></div>
              <div class="sum-row total-row">
                <span>Total</span>
                <span class="sum-val" style="font-size: 16px;">₹${totalCalculated.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 250);
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  const handleGenerateLink = (gatewayName: string) => {
    toast.info(`Generating checkout link for ${gatewayName}...`)
  }

  const handleDownloadBrochure = (brochureUrl?: string, planName?: string) => {
    if (!brochureUrl) {
      toast.error('No brochure document uploaded for this plan')
      return
    }
    try {
      const link = document.createElement('a')
      link.href = brochureUrl
      link.target = '_blank'
      link.download = `${(planName || 'Plan').replace(/\s+/g, '_')}_Brochure`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Brochure download initiated')
    } catch {
      window.open(brochureUrl, '_blank')
    }
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
          <>
              {/* Step 1: Selection Form Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <form onSubmit={handleSelectionSubmit} className="flex items-end justify-between flex-wrap gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-w-0">
                    {/* Segment Select */}
                    <SearchableDropdown
                      label="Segment *"
                      placeholder="Select Segment"
                      searchPlaceholder="Search segment..."
                      options={segments.map(s => ({
                        label: s.name === 'Insitute' ? 'Institute' : s.name,
                        value: s.name
                      }))}
                      value={selectedSegment}
                      onChange={val => {
                        setSelectedSegment(val)
                        setSelectedSchool('')
                        setIsSubmitted(false)
                        setInstActivePlan(null)
                        setInstUpcomingPlans([])
                        setInstPlanHistory([])
                        setShowAllPlansOverride(false)
                      }}
                      allowClear={false}
                    />

                    {/* School Select */}
                    <SearchableDropdown
                      label="School/College Name (optional)"
                      placeholder="Select School"
                      searchPlaceholder="Search school/college name..."
                      options={schools
                        .filter(s => !selectedSegment || s.segment_name === selectedSegment)
                        .map(s => ({
                          label: `${s.name}${s.segment_name ? ` (${s.segment_name})` : ''}`,
                          value: s.name
                        }))
                      }
                      value={selectedSchool}
                      onChange={val => {
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
                      allowClear={true}
                    />
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
                  ) : segmentInstitutesList.length > 0 && !selectedSchool && !showAllPlansOverride ? (
                    /* Multiple Institute Cards under the selected Segment */
                    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between px-1">
                        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                          Institutes in {selectedSegment} Segment ({segmentInstitutesList.length})
                        </h2>
                      </div>

                      {segmentInstitutesList.map((instData: any, iIdx: number) => {
                        const dDetails = instData.institutionDetails;
                        const dActivePlan = instData.activePlan;
                        const dUpcomingPlans = instData.upcomingPlans || [];
                        const dPlanHistory = instData.planHistory || [];

                        return (
                          <div key={dDetails?.id || iIdx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/70 shadow-md flex flex-col gap-6">
                            
                            {/* Institute Profile & Contact Details Header */}
                            <div className="flex flex-col gap-5 border-b border-slate-150 dark:border-slate-700/80 pb-6">
                              <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-100 dark:border-indigo-800/50 shrink-0 shadow-sm">
                                    <Building2 className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{dDetails?.name}</h3>
                                      {dDetails?.code && (
                                        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                                          {dDetails.code}
                                        </span>
                                      )}
                                      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-xs font-bold">
                                        {selectedSegment}
                                      </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-1">
                                      Institute Billing & Subscription Profile
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {dActivePlan ? (
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      Active Plan
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                                      No Active Plan
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Contact Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Owner / Contact</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
                                      {dDetails?.contact_person || 'Not Specified'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                                    <Phone className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Phone Number</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
                                      {dDetails?.mobile_no || 'Not Specified'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                                    <Mail className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Email Address</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block" title={dDetails?.email_id}>
                                      {dDetails?.email_id || 'Not Specified'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Location</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block" title={`${dDetails?.district || ''}, ${dDetails?.state || ''}`}>
                                      {[dDetails?.district, dDetails?.state].filter(Boolean).join(', ') || dDetails?.address || 'Not Specified'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Active Plan Detail for this Institute */}
                            <div className="flex flex-col gap-5">
                              {dActivePlan ? (
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 overflow-hidden p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                  <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        Paid
                                      </span>
                                      <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{dActivePlan.plan_name}</h5>
                                      {(() => {
                                        const fullPlan = filteredPlansList.find(p => p.id === dActivePlan.plan_id) || plans.find(p => p.id === dActivePlan.plan_id);
                                        const brochure = dActivePlan.brochure_url || fullPlan?.brochure_url;
                                        if (brochure) {
                                          return (
                                            <button
                                              onClick={() => handleDownloadBrochure(brochure, dActivePlan.plan_name)}
                                              className="px-2.5 py-0.5 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/80 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                              title="Download Brochure"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                              Brochure
                                            </button>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      Valid: {formatDateOnly(dActivePlan.start_date)} to {formatDateOnly(dActivePlan.end_date)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-5">
                                    <div className="text-right">
                                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount Paid</div>
                                      <span className="text-xl font-black text-slate-800 dark:text-slate-100">₹{dActivePlan.amount}</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedSchool(dDetails?.name)
                                        setInstDetails(dDetails)
                                        setInstActivePlan(dActivePlan)
                                        setInstUpcomingPlans(dUpcomingPlans)
                                        setInstPlanHistory(dPlanHistory)
                                      }}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                                    >
                                      Manage Institute & Plan
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-rose-500" />
                                      Not Paid
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">No active plan for this institute.</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedSchool(dDetails?.name)
                                      setInstDetails(dDetails)
                                      setPurchaseMode('new')
                                      setShowAllPlansOverride(true)
                                    }}
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                                  >
                                    + Purchase Plan
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  ) : (instActivePlan || instUpcomingPlans.length > 0 || instPlanHistory.length > 0) && !showAllPlansOverride ? (
                    /* Institute Wise Single Card */
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/70 shadow-md flex flex-col gap-6 animate-in fade-in duration-200">
                      
                      {/* Institute Profile & Contact Details Header */}
                      <div className="flex flex-col gap-5 border-b border-slate-150 dark:border-slate-700/80 pb-6">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-100 dark:border-indigo-800/50 shrink-0 shadow-sm">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{instDetails?.name || selectedSchool}</h3>
                                {instDetails?.code && (
                                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                                    {instDetails.code}
                                  </span>
                                )}
                                <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-xs font-bold">
                                  {selectedSegment}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-1">
                                Institute Billing & Subscription Profile
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {instActivePlan ? (
                              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Active Plan
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                No Active Plan
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contact Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Owner / Contact</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
                                {instDetails?.contact_person || 'Not Specified'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Phone Number</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
                                {instDetails?.mobile_no || 'Not Specified'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Email Address</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block" title={instDetails?.email_id}>
                                {instDetails?.email_id || 'Not Specified'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Location</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block" title={`${instDetails?.district || ''}, ${instDetails?.state || ''}`}>
                                {[instDetails?.district, instDetails?.state].filter(Boolean).join(', ') || instDetails?.address || 'Not Specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nested Active & Subscription Plan Section */}
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Active Subscription</h4>
                        </div>

                        {instActivePlan ? (
                          <div className="flex flex-col gap-6">
                            {/* Ongoing Plan */}
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 overflow-hidden">
                              <div className="px-5 py-4 border-b border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-between flex-wrap gap-2">
                                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                  Ongoing Plan
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Paid
                                  </span>
                                  {(() => {
                                    const activeValidTill = new Date(instActivePlan.end_date);
                                    const activeDaysLeft = Math.max(0, Math.ceil((activeValidTill.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                    return (
                                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                                        {activeDaysLeft} Days Left
                                      </span>
                                    )
                                  })()}
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{instActivePlan.plan_name}</h5>
                                      {(() => {
                                        const fullPlan = filteredPlansList.find(p => p.id === instActivePlan.plan_id) || plans.find(p => p.id === instActivePlan.plan_id);
                                        const brochure = instActivePlan.brochure_url || fullPlan?.brochure_url;
                                        if (brochure) {
                                          return (
                                            <button
                                              onClick={() => handleDownloadBrochure(brochure, instActivePlan.plan_name)}
                                              className="px-2.5 py-1 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/80 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                              title="Download Brochure"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                              Brochure
                                            </button>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    {(() => {
                                      const fullPlan = filteredPlansList.find(p => p.id === instActivePlan.plan_id) || plans.find(p => p.id === instActivePlan.plan_id);
                                      if (!fullPlan) return null;
                                      return (
                                        <div className="flex flex-col gap-2 mt-1 mb-1">
                                          {fullPlan.description && (
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-lg line-clamp-2">{fullPlan.description}</p>
                                          )}
                                          {fullPlan.menus && fullPlan.menus.length > 0 && (
                                            <div className="mt-1">
                                              {!showActivePlanFeatures ? (
                                                <button 
                                                  onClick={() => setShowActivePlanFeatures(true)}
                                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors"
                                                >
                                                  Show all features
                                                </button>
                                              ) : (
                                                <div className="flex flex-col gap-2 mt-1">
                                                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1 pb-1">
                                                    {fullPlan.menus.map((m: string) => (
                                                      <span key={m} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                                        {m}
                                                      </span>
                                                    ))}
                                                  </div>
                                                  <button 
                                                    onClick={() => setShowActivePlanFeatures(false)}
                                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 self-start hover:underline cursor-pointer transition-colors"
                                                  >
                                                    Hide features
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid From: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(instActivePlan.start_date)}</span></div>
                                      </div>
                                      <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid Till: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(instActivePlan.end_date)}</span></div>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount Paid</div>
                                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{instActivePlan.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleDownloadPDF(selectedSchool, instActivePlan.amount, instActivePlan.plan_name || 'Active Plan', instActivePlan.payment_date, instActivePlan.transaction_id, instActivePlan.payment_mode)}
                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm cursor-pointer" title="Download Bill"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="px-5 py-4 bg-indigo-100/30 dark:bg-indigo-900/20 border-t border-indigo-100/50 dark:border-indigo-900/50 flex flex-wrap items-center gap-3">
                                <button
                                  onClick={() => {
                                    setPurchaseMode('change')
                                    setShowAllPlansOverride(true)
                                  }}
                                  className="px-5 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  Change Plan (Instant)
                                </button>
                                <button
                                  onClick={() => {
                                    setPurchaseMode('upcoming')
                                    setShowAllPlansOverride(true)
                                  }}
                                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  Create Upcoming Plan
                                </button>
                              </div>
                            </div>
                            
                            {(() => {
                            const activeFullPlan = (instActivePlan?.renewal_billing_items && instActivePlan.renewal_billing_items.length > 0)
                              ? instActivePlan
                              : (filteredPlansList.find(p => p.id === instActivePlan.plan_id) || plans.find(p => p.id === instActivePlan.plan_id) || instActivePlan);
                            
                            const renewalItems = activeFullPlan?.renewal_billing_items || instActivePlan?.renewal_billing_items || [];
                            const hasRenewal = renewalItems.length > 0 || (Number(instActivePlan?.renewal_billing_duration || activeFullPlan?.renewal_billing_duration || 0) > 0);
                            
                            if (!hasRenewal) return null;
                            
                            const renewalPrice = renewalItems.length > 0
                              ? renewalItems.reduce((acc: number, item: any) => acc + getItemTotal(item), 0)
                              : Number(instActivePlan.amount || 0);
                            const renewalDuration = instActivePlan?.renewal_billing_duration || activeFullPlan?.renewal_billing_duration || 365;
                            
                            const validFrom = new Date(instActivePlan.end_date);
                            const validTill = new Date(validFrom.getTime() + renewalDuration * 24 * 60 * 60 * 1000);
                            
                            const daysLeftToRenew = Math.max(0, Math.ceil((validFrom.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                            const hasPendingRenewal = instHasPendingRenewal;
                            const isRenewalPaid = instHasPaidRenewal || instUpcomingPlans.some((p: any) => p.bill_type === 'renew');

                            return (
                              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 overflow-hidden">
                                <div className="px-5 py-4 border-b border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-between flex-wrap gap-2">
                                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    Renewal Details (Active Plan)
                                  </h4>
                                  {isRenewalPaid ? (
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      Paid
                                    </span>
                                  ) : hasPendingRenewal ? (
                                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                      Requested
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                      Not Paid
                                    </span>
                                  )}
                                </div>
                                <div className="p-5">
                                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{activeFullPlan.plan_name} (Renewal)</h5>
                                        {(() => {
                                          const brochure = activeFullPlan?.brochure_url || instActivePlan?.brochure_url;
                                          if (brochure) {
                                            return (
                                              <button
                                                onClick={() => handleDownloadBrochure(brochure, activeFullPlan?.plan_name || instActivePlan?.plan_name)}
                                                className="px-2.5 py-1 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/80 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                title="Download Brochure"
                                              >
                                                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Brochure
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                      <div className="flex flex-col gap-2 mt-1 mb-1">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-lg line-clamp-2">
                                          This is the renewal configuration for your current active plan.
                                        </p>
                                        {activeFullPlan.menus && activeFullPlan.menus.length > 0 && (
                                          <div className="mt-1">
                                            {!showRenewalFeatures ? (
                                              <button 
                                                onClick={() => setShowRenewalFeatures(true)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors"
                                              >
                                                Show all features
                                              </button>
                                            ) : (
                                              <div className="flex flex-col gap-2 mt-1">
                                                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1 pb-1">
                                                  {activeFullPlan.menus.map((m: string) => (
                                                    <span key={m} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                                      {m}
                                                    </span>
                                                  ))}
                                                </div>
                                                <button 
                                                  onClick={() => setShowRenewalFeatures(false)}
                                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700 self-start hover:underline cursor-pointer transition-colors"
                                                >
                                                  Hide features
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-6 items-center">
                                      {hasPendingRenewal && (
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid From: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(instActivePlan.end_date)}</span></div>
                                          </div>
                                          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid Till: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(validTill.toISOString())}</span></div>
                                          </div>
                                        </div>
                                      )}
                                      <div className="text-right flex flex-col justify-center">
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Renewal Price</div>
                                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{renewalPrice.toFixed(2)}</span>
                                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                                          {daysLeftToRenew} days left
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-5 py-4 bg-indigo-100/30 dark:bg-indigo-900/20 border-t border-indigo-100/50 dark:border-indigo-900/50 flex flex-wrap items-center gap-3">
                                  <button
                                    disabled={hasPendingRenewal || isRenewalPaid}
                                    onClick={() => {
                                      setPurchaseMode('renew')
                                      if (activeFullPlan) {
                                        setSelectedPlan(activeFullPlan)
                                        setWizardStep(2)
                                      } else {
                                        toast.error('Plan details not found')
                                      }
                                    }}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 ${
                                      isRenewalPaid
                                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-not-allowed shadow-none border border-emerald-200 dark:border-emerald-800'
                                        : hasPendingRenewal
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                    }`}
                                  >
                                    {isRenewalPaid ? 'Plan Renewed (Paid)' : hasPendingRenewal ? 'Renewal Requested' : 'Renew Plan'}
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
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
                          <div className="flex flex-col gap-6 mt-6">
                            {instUpcomingPlans.map((plan: any) => (
                              <div key={plan.id} className="rounded-2xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 overflow-hidden">
                                <div className="px-5 py-4 border-b border-blue-100/50 dark:border-blue-900/50 flex items-center justify-between flex-wrap gap-2">
                                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                                    Queued Plan
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      Paid
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                                      Upcoming
                                    </span>
                                  </div>
                                </div>
                                <div className="p-5">
                                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{plan.plan_name}</h5>
                                        {(() => {
                                          const fullPlan = filteredPlansList.find(p => p.id === plan.plan_id) || plans.find(p => p.id === plan.plan_id);
                                          const brochure = plan.brochure_url || fullPlan?.brochure_url;
                                          if (brochure) {
                                            return (
                                              <button
                                                onClick={() => handleDownloadBrochure(brochure, plan.plan_name)}
                                                className="px-2.5 py-1 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/80 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                title="Download Brochure"
                                              >
                                                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Brochure
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                      {(() => {
                                        const fullPlan = filteredPlansList.find(p => p.id === plan.plan_id) || plans.find(p => p.id === plan.plan_id);
                                        if (!fullPlan) return null;
                                        return (
                                          <div className="flex flex-col gap-2 mt-1 mb-1">
                                            {fullPlan.description && (
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-lg line-clamp-2">{fullPlan.description}</p>
                                            )}
                                            {fullPlan.menus && fullPlan.menus.length > 0 && (
                                              <div className="mt-1">
                                                {!showUpcomingFeatures[plan.id] ? (
                                                  <button 
                                                    onClick={() => setShowUpcomingFeatures(prev => ({...prev, [plan.id]: true}))}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                                                  >
                                                    Show all features
                                                  </button>
                                                ) : (
                                                  <div className="flex flex-col gap-2 mt-1">
                                                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1 pb-1">
                                                      {fullPlan.menus.map((m: string) => (
                                                        <span key={m} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                                          {m}
                                                        </span>
                                                      ))}
                                                    </div>
                                                    <button 
                                                      onClick={() => setShowUpcomingFeatures(prev => ({...prev, [plan.id]: false}))}
                                                      className="text-[10px] font-bold text-slate-500 hover:text-slate-700 self-start hover:underline cursor-pointer transition-colors"
                                                    >
                                                      Hide features
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <div className="flex flex-wrap gap-6 items-center">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid From: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(plan.start_date)}</span></div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Valid Till: <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{formatDateOnly(plan.end_date)}</span></div>
                                        </div>
                                      </div>
                                      <div className="text-right flex flex-col justify-center">
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price Paid</div>
                                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{plan.amount}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-5 py-4 bg-blue-100/30 dark:bg-blue-900/20 border-t border-blue-100/50 dark:border-blue-900/50 flex flex-wrap items-center justify-end gap-3">
                                  <button
                                    onClick={async () => {
                                      const confirm = window.confirm(`Activate "${plan.plan_name}" instantly today?\n\nAny existing active plan will be terminated immediately and moved to history regardless of its remaining duration/expiry date.`);
                                      if (!confirm) return;
                                      try {
                                        const instId = instDetails?.id || (instDetails as any)?.institution_id || institutionsList.find((i: any) => i.name === selectedSchool)?.id;
                                        const res = await fetch('/api/admin/billing/institute-plans', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ bill_id: plan.id, institution_id: instId })
                                        });
                                        const d = await res.json();
                                        if (d.success) {
                                          toast.success(`Plan "${plan.plan_name}" activated instantly!`);
                                          if (instId) {
                                            const r2 = await fetch(`/api/admin/billing/institute-plans?institution_id=${instId}`);
                                            const d2 = await r2.json();
                                            if (d2.success) {
                                              setInstActivePlan(d2.activePlan || null);
                                              setInstUpcomingPlans(d2.upcomingPlans || []);
                                              setInstPlanHistory(d2.planHistory || []);
                                            }
                                          }
                                          fetchBills(currentPage);
                                        } else {
                                          toast.error(d.error || 'Failed to activate plan');
                                        }
                                      } catch (err) {
                                        toast.error('Failed to activate plan');
                                      }
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                                    Activate Instantly
                                  </button>
                                  <button onClick={() => handleDownloadPDF(selectedSchool, plan.amount, plan.plan_name || 'Upcoming Plan', plan.payment_date, plan.transaction_id, plan.payment_mode)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm cursor-pointer" title="Download Bill">
                                    <Download className="w-4 h-4" />
                                  </button>
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
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Status</th>
                                  <th className="px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
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
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-bold">
                                        Paid
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {(() => {
                                          const fullPlan = filteredPlansList.find(p => p.id === h.plan_id) || plans.find(p => p.id === h.plan_id);
                                          const brochure = h.brochure_url || fullPlan?.brochure_url;
                                          if (brochure) {
                                            return (
                                              <button
                                                onClick={() => handleDownloadBrochure(brochure, h.plan_name)}
                                                className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
                                                title="Download Brochure"
                                              >
                                                <FileText className="w-3.5 h-3.5" />
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}
                                        <button
                                          onClick={() => handleDownloadPDF(selectedSchool, h.amount, h.plan_name || 'Past Plan', h.payment_date, h.transaction_id, h.payment_mode)}
                                          className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                                          title="Download Bill"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
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
                          {selectedSchool 
                            ? `Select Plan to Purchase for ${selectedSchool}` 
                            : `Available Plans for ${selectedSegment || 'Segment'}`}
                        </h2>
                        {showAllPlansOverride && selectedSchool && (
                          <button
                            onClick={() => setShowAllPlansOverride(false)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            &larr; Back to Dashboard
                          </button>
                        )}
                      </div>

                      {selectedSchool && !(instActivePlan || instUpcomingPlans.length > 0 || instPlanHistory.length > 0) && (
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
                          {filteredPlansList.map((p) => {
                            const basePrice = (p.first_billing_items && p.first_billing_items.length > 0)
                              ? p.first_billing_items.reduce((sum: number, item: any) => sum + getItemTotal(item), 0)
                              : (Number((p as any).price) || Number((p as any).amount) || 0);

                            const renewalPrice = (p.renewal_billing_items && p.renewal_billing_items.length > 0)
                              ? p.renewal_billing_items.reduce((sum: number, item: any) => sum + getItemTotal(item), 0)
                              : 0;

                            const baseDuration = p.first_billing_duration || 365;
                            const renewalDuration = p.renewal_billing_duration || 365;
                            const hasRenewal = Boolean(
                              (p.renewal_billing_items && p.renewal_billing_items.length > 0) ||
                              (p.renewal_billing_duration && p.renewal_billing_duration > 0 && renewalPrice > 0)
                            );

                            const isCurrentActive = Boolean(instActivePlan && instActivePlan.plan_id === p.id);

                            return (
                              <div
                                key={p.id}
                                className={`bg-white dark:bg-slate-800 rounded-2xl p-7 border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative hover:shadow-md transition-all ${
                                  isCurrentActive 
                                    ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/10 dark:bg-emerald-950/10' 
                                    : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{p.plan_name}</h3>
                                    {p.segment && (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                                        {p.segment}
                                      </span>
                                    )}
                                    {isCurrentActive && (
                                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Current Active Plan
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mt-1">
                                    {p.description || 'Check billing components details of the selected plan below.'}
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
                                  {hasRenewal && renewalPrice > 0 ? (
                                    <div className="flex flex-wrap sm:flex-nowrap md:flex-wrap items-center gap-2.5 justify-center md:justify-end">
                                      <div className="border border-indigo-100 dark:border-indigo-900/60 rounded-xl px-4 py-2.5 text-center bg-indigo-50/60 dark:bg-indigo-950/30 flex flex-col items-center justify-center shrink-0 min-w-[115px]">
                                        <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Base Amount</span>
                                        <span className="text-base font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
                                          ₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                          {baseDuration} Days
                                        </span>
                                      </div>

                                      <div className="border border-violet-100 dark:border-violet-900/60 rounded-xl px-4 py-2.5 text-center bg-violet-50/60 dark:bg-violet-950/30 flex flex-col items-center justify-center shrink-0 min-w-[115px]">
                                        <span className="text-[9px] font-extrabold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Renewal Amount</span>
                                        <span className="text-base font-black text-violet-600 dark:text-violet-300 mt-0.5">
                                          ₹{renewalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                          {renewalDuration} Days
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2.5 justify-center md:justify-end">
                                      <div className="border border-indigo-100 dark:border-indigo-900/60 rounded-xl px-5 py-3 text-center bg-indigo-50/60 dark:bg-indigo-950/30 flex flex-col items-center justify-center shrink-0 min-w-[110px]">
                                        <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Plan Amount</span>
                                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
                                          ₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>

                                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center shrink-0 min-w-[100px]">
                                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Validity</span>
                                        <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{baseDuration} Days</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-row md:flex-col gap-2 flex-1 md:flex-none w-full">
                                    {p.brochure_url && (
                                      <button
                                        onClick={() => handleDownloadBrochure(p.brochure_url, p.plan_name)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800/60 cursor-pointer shadow-sm"
                                      >
                                        <Download className="w-4 h-4" />
                                        Brochure
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setShowViewPlanModal(p)
                                        setViewPlanTab('first')
                                      }}
                                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#EBF6F6] dark:bg-slate-750 hover:bg-[#EBF6F6]/80 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-100 dark:border-slate-600 cursor-pointer"
                                    >
                                      <FileText className="w-4 h-4" />
                                      View Plan
                                    </button>
                                    {purchaseMode === 'change' && isCurrentActive ? (
                                      <button
                                        disabled
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-extrabold cursor-not-allowed shadow-none flex items-center justify-center gap-1.5"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Currently Active
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setSelectedPlan(p)
                                          setWizardStep(2)
                                        }}
                                        className={`flex-1 md:flex-none px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                                          purchaseMode === 'change' 
                                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                                        }`}
                                      >
                                        {purchaseMode === 'change' ? (
                                          <>
                                            <Zap className="w-3.5 h-3.5 text-amber-200" />
                                            Switch to this Plan
                                          </>
                                        ) : purchaseMode === 'upcoming' ? (
                                          'Queue Upcoming Plan'
                                        ) : (
                                          'Buy Now'
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>

            {/* Modal for Step 2: Invoice Template Layout */}
            {wizardStep === 2 && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 relative animate-in fade-in zoom-in duration-200 flex flex-col gap-6">
                  
                  {/* Modal Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (purchaseMode === 'edit') {
                        setWizardStep(0)
                        setEditingId(null)
                        setActiveTab('history')
                        setPurchaseMode('new')
                      } else {
                        setWizardStep(1)
                        if (purchaseMode === 'renew') {
                          setPurchaseMode('new')
                        }
                      }
                    }}
                    className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10 shadow-sm"
                    title="Close Invoice"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* ================= INVOICE HEADER ================= */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    {/* Left: Brand Logo / Provider Info */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                            ACADEMY SETU
                          </h2>
                          <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Educational ERP & Cloud Management Solutions
                          </p>
                        </div>
                      </div>

                      {/* Provider Box */}
                      {purchaseMode === 'edit' ? (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-1.5 max-w-sm">
                          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Who is this from?</span>
                          <input
                            type="text"
                            value={fromCompanyName}
                            onChange={(e) => setFromCompanyName(e.target.value)}
                            placeholder="Company / Provider Name"
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                          />
                          <input
                            type="text"
                            value={fromCompanySubtitle}
                            onChange={(e) => setFromCompanySubtitle(e.target.value)}
                            placeholder="Department / Support Desk"
                            className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                          />
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">Segment:</span>
                            <input
                              type="text"
                              value={fromSegment || selectedSegment}
                              onChange={(e) => {
                                setFromSegment(e.target.value)
                                setSelectedSegment(e.target.value)
                              }}
                              placeholder="Segment (e.g. College / School)"
                              className="w-full px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-1 max-w-sm">
                          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Who is this from?</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">Academy Setu Technologies Pvt. Ltd.</p>
                          <p className="text-[11px] text-slate-500">Platform Accounts & Billing Support Desk</p>
                          {selectedSegment && (
                            <span className="self-start mt-0.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">
                              Segment: {selectedSegment}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Invoice Title & Metadata */}
                    <div className="flex flex-col items-start md:items-end gap-3 min-w-[280px]">
                      <div className="text-left md:text-right">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                          INVOICE
                        </h1>
                        <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-slate-400">#</span>
                          {purchaseMode === 'edit' ? (
                            <input 
                              type="text" 
                              value={invoiceNo}
                              onChange={(e) => setInvoiceNo(e.target.value)}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200 w-36 text-left md:text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
                              {invoiceNo}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Invoice Date Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs w-full">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                          {purchaseMode === 'edit' ? (
                            <input 
                              type="date" 
                              value={invoiceDate}
                              onChange={(e) => setInvoiceDate(e.target.value)}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200">
                              {invoiceDate}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</span>
                          {purchaseMode === 'edit' ? (
                            <select 
                              value={invoicePaymentTerms}
                              onChange={(e) => setInvoicePaymentTerms(e.target.value)}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="Due on Receipt">Due on Receipt</option>
                              <option value="Immediate">Immediate</option>
                              <option value="Net 15">Net 15</option>
                              <option value="Net 30">Net 30</option>
                            </select>
                          ) : (
                            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200">
                              {invoicePaymentTerms}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                          {purchaseMode === 'edit' ? (
                            <input 
                              type="date" 
                              value={invoiceDueDate}
                              onChange={(e) => setInvoiceDueDate(e.target.value)}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200">
                              {invoiceDueDate}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO Number</span>
                          {purchaseMode === 'edit' ? (
                            <input 
                              type="text" 
                              placeholder="Optional PO#" 
                              value={invoicePoNumber}
                              onChange={(e) => setInvoicePoNumber(e.target.value)}
                              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
                              {invoicePoNumber || '—'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= BILL TO (INSTITUTE DETAILS) & PLAN PACKAGE ================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    {/* Billed To (Institution Details - 7 Cols) */}
                    {purchaseMode === 'edit' ? (
                      <div className="lg:col-span-7 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              BILL TO (INSTITUTION)
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Editable Details</span>
                        </div>

                        {/* Institute Name Input */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Institution Name</label>
                          <input
                            type="text"
                            value={billInstName}
                            onChange={(e) => {
                              setBillInstName(e.target.value)
                              setSelectedSchool(e.target.value)
                            }}
                            placeholder="Institution / School Name"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                          />
                        </div>

                        {/* Code, Contact, Mobile, Email */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">School Code</label>
                            <input
                              type="text"
                              value={billInstCode}
                              onChange={(e) => setBillInstCode(e.target.value)}
                              placeholder="Code"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Contact</label>
                            <input
                              type="text"
                              value={billInstContact}
                              onChange={(e) => setBillInstContact(e.target.value)}
                              placeholder="Contact Person"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Mobile No</label>
                            <input
                              type="text"
                              value={billInstMobile}
                              onChange={(e) => setBillInstMobile(e.target.value)}
                              placeholder="Mobile"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email</label>
                            <input
                              type="email"
                              value={billInstEmail}
                              onChange={(e) => setBillInstEmail(e.target.value)}
                              placeholder="Email"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Complete Address</label>
                          <div className="relative flex items-center">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                            <input
                              type="text"
                              value={billInstAddress}
                              onChange={(e) => setBillInstAddress(e.target.value)}
                              placeholder="Institution address, street, city, state, pincode"
                              className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="lg:col-span-7 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            BILL TO (INSTITUTION)
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                          {selectedSchool || instDetails?.name || 'Client School'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {(instDetails?.code || billInstCode) && (
                            <div><span className="text-slate-400 text-[10px] font-semibold">School Code:</span> <span className="font-bold">{instDetails?.code || billInstCode}</span></div>
                          )}
                          {(instDetails?.contact_person || billInstContact) && (
                            <div><span className="text-slate-400 text-[10px] font-semibold">Contact:</span> <span className="font-bold">{instDetails?.contact_person || billInstContact}</span></div>
                          )}
                          {(instDetails?.mobile_no || billInstMobile) && (
                            <div><span className="text-slate-400 text-[10px] font-semibold">Mobile:</span> <span className="font-bold">{instDetails?.mobile_no || billInstMobile}</span></div>
                          )}
                          {(instDetails?.email_id || billInstEmail) && (
                            <div><span className="text-slate-400 text-[10px] font-semibold">Email:</span> <span className="font-bold">{instDetails?.email_id || billInstEmail}</span></div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          {[instDetails?.address, instDetails?.district, instDetails?.state, instDetails?.pincode].filter(Boolean).join(', ') || billInstAddress || 'Institution registered address on file'}
                        </p>
                      </div>
                    )}

                    {/* Selected Plan Details & Validity Card (5 Cols) */}
                    {purchaseMode === 'edit' ? (
                      <div className="lg:col-span-5 flex flex-col justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> PLAN PACKAGE
                          </span>
                          <select
                            value={billPlanBadge}
                            onChange={(e) => setBillPlanBadge(e.target.value)}
                            className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 focus:outline-none"
                          >
                            <option value="New Plan">New Plan</option>
                            <option value="Renewal Plan">Renewal Plan</option>
                            <option value="Plan Upgrade">Plan Upgrade</option>
                            <option value="Upcoming Plan">Upcoming Plan</option>
                            <option value="Active Plan">Active Plan</option>
                            <option value="Custom Plan">Custom Plan</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Plan Package Name</label>
                            <input
                              type="text"
                              value={billPlanName}
                              onChange={(e) => setBillPlanName(e.target.value)}
                              placeholder="Plan / Package Name"
                              className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Duration</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  value={billPlanDuration}
                                  onChange={(e) => {
                                    const dur = e.target.value
                                    setBillPlanDuration(dur)
                                    if (billValidFrom && dur) {
                                      const f = new Date(billValidFrom)
                                      f.setDate(f.getDate() + Number(dur))
                                      setBillValidTo(f.toISOString().substring(0, 10))
                                    }
                                  }}
                                  placeholder="365"
                                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Valid From</label>
                              <input
                                type="date"
                                value={billValidFrom}
                                onChange={(e) => {
                                  setBillValidFrom(e.target.value)
                                  if (e.target.value && billPlanDuration) {
                                    const f = new Date(e.target.value)
                                    f.setDate(f.getDate() + Number(billPlanDuration))
                                    setBillValidTo(f.toISOString().substring(0, 10))
                                  }
                                }}
                                className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Valid To</label>
                              <input
                                type="date"
                                value={billValidTo}
                                onChange={(e) => setBillValidTo(e.target.value)}
                                className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="lg:col-span-5 flex flex-col justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> PLAN PACKAGE
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                            {purchaseMode === 'renew' ? 'Renewal Plan' : purchaseMode === 'change' ? 'Plan Upgrade' : purchaseMode === 'upcoming' ? 'Upcoming Plan' : 'New Plan'}
                          </span>
                        </div>
                        {selectedPlan && (
                          <div className="flex flex-col gap-1 mt-2">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedPlan.plan_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Duration: {purchaseMode === 'renew' ? (selectedPlan.renewal_billing_duration || 365) : (selectedPlan.first_billing_duration || 365)} Days
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {dates.validFrom} → {dates.validTo}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================= ITEMIZED BILLING LINE ITEMS TABLE ================= */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        Itemized Billing Details
                      </h4>
                      {purchaseMode === 'edit' && (
                        <button
                          type="button"
                          onClick={handleAddInvoiceItem}
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Line Item
                        </button>
                      )}
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white dark:bg-slate-800 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-3 text-center w-12">S.No.</th>
                            <th className="py-3 px-3">Plan Name</th>
                            <th className="py-3 px-3 text-center w-20">Qty</th>
                            <th className="py-3 px-3 text-right w-28">Rate (₹)</th>
                            <th className="py-3 px-3 text-center w-20">Tax (%)</th>
                            <th className="py-3 px-3 text-right w-24">Tax (₹)</th>
                            <th className="py-3 px-3 text-right w-28">Amount (₹)</th>
                            {purchaseMode === 'edit' && <th className="py-3 px-2 text-center w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                          {invoiceItems.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800 transition-colors">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                {purchaseMode === 'edit' ? (
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleInvoiceItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Plan Name"
                                    className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none transition-all"
                                  />
                                ) : (
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 block px-2 py-1">
                                    {item.description}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {purchaseMode === 'edit' ? (
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity || 1}
                                    onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', e.target.value)}
                                    className="w-14 px-1.5 py-1 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded text-xs text-center font-bold text-slate-800 dark:text-slate-200 focus:outline-none transition-all"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {item.quantity || 1}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {purchaseMode === 'edit' ? (
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleInvoiceItemChange(item.id, 'price', e.target.value)}
                                    className="w-24 px-2 py-1 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded text-xs text-right font-bold text-slate-800 dark:text-slate-200 focus:outline-none transition-all"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    ₹{Number(item.price || 0).toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {purchaseMode === 'edit' ? (
                                  <input
                                    type="number"
                                    value={item.tax_percentage}
                                    onChange={(e) => handleInvoiceItemChange(item.id, 'tax_percentage', e.target.value)}
                                    className="w-14 px-1 py-1 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded text-xs text-center font-semibold text-slate-600 dark:text-slate-300 focus:outline-none transition-all"
                                  />
                                ) : (
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                                    {item.tax_percentage || 0}%
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                ₹{Number(item.tax_price || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-100">
                                ₹{Number(item.total || 0).toFixed(2)}
                              </td>
                              {purchaseMode === 'edit' && (
                                <td className="py-2.5 px-2 text-center">
                                  {invoiceItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveInvoiceItem(item.id)}
                                      className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-slate-500">Subtotal (Excl. Tax): ₹{getInvoiceSubtotal().toFixed(2)}</td>
                            <td colSpan={purchaseMode === 'edit' ? 3 : 2} className="py-2 px-3 text-right text-slate-500">Total Tax: ₹{getInvoiceTaxTotal().toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-slate-900 dark:text-white font-black">₹{getGrossAmount().toFixed(2)}</td>
                            {purchaseMode === 'edit' && <td></td>}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* ================= BOTTOM SPLIT SECTION (PAYMENT & TOTALS) ================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    
                    {/* LEFT COLUMN: Payment Mode, Multiple Transactions, Notes & Terms (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      
                      {/* Hidden form anchor if in edit mode */}
                      {purchaseMode === 'edit' && (
                        <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="hidden" />
                      )}

                      {/* Payment Mode Selector (Only for Plan Purchase / Renewal / Change / Upcoming, NOT in Transaction History edit) */}
                      {purchaseMode !== 'edit' && (
                        <div className="bg-slate-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-indigo-500" />
                              Payment Method
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400">Select Mode</span>
                          </div>

                          {/* Mode Buttons */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['gateway', 'bank', 'upi', 'qr'] as const).map(mode => (
                              <button 
                                key={mode} 
                                type="button" 
                                onClick={() => setPaymentModeOption(mode)}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${
                                  paymentModeOption === mode 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                              >
                                <span className="text-sm leading-none">
                                  {mode === 'gateway' ? '💳' : mode === 'bank' ? '🏦' : mode === 'upi' ? '📱' : '📷'}
                                </span>
                                {mode === 'gateway' ? 'Gateway' : mode === 'bank' ? 'Bank' : mode === 'upi' ? 'UPI' : 'QR Code'}
                              </button>
                            ))}
                          </div>

                          {/* Payment Mode Forms */}
                          <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3 mt-1">
                            {/* 1. Gateway */}
                            {paymentModeOption === 'gateway' && (
                              <div className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Razorpay Online Gateway</span>
                                  <button type="button" onClick={() => handleGenerateLink('Razorpay')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm">Generate Link</button>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">PhonePe Payment Gateway</span>
                                  <button type="button" onClick={() => handleGenerateLink('Phonepe')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm">Generate Link</button>
                                </div>
                              </div>
                            )}

                            {/* 2. Bank Transfer */}
                            {paymentModeOption === 'bank' && (
                              <div className="flex flex-col gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bank Account Details</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div><span className="text-slate-400 text-[10px] font-semibold block">Account No.</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankAccountNo}</span></div>
                                    <div><span className="text-slate-400 text-[10px] font-semibold block">IFSC Code</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankIfsc}</span></div>
                                    <div><span className="text-slate-400 text-[10px] font-semibold block">Holder Name</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankHolderName}</span></div>
                                  </div>
                                </div>

                                {/* Multi-Payment Rows */}
                                <div className="flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Attached Transactions ({payments.length})
                                      </span>
                                      {getTotalEntered() < getFinalAmount() ? (
                                        <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
                                          Entered: ₹{getTotalEntered().toFixed(2)} (Short by ₹{(getFinalAmount() - getTotalEntered()).toFixed(2)})
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                          Total: ₹{getTotalEntered().toFixed(2)} ✓ Full Amount
                                        </span>
                                      )}
                                    </div>
                                    <button type="button" onClick={addPayment} className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                      <Plus className="w-3.5 h-3.5" /> Add Another Payment
                                    </button>
                                  </div>

                                  {payments.map((p, index) => (
                                    <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                                      {index > 0 && (
                                        <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID / UTR *</label>
                                        <input type="text" placeholder="Enter UTR / Txn ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount (₹) *</label>
                                        <input type="number" placeholder="Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment Proof Screenshot *</label>
                                        <label className="relative cursor-pointer block">
                                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setPayments(prev => prev.map(pay => pay.id === p.id ? { ...pay, screenshot: file.name, screenshotData: reader.result as string } : pay));
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }} />
                                          <div className={`w-full px-3 py-1.5 pr-8 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                                            {p.screenshot || 'Attach payment receipt / screenshot...'}
                                          </div>
                                          <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. UPI */}
                            {paymentModeOption === 'upi' && (
                              <div className="flex flex-col gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">UPI Details</p>
                                  <div className="text-xs"><span className="text-slate-400 text-[10px] font-semibold block">VPA / UPI ID:</span><span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span></div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Attached Transactions ({payments.length})
                                      </span>
                                      {getTotalEntered() < getFinalAmount() ? (
                                        <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
                                          Entered: ₹{getTotalEntered().toFixed(2)} (Short by ₹{(getFinalAmount() - getTotalEntered()).toFixed(2)})
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                          Total: ₹{getTotalEntered().toFixed(2)} ✓ Full Amount
                                        </span>
                                      )}
                                    </div>
                                    <button type="button" onClick={addPayment} className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                      <Plus className="w-3.5 h-3.5" /> Add Another Payment
                                    </button>
                                  </div>

                                  {payments.map((p, index) => (
                                    <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                                      {index > 0 && (
                                        <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                        <input type="text" placeholder="Enter UPI Ref / Txn ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount (₹) *</label>
                                        <input type="number" placeholder="Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment Proof Screenshot *</label>
                                        <label className="relative cursor-pointer block">
                                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setPayments(prev => prev.map(pay => pay.id === p.id ? { ...pay, screenshot: file.name, screenshotData: reader.result as string } : pay));
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }} />
                                          <div className={`w-full px-3 py-1.5 pr-8 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                            {p.screenshot || 'Attach payment screenshot...'}
                                          </div>
                                          <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 4. QR Code */}
                            {paymentModeOption === 'qr' && (
                              <div className="flex flex-col gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
                                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0">
                                    <QrCode className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Scan QR Code to Pay</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Scan via any UPI App (GPay, PhonePe, Paytm), then attach UTR & proof.</p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Attached Transactions ({payments.length})
                                      </span>
                                      {getTotalEntered() < getFinalAmount() ? (
                                        <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
                                          Entered: ₹{getTotalEntered().toFixed(2)} (Short by ₹{(getFinalAmount() - getTotalEntered()).toFixed(2)})
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                          Total: ₹{getTotalEntered().toFixed(2)} ✓ Full Amount
                                        </span>
                                      )}
                                    </div>
                                    <button type="button" onClick={addPayment} className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                      <Plus className="w-3.5 h-3.5" /> Add Another Payment
                                    </button>
                                  </div>

                                  {payments.map((p, index) => (
                                    <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                                      {index > 0 && (
                                        <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                        <input type="text" placeholder="Enter Transaction ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount (₹) *</label>
                                        <input type="number" placeholder="Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                      </div>
                                      <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment Proof Screenshot *</label>
                                        <label className="relative cursor-pointer block">
                                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setPayments(prev => prev.map(pay => pay.id === p.id ? { ...pay, screenshot: file.name, screenshotData: reader.result as string } : pay));
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }} />
                                          <div className={`w-full px-3 py-1.5 pr-8 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                            {p.screenshot || 'Attach payment screenshot...'}
                                          </div>
                                          <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </form>
                        </div>
                      )}

                      {/* Notes & Terms Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                          <textarea 
                            rows={2}
                            value={invoiceNotes}
                            onChange={(e) => setInvoiceNotes(e.target.value)}
                            placeholder="Notes - any relevant information not already covered"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Terms</label>
                          <textarea 
                            rows={2}
                            value={invoiceTerms}
                            onChange={(e) => setInvoiceTerms(e.target.value)}
                            placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Promo Code & Invoice Summary Totals (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      
                      {/* Promo Code Coupon Selector (Only for Plan Purchase / Renewal / Change / Upcoming, NOT in Transaction History edit) */}
                      {purchaseMode !== 'edit' && (
                        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Percent className="w-3.5 h-3.5 text-indigo-500" /> Apply Promo Code
                            </span>
                            {appliedPromo && (
                              <button 
                                type="button" 
                                onClick={() => setAppliedPromo(null)}
                                className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {promoCodes.length === 0 ? (
                            <p className="text-[10px] text-slate-400">No promo codes available.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {promoCodes.map(pc => {
                                const isSelected = appliedPromo?.id === pc.id
                                return (
                                  <button
                                    key={pc.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) setAppliedPromo(null)
                                      else {
                                        setAppliedPromo(pc)
                                        toast.success(`Promo code ${pc.code} applied!`)
                                      }
                                    }}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                                    }`}
                                  >
                                    <Percent className="w-3 h-3" />
                                    {pc.code}
                                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Invoice Summary Calculation Breakdown */}
                      <div className="bg-slate-900 text-white dark:bg-slate-850 p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col gap-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                          INVOICE SUMMARY
                        </h4>

                        <div className="flex flex-col gap-2 text-xs font-semibold">
                          <div className="flex justify-between text-slate-300">
                            <span>Subtotal</span>
                            <span>₹{getInvoiceSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div className="flex justify-between text-slate-300">
                            <span>Total Tax / GST</span>
                            <span>₹{getInvoiceTaxTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          {purchaseMode !== 'edit' && appliedPromo && (
                            <div className="flex justify-between text-emerald-400 font-bold">
                              <span>Discount ({appliedPromo.code})</span>
                              <span>− ₹{getPromoDiscountAmount(selectedPlan, appliedPromo).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}

                          <div className="border-t border-slate-800 pt-2.5 mt-1 flex justify-between items-center">
                            <span className="font-extrabold text-sm uppercase text-slate-100">Total</span>
                            <span className="text-lg font-black text-white">
                              ₹{getFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            type="submit"
                            form="checkout-form"
                            disabled={submitting}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Processing Invoice...</>
                            ) : purchaseMode === 'edit' ? (
                              '💾 Update Bill'
                            ) : paymentModeOption === 'gateway' ? (
                              '⚡ Pay & Directly Activate Plan'
                            ) : (
                              '📩 Submit Payment Request'
                            )}
                          </button>

                          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            {purchaseMode === 'edit'
                              ? 'Updates this transaction invoice in the billing history.'
                              : paymentModeOption === 'gateway'
                              ? 'Gateway payments directly activate the institute plan without manual moderation.'
                              : 'Manual payments require admin verification on the Request page before activation.'}
                          </p>
                        </div>
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


          {/* Filter and Log Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-0">
                {/* Segment Select */}
                <SearchableDropdown
                  label="Segment"
                  placeholder="All Segments"
                  searchPlaceholder="Search segment..."
                  options={segments.map(s => ({
                    label: s.name === 'Insitute' ? 'Institute' : s.name,
                    value: s.name
                  }))}
                  value={filterSegment}
                  onChange={val => setFilterSegment(val)}
                  allowClear={true}
                />

                {/* School Select */}
                <SearchableDropdown
                  label="School"
                  placeholder="All Schools"
                  searchPlaceholder="Search school..."
                  options={Array.from(new Set(schools.map(s => s.name))).map(name => ({
                    label: name,
                    value: name
                  }))}
                  value={filterSchool}
                  onChange={val => setFilterSchool(val)}
                  allowClear={true}
                />

                {/* Payment Mode Select */}
                <SearchableDropdown
                  label="Payment Mode"
                  placeholder="All Payment Modes"
                  searchPlaceholder="Search mode..."
                  options={[
                    'Payment Gateway',
                    'Bank Transfer',
                    'UPI ID',
                    'QR Code',
                    'Cash / Cheque'
                  ]}
                  value={filterPaymentMode}
                  onChange={val => setFilterPaymentMode(val)}
                  allowClear={true}
                />

                {/* Select Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Date</label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
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
                <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Total Price</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Mode</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Date</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Bill</th>
                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                          Loading transaction records...
                        </div>
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-semibold">{bill.segment === 'Insitute' ? 'Institute' : bill.segment}</td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-semibold">{bill.school_name}</td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{bill.plan_name}</td>
                          <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-bold">₹{Number(bill.amount || 0).toFixed(2)}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
                              {bill.payment_mode}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{formatDateOnly(bill.payment_date)}</td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDownloadPDF(bill.school_name, bill.amount, bill.plan_name, bill.payment_date, bill.transaction_id, bill.payment_mode)}
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
      {showViewPlanModal && (() => {
        const hasRenewalInModal = Boolean(
          (showViewPlanModal.renewal_billing_items && showViewPlanModal.renewal_billing_items.length > 0) ||
          (showViewPlanModal.renewal_billing_duration && showViewPlanModal.renewal_billing_duration > 0)
        );
        const activeItems = (viewPlanTab === 'renewal' && hasRenewalInModal)
          ? (showViewPlanModal.renewal_billing_items || [])
          : (showViewPlanModal.first_billing_items || []);
        
        const activeDuration = (viewPlanTab === 'renewal' && hasRenewalInModal)
          ? (showViewPlanModal.renewal_billing_duration || 365)
          : (showViewPlanModal.first_billing_duration || 365);

        const activeTotal = activeItems.length > 0
          ? activeItems.reduce((sum: number, item: any) => sum + getItemTotal(item), 0)
          : (Number((showViewPlanModal as any).price) || 0);

        return (
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

              {/* Tabs if both base and renewal exist */}
              {hasRenewalInModal && (
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setViewPlanTab('first')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      viewPlanTab === 'first'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Base Plan ({showViewPlanModal.first_billing_duration || 365} Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPlanTab('renewal')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      viewPlanTab === 'renewal'
                        ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Renewal Plan ({showViewPlanModal.renewal_billing_duration || 365} Days)
                  </button>
                </div>
              )}

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
                      {activeItems && activeItems.length > 0 ? (
                        activeItems.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">{item.item_description}</td>
                            <td className="p-3 text-right">₹{Number(item.price).toFixed(2)}</td>
                            <td className="p-3 text-right">₹{getItemTaxAmount(item).toFixed(2)} ({item.tax_percentage}%)</td>
                            <td className="p-3 text-right font-extrabold text-slate-800 dark:text-slate-100">
                              ₹{getItemTotal(item).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                          <td colSpan={4} className="p-3 text-center text-slate-400">No item details available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center bg-[#EBF6F6]/40 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Total {hasRenewalInModal && viewPlanTab === 'renewal' ? 'Renewal' : 'Base'} Subscription Price
                  </span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    ₹{activeTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {showViewPlanModal.brochure_url && (
                  <button
                    onClick={() => handleDownloadBrochure(showViewPlanModal.brochure_url, showViewPlanModal.plan_name)}
                    className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Plan Brochure
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
