'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const SOURCE_OPTIONS = ['Offline Meeting', 'YouTube', 'Facebook', 'Other']
const STATE_OPTIONS = ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Delhi', 'Maharashtra', 'Bihar', 'Haryana']
const DISTRICT_OPTIONS = ['Lucknow', 'Bhopal', 'Chandigarh', 'New Delhi', 'Mumbai', 'Patna', 'Gurugram', 'Noida']

interface LeadStatus {
  id: string
  name: string
}

export default function CreateLeadPage() {
  const router = useRouter()
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loadingStatuses, setLoadingStatuses] = useState(true)

  // Form states
  const [leadSource, setLeadSource] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [emailId, setEmailId] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [noOfStudents, setNoOfStudents] = useState('')
  const [status, setStatus] = useState('Created')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadStatuses() {
      try {
        const res = await fetch('/api/admin/crm/status')
        const data = await res.json()
        if (data.success) {
          setStatuses(data.data)
        }
      } catch {
        console.error('Failed to load statuses')
      } finally {
        setLoadingStatuses(false)
      }
    }
    loadStatuses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadSource) {
      toast.error('Lead Source is required')
      return
    }
    if (!mobileNo.trim()) {
      toast.error('Mobile No. is required')
      return
    }
    if (!schoolName.trim()) {
      toast.error('School Name is required')
      return
    }
    if (!status) {
      toast.error('Status is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_source: leadSource,
          mobile_no: mobileNo.trim(),
          email_id: emailId.trim(),
          contact_person: contactPerson.trim(),
          school_name: schoolName.trim(),
          state,
          district,
          no_of_students: parseInt(noOfStudents || '0'),
          status
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead created successfully!')
        router.push('/admin/crm/leads')
      } else {
        toast.error(data.error || 'Failed to create lead')
      }
    } catch {
      toast.error('Something went wrong creating lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Create Lead</h1>
        </div>

        {/* Lead Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Lead Source */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Lead Source<span className="text-red-500">*</span>
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select an Option</option>
                  {SOURCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Mobile No. */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Mobile No.<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Mobile No."
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-550/20 focus:border-teal-550 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Email ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Email Id</label>
                <input
                  type="email"
                  placeholder="Enter Email ID"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-550/20 focus:border-teal-550 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Person */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Contact Person</label>
                <input
                  type="text"
                  placeholder="Enter Contact Person Name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-550/20 focus:border-teal-550 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              {/* School Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">School Name</label>
                <input
                  type="text"
                  placeholder="Enter School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-550/20 focus:border-teal-550 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select State</option>
                  {STATE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select District</option>
                  {DISTRICT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* No. of Students */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">No. of Students</label>
                <input
                  type="number"
                  placeholder="Enter no. of Students"
                  value={noOfStudents}
                  onChange={(e) => setNoOfStudents(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-555/20 focus:border-teal-555 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Status Option */}
            <div className="flex flex-col gap-1.5 md:max-w-xs">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                required
              >
                <option value="">Select Status</option>
                {loadingStatuses ? (
                  <option disabled>Loading statuses...</option>
                ) : (
                  statuses.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Actions Form */}
            <div className="flex justify-center md:justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-5">
              <button
                type="button"
                onClick={() => router.push('/admin/crm/leads')}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-350 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-755 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
