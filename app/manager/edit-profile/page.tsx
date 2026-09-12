'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Eye, EyeOff, Loader2, Mail, Phone, Lock, 
  User, Shield, Calendar, MapPin, CheckCircle2, Award,
  Sparkles, Trash2, Key
} from 'lucide-react'
import { toast } from 'sonner'
import { getManagerProfileAction, updateManagerProfileAction } from '@/app/manager/login/actions'

export default function ManagerEditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Personal Details
  const [idNo, setIdNo] = useState('')
  const [name, setName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [joiningDate, setJoiningDate] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [role, setRole] = useState('Manager')

  // Address Details
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [pincode, setPincode] = useState('')
  const [aadharNo, setAadharNo] = useState('')

  // Dynamic States from Settings API
  const [statesData, setStatesData] = useState<any[]>([])

  // Login/Security Details
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getManagerProfileAction()
        if (data) {
          setIdNo(data.id_no || '')
          setName(data.name || '')
          setMobileNo(data.phone || '')
          setEmail(data.email || '')
          setGender((data.gender as any) || 'Male')
          setRole(data.role || 'Manager')
          setAddress(data.address && data.address !== 'NA' ? data.address : '')
          setState(data.state || '')
          setDistrict(data.district || '')
          setPincode(data.pincode || '')
          setAadharNo(data.aadhar_no || '')
          setJoiningDate(data.joining_date || null)
          setPermissions(data.permissions || ['Lead Permission', 'Application Permission', 'Conversation Permission'])
          
          if (data.avatar_url) {
            setProfilePhoto(data.avatar_url)
            localStorage.setItem('managerProfilePhoto', data.avatar_url)
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err)
        toast.error('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const allStatesList: string[] = React.useMemo(() => {
    return statesData
      .map((s: any) => s.state_name as string)
      .filter(Boolean)
      .sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData])

  const districtOptions: string[] = React.useMemo(() => {
    if (!state) return []
    const stateObj = statesData.find((s: any) => s.state_name?.toLowerCase() === state.toLowerCase())
    return ((stateObj?.districts || []) as string[]).slice().sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData, state])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setProfilePhoto(result)
      toast.success('Photo selected! Click "Save Changes" to apply.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(null)
    toast.info('Photo removed. Click "Save Changes" to apply.')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!mobileNo.trim()) {
      toast.error('Please enter your mobile number')
      return
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (password && password !== confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    setSubmitting(true)
    try {
      const res = await updateManagerProfileAction({
        name: name.trim(),
        phone: mobileNo.trim(),
        gender,
        avatar_url: profilePhoto || '',
        address: address.trim(),
        state,
        district,
        pincode: pincode.trim(),
        aadhar_no: aadharNo.trim(),
        password: password || undefined
      })

      if (res.success) {
        toast.success('Profile updated successfully!')
        setPassword('')
        setConfirmPassword('')
        if (profilePhoto) {
          localStorage.setItem('managerProfilePhoto', profilePhoto)
        } else {
          localStorage.removeItem('managerProfilePhoto')
        }
        window.dispatchEvent(new Event('profileUpdated'))
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('Something went wrong updating profile')
    } finally {
      setSubmitting(false)
    }
  }

  const formatJoiningDate = (dString: string | null) => {
    if (!dString) return 'Active Member'
    try {
      const date = new Date(dString)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dString
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm font-semibold text-slate-400">Loading profile...</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-12">
        
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Edit Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal information, address, and login credentials</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              Manager Role
            </span>
            {idNo && (
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-full border border-slate-200 dark:border-slate-600">
                ID: {idNo}
              </span>
            )}
          </div>
        </div>

        {/* Main Profile Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <form onSubmit={handleUpdate} className="flex flex-col gap-8">
            
            {/* 1. Personal Details Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Personal Details</h2>
              </div>
              
              <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
                
                {/* Form Fields */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* ID No. */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ID No. / Employee Code</label>
                    <input
                      type="text"
                      value={idNo}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Mobile No */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No. <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-200 dark:border-slate-600 rounded-l-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center">
                        +91
                      </span>
                      <input
                        type="text"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email ID (Disabled) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Official Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</label>
                    <div className="flex gap-4 pt-1.5">
                      {(['Male', 'Female', 'Others'] as const).map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Aadhar No */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Aadhar Number</label>
                    <input
                      type="text"
                      value={aadharNo}
                      onChange={(e) => setAadharNo(e.target.value)}
                      placeholder="12-digit UIDAI number"
                      maxLength={12}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                </div>

                {/* Profile Photo Uploader */}
                <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 w-full lg:w-64 shrink-0">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Profile Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{name ? name.substring(0, 2).toUpperCase() : 'MG'}</span>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-transform cursor-pointer hover:scale-110 active:scale-95"
                      title="Upload New Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Profile Picture</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* 2. Address & Location Details */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Address & Location</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Full Address */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Street / Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 124/B Sector 12, Indiranagar"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                  <select
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value)
                      setDistrict('')
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {allStatesList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District / City</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!state}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-700/40 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {districtOptions.map((dist: string) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Pincode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 226010"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

              </div>
            </div>

            {/* 3. Account Security / Password Change */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Login Security</h2>
                  <p className="text-xs text-slate-400">Leave blank if you do not wish to change your password</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Permissions & Meta Preview */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Assigned Portal Permissions</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Contact Administrator to request additional department permissions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {permissions.length > 0 ? (
                  permissions.map((p, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-600 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Standard Access</span>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => router.push('/manager/dashboard')}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </>
  )
}
