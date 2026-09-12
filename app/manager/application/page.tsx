'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Eye, Edit3, RefreshCw, X, MoreVertical, Loader2, Filter, ChevronDown, ChevronUp, UserCheck, Camera, Percent, Check, CreditCard, Building, Smartphone, QrCode, Wallet, ShieldCheck, Tag, Paperclip, Download } from 'lucide-react'
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
}

export default function ManagerApplicationPage() {
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
  const [filterAssignedTo, setFilterAssignedTo] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  // Assignment states
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignableUsers, setAssignableUsers] = useState<any[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

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

  const fetchAssignableUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/assignable?portal=manager')
      const data = await res.json()
      if (data.success) {
        const usersOnlyAdminBdm = (data.data || []).filter(
          (u: any) => !u.role?.toLowerCase().includes('manager')
        )
        setAssignableUsers(usersOnlyAdminBdm)
      }
    } catch (err) {
      console.error('Failed to fetch assignable users', err)
    }
  }

  useEffect(() => {
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatesData(data.data)
        }
      })
      .catch(err => console.error('Failed to load states/cities', err))
    
    fetchAssignableUsers()
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
  const [paymentMode, setPaymentMode] = useState<string>('Payment Gateway')
  const [transactionId, setTransactionId] = useState<string>('')
  const [screenshotFilename, setScreenshotFilename] = useState<string>('')
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('')
  const [plans, setPlans] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])

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
      queryParams.append('portal', 'manager')
      if (searchText) {
        queryParams.append('search', searchText)
      }
      queryParams.append('tab', activeTab)
      if (filterStatus) {
        queryParams.append('status', filterStatus)
      }
      if (filterAssignedTo) {
        queryParams.append('assigned_to', filterAssignedTo)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchApplications()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, filterStatus, filterAssignedTo, filterState, filterDistrict, filterFromDate, filterToDate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchApplications()
  }

  const handleResetFilters = () => {
    setFilterStatus('')
    setFilterAssignedTo('')
    setFilterState('')
    setFilterDistrict('')
    setFilterFromDate('')
    setFilterToDate('')
    setCurrentPage(1)
    setTimeout(() => fetchApplications(), 0)
  }

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedApps.length === 0) {
      toast.error('No applications selected')
      return
    }
    
    setIsAssigning(true)
    try {
      const res = await fetch('/api/admin/application/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_ids: selectedApps,
          assigned_to: selectedAssignee || null // null to unassign
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setIsAssignModalOpen(false)
        setSelectedApps([])
        setSelectedAssignee('')
        fetchApplications()
      } else {
        toast.error(data.error || 'Failed to assign applications')
      }
    } catch (err) {
      console.error('Assign error:', err)
      toast.error('Error during assignment')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedApps(paginatedApps.map(a => a.id))
    } else {
      setSelectedApps([])
    }
  }

  const handleSelectApp = (id: string) => {
    setSelectedApps(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
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
      return { basePrice: 0, discountAmount: 0, finalNet: 0 }
    }

    const selectedPlanObj = plans.find(p => p.id === selectedPlanId || p.plan_name === selectedPlanId)
    if (!selectedPlanObj) {
      return { basePrice: 0, discountAmount: 0, finalNet: 0 }
    }

    const itemsSum = (selectedPlanObj.first_billing_items || []).reduce((sum: number, item: any) => {
      const itemTotal = Number(item.tax_price) > 0 
        ? Number(item.tax_price) 
        : (Number(item.price || 0) + (Number(item.price || 0) * Number(item.tax_percentage || 0) / 100))
      return sum + itemTotal
    }, 0)
    const basePrice = itemsSum > 0 ? itemsSum : Number((selectedPlanObj as any).price || 0)

    const promoObj = promoCodes.find(pc => pc.code === appliedPromoCode)
    let discountAmount = 0
    if (promoObj) {
      const val = Number(promoObj.discount_value || 0)
      if (promoObj.discount_type === 'Fixed' || promoObj.discount_type === 'Amount') {
        discountAmount = Math.min(val, basePrice)
      } else {
        discountAmount = (basePrice * val) / 100
      }
    } else if (appliedPromoCode) {
      discountAmount = 500
    }

    const finalNet = Math.max(0, basePrice - discountAmount)
    return { basePrice, discountAmount, finalNet }
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
          amount: appStatus === 'Pending' ? finalNet : null
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application created successfully')
        setIsCreateModalOpen(false)
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
          transaction_id: transactionId,
          screenshot_filename: screenshotFilename,
          screenshot_data_url: screenshotDataUrl,
          screenshots: screenshotFilename ? [{ filename: screenshotFilename, dataUrl: screenshotDataUrl, amount: finalNet }] : []
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
          transaction_id: transactionId,
          screenshot_filename: screenshotFilename,
          screenshot_data_url: screenshotDataUrl,
          screenshots: screenshotFilename ? [{ filename: screenshotFilename, dataUrl: screenshotDataUrl, amount: finalNet }] : []
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success(resData.message || 'Application status updated successfully')
        setIsUpdateStatusModalOpen(false)
        setSelectedApp(null)
        setTransactionId('')
        setScreenshotFilename('')
        setScreenshotDataUrl('')
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Something went wrong updating status')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Action
  const handleDeleteApplication = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/application/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const resData = await response.json()
      if (resData.success) {
        toast.success('Application deleted successfully')
        setDeleteTargetId(null)
        fetchApplications()
      } else {
        toast.error(resData.error || 'Failed to delete application')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong deleting application')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.error('No applications to export')
      return
    }
    const headers = ['Application No', 'School Name', 'Contact Person', 'State', 'District', 'Status', 'Plan', 'Payment Mode', 'Created At']
    const rows = applications.map(app => [
      `"${app.application_no || ''}"`,
      `"${app.school_name || ''}"`,
      `"${app.contact_person || ''}"`,
      `"${app.state || ''}"`,
      `"${app.district || ''}"`,
      `"${app.status || ''}"`,
      `"${app.plan_name || app.plan_id || ''}"`,
      `"${app.payment_mode || ''}"`,
      `"${app.created_at ? new Date(app.created_at).toLocaleDateString() : ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `manager_applications_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Applications exported to CSV')
  }

  // Filter & Pagination Logic
  const filteredApps = applications
  const totalRecords = filteredApps.length
  const totalPages = Math.ceil(totalRecords / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedApps = filteredApps.slice(startIndex, startIndex + pageSize)

  // Dynamic calculation for Modal price view
  const modalCalculations = getCalculatedPrice(plan, promoCode)

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-10">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Application Portal</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage school applications, plan enrollments & status verifications</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() => {
                if (selectedApps.length === 0) {
                  toast.error('Please select at least one application from the list to assign')
                  return
                }
                setIsAssignModalOpen(true)
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                selectedApps.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Assign Applications {selectedApps.length > 0 && `(${selectedApps.length})`}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Application
            </button>
          </div>
        </div>

        {/* Tab Selection & Search Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl w-fit">
              <button
                onClick={() => {
                  setActiveTab('all')
                  setCurrentPage(1)
                }}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Applications ({metaCounts.totalCount})
              </button>
              <button
                onClick={() => {
                  setActiveTab('new')
                  setCurrentPage(1)
                }}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'new'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                New Applications ({metaCounts.newCount})
              </button>
            </div>

            {/* Search & Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search application..."
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showFilters || filterStatus || filterAssignedTo || filterState || filterDistrict || filterFromDate || filterToDate
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => fetchApplications()}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

          </div>

          {/* Collapsible Filter Bar */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Assigned To</label>
                <select
                  value={filterAssignedTo}
                  onChange={(e) => setFilterAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Staff</option>
                  <option value="unassigned">Unassigned</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">State</label>
                <SearchableDropdown
                  options={allStatesList}
                  value={filterState}
                  onChange={(val) => {
                    setFilterState(val)
                    setFilterDistrict('')
                  }}
                  placeholder="All States"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">District</label>
                <SearchableDropdown
                  options={getDistrictsForState(filterState)}
                  value={filterDistrict}
                  onChange={(val) => setFilterDistrict(val)}
                  placeholder="All Districts"
                  disabled={!filterState}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">From Date</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">To Date</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {(filterStatus || filterAssignedTo || filterState || filterDistrict || filterFromDate || filterToDate) && (
                <div className="sm:col-span-2 md:col-span-6 flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Applications Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-4 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedApps.length > 0 && selectedApps.length === paginatedApps.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Action</th>
                  <th className="py-4 px-4">Application No</th>
                  <th className="py-4 px-4">School Name</th>
                  <th className="py-4 px-4 min-w-[150px]">Assigned To</th>
                  <th className="py-4 px-4">Contact Person</th>
                  <th className="py-4 px-4">State & District</th>
                  <th className="py-4 px-4">Plan & Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="font-semibold text-xs">Loading applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-slate-400">
                      <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No applications found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or create a new application.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app, idx) => {
                    const statusColorMap: Record<string, string> = {
                      Applied: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
                      Pending: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
                      Paid: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
                      Unpaid: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
                      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
                      Inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400',
                      Completed: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
                    }
                    const badgeClass = statusColorMap[app.status] || 'bg-slate-100 text-slate-600 border-slate-200'

                    return (
                      <tr 
                        key={app.id} 
                        className={`hover:bg-blue-50/30 dark:hover:bg-slate-700/20 transition-colors group ${
                          selectedApps.includes(app.id) ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedApps.includes(app.id)}
                            onChange={() => handleSelectApp(app.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-400">
                          {startIndex + idx + 1}
                        </td>
                        <td className="py-4 px-4 text-center relative whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedApps([app.id])
                                setSelectedAssignee(app.assigned_to || '')
                                setIsAssignModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                              title="Assign Application"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/manager/application/${app.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                              title="View & Edit Application"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApp(app)
                                setAppStatus(app.status)
                                setEnquiryStatus(app.enquiry_status || 'Applied')
                                const foundPlan = plans.find(p => p.id === app.plan_id || p.plan_name === app.plan_id)
                                setPlan(foundPlan ? foundPlan.id : (app.plan_id || ''))
                                setPromoCode(app.promo_code || '')
                                setPaymentMode(app.payment_mode || 'Payment Gateway')
                                setIsUpdateStatusModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
                              title="Update Status / Convert"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">
                          <Link href={`/manager/application/${app.id}`} className="hover:underline">
                            {app.application_no || `#${app.id.slice(0, 8)}`}
                          </Link>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">
                          {app.school_name}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={app.assigned_to || ''}
                            onChange={async (e) => {
                              const userId = e.target.value
                              try {
                                const res = await fetch('/api/admin/application/assign', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    application_ids: [app.id],
                                    assigned_to: userId || null
                                  })
                                })
                                const data = await res.json()
                                if (data.success) {
                                  toast.success('Successfully updated assignment')
                                  fetchApplications()
                                } else {
                                  toast.error(data.error || 'Failed to assign application')
                                }
                              } catch (err) {
                                console.error('Inline assign error:', err)
                                toast.error('Error during assignment')
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] cursor-pointer"
                          >
                            <option value="">Unassigned</option>
                            {assignableUsers.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          {app.contact_person}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {app.district ? `${app.district}, ` : ''}{app.state || 'N/A'}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {app.plan_name || app.plan_id ? (
                            <div>
                              <span>{app.plan_name || app.plan_id}</span>
                              {app.amount ? (
                                <p className="text-[11px] font-bold text-emerald-600">₹{Number(app.amount).toLocaleString('en-IN')}</p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No Plan</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badgeClass}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-[11px]">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{totalRecords > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(startIndex + pageSize, totalRecords)}</span> of{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{totalRecords}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => (
                  <React.Fragment key={pageNum}>
                    {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* UPDATE STATUS MODAL */}
      {isUpdateStatusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Update Application Status</h3>
                <p className="text-xs text-slate-400">{selectedApp.school_name} ({selectedApp.application_no || `#${selectedApp.id.slice(0, 8)}`})</p>
              </div>
              <button
                onClick={() => setIsUpdateStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Application Status <span className="text-red-500">*</span></label>
                <select
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Active">Active (Convert to Institute)</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
                {(appStatus === 'Active' || appStatus === 'Paid') && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                    Setting status to {appStatus} will automatically create or update an active Institute record with Auto-generated ID.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">No Plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.plan_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Promo Code</label>
                  <select
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">No Promo Code</option>
                    {promoCodes.map((pc) => (
                      <option key={pc.id} value={pc.code}>{pc.code} ({pc.discount_value}{pc.discount_type === 'Percentage' ? '%' : ' OFF'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {plan && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-slate-700/40 border border-blue-100 dark:border-slate-600 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Base Price</span>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">₹{modalCalculations.basePrice.toLocaleString('en-IN')}</p>
                  </div>
                  {modalCalculations.discountAmount > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Discount</span>
                      <p className="text-xs font-extrabold text-emerald-600">-₹{modalCalculations.discountAmount.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400">Payable Amount</span>
                    <p className="text-lg font-black text-blue-700 dark:text-blue-300">₹{modalCalculations.finalNet.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Payment Gateway">Payment Gateway</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI ID">UPI ID</option>
                  <option value="QR Code">QR Code</option>
                  <option value="Cash">Cash / Cheque</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN987654321"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Update Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                Assign Application{selectedApps.length > 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false)
                  setSelectedApps([])
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBulkAssign} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Select User (BDM / Manager)
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">-- Unassign / Select a User --</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are assigning {selectedApps.length} application(s).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false)
                    setSelectedApps([])
                  }}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
