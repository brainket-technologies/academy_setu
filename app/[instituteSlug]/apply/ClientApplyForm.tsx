'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { submitAdmissionEnquiry } from '@/app/institute/website/actions'
import { toast } from 'sonner'

export default function ClientApplyForm({
  institutionId,
  courses = []
}: {
  institutionId: string
  courses?: Array<{ id: number; title: string }>
}) {
  const [form, setForm] = useState({
    name: '',
    parent_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    course_name: '',
    address: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Please enter the Student Name and Contact Mobile Number')
      return
    }
    setSubmitting(true)
    const res = await submitAdmissionEnquiry({
      institution_id: institutionId,
      name: `${form.name}${form.parent_name ? ` (Parent: ${form.parent_name})` : ''}`,
      email: form.email,
      phone: form.phone,
      course_name: form.course_name,
      message: `[ONLINE APPLICATION]\nDOB: ${form.dob || 'N/A'}\nGender: ${form.gender}\nAddress: ${form.address || 'N/A'}\nNotes: ${form.message || 'None'}`
    })
    setSubmitting(false)
    if (res.success) {
      toast.success('Your application has been submitted successfully!')
      setSubmitted(true)
    } else {
      toast.error(res.error || 'Failed to submit application')
    }
  }

  if (submitted) {
    return (
      <div className="p-10 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 max-w-2xl mx-auto shadow-sm">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
        <h3 className="font-extrabold text-emerald-950 text-xl">
          Application Received Successfully!
        </h3>
        <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
          Thank you for applying. Your application has been logged into our institution admissions database. An admissions officer will contact you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-bold text-lg text-slate-900">Student & Guardian Details</h3>
        <p className="text-xs text-slate-500">Please provide accurate information for verification.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Student Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Father / Mother / Guardian Name
          </label>
          <input
            type="text"
            placeholder="e.g. Mr. Anil Sharma"
            value={form.parent_name}
            onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mobile Number (WhatsApp) <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="+91 XXXXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="student@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Gender
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Class / Course Desired <span className="text-red-500">*</span>
          </label>
          {courses.length > 0 ? (
            <select
              required
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Select a Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              placeholder="e.g. Class 11th Science"
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Residential Address
        </label>
        <input
          type="text"
          placeholder="City, Village, District, Pin Code"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Previous School & Percentage / Additional Notes
        </label>
        <textarea
          rows={3}
          placeholder="Previous school name, board, percentage achieved, or hostel requirement..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white resize-y"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <span>{submitting ? 'Submitting Application...' : 'Submit Online Admission Application'}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
