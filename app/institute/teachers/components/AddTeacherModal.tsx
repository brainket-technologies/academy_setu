'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, Upload, Calendar, ChevronDown, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createTeacher } from '../actions'
import { fetchStatesDistricts } from '../../actions'
import { useClasses, useDepartments, useSubjects } from '@/lib/mastersData'
import { INDIA_STATES_DISTRICTS } from '@/lib/india-data'

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  'Personal Details',
  'Qualification Details',
  'Address Details',
  'Assign Class & Section',
  'Payroll & Leave',
  'Payment Details',
]

// ─── Input Components ─────────────────────────────────────────────────────────
const inputCls = (hasError?: boolean) => 
  `w-full px-3.5 py-2.5 border rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none transition-colors ${
    hasError 
      ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/20 dark:bg-red-950/20' 
      : 'border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-500'
  }`

const labelCls = 'block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide'
const reqStar = <span className="text-red-500 ml-0.5 font-black">*</span>

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={labelCls}>{label}{required && reqStar}</label>
      </div>
      {children}
      {error && <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</p>}
    </div>
  )
}

function SelectField({ label, required, value, onChange, options, placeholder, error }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; error?: string
}) {
  return (
    <Field label={label} required={required} error={error}>
      <div className="relative">
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className={`${inputCls(!!error)} appearance-none cursor-pointer pr-10`}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((o, idx) => <option key={`${o}-${idx}`} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </Field>
  )
}

function FileUploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Field label={label}>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-teal-400 hover:bg-teal-50/30 transition-colors group"
      >
        <span className="text-sm text-slate-400 font-medium truncate pr-2">{value || `Upload ${label}`}</span>
        <Upload className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
      </button>
      <input ref={ref} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0]?.name || '')} />
    </Field>
  )
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function PersonalDetailsStep({ data, setData, departments, errors }: { data: any; setData: (d: any) => void; departments: any[]; errors: Record<string, string> }) {
  const [showPassword, setShowPassword] = useState(false)
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <SectionTitle>Basic Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="First Name" required error={errors.firstName}>
          <input className={inputCls(!!errors.firstName)} placeholder="Enter First Name" value={data.firstName || ''} onChange={e => set('firstName', e.target.value)} />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input className={inputCls(!!errors.lastName)} placeholder="Enter Last Name" value={data.lastName || ''} onChange={e => set('lastName', e.target.value)} />
        </Field>
        <Field label="Username" required error={errors.username}>
          <input className={inputCls(!!errors.username)} placeholder="Enter Username" value={data.username || ''} onChange={e => set('username', e.target.value)} />
        </Field>
        <Field label="Password" required error={errors.password}>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              className={`${inputCls(!!errors.password)} pr-10`} 
              placeholder="Enter Password" 
              value={data.password || ''} 
              onChange={e => set('password', e.target.value)} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <Field label="Contact No." required error={errors.contact}>
          <input className={inputCls(!!errors.contact)} placeholder="Enter Mobile No." value={data.contact || ''} onChange={e => set('contact', e.target.value)} maxLength={10} />
        </Field>
        <Field label="Alt. Contact No.">
          <input className={inputCls(false)} placeholder="Enter Alt. Mobile No." value={data.altContact || ''} onChange={e => set('altContact', e.target.value)} maxLength={10} />
        </Field>
        <Field label="Email ID" required error={errors.email}>
          <input type="email" className={inputCls(!!errors.email)} placeholder="Enter Email" value={data.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <div className="relative">
            <input type="date" className={inputCls(false)} value={data.dob || ''} onChange={e => set('dob', e.target.value)} />
          </div>
        </Field>
        <SelectField label="Gender" required value={data.gender || ''} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} error={errors.gender} />
        <SelectField label="Blood Group" value={data.bloodGroup || ''} onChange={v => set('bloodGroup', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
        <SelectField label="Department" required value={data.department || ''} onChange={v => set('department', v)} options={departments.map((d: any) => d.departmentName || d.name || d)} error={errors.department} />
        <Field label="Designation" required error={errors.designation}>
          <input className={inputCls(!!errors.designation)} placeholder="Enter Designation" value={data.designation || ''} onChange={e => set('designation', e.target.value)} />
        </Field>
        <Field label="Joining Date">
          <input type="date" className={inputCls(false)} value={data.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)} />
        </Field>
        <Field label="Staff ID No.">
          <input className={inputCls(false)} placeholder="Enter Staff ID" value={data.staffId || ''} onChange={e => set('staffId', e.target.value)} />
        </Field>
      </div>
      <SectionTitle>Profile Photo</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FileUploadField label="Profile Photo" value={data.photo || ''} onChange={v => set('photo', v)} />
      </div>
    </div>
  )
}

// ─── Step 2: Qualification Details ───────────────────────────────────────────
type QualRow = { qualification: string; passYear: string; obtMarks: string; percentage: string; college: string; doc: string }
type AQRow = { course: string; passYear: string; doc: string }
type ExpRow = { school: string; designation: string; from: string; to: string }

function QualificationDetailsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const [quals, setQuals] = useState<QualRow[]>(data.quals || [{ qualification: '', passYear: '', obtMarks: '', percentage: '', college: '', doc: '' }])
  const [aq, setAq] = useState<AQRow[]>(data.aq || [{ course: '', passYear: '', doc: '' }])
  const [exp, setExp] = useState<ExpRow[]>(data.exp || [{ school: '', designation: '', from: '', to: '' }])

  const updateQual = (i: number, k: keyof QualRow, v: string) => {
    const n = [...quals]; n[i] = { ...n[i], [k]: v }; setQuals(n); setData({ ...data, quals: n })
  }
  const addQual = () => { const n = [...quals, { qualification: '', passYear: '', obtMarks: '', percentage: '', college: '', doc: '' }]; setQuals(n); setData({ ...data, quals: n }) }
  const removeQual = (i: number) => { const n = quals.filter((_, j) => j !== i); setQuals(n); setData({ ...data, quals: n }) }

  const updateAq = (i: number, k: keyof AQRow, v: string) => {
    const n = [...aq]; n[i] = { ...n[i], [k]: v }; setAq(n); setData({ ...data, aq: n })
  }
  const addAq = () => { const n = [...aq, { course: '', passYear: '', doc: '' }]; setAq(n); setData({ ...data, aq: n }) }
  const removeAq = (i: number) => { const n = aq.filter((_, j) => j !== i); setAq(n); setData({ ...data, aq: n }) }

  const updateExp = (i: number, k: keyof ExpRow, v: string) => {
    const n = [...exp]; n[i] = { ...n[i], [k]: v }; setExp(n); setData({ ...data, exp: n })
  }
  const addExp = () => { const n = [...exp, { school: '', designation: '', from: '', to: '' }]; setExp(n); setData({ ...data, exp: n }) }
  const removeExp = (i: number) => { const n = exp.filter((_, j) => j !== i); setExp(n); setData({ ...data, exp: n }) }

  const rowInput = 'w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-300 transition-colors'

  return (
    <div className="space-y-8">
      {/* Qualification Details */}
      <div>
        <SectionTitle>Qualification Details</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['Qualification', 'Pass. Year', 'Obt. Marks', 'Percentage', 'College Name', 'Document'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quals.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 px-3">
                      <button type="button" onClick={() => removeQual(i)} disabled={quals.length === 1}
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="e.g. B.Ed" value={row.qualification} onChange={e => updateQual(i, 'qualification', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Year" value={row.passYear} onChange={e => updateQual(i, 'passYear', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Marks" value={row.obtMarks} onChange={e => updateQual(i, 'obtMarks', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="%" value={row.percentage} onChange={e => updateQual(i, 'percentage', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="College Name" value={row.college} onChange={e => updateQual(i, 'college', e.target.value)} /></td>
                    <td className="py-2.5 px-2">
                      <button type="button" className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap">
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={addQual}
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Qualification */}
      <div>
        <SectionTitle>Additional Qualification</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['Course / Certificate', 'Pass. Year', 'Document'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aq.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 px-3">
                      <button type="button" onClick={() => removeAq(i)} disabled={aq.length === 1}
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Course or Certificate Name" value={row.course} onChange={e => updateAq(i, 'course', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Year" value={row.passYear} onChange={e => updateAq(i, 'passYear', e.target.value)} /></td>
                    <td className="py-2.5 px-2">
                      <button type="button" className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap">
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={addAq}
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div>
        <SectionTitle>Experience</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['School/Organization Name', 'Designation', 'From', 'To'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exp.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 px-3">
                      <button type="button" onClick={() => removeExp(i)} disabled={exp.length === 1}
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="School or Org Name" value={row.school} onChange={e => updateExp(i, 'school', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Designation" value={row.designation} onChange={e => updateExp(i, 'designation', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input type="date" className={rowInput} value={row.from} onChange={e => updateExp(i, 'from', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input type="date" className={rowInput} value={row.to} onChange={e => updateExp(i, 'to', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={addExp}
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Address Details ──────────────────────────────────────────────────
function AddressDetailsStep({ data, setData, statesData, errors }: { data: any; setData: (d: any) => void; statesData: any[]; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
  
  const states = statesData.map(s => s.state || s.state_name || s.name || s)
  const selectedStateObj = statesData.find(s => (s.state || s.state_name || s.name) === data.state)
  const districts = selectedStateObj ? (selectedStateObj.districts || []) : []

  return (
    <div className="space-y-6">
      <SectionTitle>Address Details</SectionTitle>
      <div className="space-y-5">
        <Field label="Address" required error={errors.address}>
          <input className={inputCls(!!errors.address)} placeholder="Enter Address" value={data.address || ''} onChange={e => set('address', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SelectField label="State" required value={data.state || ''} onChange={v => { set('state', v); set('district', '') }} options={states} placeholder="Select State" error={errors.state} />
          <SelectField label="District" required value={data.district || ''} onChange={v => set('district', v)} options={districts} placeholder="Select District" error={errors.district} />
          <Field label="Pincode">
            <input className={inputCls(false)} placeholder="Enter Pincode" value={data.pincode || ''} onChange={e => set('pincode', e.target.value)} maxLength={6} />
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <SectionTitle>Aadhar &amp; Signature</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          <Field label="Aadhar No." required error={errors.aadhar}>
            <input className={inputCls(!!errors.aadhar)} placeholder="Enter 12-digit Aadhar No" value={data.aadhar || ''} onChange={e => set('aadhar', e.target.value)} maxLength={12} />
          </Field>
          <FileUploadField label="Aadhar Photo" value={data.aadharFile || ''} onChange={v => set('aadharFile', v)} />
          <FileUploadField label="Signature Photo" value={data.signatureFile || ''} onChange={v => set('signatureFile', v)} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Assign Class & Section ──────────────────────────────────────────
function AssignClassStep({ data, setData, classesData, subjectsData }: { data: any; setData: (d: any) => void; classesData: any[]; subjectsData: any[] }) {
  const [assigned, setAssigned] = useState<any[]>(data.assignedClasses || [{ class: '', section: '', subject: '' }])
  const [classTeacher, setClassTeacher] = useState<any>(data.classTeacher || { class: '', section: '', subject: '' })

  const updateAssigned = (i: number, k: string, v: string) => {
    const n = [...assigned]; n[i] = { ...n[i], [k]: v };
    setAssigned(n); setData({ ...data, assignedClasses: n })
  }
  const addAssigned = () => {
    const n = [...assigned, { class: '', section: '', subject: '' }];
    setAssigned(n); setData({ ...data, assignedClasses: n })
  }
  const removeAssigned = (i: number) => {
    const n = assigned.filter((_, j) => j !== i);
    setAssigned(n); setData({ ...data, assignedClasses: n })
  }
  const updateClassTeacher = (k: string, v: string) => {
    const n = { ...classTeacher, [k]: v };
    setClassTeacher(n); setData({ ...data, classTeacher: n })
  }

  const classOptions = classesData.map((c: any) => c.className || c.name || c)
  const subjectOptions = subjectsData.map((s: any) => s.subjectName || s.name || s)
  
  const getClassSections = (clsName: string) => {
    const cls = classesData.find((c: any) => (c.className || c.name) === clsName)
    return cls ? cls.sections : []
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Assign Class & Section</SectionTitle>
        <div className="space-y-4 mt-4">
          {assigned.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-end gap-4 relative">
              <div className="flex-1 w-full"><SelectField label="Class" value={row.class} onChange={v => updateAssigned(i, 'class', v)} options={classOptions} placeholder="Select Class" /></div>
              <div className="flex-1 w-full"><SelectField label="Section" value={row.section} onChange={v => updateAssigned(i, 'section', v)} options={getClassSections(row.class)} placeholder="Select Section" /></div>
              <div className="flex-1 w-full"><SelectField label="Subject" value={row.subject} onChange={v => updateAssigned(i, 'subject', v)} options={subjectOptions} placeholder="Select Subject" /></div>
              <div className="pb-1">
                {assigned.length > 1 && (
                  <button type="button" onClick={() => removeAssigned(i)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <button type="button" onClick={addAssigned} className="w-10 h-10 rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center justify-center transition-colors shadow">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <SectionTitle>Assign as a Class Teacher</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          <SelectField label="Class" value={classTeacher.class} onChange={v => updateClassTeacher('class', v)} options={classOptions} placeholder="Select Class" />
          <SelectField label="Section" value={classTeacher.section} onChange={v => updateClassTeacher('section', v)} options={getClassSections(classTeacher.class)} placeholder="Select Section" />
          <SelectField label="Subject" value={classTeacher.subject} onChange={v => updateClassTeacher('subject', v)} options={subjectOptions} placeholder="Select Subject" />
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Payroll & Leave ──────────────────────────────────────────────────
function PayrollLeaveStep({ data, setData, errors }: { data: any; setData: (d: any) => void; errors: Record<string, string> }) {
  const set = (k: string, v: string) => {
    const next = { ...data, [k]: v }
    const basic = Number(k === 'basicSalary' ? v : data.basicSalary) || 0
    const hra = Number(k === 'hra' ? v : data.hra) || 0
    const conv = Number(k === 'conveyance' ? v : data.conveyance) || 0
    const spec = Number(k === 'specialAllowance' ? v : data.specialAllowance) || 0
    const gross = basic + hra + conv + spec
    next.grossSalary = gross > 0 ? String(gross) : ''
    setData(next)
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Payroll</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Basic Salary" required error={errors.basicSalary}>
            <input className={inputCls(!!errors.basicSalary)} placeholder="Enter Basic Salary" value={data.basicSalary || ''} onChange={e => set('basicSalary', e.target.value)} />
          </Field>
          <Field label="HRA">
            <input className={inputCls(false)} placeholder="Enter HRA" value={data.hra || ''} onChange={e => set('hra', e.target.value)} />
          </Field>
          <Field label="Conveyance">
            <input className={inputCls(false)} placeholder="Enter Conveyance" value={data.conveyance || ''} onChange={e => set('conveyance', e.target.value)} />
          </Field>
          <Field label="Special Allowance">
            <input className={inputCls(false)} placeholder="Enter Special Allowance" value={data.specialAllowance || ''} onChange={e => set('specialAllowance', e.target.value)} />
          </Field>
          <Field label="Gross Monthly Salary">
            <div className="relative">
              <input readOnly className={`${inputCls(false)} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-inner text-slate-700 dark:text-slate-300 font-bold`} value={data.grossSalary ? `₹ ${data.grossSalary}` : 'Total Amount'} />
            </div>
          </Field>
        </div>
      </div>
      
      <div>
        <SectionTitle>Paid Leave (Optional)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <div className="col-span-full sm:col-span-1 lg:col-span-1">
             <SelectField label="Leave Option" value={data.leaveOption || ''} onChange={v => set('leaveOption', v)} options={['Option 1', 'Option 2']} placeholder="Select an Option" />
          </div>
          <div className="col-span-full hidden lg:block -mt-5" />
          <Field label="Casual Leave">
            <input className={inputCls(false)} placeholder="Enter No. of leave" value={data.casualLeaveNo || ''} onChange={e => set('casualLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls(false)} value={data.casualLeaveFrom || ''} onChange={e => set('casualLeaveFrom', e.target.value)} />
          </Field>
          <div className="hidden lg:block" />
          <Field label="Medical Leave">
            <input className={inputCls(false)} placeholder="Enter No. of leave" value={data.medicalLeaveNo || ''} onChange={e => set('medicalLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls(false)} value={data.medicalLeaveFrom || ''} onChange={e => set('medicalLeaveFrom', e.target.value)} />
          </Field>
          <div className="hidden lg:block" />
          <Field label="Half Day Leave">
            <input className={inputCls(false)} placeholder="Enter No. of leave" value={data.halfDayLeaveNo || ''} onChange={e => set('halfDayLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls(false)} value={data.halfDayLeaveFrom || ''} onChange={e => set('halfDayLeaveFrom', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: Payment Details ──────────────────────────────────────────────────
function PaymentDetailsStep({ data, setData, errors }: { data: any; setData: (d: any) => void; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Bank Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Account Holder Name" required error={errors.accountName}>
            <input className={inputCls(!!errors.accountName)} placeholder="Enter Account Holder Name" value={data.accountName || ''} onChange={e => set('accountName', e.target.value)} />
          </Field>
          <Field label="Bank Account No." required error={errors.accountNo}>
            <input className={inputCls(!!errors.accountNo)} placeholder="Enter Bank Account No." value={data.accountNo || ''} onChange={e => set('accountNo', e.target.value)} />
          </Field>
          <Field label="IFSC Code" required error={errors.ifsc}>
            <input className={inputCls(!!errors.ifsc)} placeholder="Enter IFSC Code" value={data.ifsc || ''} onChange={e => set('ifsc', e.target.value)} />
          </Field>
          <Field label="Bank Name" required error={errors.bankName}>
            <input className={inputCls(!!errors.bankName)} placeholder="Enter Bank Name" value={data.bankName || ''} onChange={e => set('bankName', e.target.value)} />
          </Field>
          <Field label="PAN No." required error={errors.panNo}>
            <input className={inputCls(!!errors.panNo)} placeholder="Enter PAN No." value={data.panNo || ''} onChange={e => set('panNo', e.target.value)} />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Online Payment Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="UPI ID">
            <input className={inputCls(false)} placeholder="Enter UPI ID" value={data.upiId || ''} onChange={e => set('upiId', e.target.value)} />
          </Field>
          <FileUploadField label="QR Code" value={data.qrCode || ''} onChange={v => set('qrCode', v)} />
        </div>
      </div>
      <div>
        <SectionTitle>Other Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Universal Account No.">
            <input className={inputCls(false)} placeholder="Enter Universal Account No." value={data.uanNo || ''} onChange={e => set('uanNo', e.target.value)} />
          </Field>
          <Field label="PF Account No.">
             <input className={inputCls(false)} placeholder="Enter PF Account No." value={data.pfNo || ''} onChange={e => set('pfNo', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">{children}</h3>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

// ─── Main Modal Component ─────────────────────────────────────────────────────
export interface AddTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddTeacherModal({ isOpen, onClose, onSuccess }: AddTeacherModalProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [statesData, setStatesData] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [bannerError, setBannerError] = useState('')

  const departments = useDepartments()
  const classesData = useClasses()
  const subjectsData = useSubjects()

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setFormData({})
      setStepErrors({})
      setBannerError('')
      return
    }

    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStatesData(data.data)
        } else {
          fetchStatesDistricts().then(res2 => {
            if (res2.success && Array.isArray(res2.data)) {
              setStatesData(res2.data)
            } else {
              setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state: s.state, districts: s.districts })))
            }
          })
        }
      })
      .catch(() => {
        setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state: s.state, districts: s.districts })))
      })
  }, [isOpen])

  if (!isOpen) return null

  const updateStepData = (key: string, d: any) => {
    setFormData(prev => ({ ...prev, [key]: d }))
    // Clear errors for fields as user types
    if (Object.keys(stepErrors).length > 0) {
      setStepErrors({})
      setBannerError('')
    }
  }

  // Validate specific step
  const validateStep = (stepIdx: number): boolean => {
    const errors: Record<string, string> = {}
    let message = ''

    if (stepIdx === 0) {
      const p = formData.personal || {}
      if (!p.firstName?.trim()) errors.firstName = 'First name is required'
      if (!p.lastName?.trim()) errors.lastName = 'Last name is required'
      if (!p.username?.trim()) errors.username = 'Username is required'
      if (!p.password?.trim()) errors.password = 'Password is required'
      if (!p.contact?.trim()) {
        errors.contact = 'Contact number is required'
      } else if (!/^\d{10}$/.test(p.contact.replace(/\D/g, ''))) {
        errors.contact = 'Please enter a valid 10-digit mobile number'
      }
      if (!p.email?.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(p.email)) {
        errors.email = 'Please enter a valid email address'
      }
      if (!p.gender) errors.gender = 'Gender is required'
      if (!p.department) errors.department = 'Department is required'
      if (!p.designation?.trim()) errors.designation = 'Designation is required'

      if (Object.keys(errors).length > 0) {
        message = 'Please fill all required fields in Personal Details marked with *.'
      }
    } else if (stepIdx === 2) {
      const a = formData.address || {}
      if (!a.address?.trim()) errors.address = 'Address is required'
      if (!a.state?.trim()) errors.state = 'State is required'
      if (!a.district?.trim()) errors.district = 'District is required'
      if (!a.aadhar?.trim()) {
        errors.aadhar = 'Aadhar number is required'
      } else if (!/^\d{12}$/.test(a.aadhar.replace(/\D/g, ''))) {
        errors.aadhar = 'Aadhar number must be 12 digits'
      }

      if (Object.keys(errors).length > 0) {
        message = 'Please fill all required address & Aadhar fields marked with *.'
      }
    } else if (stepIdx === 4) {
      const pr = formData.payroll || {}
      if (!pr.basicSalary?.trim()) {
        errors.basicSalary = 'Basic salary is required'
        message = 'Please enter Basic Salary in Payroll Details.'
      }
    } else if (stepIdx === 5) {
      const pm = formData.payment || {}
      if (!pm.accountName?.trim()) errors.accountName = 'Account holder name is required'
      if (!pm.accountNo?.trim()) errors.accountNo = 'Bank account number is required'
      if (!pm.ifsc?.trim()) errors.ifsc = 'IFSC code is required'
      if (!pm.bankName?.trim()) errors.bankName = 'Bank name is required'
      if (!pm.panNo?.trim()) errors.panNo = 'PAN number is required'

      if (Object.keys(errors).length > 0) {
        message = 'Please fill all required bank payment details marked with *.'
      }
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      setBannerError(message)
      return false
    }

    setStepErrors({})
    setBannerError('')
    return true
  }

  const handleStepClick = (targetIdx: number) => {
    if (targetIdx <= step) {
      setStep(targetIdx)
      setStepErrors({})
      setBannerError('')
      return
    }

    // Check all previous steps up to target
    for (let i = step; i < targetIdx; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }

    setStep(targetIdx)
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      setStepErrors({})
      setBannerError('')
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1)
      setStepErrors({})
      setBannerError('')
    }
  }

  const handleSubmit = async () => {
    // Validate all required steps before final submit
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }

    setSubmitting(true)
    setBannerError('')

    try {
      const res = await createTeacher(formData)
      if (res.success) {
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setBannerError(res.error || 'Failed to add teacher')
      }
    } catch (err: any) {
      setBannerError(err.message || 'An error occurred while saving teacher')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
      
      <div
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Teacher</h2>
            <p className="text-xs text-slate-500 font-medium">Create a new teacher profile and assign classes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 overflow-x-auto flex-shrink-0">
          <div className="flex min-w-max px-2">
            {STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleStepClick(i)}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  step === i
                    ? 'border-teal-600 text-teal-600 bg-teal-50/70 dark:bg-teal-900/20'
                    : i < step
                    ? 'border-transparent text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer'
                    : 'border-transparent text-slate-400 hover:text-slate-600 cursor-pointer opacity-70'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  i < step ? 'bg-teal-600 text-white' : step === i ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-2.5 px-6 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50 flex-shrink-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                i < step
                  ? 'w-5 h-5 bg-teal-600 text-white shadow-sm'
                  : i === step
                  ? 'w-5 h-5 bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900/40 shadow'
                  : 'w-3 h-3 bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {i < step && <Check className="w-3 h-3" />}
              {i === step && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          ))}
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {bannerError && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{bannerError}</span>
            </div>
          )}

          {step === 0 && (
            <PersonalDetailsStep 
              data={formData.personal || {}} 
              setData={d => updateStepData('personal', d)} 
              departments={departments} 
              errors={stepErrors}
            />
          )}
          {step === 1 && (
            <QualificationDetailsStep 
              data={formData.qualification || {}} 
              setData={d => updateStepData('qualification', d)} 
            />
          )}
          {step === 2 && (
            <AddressDetailsStep 
              data={formData.address || {}} 
              setData={d => updateStepData('address', d)} 
              statesData={statesData} 
              errors={stepErrors}
            />
          )}
          {step === 3 && (
            <AssignClassStep 
              data={formData.classes || {}} 
              setData={d => updateStepData('classes', d)} 
              classesData={classesData} 
              subjectsData={subjectsData} 
            />
          )}
          {step === 4 && (
            <PayrollLeaveStep 
              data={formData.payroll || {}} 
              setData={d => updateStepData('payroll', d)} 
              errors={stepErrors}
            />
          )}
          {step === 5 && (
            <PaymentDetailsStep 
              data={formData.payment || {}} 
              setData={d => updateStepData('payment', d)} 
              errors={stepErrors}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 active:scale-95 transition-all shadow flex items-center gap-2"
              >
                Save &amp; Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-7 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Teacher
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
