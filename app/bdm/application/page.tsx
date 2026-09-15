'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Eye, Edit3, RefreshCw, X, MoreVertical, Loader2, Filter, ChevronDown, ChevronUp, UserCheck, Camera, Percent, Check, CreditCard, Building, Smartphone, QrCode, Wallet, ShieldCheck, Tag, Paperclip, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { SearchableDropdown } from '@/components/ui/SearchableDropdown'

interface Application {
  id: string
  application_no: string
  school_name: string
  contact_person: string
  state: string
  district: string
  status: 'Applied' | 'Pending' | 'Paid' | 'Unpaid' | 'Active' | 'Inactive' | 'Completed' | 'Generate' | 'Requested' | string
  enquiry_status?: string | null
  plan_id?: string | null
  plan_name?: string | null
  amount?: number | string | null
  promo_code?: string | null
  payment_mode?: string | null
  created_at: string
  assigned_to?: string | null
  assigned_user_name?: string | null
  assigned_user_role?: string | null
  created_by?: string | null
  created_by_name?: string | null
  created_by_role?: string | null
}

export default function ApplicationPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Counts for tabs
  const [metaCounts, setMetaCounts] = useState({ totalCount: 0, newCount: 0 })

  // Search & Filtering
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'new'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingApp, setViewingApp] = useState<any | null>(null)

  // Selected Record
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  // States and Districts for Dynamic Dropdowns
  const [statesData, setStatesData] = useState<any[]>([])
  const [districtsList, setDistrictsList] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatesData(data.data)
        }
      })
      .catch(err => console.error('Failed to load states/cities', err))
  }, [])

  // Computed state and district options strictly from Settings (/api/admin/settings/state-city)
  const allStatesList = React.useMemo(() => {
    return statesData
      .map((s: any) => s.state_name)
      .filter(Boolean)
      .sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData])

  const getDistrictsForState = (stName: string): string[] => {
    if (!stName) {
      const allDistricts = new Set<string>()
      statesData.forEach((s: any) => (s.districts || []).forEach((d: string) => allDistricts.add(d)))
      return Array.from(allDistricts).sort((a, b) => a.localeCompare(b))
    }
    const stateObj = statesData.find((s: any) => s.state_name?.toLowerCase() === stName.toLowerCase())
    return (stateObj?.districts || []).slice().sort((a: string, b: string) => a.localeCompare(b))
  }

  const handleStateChange = (stateVal: string) => {
    setStateName(stateVal)
    const stateObj = statesData.find(s => s.state_name === stateVal)
    if (stateObj) {
      setDistrictsList(stateObj.districts || [])
      setDistrictName('')
    } else {
      setDistrictsList([])
      setDistrictName('')
    }
  }

  // Form States (Create & Edit)
  const [schoolName, setSchoolName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [affiliatedTo, setAffiliatedTo] = useState('')
  const [affiliationCode, setAffiliationCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [emailId, setEmailId] = useState('')
  const [address, setAddress] = useState('')
  const [stateName, setStateName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [pincode, setPincode] = useState('')

  const [principalName, setPrincipalName] = useState('')
  const [principalGender, setPrincipalGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [principalSign, setPrincipalSign] = useState('')
  const [principalPhoto, setPrincipalPhoto] = useState<string | null>(null)

  const [directorName, setDirectorName] = useState('')
  const [directorGender, setDirectorGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [directorSign, setDirectorSign] = useState('')
  const [directorPhoto, setDirectorPhoto] = useState<string | null>(null)

  const [appStatus, setAppStatus] = useState<Application['status']>('Applied')
  const [enquiryStatus, setEnquiryStatus] = useState<string>('Applied')
  const [plan, setPlan] = useState<string>('')
  const [promoCode, setPromoCode] = useState<string>('')
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer')
  const [transactionId, setTransactionId] = useState<string>('')
  const [screenshotFilename, setScreenshotFilename] = useState<string>('')
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('')
  const [plans, setPlans] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])

  // Multiple Transactions State
  const [transactions, setTransactions] = useState<{ id: string; transactionId: string; amount: string; screenshotFilename: string; screenshotDataUrl: string }[]>([
    { id: '1', transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }
  ])

  const handleAddTransaction = () => {
    setTransactions(prev => [
      ...prev,
      { id: Date.now().toString(), transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }
    ])
  }

  const handleRemoveTransaction = (index: number) => {
    setTransactions(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleTransactionChange = (index: number, field: 'transactionId' | 'amount' | 'screenshotFilename' | 'screenshotDataUrl', value: string) => {
    setTransactions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const PAYMENT_METHOD_OPTIONS = [
    { id: 'Payment Gateway', label: 'Payment Gateway', sub: 'Cards / Netbanking / UPI', icon: CreditCard },
    { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'Direct NEFT / IMPS', icon: Building },
    { id: 'UPI ID', label: 'UPI ID', sub: 'Instant VPA Transfer', icon: Smartphone },
    { id: 'QR Code', label: 'QR Code', sub: 'Scan & Pay via QR', icon: QrCode },
    { id: 'Cash', label: 'Cash / Cheque', sub: 'Offline Payment', icon: Wallet },
  ]

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'principal' | 'director') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (target === 'principal') {
        setPrincipalPhoto(reader.result as string)
      } else {
        setDirectorPhoto(reader.result as string)
      }
      toast.success('Photo uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const handleSignUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'principal' | 'director') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (target === 'principal') {
        setPrincipalSign(reader.result as string)
      } else {
        setDirectorSign(reader.result as string)
      }
      toast.success('Signature uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('portal', 'bdm')
      if (searchText) {
        queryParams.append('search', searchText)
      }
      queryParams.append('tab', activeTab)
      if (filterStatus) {
        queryParams.append('status', filterStatus)
      }
      if (filterState) {
        queryParams.append('state', filterState)
      }
      if (filterDistrict) {
        queryParams.append('district', filterDistrict)
      }
      if (filterFromDate) {
        queryParams.append('start_date', filterFromDate)
      }
      if (filterToDate) {
        queryParams.append('end_date', filterToDate)
      }

      const response = await fetch(`/api/admin/application?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setApplications(resData.data)
        if (resData.meta) {
          setMetaCounts({
            totalCount: resData.meta.totalCount,
            newCount: resData.meta.newCount
          })
        }
      } else {
        toast.error('Failed to load applications')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading applications')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlansAndPromoCodes = async () => {
    try {
      const [planRes, promoRes] = await Promise.all([
        fetch('/api/admin/plan?pageSize=100'),
        fetch('/api/admin/promo-code?pageSize=100')
      ])
      const planData = await planRes.json()
      const promoData = await promoRes.json()
      if (planData.success) setPlans(planData.data)
      if (promoData.success) setPromoCodes(promoData.data)
    } catch (err) {
      console.error('Failed to load plans or promo codes', err)
    }
  }

  useEffect(() => {
    fetchApplications()
    fetchPlansAndPromoCodes()
  }, [activeTab])

  // Auto-apply filters when they change (with a small debounce for text inputs)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchApplications()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, filterStatus, filterState, filterDistrict, filterFromDate, filterToDate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchApplications()
  }

  const handleResetFilters = () => {
    setFilterStatus('')
    setFilterState('')
    setFilterDistrict('')
    setFilterFromDate('')
    setFilterToDate('')
    setCurrentPage(1)
    // fetch will be called by the useEffect on activeTab or we can call it manually
    setTimeout(() => fetchApplications(), 0)
  }

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getCalculatedPrice = (selectedPlanId: string, appliedPromoCode: string) => {
    if (!selectedPlanId) {
      return { basePrice: 0, itemsSubtotal: 0, taxTotal: 0, discountAmount: 0, finalNet: 0, selectedPlanObj: null, selectedPromoObj: null }
    }

    const selectedPlanObj = plans.find(p => p.id === selectedPlanId || p.plan_name === selectedPlanId)
    if (!selectedPlanObj) {
      return { basePrice: 0, itemsSubtotal: 0, taxTotal: 0, discountAmount: 0, finalNet: 0, selectedPlanObj: null, selectedPromoObj: null }
    }

    let itemsSubtotal = 0
    let taxTotal = 0

    if (selectedPlanObj.first_billing_items && selectedPlanObj.first_billing_items.length > 0) {
      selectedPlanObj.first_billing_items.forEach((item: any) => {
        const p = Number(item.price || 0)
        const tp = Number(item.tax_price || 0)
        const taxPct = Number(item.tax_percentage || 0)
        const calcTax = tp > 0 ? tp : (p * taxPct / 100)
        itemsSubtotal += p
        taxTotal += calcTax
      })
    }

    const calculatedGross = itemsSubtotal + taxTotal
    const rawPrice = Number((selectedPlanObj as any).gross_total_price || (selectedPlanObj as any).price || 0)
    const basePrice = calculatedGross > 0 ? calculatedGross : rawPrice
    if (itemsSubtotal === 0 && basePrice > 0) {
      itemsSubtotal = basePrice
    }

    const promoObj = promoCodes.find(pc => pc.code?.toUpperCase() === appliedPromoCode?.toUpperCase())
    let discountAmount = 0
    if (promoObj) {
      const val = Number(promoObj.discount_value || 0)
      if (promoObj.discount_type === 'Fixed' || promoObj.discount_type === 'Amount') {
        discountAmount = Math.min(val, basePrice)
      } else {
        discountAmount = (basePrice * val) / 100
      }
    } else if (appliedPromoCode && appliedPromoCode.trim()) {
      discountAmount = 0
    }

    const finalNet = Math.max(0, basePrice - discountAmount)
    return { basePrice, itemsSubtotal, taxTotal, discountAmount, finalNet, selectedPlanObj, selectedPromoObj: promoObj }
  }

  // Create Application Action
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName.trim()) { toast.error('School Name is required.'); return; }
    if (!contactPerson.trim()) { toast.error('Contact Person Name is required.'); return; }
    if (!mobileNo.trim()) { toast.error('Mobile Number is required.'); return; }
    if (!address.trim()) { toast.error('Address is required.'); return; }
    if (!stateName.trim()) { toast.error('State is required.'); return; }
    if (!districtName.trim()) { toast.error('District is required.'); return; }
    if (!pincode.trim()) { toast.error('Pincode is required.'); return; }
    if (!principalName.trim()) { toast.error('Principal Name is required.'); return; }
    if (!directorName.trim()) { toast.error('Director Name is required.'); return; }

    const { finalNet } = getCalculatedPrice(plan, promoCode)

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName.trim(),
          school_code: schoolCode.trim(),
          affiliated_to: affiliatedTo.trim(),
          affiliation_code: affiliationCode.trim(),
          contact_person: contactPerson.trim(),
          mobile_no: mobileNo.trim(),
          email_id: emailId.trim(),
          address: address.trim(),
          state: stateName.trim(),
          district: districtName.trim(),
          pincode: pincode.trim(),
          principal_name: principalName.trim(),
          principal_gender: principalGender,
          principal_sign: principalSign.trim(),
          principal_photo: principalPhoto,
          director_name: directorName.trim(),
          director_gender: directorGender,
          director_sign: directorSign.trim(),
          director_photo: directorPhoto,
          status: appStatus,
          enquiry_status: enquiryStatus,
          plan: plan,
          promo_code: promoCode,
          payment_mode: appStatus === 'Pending' ? paymentMode : null,
          amount: appStatus === 'Pending' ? finalNet : null,
          transaction_id: transactions.map(t => t.transactionId).filter(Boolean).join(', ') || transactionId,
          transactions: transactions,
          screenshots: transactions.filter(t => t.screenshotFilename || t.transactionId).map(t => ({
            transactionId: t.transactionId,
            filename: t.screenshotFilename,
            dataUrl: t.screenshotDataUrl,
            amount: t.amount || 0
          }))
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application created successfully')
        setIsCreateModalOpen(false)
        setTransactions([{ id: '1', transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }])
        // Reset form
        setSchoolName('')
        setSchoolCode('')
        setAffiliatedTo('')
        setAffiliationCode('')
        setContactPerson('')
        setMobileNo('')
        setEmailId('')
        setAddress('')
        setStateName('')
        setDistrictName('')
        setPincode('')
        setPrincipalName('')
        setPrincipalGender('Male')
        setPrincipalSign('')
        setPrincipalPhoto(null)
        setDirectorName('')
        setDirectorGender('Male')
        setDirectorSign('')
        setDirectorPhoto(null)
        setAppStatus('Applied')
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to create application')
      }
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Something went wrong creating application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setSelectedApp(null)
    setSchoolName('')
    setSchoolCode('')
    setAffiliatedTo('')
    setAffiliationCode('')
    setContactPerson('')
    setMobileNo('')
    setEmailId('')
    setAddress('')
    setStateName('')
    setDistrictName('')
    setPincode('')
    setPrincipalName('')
    setPrincipalGender('Male')
    setPrincipalSign('')
    setPrincipalPhoto(null)
    setDirectorName('')
    setDirectorGender('Male')
    setDirectorSign('')
    setDirectorPhoto(null)
    setAppStatus('Applied')
    setEnquiryStatus('Applied')
    setPlan('')
    setPromoCode('')
    setPaymentMode('Payment Gateway')
    setTransactions([{ id: '1', transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }])
  }
 
  const openEditModal = async (appId: string) => {
    setActiveMenuId(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/application/${appId}`)
      const data = await res.json()
      if (data.success) {
        const app = data.data
        setSelectedApp(app)
        setSchoolName(app.school_name || '')
        setSchoolCode(app.school_code || '')
        setAffiliatedTo(app.affiliated_to || '')
        setAffiliationCode(app.affiliation_code || '')
        setContactPerson(app.contact_person || '')
        setMobileNo(app.mobile_no || '')
        setEmailId(app.email_id || '')
        setAddress(app.address || '')
        setStateName(app.state || '')
        
        // Load districts for this state
        const stateObj = statesData.find((s: any) => s.state_name === app.state)
        if (stateObj) {
          setDistrictsList(stateObj.districts || [])
        } else {
          setDistrictsList([])
        }
        setDistrictName(app.district || '')
        setPincode(app.pincode || '')
        setPrincipalName(app.principal_name || '')
        setPrincipalGender(app.principal_gender || 'Male')
        setPrincipalSign(app.principal_sign || '')
        setPrincipalPhoto(app.principal_photo || null)
        setDirectorName(app.director_name || '')
        setDirectorGender(app.director_gender || 'Male')
        setDirectorSign(app.director_sign || '')
        setDirectorPhoto(app.director_photo || null)
        setAppStatus(app.status || 'Applied')
        setEnquiryStatus(app.enquiry_status || 'Applied')
        const foundPlan = plans.find(p => p.id === app.plan_id || p.plan_name === app.plan_id)
        setPlan(foundPlan ? foundPlan.id : (app.plan_id || ''))
        setPromoCode(app.promo_code || '')
        setPaymentMode(app.payment_mode || 'Payment Gateway')
        if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
          setTransactions(app.screenshots.map((s: any, idx: number) => ({
            id: (idx + 1).toString(),
            transactionId: s.transactionId || s.transaction_id || '',
            amount: s.amount ? String(s.amount) : '',
            screenshotFilename: s.filename || s.screenshot_filename || '',
            screenshotDataUrl: s.dataUrl || s.screenshot_data_url || ''
          })))
        } else if (app.transaction_id) {
          setTransactions([{
            id: '1',
            transactionId: app.transaction_id,
            amount: app.amount ? String(app.amount) : '',
            screenshotFilename: '',
            screenshotDataUrl: ''
          }])
        } else {
          setTransactions([{ id: '1', transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }])
        }
        setIsCreateModalOpen(true)
      } else {
        toast.error('Failed to load application details')
      }
    } catch (err) {
      console.error('Failed to load application details', err)
      toast.error('Something went wrong loading details')
    } finally {
      setLoading(false)
    }
  }

  const openViewModal = async (appId: string) => {
    setActiveMenuId(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/application/${appId}`)
      const data = await res.json()
      if (data.success) {
        setViewingApp(data.data)
        setIsViewModalOpen(true)
      } else {
        toast.error('Failed to load application details')
      }
    } catch (err) {
      console.error('Failed to load application details', err)
      toast.error('Something went wrong loading details')
    } finally {
      setLoading(false)
    }
  }

  // Edit Application Action
  const handleEditApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    if (!schoolName.trim()) { toast.error('School Name is required.'); return; }
    if (!contactPerson.trim()) { toast.error('Contact Person Name is required.'); return; }
    if (!mobileNo.trim()) { toast.error('Mobile Number is required.'); return; }
    if (!address.trim()) { toast.error('Address is required.'); return; }
    if (!stateName.trim()) { toast.error('State is required.'); return; }
    if (!districtName.trim()) { toast.error('District is required.'); return; }
    if (!pincode.trim()) { toast.error('Pincode is required.'); return; }
    if (!principalName.trim()) { toast.error('Principal Name is required.'); return; }
    if (!directorName.trim()) { toast.error('Director Name is required.'); return; }

    const { finalNet } = getCalculatedPrice(plan, promoCode)

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName.trim(),
          school_code: schoolCode.trim(),
          affiliated_to: affiliatedTo.trim(),
          affiliation_code: affiliationCode.trim(),
          contact_person: contactPerson.trim(),
          mobile_no: mobileNo.trim(),
          email_id: emailId.trim(),
          address: address.trim(),
          state: stateName.trim(),
          district: districtName.trim(),
          pincode: pincode.trim(),
          principal_name: principalName.trim(),
          principal_gender: principalGender,
          principal_sign: principalSign.trim(),
          principal_photo: principalPhoto,
          director_name: directorName.trim(),
          director_gender: directorGender,
          director_sign: directorSign.trim(),
          director_photo: directorPhoto,
          status: appStatus,
          enquiry_status: enquiryStatus,
          plan_id: plan || null,
          promo_code: promoCode,
          payment_mode: paymentMode || 'Payment Gateway',
          amount: finalNet,
          transaction_id: transactions.map(t => t.transactionId).filter(Boolean).join(', ') || transactionId,
          transactions: transactions,
          screenshots: transactions.filter(t => t.screenshotFilename || t.transactionId).map(t => ({
            transactionId: t.transactionId,
            filename: t.screenshotFilename,
            dataUrl: t.screenshotDataUrl,
            amount: t.amount || 0
          }))
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application updated successfully')
        handleCloseModal()
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to update application')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Something went wrong updating application')
    } finally {
      setSubmitting(false)
    }
  }

  // Update Status Action
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    const { finalNet } = getCalculatedPrice(plan, promoCode)

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: appStatus,
          enquiry_status: enquiryStatus,
          plan_id: plan || null,
          promo_code: promoCode,
          payment_mode: paymentMode || 'Payment Gateway',
          amount: finalNet,
          transaction_id: transactions.map(t => t.transactionId).filter(Boolean).join(', ') || transactionId,
          transactions: transactions,
          screenshots: transactions.filter(t => t.screenshotFilename || t.transactionId).map(t => ({
            transactionId: t.transactionId,
            filename: t.screenshotFilename,
            dataUrl: t.screenshotDataUrl,
            amount: t.amount || 0
          }))
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Status updated successfully')
        setIsUpdateStatusModalOpen(false)
        setSelectedApp(null)
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Something went wrong updating status')
    } finally {
      setSubmitting(false)
    }
  }

  // Row context menu navigationDelete Action
  const handleDeleteApplication = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/application/${deleteTargetId}`, { method: 'DELETE' })
      const resData = await response.json()
      if (resData.success) {
        toast.success('Application deleted successfully')
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to delete application')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong deleting application')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  // Navigate to details page for View / Edit
  const goToDetailsPage = (app: Application) => {
    setActiveMenuId(null)
    router.push(`/bdm/application/${app.id}`)
  }

  const openUpdateStatusModal = async (app: Application) => {
    setSelectedApp(app)
    setAppStatus(app.status)
    setEnquiryStatus(app.enquiry_status || 'Applied')
    
    const initialFoundPlan = plans.find(p => p.id === app.plan_id || p.plan_name === app.plan_id)
    setPlan(initialFoundPlan ? initialFoundPlan.id : (app.plan_id || ''))
    setPromoCode(app.promo_code || '')
    setPaymentMode(app.payment_mode || 'Payment Gateway')
    setIsUpdateStatusModalOpen(true)
    setActiveMenuId(null)

    try {
      const res = await fetch(`/api/admin/application/${app.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        const fullApp = data.data
        setSelectedApp(fullApp)
        const fullFoundPlan = plans.find(p => p.id === fullApp.plan_id || p.plan_name === fullApp.plan_id)
        setPlan(fullFoundPlan ? fullFoundPlan.id : (fullApp.plan_id || ''))
        setPromoCode(fullApp.promo_code || '')
        setPaymentMode(fullApp.payment_mode || 'Payment Gateway')
        if (fullApp.screenshots && Array.isArray(fullApp.screenshots) && fullApp.screenshots.length > 0) {
          setTransactions(fullApp.screenshots.map((s: any, idx: number) => ({
            id: (idx + 1).toString(),
            transactionId: s.transactionId || s.transaction_id || '',
            amount: s.amount ? String(s.amount) : '',
            screenshotFilename: s.filename || s.screenshot_filename || '',
            screenshotDataUrl: s.dataUrl || s.screenshot_data_url || ''
          })))
        } else if (fullApp.transaction_id) {
          setTransactions([{
            id: '1',
            transactionId: fullApp.transaction_id,
            amount: fullApp.amount ? String(fullApp.amount) : '',
            screenshotFilename: '',
            screenshotDataUrl: ''
          }])
        } else {
          setTransactions([{ id: '1', transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }])
        }
      }
    } catch (e) {
      console.error('Failed to load application details for update status modal', e)
    }
  }

  // Status Badge visual styles
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
      case 'Paid':
        return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
      case 'Unpaid':
        return 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
      case 'Active':
        return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
      case 'Inactive':
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
      case 'Generate':
        return 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
      case 'Requested':
        return 'bg-pink-50 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800'
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
      default:
        return 'bg-slate-50 dark:bg-slate-850 text-slate-650 dark:text-slate-350 border border-slate-150 dark:border-slate-750'
    }
  }



  // Pagination calculation
  const totalEntries = activeTab === 'all' ? metaCounts.totalCount : metaCounts.newCount
  const totalPages = Math.ceil(totalEntries / pageSize) || 1
  const paginatedApps = applications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        
        {/* Title and Top Search/Create Row */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Application</h1>
          
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Mobile no."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm cursor-pointer transition-colors shrink-0 ${
                showFilters
                  ? 'bg-indigo-600 text-white shadow-indigo-600/10'
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
              title="Toggle Filters"
            >
              {showFilters ? <ChevronUp className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10 cursor-pointer transition-colors shrink-0"
              title="Add Application"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle Component */}
        <div className="flex gap-4">
          {/* Total Application tab */}
          <button
            onClick={() => {
              setActiveTab('all')
              setCurrentPage(1)
            }}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm border cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            Total Application
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-white/90 text-indigo-700'
                : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              {metaCounts.totalCount}
            </span>
          </button>

          {/* New Application tab */}
          <button
            onClick={() => {
              setActiveTab('new')
              setCurrentPage(1)
            }}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 shadow-sm border cursor-pointer ${
              activeTab === 'new'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            New Application
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === 'new'
                ? 'bg-white/90 text-indigo-700'
                : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              {metaCounts.newCount}
            </span>
          </button>
        </div>



        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <SearchableDropdown
                label="Status"
                placeholder="All Statuses"
                searchPlaceholder="Search Status..."
                options={[
                  'Applied',
                  'Pending',
                  'Paid',
                  'Unpaid',
                  'Active',
                  'Inactive',
                  'Completed'
                ]}
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
              />
              <SearchableDropdown
                label="State"
                placeholder="All States"
                searchPlaceholder="Search State..."
                options={allStatesList}
                value={filterState}
                onChange={(val) => {
                  setFilterState(val)
                  setFilterDistrict('')
                }}
              />
              <SearchableDropdown
                label="District"
                placeholder="All Districts"
                searchPlaceholder="Search District..."
                options={getDistrictsForState(filterState)}
                value={filterDistrict}
                onChange={(val) => setFilterDistrict(val)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative">
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">S.No.</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap">Action</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">Added By</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Enquiry Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Selected Plan</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">Application No.</th>
                  <th className="px-4 py-3.5 min-w-[160px]">School Name</th>
                  <th className="px-4 py-3.5 min-w-[120px]">Contact Person</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">State</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">City / District</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading applications...
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    const { date, time } = formatDate(app.created_at)
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3.5 text-center font-medium text-slate-400 dark:text-slate-500 text-xs">{sNo}.</td>

                        {/* Action Column at Start */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => goToDetailsPage(app)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openUpdateStatusModal(app)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                              title="Update Status"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(app.id)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Added By Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {app.created_by_name ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {app.created_by_name}
                              </span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                ({app.created_by_role || 'Staff'})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">—</span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.status === 'Applied' ? 'bg-blue-500' :
                              app.status === 'Generate' ? 'bg-amber-500' :
                              app.status === 'Requested' ? 'bg-pink-500' :
                              'bg-emerald-500'
                            }`} />
                            {app.status}
                          </span>
                        </td>

                        {/* Enquiry Status Column (Beside Status) */}
                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                          {app.enquiry_status || '—'}
                        </td>

                        {/* Selected Plan Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {app.plan_name ? (
                            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800/60">
                              {app.plan_name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        {/* Amount Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                          {app.amount ? `₹${Number(app.amount).toLocaleString('en-IN')}` : '—'}
                        </td>

                        {/* Remaining Columns */}
                        <td className="px-4 py-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400 text-xs whitespace-nowrap">{app.application_no}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-100 min-w-[160px]">{app.school_name}</td>
                        <td className="px-4 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[120px]">{app.contact_person}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{app.state}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{app.district}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {date} <span className="text-slate-400 dark:text-slate-500 text-[11px] font-normal">{time}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalEntries > 0 && (
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} Entries
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;&lt;
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pgNum = idx + 1
                  const isCurrent = pgNum === currentPage
                  return (
                    <button
                      key={pgNum}
                      onClick={() => setCurrentPage(pgNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCurrent 
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25' 
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pgNum}
                    </button>
                  )
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create Application */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
              {selectedApp ? 'Edit Application' : 'New Application'}
            </h3>
            <form onSubmit={selectedApp ? handleEditApplication : handleCreateApplication} className="flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                {/* School Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter School Name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Code grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">School Code</label>
                    <input
                      type="text"
                      placeholder="Enter School Code"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Affiliated To</label>
                    <input
                      type="text"
                      placeholder="Enter Affiliated to"
                      value={affiliatedTo}
                      onChange={(e) => setAffiliatedTo(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Affiliation Code</label>
                    <input
                      type="text"
                      placeholder="Enter Affiliation Code"
                      value={affiliationCode}
                      onChange={(e) => setAffiliationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Contact grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Contact Person Name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Mobile No."
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email ID</label>
                    <input
                      type="email"
                      placeholder="Enter Email ID"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter School Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <SearchableDropdown
                    label="State *"
                    placeholder="Select State"
                    searchPlaceholder="Search State..."
                    options={allStatesList}
                    value={stateName}
                    onChange={(val) => handleStateChange(val)}
                  />
                  <SearchableDropdown
                    label="District *"
                    placeholder="Select District"
                    searchPlaceholder="Search District..."
                    options={getDistrictsForState(stateName)}
                    value={districtName}
                    onChange={(val) => setDistrictName(val)}
                    disabled={!stateName}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* Professional Signatures / Photo blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Principal Details Panel */}
                  <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Principal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Principal Name"
                          value={principalName}
                          onChange={(e) => setPrincipalName(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</span>
                        <div className="flex gap-4 mt-1">
                          {['Male', 'Female', 'Others'].map(g => (
                            <label key={g} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                              <input 
                                type="radio" 
                                name="principal_gender" 
                                value={g}
                                checked={principalGender === g}
                                onChange={() => setPrincipalGender(g as any)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              {g}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Principal Sign.</span>
                        <div className="h-16 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden shadow-inner group">
                          {principalSign ? (
                            <>
                              <img src={principalSign} alt="Principal Signature" className="h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setPrincipalSign('')}
                                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                                title="Remove Signature"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                          )}
                        </div>
                        <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                          Upload Signature
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleSignUpload(e, 'principal')}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Principal Photo Card */}
                    <div className="w-32 flex flex-col gap-2 shrink-0">
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
                        {principalPhoto ? (
                          <>
                            <img src={principalPhoto} alt="Principal" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPrincipalPhoto(null)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                              title="Remove Photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                              <Camera className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                        Upload Photo
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'principal')}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Director Details Panel */}
                  <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Director Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Director Name"
                          value={directorName}
                          onChange={(e) => setDirectorName(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</span>
                        <div className="flex gap-4 mt-1">
                          {['Male', 'Female', 'Others'].map(g => (
                            <label key={g} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                              <input 
                                type="radio" 
                                name="director_gender" 
                                value={g}
                                checked={directorGender === g}
                                onChange={() => setDirectorGender(g as any)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              {g}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Director Sign.</span>
                        <div className="h-16 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden shadow-inner group">
                          {directorSign ? (
                            <>
                              <img src={directorSign} alt="Director Signature" className="h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setDirectorSign('')}
                                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                                title="Remove Signature"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                          )}
                        </div>
                        <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                          Upload Signature
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleSignUpload(e, 'director')}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Director Photo Card */}
                    <div className="w-32 flex flex-col gap-2 shrink-0">
                      <div className="h-32 bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
                        {directorPhoto ? (
                          <>
                            <img src={directorPhoto} alt="Director" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setDirectorPhoto(null)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                              title="Remove Photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                              <Camera className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                        Upload Photo
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'director')}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={appStatus}
                      onChange={(e) => {
                        const val = e.target.value as Application['status']
                        setAppStatus(val)
                        if (val === 'Pending') {
                          setEnquiryStatus('Payment Pending')
                        }
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Enquiry Status Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enquiry Status</label>
                    <select
                      value={enquiryStatus}
                      onChange={(e) => setEnquiryStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="In Review">In Review</option>
                      <option value="Verification Completed">Verification Completed</option>
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Successfully Onboarded">Successfully Onboarded</option>
                    </select>
                  </div>
                </div>

                {(appStatus === 'Pending' || appStatus === 'Completed' || enquiryStatus === 'Successfully Onboarded') && (
                  <div className="flex flex-col gap-5 mt-4 animate-in fade-in duration-200 border-t border-slate-100 dark:border-slate-700 pt-5">
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Plan, Promo & Payment Method Setup
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Configure subscription details and select preferred billing payment method
                        </p>
                      </div>
                    </div>

                    {/* Plan & Promo Code Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Plan Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Plan <span className="text-red-500">*</span></span>
                          {plan && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Selected</span>}
                        </label>
                        <select
                          value={plan}
                          onChange={(e) => setPlan(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
                          required={appStatus === 'Pending' || appStatus === 'Completed' || enquiryStatus === 'Successfully Onboarded'}
                        >
                          <option value="">Select Plan</option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.plan_name} ({p.segment || 'General'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Promo Code Input & Pills */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Promo Code
                          </span>
                          {promoCode && (
                            <button type="button" onClick={() => setPromoCode('')} className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer">
                              Remove
                            </button>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={plan ? "Enter promo code..." : "Select plan first..."}
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            disabled={!plan}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                          />
                          {promoCode && (
                            <button
                              type="button"
                              onClick={() => {
                                const { discountAmount } = getCalculatedPrice(plan, promoCode)
                                if (discountAmount > 0) {
                                  toast.success(`Promo code ${promoCode} applied! Saved ₹${discountAmount.toLocaleString('en-IN')}`)
                                } else {
                                  toast.info(`Promo code applied: ${promoCode}`)
                                }
                              }}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                            >
                              Apply
                            </button>
                          )}
                        </div>

                        {/* Promo Code Quick Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(promoCodes.length > 0 ? promoCodes : [
                            { code: 'WELCOME10', discount_type: 'Percentage', discount_value: '10' },
                            { code: 'FESTIVE20', discount_type: 'Percentage', discount_value: '20' },
                            { code: 'FLAT500', discount_type: 'Fixed', discount_value: '500' },
                            { code: 'SPECIAL', discount_type: 'Fixed', discount_value: '1000' }
                          ]).map(pcItem => {
                            const codeStr = typeof pcItem === 'string' ? pcItem : pcItem.code
                            const isApplied = promoCode?.toUpperCase() === codeStr?.toUpperCase()
                            const discountTag = typeof pcItem === 'object' && pcItem.discount_value
                              ? (pcItem.discount_type === 'Percentage' ? `${pcItem.discount_value}% OFF` : `₹${pcItem.discount_value} OFF`)
                              : ''
                            return (
                              <button
                                key={codeStr}
                                type="button"
                                disabled={!plan}
                                onClick={() => {
                                  if (isApplied) setPromoCode('')
                                  else { 
                                    setPromoCode(codeStr)
                                    toast.success(`Promo code ${codeStr} applied!`) 
                                  }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isApplied
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                                }`}
                              >
                                <Percent className="w-3 h-3" />
                                {codeStr}
                                {discountTag && <span className={`text-[10px] ml-0.5 opacity-90 ${isApplied ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400 font-semibold'}`}>({discountTag})</span>}
                                {isApplied && <Check className="w-3 h-3 ml-0.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* If Plan is NOT selected, show clean prompt card and hide payment details */}
                    {!plan ? (
                      <div className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/40 border-2 border-dashed border-indigo-200/80 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2 py-8 my-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Plan Selected</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                          Please select a subscription plan above to view itemized pricing, choose payment methods, and see the billing breakdown.
                        </p>
                      </div>
                    ) : (
                      /* If Plan IS selected, show Plan Details Overview, Payment Method, Transactions, and Billing Summary */
                      <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                        
                        {/* 1. Plan Details Overview Card */}
                        {(() => {
                          const { basePrice, itemsSubtotal, taxTotal, selectedPlanObj } = getCalculatedPrice(plan, promoCode)
                          if (!selectedPlanObj) return null

                          return (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 shadow-xs flex flex-col gap-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/60 dark:border-slate-700/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                                    {selectedPlanObj.plan_name}
                                  </h5>
                                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold">
                                    {selectedPlanObj.segment || 'General'}
                                  </span>
                                </div>
                                {selectedPlanObj.first_billing_duration && (
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Billing Validity: <strong className="text-slate-700 dark:text-slate-200">{selectedPlanObj.first_billing_duration}</strong>
                                  </span>
                                )}
                              </div>

                              {/* Itemized Billing Breakdown Table if items exist */}
                              {selectedPlanObj.first_billing_items && selectedPlanObj.first_billing_items.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Plan Components & Taxes ({selectedPlanObj.first_billing_items.length} items):
                                  </span>
                                  <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                          <th className="px-3 py-2">Item Description</th>
                                          <th className="px-3 py-2 text-right">Base Price</th>
                                          <th className="px-3 py-2 text-right">Tax (%)</th>
                                          <th className="px-3 py-2 text-right">Tax (₹)</th>
                                          <th className="px-3 py-2 text-right">Total (₹)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                        {selectedPlanObj.first_billing_items.map((item: any, idx: number) => {
                                          const p = Number(item.price || 0)
                                          const tp = Number(item.tax_price || 0)
                                          const taxPct = Number(item.tax_percentage || 0)
                                          const calcTax = tp > 0 ? tp : (p * taxPct / 100)
                                          const rowTotal = p + calcTax

                                          return (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                              <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">
                                                {item.item_description || `Item #${idx + 1}`}
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                                                ₹{p.toLocaleString('en-IN')}
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">
                                                {taxPct}%
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">
                                                ₹{calcTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                              </td>
                                              <td className="px-3 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                                ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      <tfoot className="bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 text-xs font-bold">
                                        <tr>
                                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Plan Gross Total</td>
                                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">₹{itemsSubtotal.toLocaleString('en-IN')}</td>
                                          <td className="px-3 py-2"></td>
                                          <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                          <td className="px-3 py-2 text-right text-indigo-700 dark:text-indigo-300 font-extrabold">₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <span className="text-slate-500 dark:text-slate-400">Plan Gross Price:</span>
                                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">₹{basePrice.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          )
                        })()}

                        {/* 2. Payment Method Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            Payment Method <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {PAYMENT_METHOD_OPTIONS.map((pm) => {
                              const IconComp = pm.icon
                              const isSelected = paymentMode === pm.id
                              return (
                                <button
                                  key={pm.id}
                                  type="button"
                                  onClick={() => setPaymentMode(pm.id)}
                                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                                    isSelected
                                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                                      : 'bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-500'
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                      <Check className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                  <IconComp className={`w-5 h-5 mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                  <span className="text-xs font-bold leading-tight">{pm.label}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{pm.sub}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 3. Multiple Transactions Section */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                              Transactions & Payment Proofs ({transactions.length})
                            </label>
                            <button
                              type="button"
                              onClick={handleAddTransaction}
                              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Transaction
                            </button>
                          </div>

                          <div className="space-y-3">
                            {transactions.map((tx, idx) => (
                              <div 
                                key={tx.id || idx} 
                                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 relative flex flex-col gap-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                      {idx + 1}
                                    </span>
                                    Transaction #{idx + 1}
                                  </span>
                                  {transactions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTransaction(idx)}
                                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                      title="Remove Transaction"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                      Transaction ID / UTR No.
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. UTR12345678"
                                      value={tx.transactionId}
                                      onChange={(e) => handleTransactionChange(idx, 'transactionId', e.target.value)}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-mono"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                      Amount (₹) <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="Amount (₹)"
                                      value={tx.amount || ''}
                                      onChange={(e) => handleTransactionChange(idx, 'amount', e.target.value)}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                      <Paperclip className="w-3 h-3 text-indigo-500" />
                                      Payment Proof Screenshot
                                    </label>
                                    <div className="relative">
                                      <label className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all shadow-xs">
                                        <span className={`text-xs truncate max-w-[130px] ${tx.screenshotFilename ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                          {tx.screenshotFilename || 'Attach screenshot...'}
                                        </span>
                                        <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                                          Browse
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              const reader = new FileReader()
                                              reader.onloadend = () => {
                                                handleTransactionChange(idx, 'screenshotFilename', file.name)
                                                handleTransactionChange(idx, 'screenshotDataUrl', reader.result as string)
                                                toast.success(`Proof attached for Transaction #${idx + 1}`)
                                              }
                                              reader.readAsDataURL(file)
                                            }
                                          }}
                                        />
                                      </label>
                                      {tx.screenshotFilename && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleTransactionChange(idx, 'screenshotFilename', '')
                                            handleTransactionChange(idx, 'screenshotDataUrl', '')
                                          }}
                                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                                          title="Remove Screenshot"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. Summary & Net Payable Breakdown Card */}
                        {(() => {
                          const { basePrice, itemsSubtotal, taxTotal, discountAmount, finalNet } = getCalculatedPrice(plan, promoCode)

                          return (
                            <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 shadow-lg text-white border border-slate-800 flex flex-col gap-2.5">
                              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                                <span className="font-semibold flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Billing Breakdown Summary
                                </span>
                                <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {paymentMode}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1.5 text-xs font-semibold pt-1">
                                <div className="flex justify-between text-slate-300">
                                  <span>Plan Components Subtotal</span>
                                  <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                                </div>
                                {taxTotal > 0 && (
                                  <div className="flex justify-between text-slate-400">
                                    <span>Taxes & GST</span>
                                    <span>+ ₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800/80 pt-1">
                                  <span>Plan Gross Total</span>
                                  <span>₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {discountAmount > 0 && (
                                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/50">
                                    <span>Promo Discount ({promoCode})</span>
                                    <span>− ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-white font-black text-base border-t border-slate-800 pt-2.5 mt-1">
                                  <span>Total Payable (Net)</span>
                                  <span className="text-indigo-400 text-lg">
                                    ₹{finalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-4 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedApp ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal 3: Update Status */}
      {isUpdateStatusModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsUpdateStatusModalOpen(false)
                setSelectedApp(null)
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" />
              Update Status
            </h3>
            <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Changing status for application <strong className="text-slate-700 dark:text-slate-200">{selectedApp.application_no}</strong> ({selectedApp.school_name})
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={appStatus}
                    onChange={(e) => {
                      const val = e.target.value as Application['status']
                      setAppStatus(val)
                      if (val === 'Pending') {
                        setEnquiryStatus('Payment Pending')
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Enquiry Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Enquiry Status</label>
                  <select
                    value={enquiryStatus}
                    onChange={(e) => setEnquiryStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="In Review">In Review</option>
                    <option value="Verification Completed">Verification Completed</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Successfully Onboarded">Successfully Onboarded</option>
                  </select>
                </div>
              </div>

              {(appStatus === 'Pending' || appStatus === 'Completed' || enquiryStatus === 'Successfully Onboarded') && (
                <div className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Plan & Subscription Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Select Plan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required={appStatus === 'Pending' || appStatus === 'Completed' || enquiryStatus === 'Successfully Onboarded'}
                      >
                        <option value="">-- No Plan Selected --</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.plan_name} (₹{Number(p.gross_total_price || p.price || 0).toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Promo Code Input & Pills */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" /> Promo Code
                        </span>
                        {promoCode && (
                          <button type="button" onClick={() => setPromoCode('')} className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer">
                            Remove
                          </button>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={plan ? "Enter promo code..." : "Select plan first..."}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          disabled={!plan}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                        />
                        {promoCode && (
                          <button
                            type="button"
                            onClick={() => {
                              const { discountAmount } = getCalculatedPrice(plan, promoCode)
                              if (discountAmount > 0) {
                                toast.success(`Promo code ${promoCode} applied! Saved ₹${discountAmount.toLocaleString('en-IN')}`)
                              } else {
                                toast.info(`Promo code applied: ${promoCode}`)
                              }
                            }}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                          >
                            Apply
                          </button>
                        )}
                      </div>

                      {/* Promo Code Quick Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(promoCodes.length > 0 ? promoCodes : [
                          { code: 'WELCOME10', discount_type: 'Percentage', discount_value: '10' },
                          { code: 'FESTIVE20', discount_type: 'Percentage', discount_value: '20' },
                          { code: 'FLAT500', discount_type: 'Fixed', discount_value: '500' },
                          { code: 'SPECIAL', discount_type: 'Fixed', discount_value: '1000' }
                        ]).map(pcItem => {
                          const codeStr = typeof pcItem === 'string' ? pcItem : pcItem.code
                          const isApplied = promoCode?.toUpperCase() === codeStr?.toUpperCase()
                          const discountTag = typeof pcItem === 'object' && pcItem.discount_value
                            ? (pcItem.discount_type === 'Percentage' ? `${pcItem.discount_value}% OFF` : `₹${pcItem.discount_value} OFF`)
                            : ''
                          return (
                            <button
                              key={codeStr}
                              type="button"
                              disabled={!plan}
                              onClick={() => {
                                if (isApplied) setPromoCode('')
                                else { 
                                  setPromoCode(codeStr)
                                  toast.success(`Promo code ${codeStr} applied!`) 
                                }
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                isApplied
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                              }`}
                            >
                              <Percent className="w-3 h-3" />
                              {codeStr}
                              {discountTag && <span className={`text-[10px] ml-0.5 opacity-90 ${isApplied ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400 font-semibold'}`}>({discountTag})</span>}
                              {isApplied && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* If Plan is NOT selected, show clean prompt card and hide payment details */}
                  {!plan ? (
                    <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/40 border-2 border-dashed border-indigo-200/80 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2 py-6 my-1">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Plan Selected</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                        Select a plan above to view itemized pricing, choose payment methods, and see the billing breakdown.
                      </p>
                    </div>
                  ) : (
                    /* If Plan IS selected, show Plan Details Overview, Payment Method, Transactions, and Billing Summary */
                    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                      
                      {/* 1. Plan Details Overview Card */}
                      {(() => {
                        const { basePrice, itemsSubtotal, taxTotal, selectedPlanObj } = getCalculatedPrice(plan, promoCode)
                        if (!selectedPlanObj) return null

                        return (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 shadow-xs flex flex-col gap-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/60 dark:border-slate-700/60 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                                  {selectedPlanObj.plan_name}
                                </h5>
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold">
                                  {selectedPlanObj.segment || 'General'}
                                </span>
                              </div>
                              {selectedPlanObj.first_billing_duration && (
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                  Validity: <strong className="text-slate-700 dark:text-slate-200">{selectedPlanObj.first_billing_duration}</strong>
                                </span>
                              )}
                            </div>

                            {/* Itemized Billing Breakdown Table if items exist */}
                            {selectedPlanObj.first_billing_items && selectedPlanObj.first_billing_items.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                  Plan Components & Taxes:
                                </span>
                                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                      <tr>
                                        <th className="px-2.5 py-1.5">Item</th>
                                        <th className="px-2.5 py-1.5 text-right">Base</th>
                                        <th className="px-2.5 py-1.5 text-right">Tax</th>
                                        <th className="px-2.5 py-1.5 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                      {selectedPlanObj.first_billing_items.map((item: any, idx: number) => {
                                        const p = Number(item.price || 0)
                                        const tp = Number(item.tax_price || 0)
                                        const taxPct = Number(item.tax_percentage || 0)
                                        const calcTax = tp > 0 ? tp : (p * taxPct / 100)
                                        const rowTotal = p + calcTax

                                        return (
                                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                            <td className="px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200">
                                              {item.item_description || `Item #${idx + 1}`}
                                            </td>
                                            <td className="px-2.5 py-1.5 text-right text-slate-600 dark:text-slate-300">
                                              ₹{p.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-2.5 py-1.5 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                                              {taxPct}% (₹{calcTax.toLocaleString('en-IN')})
                                            </td>
                                            <td className="px-2.5 py-1.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                              ₹{rowTotal.toLocaleString('en-IN')}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot className="bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 text-xs font-bold">
                                      <tr>
                                        <td className="px-2.5 py-1.5 text-slate-700 dark:text-slate-300">Gross Total</td>
                                        <td className="px-2.5 py-1.5 text-right text-slate-700 dark:text-slate-300">₹{itemsSubtotal.toLocaleString('en-IN')}</td>
                                        <td className="px-2.5 py-1.5 text-right text-slate-500 dark:text-slate-400 text-[11px]">₹{taxTotal.toLocaleString('en-IN')}</td>
                                        <td className="px-2.5 py-1.5 text-right text-indigo-700 dark:text-indigo-300 font-extrabold">₹{basePrice.toLocaleString('en-IN')}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-500 dark:text-slate-400">Plan Gross Price:</span>
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">₹{basePrice.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* 2. Payment Method Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {PAYMENT_METHOD_OPTIONS.map((pm) => {
                            const IconComp = pm.icon
                            const isSelected = paymentMode === pm.id
                            return (
                              <button
                                key={pm.id}
                                type="button"
                                onClick={() => setPaymentMode(pm.id)}
                                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                                    : 'bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-500'
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                                <IconComp className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold leading-tight">{pm.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* 3. Multiple Transactions Section */}
                      <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                            Transactions & Payment Proofs ({transactions.length})
                          </label>
                          <button
                            type="button"
                            onClick={handleAddTransaction}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Transaction
                          </button>
                        </div>

                        <div className="space-y-3">
                          {transactions.map((tx, idx) => (
                            <div 
                              key={tx.id || idx} 
                              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 relative flex flex-col gap-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                    {idx + 1}
                                  </span>
                                  Transaction #{idx + 1}
                                </span>
                                {transactions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTransaction(idx)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Transaction"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    Transaction ID / UTR No.
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. UTR12345678"
                                    value={tx.transactionId}
                                    onChange={(e) => handleTransactionChange(idx, 'transactionId', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-mono"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    Amount (₹) <span className="text-slate-400 font-normal">(optional)</span>
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Amount (₹)"
                                    value={tx.amount || ''}
                                    onChange={(e) => handleTransactionChange(idx, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    <Paperclip className="w-3 h-3 text-indigo-500" />
                                    Payment Proof Screenshot
                                  </label>
                                  <div className="relative">
                                    <label className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all shadow-xs">
                                      <span className={`text-xs truncate max-w-[130px] ${tx.screenshotFilename ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                        {tx.screenshotFilename || 'Attach screenshot...'}
                                      </span>
                                      <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                                        Browse
                                      </span>
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                              handleTransactionChange(idx, 'screenshotFilename', file.name)
                                              handleTransactionChange(idx, 'screenshotDataUrl', reader.result as string)
                                              toast.success(`Proof attached for Transaction #${idx + 1}`)
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                        }}
                                      />
                                    </label>
                                    {tx.screenshotFilename && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleTransactionChange(idx, 'screenshotFilename', '')
                                          handleTransactionChange(idx, 'screenshotDataUrl', '')
                                        }}
                                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                                        title="Remove Screenshot"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Summary & Net Payable Breakdown Card */}
                      {(() => {
                        const { basePrice, itemsSubtotal, taxTotal, discountAmount, finalNet } = getCalculatedPrice(plan, promoCode)

                        return (
                          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 shadow-lg text-white border border-slate-800 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                              <span className="font-semibold flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Billing Breakdown Summary
                              </span>
                              <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {paymentMode}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs font-semibold pt-1">
                              <div className="flex justify-between text-slate-300">
                                <span>Plan Components Subtotal</span>
                                <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                              </div>
                              {taxTotal > 0 && (
                                <div className="flex justify-between text-slate-400">
                                  <span>Taxes & GST</span>
                                  <span>+ ₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800/80 pt-1">
                                <span>Plan Gross Total</span>
                                <span>₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/50">
                                  <span>Promo Discount ({promoCode})</span>
                                  <span>− ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-white font-black text-base border-t border-slate-800 pt-2.5 mt-1">
                                <span>Total Payable (Net)</span>
                                <span className="text-indigo-400 text-lg">
                                  ₹{finalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateStatusModalOpen(false)
                    setSelectedApp(null)
                  }}
                  className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal 4: View Application Details */}
      {isViewModalOpen && viewingApp && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsViewModalOpen(false)
                setViewingApp(null)
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
              Application Details - <span className="text-indigo-600 dark:text-indigo-400">{viewingApp.application_no}</span>
            </h3>

            <div className="flex flex-col gap-6 text-sm">
              {/* Section 1: Institution Info */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">School & Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">School Name</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.school_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">School Code</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.school_code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Affiliated To</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.affiliated_to || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Affiliation Code</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.affiliation_code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Contact Person</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.contact_person || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Mobile No.</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.mobile_no || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Email ID</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.email_id || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Address</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.address || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">State</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.state || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">District</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.district || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Pincode</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.pincode || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{viewingApp.status || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Principal & Director Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Principal Info */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">Principal Details</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Name</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.principal_name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Gender</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.principal_gender || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Signature</span>
                        <div className="h-16 mt-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          {viewingApp.principal_sign ? (
                            <img src={viewingApp.principal_sign} alt="Principal Signature" className="h-full object-contain" />
                          ) : (
                            <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-24 shrink-0 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase">Photo</span>
                      <div className="h-24 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {viewingApp.principal_photo ? (
                          <img src={viewingApp.principal_photo} alt="Principal" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Photo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Director Info */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">Director Details</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Name</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.director_name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Gender</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingApp.director_gender || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Signature</span>
                        <div className="h-16 mt-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          {viewingApp.director_sign ? (
                            <img src={viewingApp.director_sign} alt="Director Signature" className="h-full object-contain" />
                          ) : (
                            <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-24 shrink-0 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase">Photo</span>
                      <div className="h-24 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {viewingApp.director_photo ? (
                          <img src={viewingApp.director_photo} alt="Director" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Photo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-6">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setViewingApp(null)
                }}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
