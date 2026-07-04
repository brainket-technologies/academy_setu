'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getManagerProfileAction, updateManagerProfileAction } from '@/app/manager/login/actions'

export default function EditProfilePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Personal Details States
  const [idNo, setIdNo] = useState('AS511')
  const [name, setName] = useState('Rahul')
  const [mobileNo, setMobileNo] = useState('8299514783')
  const [countryCode, setCountryCode] = useState('+91')
  const [email, setEmail] = useState('rahul@academysetu.com')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getManagerProfileAction()
        if (data) {
          setIdNo(data.id_no || 'AS511')
          setName(data.name || 'Rahul')
          setMobileNo(data.phone || '8299514783')
          setEmail(data.email || 'rahul@academysetu.com')
          setGender((data.gender as any) || 'Male')
          setUsername(data.email || 'rahul@academysetu.com')
          if (data.avatar_url) {
            setProfilePhoto(data.avatar_url)
            localStorage.setItem('managerProfilePhoto', data.avatar_url)
            window.dispatchEvent(new Event('profileUpdated'))
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err)
      }
    }
    fetchData()
  }, [])

  // Login/Account Details States
  const [username, setUsername] = useState('rahul@academysetu.com')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string)
      toast.success('Photo uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const res = await updateManagerProfileAction({
        name,
        phone: mobileNo,
        gender,
        avatar_url: profilePhoto,
        password: password || undefined
      })

      if (res.success) {
        toast.success('Profile updated successfully!')
        if (profilePhoto) {
          localStorage.setItem('managerProfilePhoto', profilePhoto)
          window.dispatchEvent(new Event('profileUpdated'))
        }
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
        
        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Edit Profile</h1>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <form onSubmit={handleUpdate} className="flex flex-col gap-10">
            
            {/* Personal Details Section */}
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Personal Details</h2>
              
              <div className="flex flex-col-reverse md:flex-row gap-10">
                {/* Form Fields */}
                <div className="flex-1 flex flex-col gap-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ID No. <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={idNo}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none transition-all text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No. <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <select 
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-24 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input
                          type="text"
                          value={mobileNo}
                          onChange={(e) => setMobileNo(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Id</label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none transition-all text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender <span className="text-red-500">*</span></label>
                    <div className="flex gap-6 mt-1">
                      {['Male', 'Female', 'Others'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g as any)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <div className="w-full md:w-64 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile Default" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-6 py-2 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm">
                    <Camera className="w-4 h-4" />
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Login/Account Details Section */}
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Login/Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">User Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none transition-all text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Password (Leave blank to keep same)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save & Next
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
