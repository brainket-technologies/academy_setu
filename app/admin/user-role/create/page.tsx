'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  ArrowLeft, Printer, Camera, Paperclip, Clock, Calendar,
  Eye, EyeOff, Check, X, Loader2, Contact, Mail, Phone,
  Key, MapPin, User, Lock, Shield, Plus, FileText, Image
} from 'lucide-react'
import { toast } from 'sonner'

const PERMISSION_OPTIONS = [
  'Lead Permission',
  'Expense Permission',
  'Billing Permission',
  'Application Permission',
  'Promo Code Permission',
  'Conversation Permission',
  'Ticket Category Permission',
  'User Role Permission'
]

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Noida', 'Ghaziabad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Ambala']
}

function UserWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  const roleParam = searchParams.get('role')

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1)
  const [loadingUser, setLoadingUser] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Password toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    roleName: '',
    joining_date: '',
    permissions: ['Lead Permission', 'Expense Permission', 'Billing Permission'] as string[],
    id_no: '',
    gender: 'Male',
    avatar_url: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
    aadhar_no: '',
    aadhar_card_url: '',
    signature_url: '',
    login_time_type: 'Always',
    login_time: '10:00',
    logout_time: '18:00',
    login_expire_date: '',
    device_permission_count: '1'
  })

  // Load user data if editing
  useEffect(() => {
    if (userId) {
      setLoadingUser(true)
      fetch(`/api/admin/users?id=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const u = data.data
            // Format dates for inputs
            const formatInputDate = (dString: string) => {
              if (!dString) return ''
              return dString.split('T')[0]
            }
            setFormData({
              name: u.name || '',
              email: u.email || '',
              phone: u.phone || '',
              role: u.role || 'Admin',
              roleName: u.role === 'Custom' ? (u.role_name || '') : '',
              joining_date: formatInputDate(u.joining_date),
              permissions: u.permissions || [],
              id_no: u.id_no || '',
              gender: u.gender || 'Male',
              avatar_url: u.avatar_url || '',
              username: u.email || '', // default to email
              password: '', // blank by default in edit mode
              confirmPassword: '',
              address: u.address || '',
              state: u.state || '',
              district: u.district || '',
              pincode: u.pincode || '',
              aadhar_no: u.aadhar_no || '',
              aadhar_card_url: u.aadhar_card_url || '',
              signature_url: u.signature_url || '',
              login_time_type: u.login_time_type || 'Always',
              login_time: u.login_time || '10:00',
              logout_time: u.logout_time || '18:00',
              login_expire_date: formatInputDate(u.login_expire_date),
              device_permission_count: String(u.device_permission_count || '1')
            })
          } else {
            toast.error('Failed to load user details')
          }
        })
        .catch(() => toast.error('Error fetching user data'))
        .finally(() => setLoadingUser(false))
    } else if (roleParam) {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [userId, roleParam])

  // Permission selection
  const handleAddPermission = (perm: string) => {
    if (!formData.permissions.includes(perm)) {
      setFormData(prev => ({ ...prev, permissions: [...prev.permissions, perm] }))
    }
  }

  const handleRemovePermission = (perm: string) => {
    setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }))
  }

  // Mock document upload
  const handleMockUpload = (field: 'avatar_url' | 'aadhar_card_url' | 'signature_url') => {
    if (field === 'avatar_url') {
      const randomId = Math.floor(Math.random() * 70)
      setFormData(prev => ({ ...prev, avatar_url: `https://i.pravatar.cc/150?img=${randomId}` }))
      toast.success('Mock photo uploaded successfully!')
    } else if (field === 'aadhar_card_url') {
      setFormData(prev => ({ ...prev, aadhar_card_url: 'Aadhar_Card.jpg' }))
      toast.success('Mock Aadhar Card document uploaded!')
    } else if (field === 'signature_url') {
      setFormData(prev => ({ ...prev, signature_url: 'Signature.png' }))
      toast.success('Mock Signature image uploaded!')
    }
  }

  // Validation
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name) return 'Full Name is required'
      if (!formData.email) return 'Email Address is required'
      if (formData.role === 'Custom' && !formData.roleName) return 'User Role Name is required for custom roles'
      if (!userId && !formData.password) return 'Password is required'
      if (formData.password && formData.password !== formData.confirmPassword) return 'Passwords do not match'
      return null
    }
    if (step === 2) {
      if (!formData.address) return 'Address is required'
      if (!formData.state) return 'State is required'
      if (!formData.district) return 'District is required'
      if (!formData.pincode) return 'Pincode is required'
      if (!formData.aadhar_no) return 'Aadhar Card Number is required'
      return null
    }
    if (step === 3) {
      if (formData.login_time_type === 'Custom') {
        if (!formData.login_time || !formData.logout_time) return 'Login and Logout times are required for custom timing'
      }
      if (!formData.login_expire_date) return 'Login Expire Date is required'
      return null
    }
    return null
  }

  const handleNext = () => {
    const error = validateStep(activeStep)
    if (error) {
      toast.error(error)
      return
    }
    setActiveStep(prev => (prev + 1) as any)
  }

  const handleBack = () => {
    setActiveStep(prev => (prev - 1) as any)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users'
      const method = userId ? 'PUT' : 'POST'

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role === 'Custom' ? formData.roleName : formData.role,
        phone: formData.phone,
        id_no: formData.id_no || `AS${Math.floor(100 + Math.random() * 900)}`,
        avatar_url: formData.avatar_url || 'https://i.pravatar.cc/150?u=' + formData.email,
        is_active: true,
        joining_date: formData.joining_date,
        permissions: formData.permissions,
        gender: formData.gender,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        pincode: formData.pincode,
        aadhar_no: formData.aadhar_no,
        aadhar_card_url: formData.aadhar_card_url,
        signature_url: formData.signature_url,
        login_time_type: formData.login_time_type,
        login_time: formData.login_time_type === 'Custom' ? formData.login_time : null,
        logout_time: formData.login_time_type === 'Custom' ? formData.logout_time : null,
        login_expire_date: formData.login_expire_date,
        device_permission_count: parseInt(formData.device_permission_count)
      }

      if (formData.password) {
        Object.assign(payload, { password: formData.password })
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (result.success) {
        toast.success(userId ? 'User updated successfully!' : 'User created successfully!')
        router.push('/admin/user-role')
      } else {
        toast.error(result.error || 'Failed to save user')
      }
    } catch {
      toast.error('Connection error saving user')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loadingUser) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-teal-650" />
          <span className="text-sm font-semibold text-slate-500">Retrieving user profile...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto print:p-0">
        
        {/* Header Title Card */}
        {activeStep < 4 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {userId ? 'Edit User' : 'Create User'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Fill administrative credentials, permissions, and security log-in parameters.
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/user-role')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-655 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Final Preview</h1>
            </div>
            <button
              onClick={handlePrint}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-sm"
              title="Print Preview"
            >
              <Printer className="w-5 h-5" /> Print Info
            </button>
          </div>
        )}

        {/* Wizard Progressive Navigation Header - Match Screenshots 1, 2, 4 */}
        {activeStep < 4 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 shadow-sm">
            {/* Step name tabs */}
            <div className="grid grid-cols-3 gap-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden p-1 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                className={`py-3 rounded-lg font-bold text-xs transition-all ${
                  activeStep === 1
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                onClick={() => activeStep > 1 && setActiveStep(1)}
              >
                Personal Details
              </button>
              <button
                type="button"
                className={`py-3 rounded-lg font-bold text-xs transition-all ${
                  activeStep === 2
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                onClick={() => activeStep > 2 && setActiveStep(2)}
              >
                Address Details
              </button>
              <button
                type="button"
                className={`py-3 rounded-lg font-bold text-xs transition-all ${
                  activeStep === 3
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                onClick={() => activeStep > 3 && setActiveStep(3)}
              >
                Log in Criteria
              </button>
            </div>

            {/* Timeline progress connector line */}
            <div className="relative flex items-center justify-between px-16 mt-6 pb-2">
              <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10">
                <div 
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
                />
              </div>

              {/* Step 1 dot */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${
                  activeStep > 1 
                    ? 'bg-green-500' 
                    : 'bg-teal-600 ring-4 ring-teal-100 dark:ring-teal-900/50'
                }`}>
                  {activeStep > 1 ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>

              {/* Step 2 dot */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${
                  activeStep > 2 
                    ? 'bg-green-500' 
                    : activeStep === 2
                      ? 'bg-teal-600 ring-4 ring-teal-100 dark:ring-teal-900/50'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}>
                  {activeStep > 2 ? <Check className="w-3.5 h-3.5" /> : activeStep === 2 ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : null}
                </div>
              </div>

              {/* Step 3 dot */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${
                  activeStep === 3
                    ? 'bg-teal-600 ring-4 ring-teal-100 dark:ring-teal-900/50'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}>
                  {activeStep === 3 ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS CARD */}
        {activeStep === 1 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Joining Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Joining Details</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">User Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="BDM">BDM</option>
                    <option value="Support Team">Support Team</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {formData.role === 'Custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">User Role Name *</label>
                    <input
                      type="text"
                      placeholder="Enter User Role Name"
                      value={formData.roleName}
                      onChange={e => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Joining Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.joining_date}
                      onChange={e => setFormData(prev => ({ ...prev, joining_date: e.target.value }))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer"
                    />
                    <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Multi Select Permission Tag Pills - Matches mockup 1 */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Permissions (Select Multiple Permission)</label>
                <div className="border border-slate-200 dark:border-slate-750 rounded-xl p-3 bg-slate-50/30 dark:bg-slate-900/10 min-h-[44px] flex flex-wrap gap-2 items-center">
                  {formData.permissions.map(perm => (
                    <span 
                      key={perm}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-550/10 border border-teal-100 dark:border-teal-900/50 rounded-full text-xs font-bold text-teal-600 dark:text-teal-400 shadow-sm"
                    >
                      {perm}
                      <button 
                        type="button" 
                        onClick={() => handleRemovePermission(perm)}
                        className="text-teal-400 hover:text-teal-650 p-0.5 rounded-full hover:bg-teal-100/50 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.permissions.length === 0 && (
                    <span className="text-xs text-slate-400 font-semibold italic">No permissions assigned yet</span>
                  )}
                </div>

                {/* Available Select dropdown */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Add:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PERMISSION_OPTIONS.filter(o => !formData.permissions.includes(o)).map(o => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => handleAddPermission(o)}
                        className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-teal-50 hover:text-teal-650 hover:border-teal-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        + {o.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Personal Details</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Form fields */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">ID No. *</label>
                    <input
                      type="text"
                      placeholder="Enter ID No."
                      value={formData.id_no}
                      onChange={e => setFormData(prev => ({ ...prev, id_no: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Name *</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Mobile No. *</label>
                    <div className="flex border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 bg-white dark:bg-slate-800 transition-all">
                      <select className="px-3 border-r border-slate-100 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-semibold focus:outline-none cursor-pointer">
                        <option>+91</option>
                        <option>+1</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Enter Mobile No."
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 px-3 py-2.5 bg-transparent text-slate-750 dark:text-slate-200 text-sm focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Email Id</label>
                    <input
                      type="email"
                      placeholder="Enter Email ID"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-3">Gender *</label>
                    <div className="flex gap-6 items-center">
                      {(['Male', 'Female', 'Others'] as const).map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.gender === g}
                            onChange={() => setFormData(prev => ({ ...prev, gender: g }))}
                            className="w-4 h-4 text-teal-600 border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 focus:ring-teal-500 cursor-pointer"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Photo Upload block */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-750 rounded-2xl bg-slate-50/20 dark:bg-slate-800/10 gap-4">
                  <div className="w-28 h-28 rounded-full border-2 border-slate-200/50 bg-slate-100/50 dark:bg-slate-850 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-teal-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMockUpload('avatar_url')}
                    className="px-4 py-2 border border-teal-500 dark:border-teal-700 hover:bg-teal-500 hover:text-white rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 transition-all cursor-pointer shadow-sm shadow-teal-500/5 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Login/Account Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Login/Account Details</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">User Name *</label>
                  <input
                    type="text"
                    placeholder="Enter User Name"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                    Password {userId ? '(Leave blank to keep same)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/user-role')}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 transition-all cursor-pointer"
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS DETAILS CARD */}
        {activeStep === 2 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Address Form Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Address Details</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Address *</label>
                  <textarea
                    rows={3}
                    placeholder="Enter Address"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">State *</label>
                    <select
                      value={formData.state}
                      onChange={e => setFormData(prev => ({ ...prev, state: e.target.value, district: '' }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="">Select State</option>
                      {Object.keys(STATES_AND_DISTRICTS).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">District *</label>
                    <select
                      value={formData.district}
                      disabled={!formData.state}
                      onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {formData.state && STATES_AND_DISTRICTS[formData.state]?.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter Pincode"
                      value={formData.pincode}
                      onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aadhar & Signature Section - Matches mockup 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Aadhar & Signature</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Aadhar No. *</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Enter Aadhar No."
                    value={formData.aadhar_no}
                    onChange={e => setFormData(prev => ({ ...prev, aadhar_no: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                  />
                </div>

                {/* Attach Aadhar file input card styling */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Attach Aadhar</label>
                  <div 
                    onClick={() => handleMockUpload('aadhar_card_url')}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm hover:border-teal-500/60 transition-all cursor-pointer"
                  >
                    <span className={`truncate font-semibold ${formData.aadhar_card_url ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                      {formData.aadhar_card_url || 'Upload Aadhar Photo'}
                    </span>
                    <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Attach Signature file input card styling */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">Attach Signature</label>
                  <div 
                    onClick={() => handleMockUpload('signature_url')}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm hover:border-teal-500/60 transition-all cursor-pointer"
                  >
                    <span className={`truncate font-semibold ${formData.signature_url ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                      {formData.signature_url || 'Upload Signature Photo'}
                    </span>
                    <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/user-role')}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-750 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 transition-all cursor-pointer"
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOGIN CRITERIA CARD */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Login Criteria</h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-3">Log in Time Type</label>
                  <div className="flex gap-6 items-center">
                    {(['Always', 'Custom'] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="login_time_type"
                          value={t}
                          checked={formData.login_time_type === t}
                          onChange={() => setFormData(prev => ({ ...prev, login_time_type: t }))}
                          className="w-4 h-4 text-teal-600 border-slate-300 dark:border-slate-655 bg-white dark:bg-slate-800 focus:ring-teal-500 cursor-pointer"
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                {formData.login_time_type === 'Custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 font-medium">Log in Time *</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.login_time}
                          onChange={e => setFormData(prev => ({ ...prev, login_time: e.target.value }))}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer font-semibold"
                        />
                        <Clock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 font-medium">Log Out Time *</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.logout_time}
                          onChange={e => setFormData(prev => ({ ...prev, logout_time: e.target.value }))}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer font-semibold"
                        />
                        <Clock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 font-medium">Log in Expire Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.login_expire_date}
                      onChange={e => setFormData(prev => ({ ...prev, login_expire_date: e.target.value }))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer font-semibold"
                    />
                    <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 font-medium">No. of Device Permission *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="Enter No. of Device"
                    value={formData.device_permission_count}
                    onChange={e => setFormData(prev => ({ ...prev, device_permission_count: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/user-role')}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-750 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 transition-all cursor-pointer"
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL PREVIEW DESIGN - Matches mockup 4 */}
        {activeStep === 4 && (
          <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-200 print:bg-white print:text-black">
            
            {/* Grid of Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Card 1: Basic Info - Left Side span 8 */}
              <div className="md:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-100">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Basic Info</h4>
                  <button 
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  {/* Photo with Camera badge */}
                  <div className="w-24 h-24 rounded-full border-2 border-slate-100 bg-slate-50 dark:bg-slate-850 flex items-center justify-center overflow-hidden relative flex-shrink-0 shadow-sm">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md print:hidden">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Profile Key info */}
                  <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">User Role Name</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{formData.role === 'Custom' ? formData.roleName : formData.role}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID No.</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{formData.id_no || '-'}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gender</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.gender}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Joining Date</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formData.joining_date ? new Date(formData.joining_date).toLocaleDateString('en-GB') : '-'}
                      </span>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-100/50 dark:border-slate-700/30 mt-2">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mobile No.</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{formData.phone || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email ID</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block max-w-[200px]" title={formData.email}>{formData.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Login & Account Details - Right Side span 4 */}
              <div className="md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col self-stretch">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-100">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Login & Account Details</h4>
                  <button 
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4 text-sm flex-1 justify-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">User Name</span>
                    <div className="px-3.5 py-2 border border-slate-100 dark:border-slate-750 bg-slate-50/30 dark:bg-slate-800/60 rounded-xl font-semibold text-slate-700 dark:text-slate-200">
                      {formData.username || formData.email}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Password</span>
                    <div className="px-3.5 py-2 border border-slate-100 dark:border-slate-755 bg-slate-50/30 dark:bg-slate-800/60 rounded-xl font-mono text-slate-750 dark:text-slate-200 flex items-center justify-between">
                      <span>{formData.password ? formData.password : '••••••••••••'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Aadhar Details - Left Side span 6 */}
              <div className="md:col-span-6 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col self-stretch">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-100">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Aadhar Details</h4>
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4 text-sm flex-1 justify-center">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-400 font-semibold">Aadhar Card No.</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formData.aadhar_no || '-'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 font-semibold">Aadhar Card</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-teal-500" /> {formData.aadhar_card_url || 'Not Attached'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Address Details - Right Side span 6 */}
              <div className="md:col-span-6 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col self-stretch">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-100">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Address Details</h4>
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-3 text-sm flex-1 justify-center">
                  <div className="flex justify-between items-start py-1 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-slate-400 font-semibold flex-shrink-0">Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[240px] truncate">{formData.address || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-slate-400 font-semibold">Pincode</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formData.pincode || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-slate-400 font-semibold">District</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formData.district || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold">State</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formData.state || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Log in Criteria - span 12 */}
              <div className="md:col-span-12 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-100">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Log in Criteria</h4>
                  <button 
                    onClick={() => setActiveStep(3)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Log in Time Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{formData.login_time_type}</span>
                  </div>

                  {formData.login_time_type === 'Custom' && (
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Log in Time</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                        {formData.login_time} - {formData.logout_time}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Log in Expire Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {formData.login_expire_date ? new Date(formData.login_expire_date).toLocaleDateString('en-GB') : '-'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">No. of Device Permission</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{formData.device_permission_count}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Final Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6 mt-4 print:hidden">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Print
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-10 py-2.5 bg-teal-600 hover:bg-teal-750 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Final Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

export default function UserWizardPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-teal-650" />
          <span className="text-sm font-semibold text-slate-500">Loading progressive wizard...</span>
        </div>
      </AdminLayout>
    }>
      <UserWizardContent />
    </Suspense>
  )
}
