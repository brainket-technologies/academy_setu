'use client'

import React, { useState, useEffect } from 'react'
import { fetchLeads, saveLead, addFollowup } from './actions'
import { fetchLeadSources } from '../leads-sources/actions'
import { fetchLeadStatuses } from '../leads-status/actions'
import { 
  Download, Upload, Filter, Plus, X, Search, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, PhoneCall, Image as ImageIcon
} from 'lucide-react'

// Modals/Overlays will be rendered conditionally based on state.
type ViewState = 'LIST' | 'CREATE_LEAD' | 'UPDATE_LEAD';

export default function LeadsPage() {
  const [view, setView] = useState<ViewState>('LIST')
  const [leads, setLeads] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Selection/Update State
  const [selectedLead, setSelectedLead] = useState<any>(null)

  // Filters State
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    const [res, srcRes, statRes] = await Promise.all([
       fetchLeads(),
       fetchLeadSources(),
       fetchLeadStatuses()
    ])
    
    if (res.success) setLeads(res.data || [])
    if (srcRes.success) setSources(srcRes.data || [])
    if (statRes.success) setStatuses(statRes.data || [])
    
    try {
      const cls = localStorage.getItem('school_masters_classes')
      if (cls) setClasses(JSON.parse(cls))
    } catch(e) {}
    
    setLoading(false)
  }

  const handleOpenCreate = () => {
    setView('CREATE_LEAD')
  }

  const handleOpenUpdate = (lead: any) => {
    setSelectedLead(lead)
    setView('UPDATE_LEAD')
  }

  const handleCloseModal = () => {
    setView('LIST')
    setSelectedLead(null)
    loadLeads()
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 relative">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">All Leads</h1>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-900/30 dark:border-teal-800">
              Total Leads {leads.length < 10 ? `0${leads.length}` : leads.length}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/30 dark:border-purple-800">
              New Leads 01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm relative">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={handleOpenCreate} className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter SlideDown / Dropdown */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2 relative">
          <button onClick={() => setShowFilters(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">From</label>
              <div className="relative">
                <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">To</label>
              <div className="relative">
                <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Class</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none">
                <option>Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.className}>{c.className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none">
                <option>Select Status</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Source</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none">
                <option>Select Source</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Reference</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none">
                <option>Select Reference</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Search</label>
              <input type="text" placeholder="Search By Name, Mobile, email" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button className="px-8 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors">Filter</button>
            <button onClick={() => setShowFilters(false)} className="px-8 py-2 bg-white border border-teal-600 text-teal-600 text-sm font-bold rounded-lg hover:bg-teal-50 transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-4 px-2">S. No.</th>
                <th className="pb-4 px-2">Name</th>
                <th className="pb-4 px-2">Contact</th>
                <th className="pb-4 px-2">Father Name</th>
                <th className="pb-4 px-2">Applied For</th>
                <th className="pb-4 px-2">Scheduled At</th>
                <th className="pb-4 px-2">Assigned To</th>
                <th className="pb-4 px-2">Status</th>
                <th className="pb-4 px-2">Remark</th>
                <th className="pb-4 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400">No leads found. Create one!</td></tr>
              ) : (
                leads.filter(l => (l.first_name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((lead, i) => (
                  <tr key={lead.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="py-3 px-2 font-semibold text-slate-600">{i + 1}.</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          <img src={`https://i.pravatar.cc/150?u=${lead.id}`} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{lead.first_name} {lead.last_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-600">{lead.mobile_no}</td>
                    <td className="py-3 px-2 font-semibold text-slate-600">{lead.father_name}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">Class / Course<br/><span className="font-bold text-slate-700 dark:text-slate-300">{lead.admission_class}</span></td>
                    <td className="py-3 px-2 text-slate-500 text-[11px]">
                      {lead.scheduled_at ? new Date(lead.scheduled_at).toLocaleString() : 'Not set'}
                    </td>
                    <td className="py-3 px-2 text-xs">
                       <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">{lead.assigned_to || 'Riya'}</span>
                    </td>
                    <td className="py-3 px-2">
                      {lead.status === 'Inactive' ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-500 rounded-md">Inactive</span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-500 rounded-md">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md">{lead.remark || 'Interested'}</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenUpdate(lead)} className="w-6 h-6 rounded bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center" title="Update Lead">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-6 h-6 rounded bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Showing 1-{Math.min(10, leads.length)} of {leads.length} Entries</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
            <button className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">2</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      {view === 'CREATE_LEAD' && <CreateLeadModal onClose={handleCloseModal} sources={sources} statuses={statuses} classes={classes} />}
      {view === 'UPDATE_LEAD' && <UpdateLeadModal lead={selectedLead} onClose={handleCloseModal} statuses={statuses} />}

    </div>
  )
}

function CreateLeadModal({ onClose, sources, statuses, classes = [] }: { onClose: () => void, sources: any[], statuses: any[], classes?: any[] }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveAndNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setSubmitting(true)
      await saveLead(formData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Lead Create</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Stepper */}
          <div className="flex items-center justify-between relative mb-10 mx-auto max-w-3xl">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-600 rounded-full -z-10 transition-all duration-300" style={{ width: step === 1 ? '15%' : step === 2 ? '50%' : '90%' }}></div>
            
            <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white ${step >= 1 ? 'border-teal-600' : 'border-slate-300'} shadow-sm`}>
                {step > 1 && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
              </div>
              <span className="text-xs font-bold">Personal Details</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white ${step >= 2 ? 'border-teal-600' : 'border-slate-300'} shadow-sm`}>
                {step > 2 && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
              </div>
              <span className="text-xs font-bold">Education Details</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-teal-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white ${step >= 3 ? 'border-teal-600' : 'border-slate-300'} shadow-sm`}>
                {step > 3 && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
              </div>
              <span className="text-xs font-bold">Parents/Address Details</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-3xl mx-auto">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <Section title="Admission Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Admission Class" required>
                      <select name="admissionClass" value={formData.admissionClass || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.className}>{c.className}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Source" required>
                      <select name="source" value={formData.source || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                         <option value="">Select Source</option>
                         {sources.map(s => (
                           <option key={s.id} value={s.category_name}>{s.category_name}</option>
                         ))}
                      </select>
                    </Field>
                    <Field label="Referred By">
                      <select name="referredBy" value={formData.referredBy || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select an Option</option></select>
                    </Field>
                  </div>
                </Section>
                
                <Section title="Basic Info">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="First Name" required><input name="firstName" value={formData.firstName || ''} onChange={handleChange} type="text" placeholder="Enter Your First Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Last Name"><input name="lastName" value={formData.lastName || ''} onChange={handleChange} type="text" placeholder="Enter Your Last Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Mobile No." required><input name="mobileNo" value={formData.mobileNo || ''} onChange={handleChange} type="text" placeholder="Enter Your Mobile No" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Email Id"><input name="emailId" value={formData.emailId || ''} onChange={handleChange} type="email" placeholder="Enter Your Email Id" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Date of Birth"><input name="dob" value={formData.dob || ''} onChange={handleChange} type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Gender" required>
                        <div className="flex items-center gap-4 h-full">
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" name="gender" value="Male" onChange={handleChange} className="accent-teal-600"/> Male</label>
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" name="gender" value="Female" onChange={handleChange} className="accent-teal-600"/> Female</label>
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" name="gender" value="Others" onChange={handleChange} className="accent-teal-600"/> Others</label>
                        </div>
                      </Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-teal-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <button className="w-full py-2 border-2 border-teal-600 text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50 transition-colors">Upload Photo</button>
                    </div>
                  </div>
                </Section>

                <Section title="Aadhar & Religion Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Nationality">
                      <select name="nationality" value={formData.nationality || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select Nationality</option><option>Indian</option></select>
                    </Field>
                    <Field label="Religion">
                      <select name="religion" value={formData.religion || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select Religion</option></select>
                    </Field>
                    <Field label="Category">
                      <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select Category</option></select>
                    </Field>
                    <Field label="Aadhar Card No.">
                      <input name="aadharNo" value={formData.aadharNo || ''} onChange={handleChange} type="text" placeholder="Enter Aadhar Card No." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                    </Field>
                  </div>
                </Section>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <Section title="Previous School Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="School Name & Address">
                      <input name="prevSchoolName" value={formData.prevSchoolName || ''} onChange={handleChange} type="text" placeholder="Enter School Name & Address" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                    </Field>
                    <Field label="Attended Class">
                      <select name="prevClass" value={formData.prevClass || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                        <option value="">Select an Option</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.className}>{c.className}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Last School Affiliated To">
                      <select name="prevAffiliation" value={formData.prevAffiliation || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select an Option</option></select>
                    </Field>
                  </div>
                </Section>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <Section title="Parents Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Father Name" required><input name="fatherName" value={formData.fatherName || ''} onChange={handleChange} type="text" placeholder="Enter Father Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Father Contact No." required><input name="fatherContact" value={formData.fatherContact || ''} onChange={handleChange} type="text" placeholder="Enter Contact No." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Father Occupation"><input name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleChange} type="text" placeholder="Enter Occupation" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Father Annual Income"><input name="fatherIncome" value={formData.fatherIncome || ''} onChange={handleChange} type="text" placeholder="Enter Annual Income" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      
                      <Field label="Mother Name"><input name="motherName" value={formData.motherName || ''} onChange={handleChange} type="text" placeholder="Enter Mother Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Mother Contact No."><input name="motherContact" value={formData.motherContact || ''} onChange={handleChange} type="text" placeholder="Enter Contact No." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Mother Occupation"><input name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleChange} type="text" placeholder="Enter Occupation" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                      <Field label="Mother Annual Income"><input name="motherIncome" value={formData.motherIncome || ''} onChange={handleChange} type="text" placeholder="Enter Annual Income" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 flex items-center justify-center text-teal-600"><ImageIcon className="w-6 h-6"/></div>
                        <button className="text-[10px] font-bold text-teal-600 border border-teal-600 rounded px-2 py-1">Upload Father Photo</button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 flex items-center justify-center text-teal-600"><ImageIcon className="w-6 h-6"/></div>
                        <button className="text-[10px] font-bold text-teal-600 border border-teal-600 rounded px-2 py-1">Upload Mother Photo</button>
                      </div>
                    </div>
                  </div>
                </Section>
                <Section title="Address Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <Field label="Address" required><input name="address" value={formData.address || ''} onChange={handleChange} type="text" placeholder="Enter Address" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                    </div>
                    <Field label="State" required><select name="state" value={formData.state || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select State</option></select></Field>
                    <Field label="District" required><select name="district" value={formData.district || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"><option>Select District</option></select></Field>
                    <Field label="Pincode"><input name="pincode" value={formData.pincode || ''} onChange={handleChange} type="text" placeholder="Enter Pincode" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                  </div>
                </Section>
                <Section title="Status & Remark">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Status" required>
                       <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                         <option value="">Select Status</option>
                         {statuses.map(st => (
                           <option key={st.id} value={st.status_name}>{st.status_name}</option>
                         ))}
                       </select>
                    </Field>
                    <Field label="Remark"><input name="remark" value={formData.remark || ''} onChange={handleChange} type="text" placeholder="Enter Remark" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/></Field>
                  </div>
                </Section>
              </div>
            )}
            
            <div className="mt-10 flex items-center justify-center gap-4 border-t border-slate-100 pt-6">
               {step > 1 && <button onClick={() => setStep(step - 1)} className="px-8 py-2 bg-white border border-teal-600 text-teal-600 text-sm font-bold rounded-xl hover:bg-teal-50 transition-colors">Back</button>}
               <button onClick={handleSaveAndNext} disabled={submitting} className="px-8 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors">
                 {submitting ? 'Saving...' : step === 3 ? 'Save' : 'Save & Next'}
               </button>
               <button onClick={onClose} className="px-8 py-2 bg-white border border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function UpdateLeadModal({ lead, onClose, statuses }: { lead: any, onClose: () => void, statuses: any[] }) {
  const [formData, setFormData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    setSubmitting(true)
    await addFollowup(lead.id, formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Lead Update</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Read Only Details */}
          <Section title="Lead Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Name"><div className="input-field bg-slate-50 opacity-70 flex items-center">{lead.first_name} {lead.last_name}</div></Field>
              <Field label="Mobile No."><div className="input-field bg-slate-50 opacity-70 flex items-center">{lead.mobile_no}</div></Field>
              <Field label="Admission Class"><div className="input-field bg-slate-50 opacity-70 flex items-center">{lead.admission_class}</div></Field>
              <Field label="Father Name"><div className="input-field bg-slate-50 opacity-70 flex items-center">{lead.father_name}</div></Field>
            </div>
          </Section>

          {/* Update Form */}
          <div className="mt-8">
            <Section title="Update Lead">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field label="Communication Option">
                        <div className="flex items-center gap-6 mt-2">
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" name="communicationOption" value="Call" onChange={handleChange} className="accent-teal-600"/> Call</label>
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" name="communicationOption" value="Message" onChange={handleChange} className="accent-teal-600"/> Message</label>
                        </div>
                    </Field>
                  </div>
                  
                  {formData.communicationOption === 'Call' && (
                    <Field label="Call Duration">
                      <input name="callDuration" onChange={handleChange} type="text" placeholder="Enter Call Duration" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                    </Field>
                  )}

                  <div className="md:col-span-2">
                    <Field label="Remarks">
                      <input name="remarks" onChange={handleChange} type="text" placeholder="Enter Remarks" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                    </Field>
                  </div>

                  <Field label="Follow Up Date">
                     <input name="followUpDate" onChange={handleChange} type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"/>
                  </Field>

                  <Field label="Status">
                     <select name="status" onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                        <option value="">Select Status</option>
                        {statuses.map(st => (
                           <option key={st.id} value={st.status_name}>{st.status_name}</option>
                        ))}
                     </select>
                  </Field>
               </div>
            </Section>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-4">
             <button onClick={onClose} className="px-8 py-2 bg-white border border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
             <button onClick={handleUpdate} disabled={submitting} className="px-8 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors">
               {submitting ? 'Updating...' : 'Update'}
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// --- Helper Components ---

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{title}</h3>
        <div className="h-px w-full bg-slate-200 dark:bg-slate-700/50"></div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}
