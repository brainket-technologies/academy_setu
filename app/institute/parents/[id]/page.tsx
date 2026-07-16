'use client'

import React, { useState } from 'react'
import { Edit, X, Calendar as CalendarIcon, FileEdit, Camera, Bell, Pencil, Trash2, Search, CheckCircle2, EyeOff, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const PARENT_DATA = {
  id: '1',
  name: 'Parent Name',
  userId: 'abcd123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir',
  parentType: 'Father',
  mobileNo: '9999999999',
  occupation: 'Private Job',
  address: '123, Street Name, Location, City name, State, Pincode',
  joinDate: '11/01/2025',
  isActive: true,
  fees: [
    { id: 1, remark: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', reminderDate: '20/01/2025', reminderTime: '11:00 AM', addedBy: 'Suresh Kumar', addedOnDate: '20/01/2025', addedOnTime: '11:00 AM', updatedOnDate: '20/01/2025', updatedOnTime: '11:00 AM' },
    { id: 2, remark: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', reminderDate: '20/01/2025', reminderTime: '11:00 AM', addedBy: 'Suresh Kumar', addedOnDate: '20/01/2025', addedOnTime: '11:00 AM', updatedOnDate: '20/01/2025', updatedOnTime: '11:00 AM' },
    { id: 3, remark: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', reminderDate: '20/01/2025', reminderTime: '11:00 AM', addedBy: 'Suresh Kumar', addedOnDate: '20/01/2025', addedOnTime: '11:00 AM', updatedOnDate: '20/01/2025', updatedOnTime: '11:00 AM' },
  ]
}

const TABS = ['Fee Details', 'Qualification Details', 'Address Details', 'Login Details']

export default function ParentProfilePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState(TABS[0])

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
            <img src={PARENT_DATA.avatar} alt={PARENT_DATA.name} className="w-32 h-32 rounded-xl object-cover border border-slate-200 bg-slate-50" />
            <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-600 text-white rounded flex items-center justify-center border-2 border-white shadow-sm hover:bg-teal-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-2">{PARENT_DATA.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-slate-500">User ID : {PARENT_DATA.userId}</span>
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${PARENT_DATA.isActive ? 'bg-teal-600' : 'bg-slate-300'} cursor-pointer`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${PARENT_DATA.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* Right: Personal Information */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Personal Information</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <FileEdit className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Parent Type</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {PARENT_DATA.parentType}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Mobile No.</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {PARENT_DATA.mobileNo}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Occupation</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {PARENT_DATA.occupation}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Address</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {PARENT_DATA.address}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-500 min-w-[100px]">Join Date</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">: &nbsp; {PARENT_DATA.joinDate}</span>
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
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 min-h-[400px]">
        {activeTab === 'Fee Details' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-end mb-6">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-center">S. No.</th>
                    <th className="px-4 py-3 text-center">Remark</th>
                    <th className="px-4 py-3 text-center">Reminder Date</th>
                    <th className="px-4 py-3 text-center">Added By</th>
                    <th className="px-4 py-3 text-center">Added On</th>
                    <th className="px-4 py-3 text-center">Updated On</th>
                    <th className="px-4 py-3 text-center">Notification</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {PARENT_DATA.fees.map((fee, i) => (
                    <tr key={fee.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-center text-slate-500 font-medium">{i + 1}.</td>
                      <td className="px-4 py-4 text-center">
                        <p className="text-[11px] text-slate-600 max-w-[200px] mx-auto leading-relaxed">{fee.remark}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {fee.reminderDate}</span>
                          <span className="text-slate-400">{fee.reminderTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-[11px] font-bold text-slate-700">{fee.addedBy}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {fee.addedOnDate}</span>
                          <span className="text-slate-400">{fee.addedOnTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {fee.updatedOnDate}</span>
                          <span className="text-slate-400">{fee.updatedOnTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center border border-orange-100">
                            <Bell className="w-3.5 h-3.5 text-orange-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    <th className="px-4 py-3 border-b border-slate-200">College Name</th>
                    <th className="px-4 py-3 border-b border-slate-200">Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-r border-slate-200">
                      <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">Graduation</div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">abcd college</div>
                    </td>
                    <td className="p-4">
                      <div className="text-blue-500 font-semibold flex items-center justify-center gap-1 text-xs cursor-pointer"><EyeOff className="w-3.5 h-3.5"/> Certificate 1.jpg</div>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Address</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">123, Location, Street Name</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Pincode</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">221507</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">State</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">Uttar Pradesh</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">District</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">Lucknow</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 mb-6 pb-2 border-b border-slate-100">Aadhar & Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Aadhar No.</label>
                  <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">1234-1234-1234</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Attach Aadhar</label>
                  <div className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-teal-600 font-semibold cursor-pointer">Aadhar Copy.jpg</span>
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  </div>
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
                <div className="px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700">teachrajesh23</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-800">Password</label>
                <div className="relative">
                  <input type="password" value="123TeachRajesh@" readOnly className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700 outline-none" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-800">Confirm Password</label>
                <div className="relative">
                  <input type="password" value="123TeachRajesh@" readOnly className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm bg-white text-slate-700 outline-none" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
