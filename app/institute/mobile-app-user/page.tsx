'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Clock } from 'lucide-react'

interface AppUserRecord {
  id: number
  name: string
  username: string
  classes: string
  fatherName: string
  role: 'Student' | 'Teacher' | 'Parents'
  lastActive: string
}

const INITIAL_USERS: AppUserRecord[] = [
  { id: 1, name: 'Shubham Singh', username: 'shubham123', classes: 'I-B', fatherName: 'Veer Singh', role: 'Student', lastActive: '20/01/2025 11:03 AM' },
  { id: 2, name: 'Rishi Kumar', username: 'rishi123', classes: 'IV-A', fatherName: 'Rahul Kumar', role: 'Student', lastActive: '20/01/2025 11:03 AM' },
  { id: 3, name: 'Priya Kumari', username: 'priya123', classes: 'II-C', fatherName: 'Santosh Singh', role: 'Student', lastActive: '20/01/2025 11:03 AM' },
  { id: 4, name: 'Shubh Tiwari', username: 'shubh123', classes: '', fatherName: 'Alok Tiwari', role: 'Teacher', lastActive: '20/01/2025 11:03 AM' },
  { id: 5, name: 'Himesh', username: 'himesh123', classes: '', fatherName: 'Suraj', role: 'Parents', lastActive: '20/01/2025 11:03 AM' },
  { id: 6, name: 'Ashok', username: 'ashok123', classes: '', fatherName: 'Ravi', role: 'Teacher', lastActive: '20/01/2025 11:03 AM' },
  { id: 7, name: 'Rahul', username: 'rahul123', classes: '', fatherName: 'Aman', role: 'Parents', lastActive: '20/01/2025 11:03 AM' },
  { id: 8, name: 'Shivam', username: 'shivam123', classes: 'VII-A', fatherName: 'Rajesh', role: 'Student', lastActive: '20/01/2025 11:03 AM' },
  { id: 9, name: 'Komal', username: 'komal123', classes: '', fatherName: 'Ankit', role: 'Teacher', lastActive: '20/01/2025 11:03 AM' },
  { id: 10, name: 'Keshav', username: 'keshav123', classes: '', fatherName: 'Mukesh', role: 'Teacher', lastActive: '20/01/2025 11:03 AM' },
  { id: 11, name: 'Vikram Singh', username: 'vikram123', classes: 'X-B', fatherName: 'Devender', role: 'Student', lastActive: '20/01/2025 11:03 AM' },
  { id: 12, name: 'Sanjay Kumar', username: 'sanjay123', classes: '', fatherName: 'Dinesh', role: 'Parents', lastActive: '20/01/2025 11:03 AM' },
]

export default function MobileAppUserPage() {
  const [users, setUsers] = useState<AppUserRecord[]>(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Teacher' | 'Student' | 'Parents'>('All')

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('mobile_app_users')
    if (saved) {
      try {
        setUsers(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('mobile_app_users', JSON.stringify(INITIAL_USERS))
    }
  }, [])

  // Calculate counts dynamically
  const totalCount = users.length
  const teachersCount = users.filter(u => u.role === 'Teacher').length
  const studentsCount = users.filter(u => u.role === 'Student').length
  const parentsCount = users.filter(u => u.role === 'Parents').length

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.classes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === 'All' || u.role === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Mobile App User</h1>
          <p className="text-xs text-slate-400 font-medium">Monitor active mobile portal log sessions</p>
        </div>
      </div>

      {/* Control Actions (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by name, role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

      </div>

      {/* Dynamic Tab Switchers (Screenshot 1) */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => setActiveTab('All')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'All' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          All - {totalCount}
        </button>

        <button 
          onClick={() => setActiveTab('Teacher')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'Teacher' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          Teachers - {teachersCount}
        </button>

        <button 
          onClick={() => setActiveTab('Student')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'Student' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          Students - {studentsCount}
        </button>

        <button 
          onClick={() => setActiveTab('Parents')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            activeTab === 'Parents' ? 'bg-teal-600 text-white font-extrabold' : 'bg-white border text-slate-650 hover:bg-slate-50'
          }`}
        >
          Parents - {parentsCount}
        </button>
      </div>

      {/* Grid listing table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4 text-left">User name</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4 text-left">Father Name</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4 text-left w-56">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-850">{item.name}</td>
                  <td className="px-4 py-3.5 text-left text-slate-600 font-mono">{item.username}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.classes || '-'}</td>
                  <td className="px-4 py-3.5 text-left text-slate-700 font-bold">{item.fatherName}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-600">{item.role}</td>
                  <td className="px-4 py-3.5 text-left">
                    <div className="flex items-center gap-1.5 text-slate-450 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.lastActive}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No mobile app user logs match your search.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

    </div>
  )
}
