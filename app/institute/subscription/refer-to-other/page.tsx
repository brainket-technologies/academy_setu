'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, CheckCircle2 } from 'lucide-react'

interface ReferralRecord {
  id: number
  schoolName: string
  contactPerson: string
  mobileNo: string
  state: string
  district: string
  createdAt: string
  status: 'Completed' | 'Pending'
}

const INITIAL_REFERRALS: ReferralRecord[] = [
]

export default function ReferToOtherPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>(INITIAL_REFERRALS)
  const [searchQuery, setSearchQuery] = useState('')

  // Form State
  const [mobileNo, setMobileNo] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [designation, setDesignation] = useState('')
  const [emailId, setEmailId] = useState('')
  const [stateName, setStateName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const referralCode = 'ASD1001'

  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_referrals')
    if (saved) {
      try {
        setReferrals(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_referrals', JSON.stringify(INITIAL_REFERRALS))
    }
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNo || !schoolName || !contactPerson || !stateName || !districtName) {
      alert('Please fill in all required fields marked with *.')
      return
    }

    const newRef: ReferralRecord = {
      id: Date.now(),
      schoolName,
      contactPerson,
      mobileNo,
      state: stateName,
      district: districtName,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    }

    const updated = [newRef, ...referrals]
    setReferrals(updated)
    localStorage.setItem('school_referrals', JSON.stringify(updated))

    setMobileNo('')
    setSchoolName('')
    setContactPerson('')
    setDesignation('')
    setEmailId('')
    setStateName('')
    setDistrictName('')

    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const filtered = referrals.filter(r => {
    const term = searchQuery.toLowerCase()
    return (
      r.schoolName.toLowerCase().includes(term) ||
      r.contactPerson.toLowerCase().includes(term) ||
      r.mobileNo.includes(term) ||
      r.state.toLowerCase().includes(term) ||
      r.district.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Refer to Other</h1>
      </div>

      {/* Yellow Warning/Notice Bar */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </div>

      {/* Referral Form card */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700">
        <form onSubmit={handleSend} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Mobile No. <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter Mobile No"
                value={mobileNo}
                onChange={e => setMobileNo(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">School Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter School Name"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Contact Person <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter Person Name"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Designation</label>
              <input
                type="text"
                placeholder="Enter Designation"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Email ID</label>
              <input
                type="email"
                placeholder="Enter Email ID"
                value={emailId}
                onChange={e => setEmailId(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">State <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter State"
                  value={stateName}
                  onChange={e => setStateName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">District <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter District"
                  value={districtName}
                  onChange={e => setDistrictName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Referral code</label>
              <input
                type="text"
                readOnly
                value={referralCode}
                className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 outline-none font-bold text-slate-500"
              />
            </div>
            <div />
            <button
              type="submit"
              className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Referral Data Table card */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-sm font-black text-[#1b3a60]">Referral Data</h2>
          
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Mobile No, City..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none font-bold text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">School Name</th>
                <th className="px-3 py-4 text-left">Contact Person</th>
                <th className="px-3 py-4">Mobile No.</th>
                <th className="px-3 py-4">State</th>
                <th className="px-3 py-4">District</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.schoolName}</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-600">{item.contactPerson}</td>
                  <td className="px-3 py-3.5 text-slate-750 font-bold">{item.mobileNo}</td>
                  <td className="px-3 py-3.5 text-slate-550 font-bold">{item.state}</td>
                  <td className="px-3 py-3.5 text-slate-550 font-bold">{item.district}</td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                    {item.createdAt}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    No referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Referral invitation sent successfully!</span>
        </div>
      )}
    </div>
  )
}
