'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Camera, Eye, EyeOff, Loader2, Mail, Phone, Lock, 
  User, Shield, Calendar, Award, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  phone: string
  avatar_url: string
  id_no: string
  joining_date: string | null
  gender: string
}

export default function EditProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submittingPassword, setSubmittingPassword] = useState(false)

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Fetch admin profile details
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile')
      const data = await res.json()
      if (data.success && data.data) {
        setProfile(data.data)
      } else {
        toast.error('Failed to load profile details')
      }
    } catch {
      toast.error('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Handle avatar upload via file selector
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    // Convert file to Base64
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      try {
        const res = await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: base64String })
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Profile picture updated successfully!')
          setProfile(prev => prev ? { ...prev, avatar_url: base64String } : null)
          // Optionally trigger global header image update
          window.location.reload()
        } else {
          toast.error(data.error || 'Failed to update profile picture')
        }
      } catch {
        toast.error('Error uploading image')
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Handle password update submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.error('Current password is required')
      return
    }
    if (!newPassword) {
      toast.error('New password is required')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSubmittingPassword(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Failed to update password')
      }
    } catch {
      toast.error('Connection error updating password')
    } finally {
      setSubmittingPassword(false)
    }
  }

  const handleCancelPassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  // Format joining date
  const formatJoiningDate = (dString: string | null) => {
    if (!dString) return '01/01/2026'
    try {
      const date = new Date(dString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return '01/01/2026'
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        
        {/* Header Title Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Profile</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your administrative personal account details and access credentials.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Password
          </button>
        </div>

        {/* Tab contents */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-16 flex flex-col items-center justify-center gap-2 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-teal-650" />
            <span className="text-sm text-slate-400 font-semibold">Loading profile information...</span>
          </div>
        ) : activeTab === 'profile' ? (
          /* Profile Details Tab Content */
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Personal Details</h3>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start mt-2">
              
              {/* Profile Image & Camera Button Overlay */}
              <div className="relative group shrink-0 self-center md:self-start">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*"
                  className="hidden" 
                />

                {/* Camera Overlay Button */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 transition-colors cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Personal Details Information Details Grid */}
              <div className="flex-1 w-full flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left items */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile?.name || 'Ashok Kumar'}</h2>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{profile?.role || 'Admin'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">{profile?.gender || 'Male'}</p>
                  </div>

                  {/* Right items */}
                  <div className="flex flex-col gap-1 text-left md:text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <p>ID No. <span className="text-slate-800 dark:text-slate-200 font-bold ml-1">{profile?.id_no || '42'}</span></p>
                    <p>Joining Date <span className="text-slate-800 dark:text-slate-200 font-bold ml-1">{formatJoiningDate(profile?.joining_date || null)}</span></p>
                  </div>
                </div>

                {/* Container displaying Mobile & Email */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Mobile No.</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">{profile?.phone || '9999999999'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Email ID</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">{profile?.email || 'abc@gmail.com'}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* Password Tab Content */
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Password Details</h3>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            </div>

            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-6 max-w-4xl mx-auto w-full mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Current Password Field */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Enter Current Password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="px-8 py-2.5 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
