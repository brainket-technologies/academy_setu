'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Eye, EyeOff, Loader2, Mail, Phone, Lock, 
  User, Shield, Calendar, MapPin, CheckCircle2, Award,
  Sparkles, Trash2, Key
} from 'lucide-react'
import { toast } from 'sonner'
import { getBdmProfileAction, updateBdmProfileAction } from '@/app/bdm/login/actions'

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Meerut', 'Gorakhpur', 'Bareilly'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Gurugram', 'Faridabad', 'Ambala', 'Panipat', 'Karnal', 'Rohtak'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem']
}

export default function BdmEditProfilePage() {
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
  const [gender, setGender] = useState<'Male' | 'Female' | 'Others'>('Female')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [joiningDate, setJoiningDate] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [role, setRole] = useState('BDM')

  // Address Details
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [pincode, setPincode] = useState('')
  const [aadharNo, setAadharNo] = useState('')

  // Login/Security Details
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBdmProfileAction()
        if (data) {
          setIdNo(data.id_no || '')
          setName(data.name || '')
          setMobileNo(data.phone || '')
          setEmail(data.email || '')
          setGender((data.gender as any) || 'Female')
          setRole(data.role || 'BDM')
          setAddress(data.address && data.address !== 'NA' ? data.address : '')
          setState(data.state || 'Uttar Pradesh')
          setDistrict(data.district || 'Lucknow')
          setPincode(data.pincode || '')
          setAadharNo(data.aadhar_no || '')
          setJoiningDate(data.joining_date || null)
          setPermissions(data.permissions || ['Lead Permission', 'Application Permission', 'Conversation Permission'])
          
          if (data.avatar_url) {
            setProfilePhoto(data.avatar_url)
            localStorage.setItem('bdmProfilePhoto', data.avatar_url)
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
      const res = await updateBdmProfileAction({
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
          localStorage.setItem('bdmProfilePhoto', profilePhoto)
        } else {
          localStorage.removeItem('bdmProfilePhoto')
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

  const districtOptions = STATES_AND_DISTRICTS[state] || []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
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
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-full border border-indigo-100 dark:border-indigo-800 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              BDM Role
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
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
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
                      placeholder="Enter full name"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                      required
                    />
                  </div>

                  {/* Mobile No */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No. <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-24 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (UAE)</option>
                      </select>
                      <input
                        type="text"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                        placeholder="Mobile number"
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Email ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender <span className="text-red-500">*</span></label>
                    <div className="flex gap-4 mt-0.5">
                      {(['Female', 'Male', 'Others'] as const).map(g => (
                        <label 
                          key={g} 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                            gender === g
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="gender" 
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Profile Photo Upload Panel */}
                <div className="w-full lg:w-64 flex flex-col items-center justify-center gap-3.5 bg-slate-50/70 dark:bg-slate-700/20 rounded-2xl p-6 border border-slate-150 dark:border-slate-700 shrink-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md bg-gradient-to-br from-indigo-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-slate-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 transition-transform hover:scale-105 cursor-pointer"
                      title="Upload Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden" 
                  />

                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Profile Photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 2MB)</span>
                  </div>

                  <div className="flex gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      Change
                    </button>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="py-1.5 px-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Address & Identity Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Address & Identification</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Address */}
                <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street, colony, locality"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                  <select
                    value={state}
                    onChange={(e) => {
                      const newState = e.target.value
                      setState(newState)
                      const firstDist = STATES_AND_DISTRICTS[newState]?.[0] || ''
                      setDistrict(firstDist)
                    }}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select State</option>
                    {Object.keys(STATES_AND_DISTRICTS).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                  {districtOptions.length > 0 ? (
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    >
                      <option value="">Select District</option>
                      {districtOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                  )}
                </div>

                {/* Pincode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit pincode"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>

                {/* Aadhar No */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Aadhar Card No.</label>
                  <input
                    type="text"
                    value={aadharNo}
                    onChange={(e) => setAadharNo(e.target.value)}
                    placeholder="12-digit Aadhar number"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>

              </div>
            </div>

            {/* 3. Login & Security Details Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Login & Security Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">User Name / Login Email</label>
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                
                {/* New Password */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">New Password <span className="text-slate-400 font-normal">(Leave blank to keep same)</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Assigned Permissions & Role Info */}
            {permissions.length > 0 && (
              <div className="bg-slate-50/60 dark:bg-slate-700/20 rounded-xl p-5 border border-slate-150 dark:border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Assigned Portal Permissions
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">Configured by Admin</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {permissions.map(perm => (
                    <span
                      key={perm}
                      className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
