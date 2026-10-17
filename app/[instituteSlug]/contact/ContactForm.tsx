'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { submitAdmissionEnquiry } from '@/app/institute/website/actions'
import { toast } from 'sonner'

export default function ContactForm({ institutionId }: { institutionId: string }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
      message: form.message
    })
    setSubmitting(false)
    if (res.success) {
      toast.success('Your message has been sent successfully!')
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } else {
      toast.error(res.error || 'Failed to send message')
    }
  }

  if (submitted) {
    return (
      <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h4 className="font-bold text-emerald-900 text-lg">Thank You! Message Received.</h4>
        <p className="text-xs text-emerald-700">Our team will get back to you as soon as possible.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Enter your full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Your Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          placeholder="name@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Mobile Number <span className="text-red-500">*</span>
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
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          required
          placeholder="Write your query or message here..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
