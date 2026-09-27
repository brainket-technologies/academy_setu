'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, FileEdit, Camera, Bell, Pencil, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ParentRecord } from '../page'

const TABS = ['Fee Details', 'Qualification Details', 'Address Details', 'Login Details']

export default function ParentProfilePage() {
  const params = useParams()
  const [parent, setParent] = useState<ParentRecord | null>(null)
  const [activeTab, setActiveTab] = useState(TABS[0])

  useEffect(() => {
    const saved = localStorage.getItem('school_institute_parents')
    if (saved && params?.id) {
      try {
        const list: ParentRecord[] = JSON.parse(saved)
        const found = list.find(p => String(p.id) === String(params.id))
        if (found) {
          setParent(found)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [params?.id])

  if (!parent) {
    return (
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Parent Profile</h1>
          <Link href="/institute/parents" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200">
            <X className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 shadow-sm text-center font-bold text-slate-400 text-sm">
          Parent details not found or deleted.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Parent Profile</h1>
        <Link href="/institute/parents" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200">
          <X className="w-4 h-4" />
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8">
        
        {/* Left: Avatar & Basic Info */}
        <div className="flex flex-col items-center min-w-[200px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-6 md:pb-0 md:pr-8">
          <div className="relative mb-4">
            <img src={parent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parent.name)}`} alt={parent.name} className="w-32 h-32 rounded-xl object-cover border border-slate-200 bg-slate-50" />
            <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-600 text-white rounded flex items-center justify-center border-2 border-white shadow-sm hover:bg-teal-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-2">{parent.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-slate-500">User ID : {parent.username}</span>
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${parent.status === 'Active' ? 'bg-teal-600' : 'bg-slate-300'} cursor-pointer`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${parent.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* Right: Personal Information */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Personal Information</h3>
            <Link href="/institute/parents" className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <FileEdit className="w-3.5 h-3.5" /> Back to Parents
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Parent Type</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.parentType || 'Father'}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Mobile No.</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.contact}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Gender</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.gender || 'Male'}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Occupation</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.employmentType || 'Private Job'}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Address</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.address || 'N/A'}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Join Date</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {parent.joinDate || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-700 px-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-colors relative ${
              activeTab === tab 
                ? 'text-teal-600' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 min-h-[300px]">
        {activeTab === 'Fee Details' && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-center">S. No.</th>
                    <th className="px-4 py-3 text-center">Remark / Note</th>
                    <th className="px-4 py-3 text-center">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-center text-slate-500 font-medium">1.</td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-[11px] text-slate-600 max-w-[200px] mx-auto leading-relaxed">Parent registered.</p>
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-semibold text-slate-600">{parent.joinDate || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Qualification Details' && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm text-center">
                <thead className="bg-slate-50 text-xs font-black text-slate-600">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200">Qualification</th>
                    <th className="px-4 py-3 border-b border-slate-200">College / University Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-r border-slate-200">
                      <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">{parent.qualification || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">{parent.college || 'N/A'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Address Details' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 mb-6 pb-2 border-b border-slate-100">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className="text-[11px] font-bold text-slate-800">Address</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700 font-semibold">{parent.address || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 mb-6 pb-2 border-b border-slate-100">Aadhar & Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Aadhar No.</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700 font-semibold">{parent.aadharNo || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Login Details' && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-slate-800 mb-6 pb-2 border-b border-slate-100">Login/Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-800">User Name</label>
                <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700 font-semibold">{parent.username}</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
