'use client'

import React, { useState } from 'react'
import { ArrowLeft, X, Plus, Upload, Trash2, CheckCircle2, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CustomField {
  id: number
  type: string
  name: string
  info?: string
  mandatory: boolean
  options?: string[]
}

const PREDEFINED_FIELDS = [
  'Name', 'Mobile No.', 'Alternate Number',
  'Email Address', 'ATAAR ID', 'Class/w Name',
  'Stream', 'Medium', 'Gender',
  'Address', 'Pincode', 'City',
  'State', 'Country', 'Aadhar No.',
  'Blood Group', 'Caste', 'Category',
  'religion', 'Nationality', 'Date Of Birth',
  'Is RTC Student?', 'Child With Special Needs', 'Attended School',
  'Attended classes', 'School Affiliated', 'Roll No',
  "Mother's Name", "Father's Name", 'Mother Qualification',
  'Father qualification', 'Mother occupation', 'Father occupation',
  'Mother Residential Address', 'Father Residential Address', 'Mother Official Address',
  'Father Official Address', 'Mother Income', 'Father Income',
  'Mother Email', 'Father Email', 'Mother Mobile',
  'Father Mobile', 'Transfer Certifican No.', 'Transfer Certificate Date',
  'Admission Date', 'Subject', 'Message', 'Upload Photo'
]

export default function CreateCustomFormPage() {
  const router = useRouter()

  // Form Details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
  )
  const [contentPosition, setContentPosition] = useState<'Before' | 'After'>('Before')

  // Tab State
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('custom')

  // Pre-defined field settings map
  const [enabledPredefined, setEnabledPredefined] = useState<Record<string, { enabled: boolean, required: boolean }>>(
    PREDEFINED_FIELDS.reduce((acc, field) => {
      acc[field] = { enabled: true, required: false }
      return acc
    }, {} as Record<string, { enabled: boolean, required: boolean }>)
  )

  // Custom Fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false)

  // Add Field Modal Form state
  const [newFieldType, setNewFieldType] = useState('Text')
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldInfo, setNewFieldInfo] = useState('')
  const [newFieldMandatory, setNewFieldMandatory] = useState(true)
  const [newFieldOptions, setNewFieldOptions] = useState<string[]>([''])

  // Right sidebar Config
  const [formStatus, setFormStatus] = useState(true)
  const [linkToLead, setLinkToLead] = useState(false)
  const [receiverEmail, setReceiverEmail] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailSignature, setEmailSignature] = useState('')
  const [autoReply, setAutoReply] = useState(true)
  const [replyToEmail, setReplyToEmail] = useState('')
  const [replyEmailSubject, setReplyEmailSubject] = useState('')
  const [replyEmailBody, setReplyEmailBody] = useState('Hello [User], Thank you for your inquiry. we will get back to you soon.')

  const [toastOpen, setToastOpen] = useState(false)

  const handlePredefinedChange = (field: string, key: 'enabled' | 'required', val: boolean) => {
    setEnabledPredefined({
      ...enabledPredefined,
      [field]: { ...enabledPredefined[field], [key]: val }
    })
  }

  const handleAddOption = () => {
    setNewFieldOptions([...newFieldOptions, ''])
  }

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...newFieldOptions]
    updated[idx] = val
    setNewFieldOptions(updated)
  }

  const handleRemoveOption = (idx: number) => {
    if (newFieldOptions.length <= 1) return
    setNewFieldOptions(newFieldOptions.filter((_, i) => i !== idx))
  }

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFieldName) {
      alert('Please enter a Field Name.')
      return
    }

    const field: CustomField = {
      id: Date.now(),
      type: newFieldType,
      name: newFieldName,
      info: newFieldInfo,
      mandatory: newFieldMandatory,
      options: ['Select', 'Radio', 'Checkbox'].includes(newFieldType) ? newFieldOptions.filter(o => o.trim()) : undefined
    }

    setCustomFields([...customFields, field])

    // Reset Modal
    setNewFieldType('Text')
    setNewFieldName('')
    setNewFieldInfo('')
    setNewFieldMandatory(true)
    setNewFieldOptions([''])
    setAddFieldModalOpen(false)
  }

  const handleRemoveCustomField = (id: number) => {
    setCustomFields(customFields.filter(f => f.id !== id))
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      alert('Please enter a form title.')
      return
    }

    const saved = localStorage.getItem('school_custom_forms')
    let formsList = []
    if (saved) {
      try {
        formsList = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }

    const newForm = {
      id: Date.now(),
      title,
      totalLeads: 0,
      linkToLead: linkToLead ? 'Linked' as const : '—' as const,
      receiverEmail: receiverEmail || 'abcd@gmail.com',
      session: '2025-26',
      status: formStatus ? 'Active' as const : 'Inactive' as const,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description
    }

    const updated = [newForm, ...formsList]
    localStorage.setItem('school_custom_forms', JSON.stringify(updated))

    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/custom-forms')
    }, 1500)
  }

  // Simple toolbar template for rich text
  const Toolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg overflow-x-auto text-[10px] font-bold text-slate-500">
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none cursor-pointer">
        <option>Paragraph 1</option>
      </select>
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none ml-1 cursor-pointer">
        <option>12 px</option>
      </select>
      {['B', 'I', 'U', '≡', '⊟', '≡', '⊞', '🔗', '📷', '■', '■'].map((btn, i) => (
        <button key={i} type="button" className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded transition-colors">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/institute/custom-forms"
            className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-slate-50 text-slate-500 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">Add New Form</h1>
            <p className="text-xs text-slate-400">Design dynamic fields and responses for public forms</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/institute/custom-forms')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSaveForm} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold text-slate-700">
        
        {/* Left Side Builder (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Create Form</legend>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Title</label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Content</label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Toolbar />
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none leading-relaxed text-slate-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Content Position <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="position"
                      checked={contentPosition === 'Before'}
                      onChange={() => setContentPosition('Before')}
                      className="accent-teal-600"
                    />
                    <span>Before Form</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="position"
                      checked={contentPosition === 'After'}
                      onChange={() => setContentPosition('After')}
                      className="accent-teal-600"
                    />
                    <span>After Form</span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Selector Tabs */}
            <div className="flex items-center gap-3 border-b pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('predefined')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'predefined' ? 'bg-teal-650 text-white font-extrabold shadow-sm' : 'bg-slate-55 text-slate-500 hover:bg-slate-100'}`}
              >
                Pre-Defined Field
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'custom' ? 'bg-teal-650 text-white font-extrabold shadow-sm' : 'bg-slate-55 text-slate-500 hover:bg-slate-100'}`}
              >
                Custom Field
              </button>
            </div>

            {/* Predefined Active tab grid */}
            {activeTab === 'predefined' && (
              <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
                <legend className="px-3 text-sm font-black text-[#1b3a60]">Form Fields</legend>
                <p className="text-[10px] text-slate-450 mb-3">Enable the fields you want to show in your form. You can also drag and drop to sort the fields.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-2">
                  {PREDEFINED_FIELDS.map(field => (
                    <div key={field} className="p-3 border rounded-xl bg-slate-50 space-y-2 relative">
                      <p className="font-bold text-slate-750">{field}</p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-500">
                          <input
                            type="checkbox"
                            checked={enabledPredefined[field]?.enabled}
                            onChange={e => handlePredefinedChange(field, 'enabled', e.target.checked)}
                            className="accent-teal-600 w-3.5 h-3.5"
                          />
                          <span>Enable</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-500">
                          <input
                            type="checkbox"
                            checked={enabledPredefined[field]?.required}
                            onChange={e => handlePredefinedChange(field, 'required', e.target.checked)}
                            className="accent-teal-600 w-3.5 h-3.5"
                          />
                          <span>Required</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Custom Active tab grid */}
            {activeTab === 'custom' && (
              <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
                <legend className="px-3 text-sm font-black text-[#1b3a60]">Custom Fields</legend>
                <div className="space-y-3">
                  {customFields.map((f, idx) => (
                    <div key={f.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 font-bold">
                      <div>
                        <p className="text-slate-800">{idx + 1}. {f.name} <span className="text-[10px] font-normal text-slate-400">({f.type})</span></p>
                        {f.info && <p className="text-[10px] text-slate-450 font-normal">{f.info}</p>}
                        {f.options && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {f.options.map(opt => (
                              <span key={opt} className="px-2 py-0.5 bg-white border rounded text-[9px] text-slate-500">{opt}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${f.mandatory ? 'bg-red-50 text-red-650' : 'bg-slate-100 text-slate-500'}`}>
                          {f.mandatory ? 'Required' : 'Optional'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(f.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {customFields.length === 0 && (
                    <p className="text-center text-slate-400 py-6">No custom fields added yet. Click Add Field to construct elements.</p>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAddFieldModalOpen(true)}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-colors text-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Field
                  </button>
                </div>
              </fieldset>
            )}

            {/* Footer Form buttons */}
            <div className="flex justify-center gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/institute/custom-forms')}
                className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
              >
                Save
              </button>
            </div>

          </div>
        </div>

        {/* Right Side config Panel (1 column) */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-black text-[#1b3a60]">Form Configuration</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-650 font-bold">Form Status</span>
            <button
              type="button"
              onClick={() => setFormStatus(!formStatus)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${formStatus ? 'bg-teal-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${formStatus ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-655 font-bold">Link to Lead</span>
            <button
              type="button"
              onClick={() => setLinkToLead(!linkToLead)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${linkToLead ? 'bg-teal-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${linkToLead ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Email Config Fieldset */}
          <div className="space-y-4 pt-2">
            <h3 className="font-black text-[#1b3a60]">Email Config</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email</label>
              <input
                type="email"
                placeholder="Enter Receiver Email"
                value={receiverEmail}
                onChange={e => setReceiverEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Email Subject</label>
              <input
                type="text"
                placeholder="Enter Email Subject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Email Signature</label>
              <textarea
                placeholder="Enter Signature details..."
                value={emailSignature}
                onChange={e => setEmailSignature(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none h-20 font-bold resize-none"
              />
            </div>
          </div>

          {/* Auto Reply settings */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#1b3a60]">Auto Reply</h3>
              <button
                type="button"
                onClick={() => setAutoReply(!autoReply)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${autoReply ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${autoReply ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            {autoReply && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Reply To Email</label>
                  <input
                    type="email"
                    placeholder="Enter Reply To Email"
                    value={replyToEmail}
                    onChange={e => setReplyToEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Reply Email Subject</label>
                  <input
                    type="text"
                    placeholder="Enter Email Subject"
                    value={replyEmailSubject}
                    onChange={e => setReplyEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Reply Email Body</label>
                  <textarea
                    value={replyEmailBody}
                    onChange={e => setReplyEmailBody(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none h-24 font-bold resize-none leading-relaxed text-slate-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </form>

      {/* ===== ADD FIELD POPUP MODAL ===== */}
      {addFieldModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setAddFieldModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Add Field</h3>
              <button onClick={() => setAddFieldModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Field Type</label>
                <select
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value)}
                  className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold"
                >
                  <option value="Text">Text</option>
                  <option value="Heading">Heading</option>
                  <option value="Select">Select (Dropdown)</option>
                  <option value="Radio">Radio</option>
                  <option value="Checkbox">Checkbox</option>
                  <option value="File">File</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Field Name</label>
                <input
                  type="text"
                  placeholder="Enter Field Name"
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>

              {/* Dynamic options when Type is Select or Radio or Checkbox */}
              {['Select', 'Radio', 'Checkbox'].includes(newFieldType) && (
                <div className="space-y-2 border-t pt-2">
                  <label className="text-slate-550 font-bold flex items-center justify-between">
                    <span>Options Configuration</span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[10px] text-teal-600 hover:underline font-black"
                    >
                      + Add Option
                    </button>
                  </label>
                  {newFieldOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg outline-none font-bold"
                      />
                      {newFieldOptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Information (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter Information"
                  value={newFieldInfo}
                  onChange={e => setNewFieldInfo(e.target.value)}
                  className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Do you want to make the field mandatory?</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mandatory"
                      checked={newFieldMandatory === true}
                      onChange={() => setNewFieldMandatory(true)}
                      className="accent-teal-650"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mandatory"
                      checked={newFieldMandatory === false}
                      onChange={() => setNewFieldMandatory(false)}
                      className="accent-teal-655"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md text-xs"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Custom Form published successfully!</span>
        </div>
      )}
    </div>
  )
}
