'use client'

import React, { useState, useEffect } from 'react'
import { Download, Upload, Plus, Search, Eye, EyeOff, Pencil, Trash2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { INDIA_STATES_DISTRICTS } from '@/lib/india-data'

export interface ParentRecord {
  id: number
  username: string
  password?: string
  name: string
  firstName?: string
  lastName?: string
  contact: string
  email?: string
  gender?: string
  parentType?: string
  studentCount: number
  fees: string
  status: 'Active' | 'Inactive'
  avatar?: string
  address?: string
  stateName?: string
  district?: string
  pincode?: string
  qualification?: string
  college?: string
  employmentType?: string
  companyName?: string
  companyAddress?: string
  designation?: string
  annualIncome?: string
  aadharNo?: string
  joinDate?: string
  deleted?: boolean
  deletedAtDate?: string
  deletedAtTime?: string
}

const STEPS = ['Personal Details', 'Qualification Details', 'Employment Details', 'Address Details']

export default function AllParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Delete Confirmation modal state
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [parentToDelete, setParentToDelete] = useState<ParentRecord | null>(null)

  // Add/Edit Parent Modal state
  const [parentModalOpen, setParentModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editParentId, setEditParentId] = useState<number | null>(null)
  const [modalStep, setModalStep] = useState(0)
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // State & District from Main Admin Settings
  const [statesData, setStatesData] = useState<any[]>([])

  // Form Fields State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('Male')
  const [parentType, setParentType] = useState('Father')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')

  const [qualification, setQualification] = useState('')
  const [collegeName, setCollegeName] = useState('')

  const [employmentType, setEmploymentType] = useState('Government Job')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [designation, setDesignation] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')

  const [address, setAddress] = useState('')
  const [stateName, setStateName] = useState('Uttar Pradesh')
  const [district, setDistrict] = useState('Lucknow')
  const [pincode, setPincode] = useState('')
  const [aadharNo, setAadharNo] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  useEffect(() => {
    // Load states and districts from Admin Settings (/api/admin/settings/state-city)
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStatesData(data.data)
        } else {
          setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state_name: s.state, districts: s.districts })))
        }
      })
      .catch(err => {
        console.error('Failed to load states/cities', err)
        setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state_name: s.state, districts: s.districts })))
      })

    const saved = localStorage.getItem('school_institute_parents')
    if (saved) {
      try {
        setParents(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_institute_parents', JSON.stringify([]))
      setParents([])
    }
  }, [])

  // Computed state list from Admin Settings
  const stateOptions = React.useMemo(() => {
    const list: string[] = statesData.length > 0 
      ? statesData.map((s: any) => s.state_name || s.name).filter(Boolean)
      : INDIA_STATES_DISTRICTS.map(s => s.state)
    return Array.from(new Set(list)).map(String).sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData])

  // Computed district list for selected state
  const districtOptions = React.useMemo(() => {
    if (!stateName) {
      if (statesData.length > 0) {
        const all = new Set<string>()
        statesData.forEach((s: any) => (s.districts || []).forEach((d: string) => all.add(d)))
        return Array.from(all).sort((a, b) => a.localeCompare(b))
      }
      return []
    }
    const foundState = statesData.find((s: any) => (s.state_name || s.name)?.toLowerCase() === stateName.toLowerCase())
    if (foundState && foundState.districts) {
      const dists = foundState.districts.map((d: any) => typeof d === 'string' ? d : (d.district_name || d.name || String(d)))
      return Array.from(new Set(dists)).map(String).sort((a: string, b: string) => a.localeCompare(b))
    }
    const fallback = INDIA_STATES_DISTRICTS.find(s => s.state.toLowerCase() === stateName.toLowerCase())
    if (fallback) {
      return fallback.districts.slice().sort((a, b) => a.localeCompare(b))
    }
    return []
  }, [statesData, stateName])

  const resetForm = () => {
    setModalStep(0)
    setFormError('')
    setIsEditMode(false)
    setEditParentId(null)
    setShowPassword(false)
    setFirstName('')
    setLastName('')
    setMobileNo('')
    setEmail('')
    setGender('Male')
    setParentType('Father')
    setUserName('')
    setPassword('')
    setQualification('')
    setCollegeName('')
    setEmploymentType('Government Job')
    setCompanyName('')
    setCompanyAddress('')
    setDesignation('')
    setAnnualIncome('')
    setAddress('')
    setStateName('Uttar Pradesh')
    setDistrict('Lucknow')
    setPincode('')
    setAadharNo('')
    setStatus('Active')
  }

  const handleOpenAddModal = () => {
    resetForm()
    setParentModalOpen(true)
  }

  const handleOpenEditModal = (parent: ParentRecord) => {
    resetForm()
    setIsEditMode(true)
    setEditParentId(parent.id)

    const nameParts = parent.name ? parent.name.split(' ') : ['', '']
    setFirstName(parent.firstName || nameParts[0] || '')
    setLastName(parent.lastName || nameParts.slice(1).join(' ') || '')
    setMobileNo(parent.contact || '')
    setEmail(parent.email || '')
    setGender(parent.gender || 'Male')
    setParentType(parent.parentType || 'Father')
    setUserName(parent.username || '')
    setPassword(parent.password || '')

    setQualification(parent.qualification || '')
    setCollegeName(parent.college || '')

    setEmploymentType(parent.employmentType || 'Government Job')
    setCompanyName(parent.companyName || '')
    setCompanyAddress(parent.companyAddress || '')
    setDesignation(parent.designation || '')
    setAnnualIncome(parent.annualIncome || '')

    setAddress(parent.address || '')
    setStateName(parent.stateName || 'Uttar Pradesh')
    setDistrict(parent.district || 'Lucknow')
    setPincode(parent.pincode || '')
    setAadharNo(parent.aadharNo || '')
    setStatus(parent.status || 'Active')

    setParentModalOpen(true)
  }

  // Validate step required fields
  const validateStep = (stepIndex: number): boolean => {
    setFormError('')
    if (stepIndex === 0) {
      if (!firstName.trim()) {
        setFormError('Please enter First Name before proceeding.')
        return false
      }
      if (!mobileNo.trim()) {
        setFormError('Please enter Mobile Number before proceeding.')
        return false
      }
      if (!userName.trim()) {
        setFormError('Please enter User Name before proceeding.')
        return false
      }
      const isDuplicate = parents.some(
        p => !p.deleted && p.id !== editParentId && p.username.trim().toLowerCase() === userName.trim().toLowerCase()
      )
      if (isDuplicate) {
        setFormError(`Username "${userName.trim()}" already exists!`)
        return false
      }
    }
    return true
  }

  const handleStepTabClick = (targetStep: number) => {
    if (targetStep <= modalStep) {
      setModalStep(targetStep)
      setFormError('')
      return
    }

    for (let s = 0; s < targetStep; s++) {
      if (!validateStep(s)) {
        setModalStep(s)
        return
      }
    }

    setModalStep(targetStep)
  }

  const handleNextStep0 = () => {
    if (validateStep(0)) {
      setModalStep(1)
    }
  }

  const handleNextStep1 = () => {
    if (validateStep(1)) {
      setModalStep(2)
    }
  }

  const handleNextStep2 = () => {
    if (validateStep(2)) {
      setModalStep(3)
    }
  }

  const handleSaveParent = () => {
    setFormError('')
    for (let s = 0; s < 3; s++) {
      if (!validateStep(s)) {
        setModalStep(s)
        return
      }
    }

    if (!address.trim()) {
      setFormError('Please enter Address before submitting.')
      return
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const now = new Date()

    if (isEditMode && editParentId) {
      const updated = parents.map(p => {
        if (p.id === editParentId) {
          return {
            ...p,
            name: fullName,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            contact: mobileNo.trim(),
            email: email.trim(),
            gender,
            parentType,
            username: userName.trim(),
            password: password.trim(),
            qualification: qualification.trim(),
            college: collegeName.trim(),
            employmentType,
            companyName: companyName.trim(),
            companyAddress: companyAddress.trim(),
            designation: designation.trim(),
            annualIncome: annualIncome.trim(),
            address: address.trim(),
            stateName: stateName.trim(),
            district: district.trim(),
            pincode: pincode.trim(),
            aadharNo: aadharNo.trim(),
            status
          }
        }
        return p
      })
      setParents(updated)
      localStorage.setItem('school_institute_parents', JSON.stringify(updated))
      localStorage.setItem('school_parents', JSON.stringify(updated))
      toast.success('Parent details updated successfully!')
    } else {
      const newParent: ParentRecord = {
        id: Date.now(),
        username: userName.trim() || `Par${Math.floor(100 + Math.random() * 900)}`,
        password: password.trim(),
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contact: mobileNo.trim(),
        email: email.trim(),
        gender,
        parentType,
        studentCount: 0,
        fees: '0/-',
        status: status,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName || 'Parent')}`,
        address: address.trim(),
        stateName: stateName.trim(),
        district: district.trim(),
        pincode: pincode.trim(),
        qualification: qualification.trim(),
        college: collegeName.trim(),
        employmentType,
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim(),
        designation: designation.trim(),
        annualIncome: annualIncome.trim(),
        aadharNo: aadharNo.trim(),
        joinDate: now.toLocaleDateString('en-GB'),
        deleted: false
      }
      const updated = [newParent, ...parents]
      setParents(updated)
      localStorage.setItem('school_institute_parents', JSON.stringify(updated))
      localStorage.setItem('school_parents', JSON.stringify(updated))
      toast.success('Parent added successfully!')
    }

    setParentModalOpen(false)
    resetForm()
  }

  const handleOpenDeleteConfirm = (parent: ParentRecord) => {
    setParentToDelete(parent)
    setDeleteConfirmModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!parentToDelete) return
    const now = new Date()
    const updated = parents.map(p => {
      if (p.id === parentToDelete.id) {
        return {
          ...p,
          deleted: true,
          deletedAtDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          deletedAtTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return p
    })
    setParents(updated)
    localStorage.setItem('school_institute_parents', JSON.stringify(updated))
    setDeleteConfirmModalOpen(false)
    setParentToDelete(null)
    toast.info('Parent moved to deleted list!')
  }

  const totalParentsCount = parents.filter(p => !p.deleted).length
  const deletedParentsCount = parents.filter(p => p.deleted).length

  const filtered = parents.filter(p => {
    if (p.deleted) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.contact.includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Parents</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <button title="Export" className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Download className="w-4 h-4" />
            </button>
            <button title="Import" className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={handleOpenAddModal} title="Add Parent" className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/parents" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm">
            <Check className="w-4 h-4" /> Total Parents <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-xs">{String(totalParentsCount).padStart(2, '0')}</span>
          </Link>
          <Link href="/institute/parents/deleted" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
            Deleted Parents <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">{String(deletedParentsCount).padStart(2, '0')}</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">S. No.</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Parent Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Student</th>
                <th className="px-4 py-3">Fees</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((parent, i) => (
                <tr key={parent.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={parent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parent.name)}`} alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{parent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{parent.contact}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{parent.studentCount || 0}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.fees || '0/-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                      parent.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-500 bg-red-50 border border-red-100'
                    }`}>
                      ● {parent.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        href={`/institute/parents/${parent.id}`}
                        className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        type="button"
                        onClick={() => handleOpenEditModal(parent)}
                        className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100 transition-colors"
                        title="Edit Parent"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleOpenDeleteConfirm(parent)}
                        className="w-7 h-7 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Parent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No parents found for this institute. Click "+" to add a new parent.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
            <span>Showing 1-{filtered.length} of {filtered.length} Entries</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Parent Modal */}
      {parentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setParentModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-base font-black text-[#1b3a60] border-b pb-3 mb-6">
              {isEditMode ? 'Edit Parent Details' : 'Add New Parent'}
            </h2>

            {/* Stepper Tabs */}
            <div className="flex flex-wrap items-center border border-teal-600 rounded-xl overflow-hidden mb-6 shadow-sm">
              {STEPS.map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleStepTabClick(idx)}
                  className={`flex-1 py-2.5 px-2 text-center text-xs font-bold border-r border-teal-600 last:border-0 transition-colors ${
                    idx === modalStep ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>

            {formError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                <span>{formError}</span>
                <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 font-bold">✕</button>
              </div>
            )}

            {/* Step 0: Personal Details */}
            {modalStep === 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">First Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter First Name" value={firstName} onChange={e => { setFirstName(e.target.value); if (formError) setFormError('') }} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Last Name</label>
                    <input type="text" placeholder="Enter Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Mobile No. <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter Mobile No." value={mobileNo} onChange={e => { setMobileNo(e.target.value); if (formError) setFormError('') }} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Email Id</label>
                    <input type="email" placeholder="Enter Email Id" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Gender <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4 py-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} /> Male</label>
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} /> Female</label>
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="gender" checked={gender === 'Others'} onChange={() => setGender('Others')} /> Others</label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Parents Type <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4 py-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Mother'} onChange={() => setParentType('Mother')} /> Mother</label>
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Father'} onChange={() => setParentType('Father')} /> Father</label>
                      <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Guardian'} onChange={() => setParentType('Guardian')} /> Guardian</label>
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2 pt-2">Login & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">User Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter User Name" value={userName} onChange={e => { setUserName(e.target.value); if (formError) setFormError('') }} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Enter Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full px-4 py-2 pr-10 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500 bg-white">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setParentModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold">Cancel</button>
                  <button type="button" onClick={handleNextStep0} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 1: Qualification Details */}
            {modalStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">Qualification Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Qualification</label>
                    <input type="text" placeholder="e.g. Graduation / Post Graduation" value={qualification} onChange={e => setQualification(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">College / University Name</label>
                    <input type="text" placeholder="e.g. ABC College" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setModalStep(0)} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold">Back</button>
                  <button type="button" onClick={handleNextStep1} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 2: Employment Details */}
            {modalStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Employment Type</label>
                    <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500 bg-white">
                      <option value="Government Job">Government Job</option>
                      <option value="Private Job">Private Job</option>
                      <option value="Business">Business</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Company / Business Name</label>
                    <input type="text" placeholder="Enter Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Designation</label>
                    <input type="text" placeholder="Enter Designation" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Annual Income</label>
                    <input type="text" placeholder="e.g. 5,00,000" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setModalStep(1)} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold">Back</button>
                  <button type="button" onClick={handleNextStep2} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 3: Address Details & Aadhar */}
            {modalStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">Address & Aadhar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Address <span className="text-red-500">*</span></label>
                    <textarea rows={2} placeholder="Enter Full Address" value={address} onChange={e => { setAddress(e.target.value); if (formError) setFormError('') }} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500 resize-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">State <span className="text-red-500">*</span></label>
                    <select 
                      value={stateName} 
                      onChange={e => {
                        const selected = e.target.value
                        setStateName(selected)
                        const foundState = statesData.find((s: any) => (s.state_name || s.name)?.toLowerCase() === selected.toLowerCase())
                        if (foundState && foundState.districts && foundState.districts.length > 0) {
                          const firstDist = typeof foundState.districts[0] === 'string' ? foundState.districts[0] : (foundState.districts[0].district_name || foundState.districts[0].name)
                          setDistrict(firstDist || '')
                        } else {
                          const fallback = INDIA_STATES_DISTRICTS.find(s => s.state.toLowerCase() === selected.toLowerCase())
                          setDistrict(fallback?.districts?.[0] || '')
                        }
                      }} 
                      className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500 bg-white"
                    >
                      <option value="">Select State</option>
                      {stateOptions.map((st, idx) => (
                        <option key={idx} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">District <span className="text-red-500">*</span></label>
                    <select 
                      value={district} 
                      onChange={e => setDistrict(e.target.value)} 
                      className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500 bg-white"
                    >
                      <option value="">Select District</option>
                      {districtOptions.map((dist, idx) => (
                        <option key={idx} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Pincode</label>
                    <input type="text" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Aadhar Card No.</label>
                    <input type="text" placeholder="Enter Aadhar No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs focus:border-teal-500" />
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setModalStep(2)} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold">Back</button>
                  <button type="button" onClick={handleSaveParent} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
                    {isEditMode ? 'Save Changes' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && parentToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setDeleteConfirmModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-800">Confirm Deletion</h2>
              <p className="text-xs text-slate-500 max-w-xs font-semibold">
                Are you sure you want to delete parent <span className="font-bold text-slate-800">"{parentToDelete.name}"</span>? The record will be moved to the deleted list.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t mt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md"
              >
                Delete Parent
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
