'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Search, Plus, Loader2, Filter, ChevronDown, ChevronUp, Trash2, X, Eye, EyeOff, Camera } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ActivatePlanModal } from '@/components/ActivatePlanModal'

interface Institute {
  id: string
  name: string
  code: string
  contact_person: string
  mobile_no: string
  email_id: string
  state: string
  district: string
  status: string
  created_at: string
  assigned_user_name?: string | null
  segment_name?: string | null
  active_plan_name?: string | null
  plan_expiry_date?: string | null
}

export function InstitutePageContent() {
  const searchParams = useSearchParams()
  const segmentId = searchParams?.get('segment_id') || ''

  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [loading, setLoading] = useState(true)

  // Counts
  const [metaCounts, setMetaCounts] = useState({ totalCount: 0 })

  // Search & Filtering
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(!!segmentId)
  const [filterState, setFilterState] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterSegment, setFilterSegment] = useState(segmentId)
  const [filterPlan, setFilterPlan] = useState('')
  const [filterPlanStatus, setFilterPlanStatus] = useState('')
  const [segments, setSegments] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [statesData, setStatesData] = useState<any[]>([])
  const [districtsList, setDistrictsList] = useState<string[]>([])

  // Activate plan modal states
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [activateTargetId, setActivateTargetId] = useState('')
  const [activateTargetName, setActivateTargetName] = useState('')
  const [activateTargetCurrentPlan, setActivateTargetCurrentPlan] = useState<string | null>(null)

  // Form states
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
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [principalName, setPrincipalName] = useState('')
  const [principalGender, setPrincipalGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [principalSign, setPrincipalSign] = useState('')
  const [principalPhoto, setPrincipalPhoto] = useState<string | null>(null)

  const [directorName, setDirectorName] = useState('')
  const [directorGender, setDirectorGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [directorSign, setDirectorSign] = useState('')
  const [directorPhoto, setDirectorPhoto] = useState<string | null>(null)

  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchInstitutes = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchText) queryParams.append('search', searchText)
      if (filterState) queryParams.append('state', filterState)
      if (filterDistrict) queryParams.append('district', filterDistrict)
      if (filterSegment) queryParams.append('segment', filterSegment)
      if (filterPlan) queryParams.append('plan', filterPlan)
      if (filterPlanStatus) queryParams.append('plan_status', filterPlanStatus)

      const response = await fetch(`/api/admin/institute?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setInstitutes(resData.data)
        if (resData.meta) {
          setMetaCounts({ totalCount: resData.meta.totalCount })
        }
      } else {
        toast.error('Failed to load institutes')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading institutes')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [segRes, planRes, statesRes] = await Promise.all([
        fetch('/api/admin/segment'),
        fetch('/api/admin/plan'),
        fetch('/api/admin/settings/state-city')
      ])
      const segData = await segRes.json()
      const planData = await planRes.json()
      const statesValData = await statesRes.json()
      if (segData.success) setSegments(segData.data)
      if (planData.success) setPlans(planData.data)
      if (statesValData.success) setStatesData(statesValData.data)
    } catch (err) {
      console.error('Failed to load filter options', err)
    }
  }

  useEffect(() => {
    fetchInstitutes()
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    if (segmentId) {
      setFilterSegment(segmentId)
      setShowFilters(true)
    } else {
      setFilterSegment('')
    }
  }, [segmentId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchInstitutes()
    }, 500)
    return () => clearTimeout(timer)
  }, [filterState, filterDistrict, filterSegment, filterPlan, filterPlanStatus, searchText])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInstitutes()
  }

  const handleResetFilters = () => {
    setFilterState('')
    setFilterDistrict('')
    setFilterSegment('')
    setFilterPlan('')
    setFilterPlanStatus('')
    setSearchText('')
    setCurrentPage(1)
  }

  const handleDeleteInstitute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this institute?')) return

    try {
      const res = await fetch(`/api/admin/institute/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Institute deleted successfully')
        fetchInstitutes()
      } else {
        toast.error(data.error || 'Failed to delete institute')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete institute')
    }
  }

  const handleStateChange = (stateVal: string) => {
    setStateName(stateVal)
    const stateObj = statesData.find((s: any) => s.state_name === stateVal)
    if (stateObj) {
      setDistrictsList(stateObj.districts || [])
      setDistrictName('')
    } else {
      setDistrictsList([])
      setDistrictName('')
    }
  }

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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedInstId(null)
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
    setPassword('')
    setShowPassword(false)
    setPrincipalName('')
    setPrincipalGender('Male')
    setPrincipalSign('')
    setPrincipalPhoto(null)
    setDirectorName('')
    setDirectorGender('Male')
    setDirectorSign('')
    setDirectorPhoto(null)
    setStatus('Active')
  }

  const openEditModal = async (instId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/institute/${instId}`)
      const data = await res.json()
      if (data.success && data.data) {
        const inst = data.data
        setSelectedInstId(instId)
        setSchoolName(inst.school_name || '')
        setSchoolCode(inst.school_code || '')
        setAffiliatedTo(inst.affiliated_to || '')
        setAffiliationCode(inst.affiliation_code || '')
        setContactPerson(inst.contact_person || '')
        setMobileNo(inst.mobile_no || '')
        setEmailId(inst.email_id || '')
        setAddress(inst.address || '')
        setStateName(inst.state || '')
        setDistrictName(inst.district || '')
        
        // Find districts
        const stateObj = statesData.find((s: any) => s.state_name === inst.state)
        if (stateObj) {
          setDistrictsList(stateObj.districts || [])
        } else {
          setDistrictsList([])
        }

        setPincode(inst.pincode || '')
        setPassword(inst.plain_password || '')
        
        setPrincipalName(inst.principal_name || '')
        setPrincipalGender(inst.principal_gender || 'Male')
        setPrincipalSign(inst.principal_sign || '')
        setPrincipalPhoto(inst.principal_photo || null)

        setDirectorName(inst.director_name || '')
        setDirectorGender(inst.director_gender || 'Male')
        setDirectorSign(inst.director_sign || '')
        setDirectorPhoto(inst.director_photo || null)

        setStatus(inst.status || 'Active')
        setIsEditModalOpen(true)
      } else {
        toast.error('Failed to load institute details')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong loading details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInstituteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName.trim()) { toast.error('Institute Name is required.'); return; }
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
      const response = await fetch(`/api/admin/institute/${selectedInstId}`, {
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
          password: password.trim(),
          status
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Institute updated successfully')
        handleCloseEditModal()
        fetchInstitutes()
      } else {
        toast.error(resData.error || 'Failed to update institute')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Something went wrong updating institute')
    } finally {
      setSubmitting(false)
    }
  }

  // Pagination calculation
  const totalEntries = metaCounts.totalCount
  const totalPages = Math.ceil(totalEntries / pageSize) || 1
  const paginatedInstitutes = institutes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Title and Top Search/Create Row */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Institutes</h1>
          
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Contact, Email"
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
            <Link 
              href="/admin/institute/create"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer transition-colors shrink-0 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Institute
            </Link>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  placeholder="Enter State"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">District</label>
                <input
                  type="text"
                  placeholder="Enter District"
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All Segments</option>
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Plan</label>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All Plans</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.plan_name}>
                      {p.plan_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Plan Status</label>
                <select
                  value={filterPlanStatus}
                  onChange={(e) => setFilterPlanStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="active">✅ Active</option>
                  <option value="expiring_soon">⚠️ Expiring Soon (30 days)</option>
                  <option value="expired">❌ Expired</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Reset Filters
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
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Institute Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Code</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Contact Person</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Active Plan</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Expiry</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Email</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Location</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading institutes...
                      </div>
                    </td>
                  </tr>
                ) : paginatedInstitutes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No institutes found.
                    </td>
                  </tr>
                ) : (
                  paginatedInstitutes.map((inst, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-bold">{inst.name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inst.segment_name || '-'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inst.code || '-'}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{inst.contact_person}</td>
                        <td className="px-5 py-4">
                          {inst.active_plan_name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                              {inst.active_plan_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {(() => {
                            if (!inst.plan_expiry_date) return <span className="text-slate-400 text-xs italic">—</span>
                            const expiry = new Date(inst.plan_expiry_date)
                            const today = new Date()
                            today.setHours(0,0,0,0)
                            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            const label = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            if (diffDays < 0) {
                              return (
                                <span className="inline-flex flex-col gap-0.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">❌ Expired</span>
                                  <span className="text-[10px] text-slate-500">{label}</span>
                                </span>
                              )
                            } else if (diffDays <= 30) {
                              return (
                                <span className="inline-flex flex-col gap-0.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">⚠️ {diffDays}d left</span>
                                  <span className="text-[10px] text-slate-500">{label}</span>
                                </span>
                              )
                            } else {
                              return (
                                <span className="inline-flex flex-col gap-0.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Active</span>
                                  <span className="text-[10px] text-slate-500">{label}</span>
                                </span>
                              )
                            }
                          })()}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs">{inst.email_id || '-'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inst.district}, {inst.state}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          {formatDate(inst.created_at)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/institute/${inst.id}`}
                              className="text-slate-655 hover:text-slate-850 dark:text-slate-300 dark:hover:text-slate-100 transition-colors cursor-pointer text-xs font-bold px-3 py-1 bg-slate-50 dark:bg-slate-700/60 rounded-lg inline-block border border-slate-100 dark:border-slate-650"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => openEditModal(inst.id)}
                              className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer text-xs font-bold px-3 py-1 bg-emerald-50 rounded-lg inline-block"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteInstitute(inst.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete Institute"
                            >
                              <Trash2 className="w-4 h-4" />
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
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &lt;&lt;
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &lt;
                </button>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg">{currentPage}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &gt;
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Edit Institute */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseEditModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
              Edit Institute
            </h3>
            
            <form onSubmit={handleUpdateInstituteSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-5">
                
                {/* Status & Name Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Institute Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Institute Name"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Login Password</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Set or update password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Institute Code</label>
                    <input
                      type="text"
                      placeholder="Enter Code"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Affiliated Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Contact Person"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Mobile Number"
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

              </div>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-4 justify-end">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Activate Plan */}
      <ActivatePlanModal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false)
          setActivateTargetId('')
          setActivateTargetName('')
          setActivateTargetCurrentPlan(null)
        }}
        onSuccess={fetchInstitutes}
        institutionId={activateTargetId}
        institutionName={activateTargetName}
        currentActivePlan={activateTargetCurrentPlan}
      />
    </>
  )
}

export default function InstitutePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <InstitutePageContent />
    </Suspense>
  )
}

