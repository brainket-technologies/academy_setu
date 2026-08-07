'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Eye, Edit3, RefreshCw, X, MoreVertical, Loader2, Filter, ChevronDown, ChevronUp, UserCheck, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Application {
  id: string
  application_no: string
  school_name: string
  contact_person: string
  state: string
  district: string
  status: 'Applied' | 'Pending' | 'Paid' | 'Unpaid' | 'Active' | 'Inactive' | 'Generate' | 'Requested' | 'Completed'
  enquiry_status?: string | null
  plan_id?: string | null
  promo_code?: string | null
  created_at: string
  assigned_to?: string | null
  assigned_user_name?: string | null
  assigned_user_role?: string | null
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
  const [filterAssignedTo, setFilterAssignedTo] = useState('')

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingApp, setViewingApp] = useState<any | null>(null)

  // Selected Record
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  // Assignment states
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignableUsers, setAssignableUsers] = useState<any[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [filterAssignRole, setFilterAssignRole] = useState<'All' | 'Manager' | 'BDM'>('All')

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
  const [plans, setPlans] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])

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
      if (filterAssignedTo) {
        queryParams.append('assigned_to', filterAssignedTo)
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

  const fetchAssignableUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/assignable')
      const data = await res.json()
      if (data.success) {
        setAssignableUsers(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch assignable users', err)
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
    fetchAssignableUsers()
    fetchPlansAndPromoCodes()
  }, [activeTab])

  // Auto-apply filters when they change (with a small debounce for text inputs)
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
    setFilterState('')
    setFilterDistrict('')
    setFilterFromDate('')
    setFilterToDate('')
    setFilterAssignedTo('')
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
          promo_code: promoCode
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application created successfully')
        setIsCreateModalOpen(false)
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
        setPlan(app.plan_id || '')
        setPromoCode(app.promo_code || '')
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
          promo_code: promoCode
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

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: appStatus,
          enquiry_status: enquiryStatus,
          plan_id: appStatus === 'Pending' ? (plan || null) : null,
          promo_code: appStatus === 'Pending' ? promoCode : ''
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
    router.push(`/admin/application/${app.id}`)
  }

  const openUpdateStatusModal = (app: Application) => {
    setSelectedApp(app)
    setAppStatus(app.status)
    setEnquiryStatus(app.enquiry_status || 'Applied')
    setPlan(app.plan_id || '')
    setPromoCode(app.promo_code || '')
    setIsUpdateStatusModalOpen(true)
    setActiveMenuId(null)
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedApps(paginatedApps.map(app => app.id))
    } else {
      setSelectedApps([])
    }
  }

  const handleSelectRow = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    )
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
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
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

        {/* Selected Actions Bar */}
        {selectedApps.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in duration-200">
            <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
              {selectedApps.length} Application{selectedApps.length > 1 ? 's' : ''} Selected
            </span>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Assign Applications
            </button>
          </div>
        )}

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="">All</option>
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Generate">Generate</option>
                  <option value="Requested">Requested</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Assigned To</label>
                <select
                  value={filterAssignedTo}
                  onChange={(e) => setFilterAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="">All Users</option>
                  <option value="unassigned">Unassigned</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  placeholder="Enter State"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">District</label>
                <input
                  type="text"
                  placeholder="Enter District"
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
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
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={paginatedApps.length > 0 && selectedApps.length === paginatedApps.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Application No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Contact Person</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">State</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">City / District</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Assigned To</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading applications...
                      </div>
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    const { date, time } = formatDate(app.created_at)
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4">
                          <input 
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedApps.includes(app.id)}
                            onChange={() => handleSelectRow(app.id)}
                          />
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-200 text-xs tracking-wider">{app.application_no}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-medium">{app.school_name}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{app.contact_person}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{app.state}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{app.district}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          📅 {date}<br/>🕒 {time}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.status === 'Applied' ? 'bg-blue-500' :
                              app.status === 'Generate' ? 'bg-amber-500' :
                              app.status === 'Requested' ? 'bg-pink-500' :
                              'bg-emerald-500'
                            }`} />
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={app.assigned_to || ''}
                            onChange={async (e) => {
                              const userId = e.target.value;
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
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm w-36 hover:bg-slate-100 dark:hover:bg-slate-600/50"
                          >
                            <option value="">Unassigned</option>
                            {assignableUsers.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openUpdateStatusModal(app)}
                              className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Update Status"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApps([app.id])
                                setIsAssignModalOpen(true)
                              }}
                              className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Assign Application"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(app.id)}
                              className="p-1.5 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4 text-emerald-650" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1.5 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <X className="w-4 h-4 text-red-500" />
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                      required
                    >
                      <option value="">Select State</option>
                      {statesData.map((s: any) => (
                        <option key={s.id} value={s.state_name}>
                          {s.state_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                      required
                      disabled={!stateName}
                    >
                      <option value="">Select District</option>
                      {districtsList.map((dist: string) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      <option value="Generate">Generate</option>
                      <option value="Requested">Requested</option>
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

                {appStatus === 'Pending' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-in fade-in duration-200">
                    {/* Plan Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Plan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                        required={appStatus === 'Pending'}
                      >
                        <option value="">Select Plan</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.plan_name} ({p.segment})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Promo Code Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Promo Code</label>
                      <div className="relative">
                        <select
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
                        >
                          <option value="">Select Promo Code</option>
                          {promoCodes.map((pc) => (
                            <option key={pc.id} value={pc.code}>
                              {pc.code} ({pc.discount_name})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-lg p-1 px-2 pointer-events-none">
                          <span className="text-xs font-bold leading-none">%</span>
                        </div>
                      </div>
                    </div>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
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
                    <option value="Generate">Generate</option>
                    <option value="Requested">Requested</option>
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

              {appStatus === 'Pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  {/* Plan Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                      required={appStatus === 'Pending'}
                    >
                      <option value="">Select Plan</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plan_name} ({p.segment})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Promo Code Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Promo Code</label>
                    <div className="relative">
                      <select
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
                      >
                        <option value="">Select Promo Code</option>
                        {promoCodes.map((pc) => (
                          <option key={pc.id} value={pc.code}>
                            {pc.code} ({pc.discount_name})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-lg p-1 px-2 pointer-events-none">
                        <span className="text-xs font-bold leading-none">%</span>
                      </div>
                    </div>
                  </div>
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

      {/* Assign Modal */}
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
                  Select User
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
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

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Application"
        description="Are you sure you want to delete this application? This action cannot be undone."
      />
    </>
  )
}
