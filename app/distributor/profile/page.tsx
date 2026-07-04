'use client'

import React, { useState, useEffect } from 'react'
import { DistributorLayout } from '@/components/layout/DistributorLayout'
import { toast } from 'sonner'
import { Eye, EyeOff, Camera } from 'lucide-react'

export default function DistributorProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/distributor/profile').then(r => r.json())
        if (res.success) {
          setProfile(res.data)
        }
      } catch (err) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/distributor/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      }).then(r => r.json())

      if (res.success) {
        toast.success(res.message || 'Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res.error || 'Failed to update password')
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <DistributorLayout>
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DistributorLayout>
    )
  }

  return (
    <DistributorLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Edit Profile</h2>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors border ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors border ${
              activeTab === 'password'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Password
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[400px]">
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800">Personal Details</h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile?.name || 'Distributor Name'}</h2>
                      <p className="text-slate-500 font-medium">Distributor</p>
                      <p className="text-sm text-slate-400 mt-1">{profile?.gender || 'Male'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">ID No. <span className="font-normal text-slate-500">{profile?.dist_id || '-'}</span></p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">Joining Date <span className="font-normal text-slate-500">{profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-GB') : '-'}</span></p>
                    </div>
                  </div>

                  <div className="bg-[#f4f7fb] rounded-xl p-6 flex flex-col sm:flex-row gap-12">
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">Mobile No.</p>
                      <p className="text-sm text-slate-600">{profile?.mobile_no || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">Email ID</p>
                      <p className="text-sm text-slate-600">{profile?.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-lg font-bold text-slate-800">Password Details</h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-8 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter Current Password"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter New Password"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-12">
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    className="px-10 py-2.5 rounded-lg font-semibold text-sm text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingPassword}
                    className="px-10 py-2.5 rounded-lg font-semibold text-sm text-white bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {savingPassword ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DistributorLayout>
  )
}
