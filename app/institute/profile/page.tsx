'use client'

import React, { useState } from 'react'
import { CheckCircle2, Camera, Eye, EyeOff } from 'lucide-react'

export default function EditProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('New Password and Confirm Password do not match.')
      return
    }

    setToastMsg('Password updated successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Edit Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'profile' ? 'bg-teal-650 bg-teal-600 text-white font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'password' ? 'bg-teal-650 bg-teal-600 text-white font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
        >
          Password
        </button>
      </div>

      {/* Main Form Box */}
      <div className="bg-white border rounded-3xl p-8 shadow-sm text-xs font-semibold text-slate-700">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-800 border-b pb-2">Personal Details</h2>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Profile Pic Card */}
              <div className="relative w-32 h-32 border rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group flex-shrink-0">
                {/* Simulated Admin avatar */}
                <div className="w-full h-full bg-slate-350 bg-slate-200 flex flex-col items-center justify-center text-slate-500 font-bold text-lg">
                  Admin
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {/* Photo Indicator badge at bottom */}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white border border-white">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Name</div>
                  <div className="text-sm font-black text-slate-800 mt-1">Ashok Kumar</div>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Role</div>
                  <div className="text-sm font-black text-slate-800 mt-1">Admin</div>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">ID No.</div>
                  <div className="text-sm font-black text-slate-800 mt-1">112</div>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Joining Date</div>
                  <div className="text-sm font-black text-slate-800 mt-1">01/01/2025</div>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Mobile No.</div>
                  <div className="text-sm font-black text-slate-800 mt-1">9999999999</div>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Email ID</div>
                  <div className="text-sm font-black text-slate-800 mt-1">abc@gmail.com</div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <h2 className="text-xs font-black text-slate-800 border-b pb-2">Password Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Current password */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-500 font-bold">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter Current Password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-500 font-bold">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-500 font-bold">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="px-8 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Update
              </button>
            </div>

          </form>
        )}
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
