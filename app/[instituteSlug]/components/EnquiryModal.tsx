'use client'

import React, { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { submitAdmissionEnquiry } from '@/app/institute/website/actions'
import { toast } from 'sonner'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  institutionId: string
  initialCourse?: string
  courses?: Array<{ id: number; title: string }>
}

export default function EnquiryModal({
  isOpen,
  onClose,
  institutionId,
  initialCourse = '',
  courses = []
}: EnquiryModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    course_name: initialCourse,
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Please enter your Name and Mobile Number')
      return
    }
    setSubmitting(true)
    const res = await submitAdmissionEnquiry({
      institution_id: institutionId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      course_name: form.course_name || initialCourse,
      message: form.message
    })
    setSubmitting(false)
    if (res.success) {
      toast.success('Your enquiry has been received!')
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2500)
    } else {
      toast.error(res.error || 'Failed to submit enquiry')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-lg text-slate-900 mb-1">
          {initialCourse ? `Apply for: ${initialCourse}` : 'Admission Application'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Please enter your contact details and our office will get in touch with you.
        </p>

        {submitted ? (
          <div className="p-6 text-center bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h5 className="font-bold text-emerald-900 text-sm">Enquiry Received!</h5>
            <p className="text-xs text-emerald-700">Thank you! We will get in touch with you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 XXXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            {courses && courses.length > 0 && !initialCourse && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Program / Class</label>
                <select
                  value={form.course_name}
                  onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                >
                  <option value="">Choose a Program</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message / Notes</label>
              <textarea
                rows={2}
                placeholder="Class interested, previous marks, etc."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
