'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Plus, Edit3, Trash2, FileText, Download, Loader2, 
  ChevronLeft, ChevronRight, X, Percent, Tag, Ticket, Check, Paperclip, Calendar,
  Building2, Phone, Mail, User, MapPin, ShieldCheck, Award
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

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
  const [segmentInstitutesList, setSegmentInstitutesList] = useState<any[]>([])
  const [showAllPlansOverride, setShowAllPlansOverride] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState<'new' | 'renew' | 'change' | 'upcoming' | 'edit'>('new')
  const [showActivePlanFeatures, setShowActivePlanFeatures] = useState(false)
  const [showRenewalFeatures, setShowRenewalFeatures] = useState(false)
  const [showUpcomingFeatures, setShowUpcomingFeatures] = useState<Record<string, boolean>>({})
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
    const items = purchaseMode === 'renew' && plan.renewal_billing_items?.length ? plan.renewal_billing_items : plan.first_billing_items
    if (!items || items.length === 0) {
      return 1200 // Default fallback base price
    }
    return items.reduce((sum: number, item: any) => sum + getItemTotal(item), 0)
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
  
  const getGrossAmount = () => {
    if (!selectedPlan) return 0
    if (purchaseMode === 'edit') return getTotalEntered()
    if (paymentModeOption !== 'gateway') return getTotalEntered()
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

  // Pre-fill manual amount field when plan or promo changes
  useEffect(() => {
    if (selectedPlan) {
      setPayments(prev => {
        if (prev.length === 1 && !prev[0].txnId && !prev[0].screenshot) {
          return [{ ...prev[0], amount: String(getFinalAmount()) }]
        }
        return prev
      })
    }
  }, [selectedPlan, appliedPromo, purchaseMode])

  // Trigger checkout creation
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    // If manual mode, require some validation
    if (paymentModeOption !== 'gateway') {
      if (payments.some(p => !p.txnId)) { toast.error('Transaction ID is required for all payments'); return }
      if (payments.some(p => !p.amount || parseFloat(p.amount) <= 0)) { toast.error('Valid Amount is required for all payments'); return }
      
      const planAmount = getPlanPrice(selectedPlan)
      const enteredAmount = getGrossAmount()
      if (enteredAmount < planAmount) {
        toast.error(`Gross amount (₹${enteredAmount}) cannot be less than the plan price (₹${planAmount})`)
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
      const finalTxn = paymentModeOption === 'gateway' ? `TXN${Math.floor(100000 + Math.random() * 900000)}` : payments.map(p => p.txnId).join(', ')
      const finalStatus = 'Pending'

      // Resolve institution_id from loaded schools list
      const selectedSchoolObj = schools.find(s => s.name === selectedSchool)
      const institutionId = selectedSchoolObj?.id || null

      const url = purchaseMode === 'edit' && editingId ? `/api/admin/billing/${editingId}` : '/api/admin/billing'
      const method = purchaseMode === 'edit' && editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
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
          promo_code_id: appliedPromo?.id || null,
          is_renewal: purchaseMode === 'renew',
          screenshots: paymentModeOption === 'gateway' ? [] : payments.map(p => ({ amount: parseFloat(p.amount) || 0, filename: p.screenshot || '', dataUrl: p.screenshotData || '' }))
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
          toast.success(paymentModeOption === 'gateway' ? 'Payment request submitted successfully!' : 'Bill created successfully!')
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
  const handleStartEdit = (bill: Bill) => {
    setActiveTab('purchase')
    // 1. Open the wizard directly to Step 2
    setWizardStep(2)
    setPurchaseMode('edit')
    setEditingId(bill.id)
    
    // 2. Pre-fill the states needed for Step 2
    const inst = schools.find(i => i.id === bill.institution_id)
    if (inst) setSelectedSchool(inst.name)
    
    const segment = segments.find(s => s.id === inst?.segment_id)?.name
    if (segment) setSelectedSegment(segment)
    
    const plan = plans.find(p => p.id === bill.plan_id)
    if (plan) setSelectedPlan(plan)
    
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
    const planDesc = fullPlan?.description || '';
    const planMenus = fullPlan?.menus || [];

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice - ${schoolName}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #fff; margin: 0; padding: 20px; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border: 2px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); min-height: 270mm; display: flex; flex-direction: column; box-sizing: border-box; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
          .brand h1 { margin: 0; color: #4f46e5; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
          .brand p { margin: 5px 0 0; color: #6b7280; font-size: 13px; }
          .invoice-meta { text-align: right; }
          .invoice-meta h2 { margin: 0 0 10px; color: #111827; font-size: 22px; font-weight: 800; text-transform: uppercase; }
          .meta-row { font-size: 13px; color: #4b5563; margin-bottom: 4px; }
          .meta-row strong { color: #111827; }
          .billing-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .billing-box { width: 100%; }
          .billing-box h3 { font-size: 13px; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
          .billing-box p { margin: 4px 0; font-size: 14px; color: #1f2937; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f9fafb; text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
          td { padding: 14px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; vertical-align: top; }
          .amount-col { text-align: right; }
          .summary-section { display: flex; justify-content: flex-end; margin-top: auto; }
          .summary-box { width: 320px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563; }
          .summary-row.total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: 800; color: #111827; }
          .footer { margin-top: 30px; text-align: center; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { 
            body { padding: 0; background: #fff; } 
            .invoice-container { box-shadow: none; border: 2px solid #cbd5e1 !important; padding: 25px; max-width: 100%; height: 97vh; min-height: 97vh; margin: 0; page-break-after: avoid; page-break-inside: avoid; } 
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="brand">
              <h1>Academy Setu</h1>
              <p>BrainKet Technologies</p>
              <p>Official CRM Partner</p>
            </div>
            <div class="invoice-meta">
              <h2>Tax Invoice</h2>
              <div class="meta-row"><strong>Date:</strong> ${new Date(date || new Date()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div class="meta-row"><strong>Transaction ID:</strong> ${txnId || 'N/A'}</div>
              <div class="meta-row"><strong>Payment Mode:</strong> <span style="text-transform: uppercase;">${paymentMode}</span></div>
            </div>
          </div>
          
          <div class="billing-section">
            <div class="billing-box">
              <h3>Billed To (Institute)</h3>
              <p style="font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 8px;">${schoolName}</p>
            </div>
          </div>
      
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong style="font-size: 16px;">${planName}</strong><br>
                  <span style="font-size: 13px; color: #6b7280;">Academy Setu CRM Software Subscription Plan</span>
                  
                  ${planDesc ? `<div style="margin-top: 10px; font-size: 13px; color: #4b5563; border-left: 2px solid #e5e7eb; padding-left: 10px;">${planDesc}</div>` : ''}
                  
                  ${planMenus && planMenus.length > 0 ? `
                    <div style="margin-top: 15px;">
                      <strong style="font-size: 12px; color: #9ca3af; text-transform: uppercase;">Modules Included:</strong>
                      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                        ${planMenus.map((m: string) => `<span style="padding: 3px 8px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 11px; font-weight: 600;">${m}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </td>
                <td class="amount-col">₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
      
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-row" style="color: #10b981;">
                <span>Discount Applied</span>
                <span>- ₹0.00</span>
              </div>
              <div class="summary-row total">
                <span>Total Paid</span>
                <span>₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
      
          <div class="footer">
            <p><strong style="color: #4f46e5;">Thank you for choosing Academy Setu!</strong></p>
            <p>This is a computer-generated invoice and requires no physical signature.</p>
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
                        School/College Name <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
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
                                  {!dActivePlan && (
                                    <button
                                      onClick={() => {
                                        setSelectedSchool(dDetails?.name)
                                        setInstDetails(dDetails)
                                        setPurchaseMode('new')
                                        setShowAllPlansOverride(true)
                                      }}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                                    >
                                      + Purchase Plan
                                    </button>
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
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                      Active Plan
                                    </span>
                                    <h5 className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">{dActivePlan.plan_name}</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      Valid: {formatDateOnly(dActivePlan.start_date)} to {formatDateOnly(dActivePlan.end_date)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">₹{dActivePlan.amount}</span>
                                    {(() => {
                                      const fullPlan = filteredPlansList.find(p => p.id === dActivePlan.plan_id) || plans.find(p => p.id === dActivePlan.plan_id);
                                      const brochure = dActivePlan.brochure_url || fullPlan?.brochure_url;
                                      if (brochure) {
                                        return (
                                          <button
                                            onClick={() => handleDownloadBrochure(brochure, dActivePlan.plan_name)}
                                            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:border-indigo-300 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                                            title="Download Brochure"
                                          >
                                            <FileText className="w-4 h-4 text-indigo-500" />
                                            Brochure
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
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
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">No active plan for this institute.</span>
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
                            {!instActivePlan && (
                              <button
                                onClick={() => {
                                  setPurchaseMode('new')
                                  setShowAllPlansOverride(true)
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                              >
                                + Purchase New Plan
                              </button>
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
                              <div className="px-5 py-4 border-b border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                  Ongoing Plan
                                </h4>
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
                              <div className="p-5">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{instActivePlan.plan_name}</h5>
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
                                    {(() => {
                                      const activeValidTill = new Date(instActivePlan.end_date);
                                      const activeDaysLeft = Math.max(0, Math.ceil((activeValidTill.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                      return (
                                        <div className="text-right p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl shadow-sm">
                                          <div className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">Amount Paid</div>
                                          <span className="text-2xl font-black">₹{instActivePlan.amount}</span>
                                        </div>
                                      )
                                    })()}
                                    <div className="flex items-center gap-2">
                                      {(() => {
                                        const fullPlan = filteredPlansList.find(p => p.id === instActivePlan.plan_id) || plans.find(p => p.id === instActivePlan.plan_id);
                                        const brochure = instActivePlan.brochure_url || fullPlan?.brochure_url;
                                        if (brochure) {
                                          return (
                                            <button
                                              onClick={() => handleDownloadBrochure(brochure, instActivePlan.plan_name)}
                                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:border-indigo-300 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                                              title="Download Brochure"
                                            >
                                              <FileText className="w-4 h-4 text-indigo-500" />
                                              Brochure
                                            </button>
                                          );
                                        }
                                        return null;
                                      })()}
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
                            const activeFullPlan = filteredPlansList.find(p => p.id === instActivePlan.plan_id) || plans.find(p => p.id === instActivePlan.plan_id);
                            const hasRenewal = activeFullPlan && activeFullPlan.renewal_billing_items && activeFullPlan.renewal_billing_items.length > 0;
                            
                            if (!hasRenewal) return null;
                            
                            const renewalPrice = (activeFullPlan?.renewal_billing_items || []).reduce((acc: number, item: any) => acc + getItemTotal(item), 0);
                            const renewalDuration = activeFullPlan.renewal_billing_duration || 0;
                            
                            const validFrom = new Date(instActivePlan.end_date);
                            const validTill = new Date(validFrom.getTime() + renewalDuration * 24 * 60 * 60 * 1000);
                            
                            const daysLeftToRenew = Math.max(0, Math.ceil((validFrom.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                            const hasPendingRenewal = instHasPendingRenewal;

                            return (
                              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 overflow-hidden">
                                <div className="px-5 py-4 border-b border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-between">
                                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    Renewal Details (Active Plan)
                                  </h4>
                                  {hasPendingRenewal && (
                                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                                      Renewal Requested
                                    </span>
                                  )}
                                </div>
                                <div className="p-5">
                                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{activeFullPlan.plan_name} (Renewal)</h5>
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
                                      <div className="text-right p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl shadow-sm">
                                        <div className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">Renewal Price</div>
                                        <span className="text-2xl font-black">₹{renewalPrice.toFixed(2)}</span>
                                        <div className="text-[10px] font-medium text-indigo-200 mt-0.5">
                                          {daysLeftToRenew} days left
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-5 py-4 bg-indigo-100/30 dark:bg-indigo-900/20 border-t border-indigo-100/50 dark:border-indigo-900/50 flex flex-wrap items-center gap-3">
                                  <button
                                    disabled={hasPendingRenewal}
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
                                      hasPendingRenewal
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                    }`}
                                  >
                                    {hasPendingRenewal ? 'Renewal Requested' : 'Renew Plan'}
                                  </button>
                                  {(() => {
                                    const brochure = activeFullPlan?.brochure_url || instActivePlan?.brochure_url;
                                    if (brochure) {
                                      return (
                                        <button
                                          onClick={() => handleDownloadBrochure(brochure, activeFullPlan?.plan_name || instActivePlan?.plan_name)}
                                          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:border-indigo-300 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                                          title="Download Brochure"
                                        >
                                          <FileText className="w-4 h-4 text-indigo-500" />
                                          Brochure
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
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
                                <div className="px-5 py-4 border-b border-blue-100/50 dark:border-blue-900/50 flex items-center justify-between">
                                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                                    Queued Plan
                                  </h4>
                                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                                    Queued
                                  </span>
                                </div>
                                <div className="p-5">
                                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-base font-black text-slate-800 dark:text-slate-100">{plan.plan_name}</h5>
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
                                      <div className="text-right p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm">
                                        <div className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Price Paid</div>
                                        <span className="text-2xl font-black">₹{plan.amount}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-5 py-4 bg-blue-100/30 dark:bg-blue-900/20 border-t border-blue-100/50 dark:border-blue-900/50 flex flex-wrap items-center justify-end gap-3">
                                  {(() => {
                                     const fullPlan = filteredPlansList.find(p => p.id === plan.plan_id) || plans.find(p => p.id === plan.plan_id);
                                     const brochure = plan.brochure_url || fullPlan?.brochure_url;
                                     if (brochure) {
                                       return (
                                         <button
                                           onClick={() => handleDownloadBrochure(brochure, plan.plan_name)}
                                           className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                                           title="Download Brochure"
                                         >
                                           <FileText className="w-4 h-4 text-blue-500" />
                                           Brochure
                                         </button>
                                       );
                                     }
                                     return null;
                                   })()}
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

            {/* Modal for Step 2 */}
            {wizardStep === 2 && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto p-4 lg:p-5 relative animate-in fade-in zoom-in duration-200">
                  <button
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
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col gap-3 mx-auto w-full mt-2">
                    
                    {/* 1. Plan Detail & Institute Header */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 px-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Purchasing Plan For</p>
                          <h2 className="text-sm font-black leading-tight">{selectedSchool || '—'}</h2>
                        </div>
                        {selectedSegment && (
                          <span className="self-start sm:self-auto px-2 py-0.5 bg-white/20 text-white border border-white/30 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">{selectedSegment}</span>
                        )}
                      </div>
                      {selectedPlan && (
                        <div className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedPlan.plan_name}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Validity: {selectedPlan.first_billing_duration || 365} days</span>
                              <span className="text-[10px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{dates.validFrom} → {dates.validTo}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Plan Price</p>
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              ₹{getPlanPrice(selectedPlan).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Promo Code */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 px-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-1.5">
                      <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-700">
                        <Percent className="w-3.5 h-3.5 text-indigo-500" /> Promo Code
                      </h3>
                      {promoCodes.length === 0 ? (
                        <p className="text-[10px] text-slate-400 font-medium mt-1">No promo codes available.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {promoCodes.map(pc => (
                            <button
                              key={pc.id}
                              type="button"
                              onClick={() => {
                                if (appliedPromo?.id === pc.id) {
                                  setAppliedPromo(null)
                                } else {
                                  setAppliedPromo(pc)
                                  toast.success(`Promo code ${pc.code} applied!`)
                                }
                              }}
                              className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border shadow-sm cursor-pointer ${
                                appliedPromo?.id === pc.id
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20'
                                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                              }`}
                            >
                              <Percent className="w-3 h-3" />
                              {pc.code}
                              {appliedPromo?.id === pc.id && (
                                <span className="ml-1 flex items-center justify-center bg-white/20 rounded-full w-3 h-3 text-[8px]">✓</span>
                              )}
                              {/* Hover Tooltip */}
                              <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-20 pointer-events-none transition-all">
                                <div className="font-bold text-indigo-300 mb-0.5">{pc.code}</div>
                                <div className="font-medium">Discount: {pc.discount_type === 'Fixed' ? `₹${pc.discount_value} Off` : `${pc.discount_value}% Off`}</div>
                                {pc.description && <div className="mt-1 text-slate-300 leading-tight border-t border-slate-600 pt-1">{pc.description}</div>}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Payment Mode */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 px-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                      <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                        Payment Mode
                      </h3>

                      {/* Mode pill tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['gateway', 'bank', 'upi', 'qr'] as const).map(mode => (
                          <button key={mode} type="button" onClick={() => setPaymentModeOption(mode)}
                            className={`flex flex-row justify-center items-center gap-1.5 py-1.5 px-2 rounded-lg border-2 text-[10px] font-bold transition-all cursor-pointer ${paymentModeOption === mode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/30'}`}
                          >
                            <span className="text-sm leading-none">{mode === 'gateway' ? '💳' : mode === 'bank' ? '🏦' : mode === 'upi' ? '📱' : '📷'}</span>
                            {mode === 'gateway' ? 'Gateway' : mode === 'bank' ? 'Bank' : mode === 'upi' ? 'UPI' : 'QR Code'}
                          </button>
                        ))}
                      </div>

                      <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3">
                        {/* 1. Payment Gateway */}
                        {paymentModeOption === 'gateway' && (
                          <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Razorpay Gateway 1</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full text-[9px] font-bold">Pending</span>
                                <button type="button" onClick={() => handleGenerateLink('Razorpay')} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors shadow-sm">Generate</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">PhonePe Gateway 1</span>
                              <button type="button" onClick={() => handleGenerateLink('Phonepe')} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors shadow-sm">Generate</button>
                            </div>
                          </div>
                        )}

                        {/* 2. Bank */}
                        {paymentModeOption === 'bank' && (
                          <div className="flex flex-col gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bank Account Details</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div><span className="text-slate-400 text-[10px] font-semibold block mb-0.5">Account No.</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankAccountNo}</span></div>
                                <div><span className="text-slate-400 text-[10px] font-semibold block mb-0.5">IFSC Code</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankIfsc}</span></div>
                                <div><span className="text-slate-400 text-[10px] font-semibold block mb-0.5">Holder Name</span><span className="font-bold text-slate-800 dark:text-slate-200">{bankHolderName}</span></div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              {payments.map((p, index) => (
                                <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                  {index > 0 && (
                                    <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                    <input type="text" placeholder="Enter Transaction ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                    <input type="number" placeholder="Enter Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
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
                                      <div className={`w-full px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                        {p.screenshot || 'Attach a file'}
                                      </div>
                                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </label>
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addPayment} className="self-start flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors px-1">
                                <Plus className="w-3.5 h-3.5" /> Add Another Payment
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. UPI */}
                        {paymentModeOption === 'upi' && (
                          <div className="flex flex-col gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">UPI Details</p>
                              <div className="text-xs"><span className="text-slate-400 text-[10px] font-semibold block mb-0.5">UPI ID</span><span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span></div>
                            </div>
                            <div className="flex flex-col gap-3">
                              {payments.map((p, index) => (
                                <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                  {index > 0 && (
                                    <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                    <input type="text" placeholder="Enter Transaction ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                    <input type="number" placeholder="Enter Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
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
                                      <div className={`w-full px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                        {p.screenshot || 'Attach a file'}
                                      </div>
                                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </label>
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addPayment} className="self-start flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors px-1">
                                <Plus className="w-3.5 h-3.5" /> Add Another Payment
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 4. QR Code */}
                        {paymentModeOption === 'qr' && (
                          <div className="flex flex-col gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                              <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm shrink-0">
                                <svg className="w-16 h-16 text-slate-900 dark:text-white" viewBox="0 0 100 100" fill="currentColor">
                                  <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" /><path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" /><path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                                  <rect x="40" y="5" width="10" height="15" /><rect x="55" y="15" width="10" height="10" /><rect x="45" y="40" width="15" height="15" /><rect x="15" y="45" width="10" height="10" /><rect x="75" y="45" width="15" height="10" /><rect x="40" y="70" width="15" height="10" /><rect x="55" y="85" width="10" height="10" /><rect x="75" y="75" width="15" height="15" /><rect x="85" y="60" width="10" height="10" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Scan QR to Pay</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Use any UPI app to scan and pay, then enter the transaction ID below.</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              {payments.map((p, index) => (
                                <div key={p.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                  {index > 0 && (
                                    <button type="button" onClick={() => removePayment(p.id)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 cursor-pointer transition-colors shadow-sm z-10" title="Remove Payment">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Transaction ID *</label>
                                    <input type="text" placeholder="Enter Transaction ID" value={p.txnId} onChange={e => updatePayment(p.id, 'txnId', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount *</label>
                                    <input type="number" placeholder="Enter Amount" value={p.amount} onChange={e => updatePayment(p.id, 'amount', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />
                                  </div>
                                  <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshot</label>
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
                                      <div className={`w-full px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs truncate ${p.screenshot ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                        {p.screenshot || 'Attach a file'}
                                      </div>
                                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </label>
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addPayment} className="self-start flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors px-1">
                                <Plus className="w-3.5 h-3.5" /> Add Another Payment
                              </button>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* 4. Final Summary & Submit */}
                    {selectedPlan && (
                      <div className="bg-slate-800 dark:bg-slate-900/80 rounded-xl p-4 shadow-md text-white mt-1 border border-slate-700">
                        <div className="flex flex-col gap-1.5 text-xs font-semibold mb-3">
                          <div className="flex justify-between text-slate-300">
                            <span>{paymentModeOption !== 'gateway' ? 'Gross Amount (Entered)' : 'Plan Price'}</span>
                            <span>₹{getGrossAmount().toLocaleString('en-IN')}</span>
                          </div>
                          {appliedPromo && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Discount ({appliedPromo.code})</span>
                              <span>− ₹{getPromoDiscountAmount(selectedPlan, appliedPromo).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-black text-lg border-t border-slate-600/50 pt-2 mt-1">
                            <span>Total Payable (Net)</span>
                            <span className="text-indigo-400">
                              ₹{getFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          form="checkout-form"
                          disabled={submitting}
                          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white font-black text-xs rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                          ) : (
                            '🚀 Submit Request'
                          )}
                        </button>

                        <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-2">
                          A request will be created under the <strong className="text-slate-300">Request</strong> menu for review.
                        </p>
                      </div>
                    )}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">Select Segment</option>
                    {segments.map(s => (
                      <option key={s.id} value={s.name}>{s.name === 'Insitute' ? 'Institute' : s.name}</option>
                    ))}
                  </select>
                </div>

                {/* School Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">School</label>
                  <select
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
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
                          <td className="p-3 text-right">₹{getItemTaxAmount(item).toFixed(2)} ({item.tax_percentage}%)</td>
                          <td className="p-3 text-right font-extrabold text-slate-800 dark:text-slate-100">
                            ₹{getItemTotal(item).toFixed(2)}
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
