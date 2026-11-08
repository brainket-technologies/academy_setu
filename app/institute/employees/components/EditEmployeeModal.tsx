'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, Upload, ChevronDown, ChevronLeft, ChevronRight, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { fetchEmployeeById, updateEmployee } from '../actions'
import { fetchEmployeeRoles } from '../roles/actions'
import { fetchStatesDistricts } from '../../actions'
import { toast } from 'sonner'

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  'Personal Details',
  'Qualification Details',
  'Address Details',
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
        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-teal-400 hover:bg-teal-50/30 transition-colors group cursor-pointer"
      >
        <span className="text-sm text-slate-400 font-medium truncate pr-2">{value || `Upload ${label}`}</span>
        <Upload className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
      </button>
      <input ref={ref} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0]?.name || '')} />
    </Field>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">{children}</h3>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function PersonalDetailsStep({ data, setData, roles, errors }: { data: any; setData: (d: any) => void; roles: any[]; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <SectionTitle>Joining &amp; Role Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SelectField 
          label="Role" 
          required 
          value={data.role || ''} 
          onChange={v => set('role', v)} 
          options={roles.map((r: any) => r.name || r)} 
          error={errors.role} 
          placeholder="Select Role"
        />
        <Field label="Staff ID / Username" required error={errors.staffId}>
          <input className={inputCls(!!errors.staffId)} placeholder="e.g. EMP101" value={data.staffId || data.username || ''} onChange={e => { set('staffId', e.target.value); set('username', e.target.value) }} />
        </Field>
        <Field label="Joining Date" required error={errors.joiningDate}>
          <input type="date" className={inputCls(!!errors.joiningDate)} value={data.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)} />
        </Field>
        <Field label="Designation" required error={errors.designation}>
          <input className={inputCls(!!errors.designation)} placeholder="e.g. Accountant, Driver" value={data.designation || ''} onChange={e => set('designation', e.target.value)} />
        </Field>
        <SelectField 
          label="Status" 
          value={data.status || 'Active'} 
          onChange={v => set('status', v)} 
          options={['Active', 'Inactive']} 
          placeholder="Select Status"
        />
      </div>

      <SectionTitle>Personal Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="First Name" required error={errors.firstName}>
          <input className={inputCls(!!errors.firstName)} placeholder="Enter First Name" value={data.firstName || ''} onChange={e => set('firstName', e.target.value)} />
        </Field>
        <Field label="Last Name">
          <input className={inputCls(false)} placeholder="Enter Last Name" value={data.lastName || ''} onChange={e => set('lastName', e.target.value)} />
        </Field>
        <Field label="Mobile No." required error={errors.contact}>
          <input className={inputCls(!!errors.contact)} placeholder="Enter 10-digit Mobile No." value={data.contact || ''} onChange={e => set('contact', e.target.value)} maxLength={10} />
        </Field>
        <Field label="Alt. Contact No.">
          <input className={inputCls(false)} placeholder="Enter Alt. Mobile No." value={data.altContact || ''} onChange={e => set('altContact', e.target.value)} maxLength={10} />
        </Field>
        <Field label="Email ID">
          <input type="email" className={inputCls(false)} placeholder="Enter Email" value={data.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>
        <SelectField label="Gender" required value={data.gender || ''} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} error={errors.gender} />
        <Field label="Date of Birth">
          <input type="date" className={inputCls(false)} value={data.dob || ''} onChange={e => set('dob', e.target.value)} />
        </Field>
        <Field label="Father / Husband Name">
          <input className={inputCls(false)} placeholder="Enter Father/Husband Name" value={data.fatherName || ''} onChange={e => set('fatherName', e.target.value)} />
        </Field>
        <SelectField label="Marital Status" value={data.maritalStatus || ''} onChange={v => set('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} />
        <SelectField label="Religion" value={data.religion || ''} onChange={v => set('religion', v)} options={['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']} />
        <SelectField label="Category" value={data.category || ''} onChange={v => set('category', v)} options={['General', 'OBC', 'SC', 'ST', 'EWS']} />
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
      <div>
        <SectionTitle>Qualification Details</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['Qualification', 'Pass. Year', 'Obt. Marks', 'Percentage', 'College / Institute', 'Document'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quals.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 px-3">
                      <button type="button" onClick={() => removeQual(i)} disabled={quals.length === 1}
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="e.g. 12th / Graduation" value={row.qualification} onChange={e => updateQual(i, 'qualification', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Year" value={row.passYear} onChange={e => updateQual(i, 'passYear', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Marks" value={row.obtMarks} onChange={e => updateQual(i, 'obtMarks', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="%" value={row.percentage} onChange={e => updateQual(i, 'percentage', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="College / Board Name" value={row.college} onChange={e => updateQual(i, 'college', e.target.value)} /></td>
                    <td className="py-2.5 px-2">
                      <button type="button" className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap cursor-pointer">
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
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Additional Qualification / Certification</SectionTitle>
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
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="e.g. DCA / Tally / PGDCA" value={row.course} onChange={e => updateAq(i, 'course', e.target.value)} /></td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Year" value={row.passYear} onChange={e => updateAq(i, 'passYear', e.target.value)} /></td>
                    <td className="py-2.5 px-2">
                      <button type="button" className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap cursor-pointer">
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
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Work Experience</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['School / Organization Name', 'Designation', 'From Date', 'To Date'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exp.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2.5 px-3">
                      <button type="button" onClick={() => removeExp(i)} disabled={exp.length === 1}
                        className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="e.g. ABC Public School" value={row.school} onChange={e => updateExp(i, 'school', e.target.value)} /></td>
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
              className="w-8 h-8 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center shadow cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Address Details ──────────────────────────────────────────────────
function AddressDetailsStep({ data, setData, statesData }: { data: any; setData: (d: any) => void; statesData: any[] }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  const currentStateObj = statesData.find((s: any) => s.state === data.state)
  const districtOptions = currentStateObj?.districts?.map((d: any) => typeof d === 'string' ? d : d.district || d.name) || []

  return (
    <div className="space-y-6">
      <SectionTitle>Address Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Address Line 1">
            <input className={inputCls(false)} placeholder="House/Flat No., Building Name, Street" value={data.address1 || ''} onChange={e => set('address1', e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Address Line 2 (Optional)">
            <input className={inputCls(false)} placeholder="Landmark, Area, Locality" value={data.address2 || ''} onChange={e => set('address2', e.target.value)} />
          </Field>
        </div>

        <Field label="State">
          <div className="relative">
            <select 
              value={data.state || ''} 
              onChange={e => {
                set('state', e.target.value)
                set('district', '')
              }}
              className={`${inputCls(false)} appearance-none cursor-pointer pr-10`}
            >
              <option value="">Select State</option>
              {statesData.map((s: any, idx: number) => (
                <option key={`${s.id || s.state}-${idx}`} value={s.state}>{s.state}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="District / City (Optional)">
          <div className="relative">
            <select
              value={data.district || ''}
              onChange={e => set('district', e.target.value)}
              disabled={!data.state || districtOptions.length === 0}
              className={`${inputCls(false)} appearance-none cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">{data.state ? 'Select District' : 'Select State First'}</option>
              {districtOptions.map((d: string, idx: number) => (
                <option key={`${d}-${idx}`} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="Pincode">
          <input className={inputCls(false)} placeholder="e.g. 201301" value={data.pincode || ''} onChange={e => set('pincode', e.target.value)} maxLength={6} />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 4: Payroll & Leave ──────────────────────────────────────────────────
function PayrollLeaveStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const [customAllowances, setCustomAllowances] = useState<any[]>(() => {
    if (Array.isArray(data.customAllowances) && data.customAllowances.length > 0) {
      return data.customAllowances
    }
    return []
  })

  const calculateGross = (fields: any, allowances: any[]) => {
    const basic = Number(fields.basicSalary) || 0
    const hra = Number(fields.hra) || 0
    const conv = Number(fields.conveyance) || 0
    const spec = Number(fields.specialAllowance) || 0
    const dynamicTotal = (allowances || []).reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)
    const gross = basic + hra + conv + spec + dynamicTotal
    return gross > 0 ? String(gross) : ''
  }

  const set = (k: string, v: any) => {
    const next = { ...data, [k]: v }
    next.grossSalary = calculateGross(next, customAllowances)
    setData(next)
  }

  const addCustomAllowance = () => {
    const newRow = { id: Date.now(), title: 'Other Allowance', amount: '' }
    const updated = [...customAllowances, newRow]
    setCustomAllowances(updated)
    const next = { ...data, customAllowances: updated }
    next.grossSalary = calculateGross(next, updated)
    setData(next)
  }

  const updateCustomAllowance = (index: number, field: string, val: string) => {
    const updated = [...customAllowances]
    updated[index] = { ...updated[index], [field]: val }
    setCustomAllowances(updated)
    const next = { ...data, customAllowances: updated }
    next.grossSalary = calculateGross(next, updated)
    setData(next)
  }

  const removeCustomAllowance = (index: number) => {
    const updated = customAllowances.filter((_, i) => i !== index)
    setCustomAllowances(updated)
    const next = { ...data, customAllowances: updated }
    next.grossSalary = calculateGross(next, updated)
    setData(next)
  }

  const [leaveEffectiveDate, setLeaveEffectiveDate] = useState<string>(() => {
    return data.leaveEffectiveDate || data.casualLeaveFrom || data.applyFrom || ''
  })

  const [allocatedLeaves, setAllocatedLeaves] = useState<any[]>(() => {
    if (Array.isArray(data.allocatedLeaves) && data.allocatedLeaves.length > 0) {
      return data.allocatedLeaves
    }
    const defaultDate = data.leaveEffectiveDate || data.casualLeaveFrom || ''
    return [
      { id: 1, leaveType: 'Casual Leave', leaveAbbr: 'CL', allowedLeaves: data.casualLeaveNo || '12', applyFrom: defaultDate },
      { id: 2, leaveType: 'Medical Leave', leaveAbbr: 'ML', allowedLeaves: data.medicalLeaveNo || '10', applyFrom: defaultDate },
      { id: 3, leaveType: 'Half Day Leave', leaveAbbr: 'HDL', allowedLeaves: data.halfDayLeaveNo || '6', applyFrom: defaultDate },
      { id: 4, leaveType: 'Sick Leave', leaveAbbr: 'SL', allowedLeaves: '8', applyFrom: defaultDate }
    ]
  })

  const handleLeaveDateChange = (val: string) => {
    setLeaveEffectiveDate(val)
    const updatedLeaves = allocatedLeaves.map(l => ({ ...l, applyFrom: val }))
    setAllocatedLeaves(updatedLeaves)
    setData({
      ...data,
      leaveEffectiveDate: val,
      casualLeaveFrom: val,
      medicalLeaveFrom: val,
      halfDayLeaveFrom: val,
      allocatedLeaves: updatedLeaves
    })
  }

  const updateLeaveRow = (index: number, field: string, val: string) => {
    const updated = [...allocatedLeaves]
    updated[index] = { ...updated[index], [field]: val }
    setAllocatedLeaves(updated)
    set('allocatedLeaves', updated)
  }

  const addCustomLeave = () => {
    const newRow = { id: Date.now(), leaveType: 'Special Leave', leaveAbbr: 'SPL', allowedLeaves: '5', applyFrom: leaveEffectiveDate }
    const updated = [...allocatedLeaves, newRow]
    setAllocatedLeaves(updated)
    set('allocatedLeaves', updated)
  }

  const removeCustomLeave = (index: number) => {
    const updated = allocatedLeaves.filter((_, i) => i !== index)
    setAllocatedLeaves(updated)
    set('allocatedLeaves', updated)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Monthly Salary Structure</SectionTitle>
          <button 
            type="button" 
            onClick={addCustomAllowance} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Salary Title (Other)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Applicable Start Date">
            <input type="date" className={inputCls(false)} value={data.applicableStartDate || ''} onChange={e => set('applicableStartDate', e.target.value)} />
          </Field>
          <Field label="Basic Salary (₹)">
            <input type="number" className={inputCls(false)} placeholder="e.g. 25000" value={data.basicSalary || ''} onChange={e => set('basicSalary', e.target.value)} />
          </Field>
          <Field label="HRA (₹)">
            <input type="number" className={inputCls(false)} placeholder="e.g. 5000" value={data.hra || ''} onChange={e => set('hra', e.target.value)} />
          </Field>
          <Field label="Conveyance Allowance (₹)">
            <input type="number" className={inputCls(false)} placeholder="e.g. 2000" value={data.conveyance || ''} onChange={e => set('conveyance', e.target.value)} />
          </Field>
          <Field label="Special Allowance (₹)">
            <input type="number" className={inputCls(false)} placeholder="e.g. 3000" value={data.specialAllowance || ''} onChange={e => set('specialAllowance', e.target.value)} />
          </Field>

          {/* Dynamic Additional Salary Titles */}
          {customAllowances.map((item, idx) => (
            <div key={item.id || idx} className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-center">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Salary Title / Component</label>
                <input 
                  className={inputCls(false)} 
                  placeholder="e.g. Other Allowance, Medical, Bonus" 
                  value={item.title || ''} 
                  onChange={e => updateCustomAllowance(idx, 'title', e.target.value)} 
                  list="edit-emp-salary-titles"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  className={inputCls(false)} 
                  placeholder="e.g. 2000" 
                  value={item.amount || ''} 
                  onChange={e => updateCustomAllowance(idx, 'amount', e.target.value)} 
                />
              </div>
              <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-4">
                <button type="button" onClick={() => removeCustomAllowance(idx)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Gross Monthly Salary ALWAYS IN LAST */}
          <Field label="Gross Monthly Salary (₹)">
            <input 
              type="number" 
              readOnly 
              className={`${inputCls(false)} bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-black cursor-not-allowed`} 
              placeholder="Auto-calculated" 
              value={data.grossSalary || ''} 
            />
          </Field>
        </div>

        <datalist id="edit-emp-salary-titles">
          <option value="Other Allowance" />
          <option value="Medical Allowance" />
          <option value="Performance Allowance" />
          <option value="Dearness Allowance (DA)" />
          <option value="Bonus" />
          <option value="Incentive" />
        </datalist>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-4 flex-wrap">
            <SectionTitle>Allocated Leave Quota</SectionTitle>
            {/* Monthly / Annually Radio Buttons */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input 
                  type="radio" 
                  name="editEmpLeaveQuotaFrequency" 
                  value="Monthly" 
                  checked={(data.leaveQuotaFrequency || 'Annually') === 'Monthly'} 
                  onChange={() => set('leaveQuotaFrequency', 'Monthly')} 
                  className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                />
                <span>Monthly</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input 
                  type="radio" 
                  name="editEmpLeaveQuotaFrequency" 
                  value="Annually" 
                  checked={(data.leaveQuotaFrequency || 'Annually') === 'Annually'} 
                  onChange={() => set('leaveQuotaFrequency', 'Annually')} 
                  className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600" 
                />
                <span>Annually</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap">
                Effective Date:
              </label>
              <input 
                type="date" 
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                value={leaveEffectiveDate} 
                onChange={e => handleLeaveDateChange(e.target.value)} 
              />
            </div>
            <button type="button" onClick={addCustomLeave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Leave Type</span>
            </button>
          </div>
        </div>
        <div className="space-y-3 mt-3">
          {allocatedLeaves.map((row, i) => (
            <div key={row.id || i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-center">
              <div className="sm:col-span-6">
                <input className={inputCls(false)} placeholder="Leave Name" value={row.leaveType || ''} onChange={e => updateLeaveRow(i, 'leaveType', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <input className={inputCls(false)} placeholder="Abbr" value={row.leaveAbbr || ''} onChange={e => updateLeaveRow(i, 'leaveAbbr', e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <input 
                  type="number" 
                  className={inputCls(false)} 
                  placeholder={(data.leaveQuotaFrequency || 'Annually') === 'Monthly' ? 'Days / Month' : 'Days / Year'} 
                  value={row.allowedLeaves || ''} 
                  onChange={e => updateLeaveRow(i, 'allowedLeaves', e.target.value)} 
                />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <button type="button" onClick={() => removeCustomLeave(i)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Payment Details ──────────────────────────────────────────────────
function PaymentDetailsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <SectionTitle>Bank Account Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Account Holder Name">
          <input className={inputCls(false)} placeholder="Enter Account Holder Name" value={data.accountName || ''} onChange={e => set('accountName', e.target.value)} />
        </Field>
        <Field label="Account Number">
          <input className={inputCls(false)} placeholder="Enter Account Number" value={data.accountNo || ''} onChange={e => set('accountNo', e.target.value)} />
        </Field>
        <Field label="IFSC Code">
          <input className={inputCls(false)} placeholder="e.g. SBIN0001234" value={data.ifsc || ''} onChange={e => set('ifsc', e.target.value)} />
        </Field>
        <Field label="Bank Name">
          <input className={inputCls(false)} placeholder="Enter Bank Name" value={data.bankName || ''} onChange={e => set('bankName', e.target.value)} />
        </Field>
        <Field label="Branch Name">
          <input className={inputCls(false)} placeholder="Enter Branch Name" value={data.branchName || ''} onChange={e => set('branchName', e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Statutory &amp; Digital Payments</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="PAN Card No.">
          <input className={inputCls(false)} placeholder="e.g. ABCDE1234F" value={data.panNo || ''} onChange={e => set('panNo', e.target.value)} maxLength={10} />
        </Field>
        <Field label="UPI ID">
          <input className={inputCls(false)} placeholder="e.g. name@okhdfcbank" value={data.upiId || ''} onChange={e => set('upiId', e.target.value)} />
        </Field>
        <Field label="UAN Number">
          <input className={inputCls(false)} placeholder="Universal Account Number" value={data.uan || ''} onChange={e => set('uan', e.target.value)} />
        </Field>
        <Field label="PF Account Number">
          <input className={inputCls(false)} placeholder="Provident Fund No." value={data.pfNo || ''} onChange={e => set('pfNo', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

// ─── Main EditEmployeeModal Component ─────────────────────────────────────────
export interface EditEmployeeModalProps {
  isOpen: boolean
  employeeId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export default function EditEmployeeModal({ isOpen, employeeId, onClose, onSuccess }: EditEmployeeModalProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({
    personal: {},
    qualification: {},
    address: {},
    payroll: {},
    payment: {},
  })

  const [roles, setRoles] = useState<any[]>([])
  const [statesData, setStatesData] = useState<any[]>([])
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [bannerError, setBannerError] = useState<string>('')

  useEffect(() => {
    if (!isOpen || !employeeId) {
      setStep(0)
      setFormData({
        personal: {},
        qualification: {},
        address: {},
        payroll: {},
        payment: {},
      })
      setStepErrors({})
      setBannerError('')
      return
    }

    setLoading(true)

    // Load roles & states
    fetchEmployeeRoles().then(res => {
      if (res.success && Array.isArray(res.data)) setRoles(res.data)
    })
    fetchStatesDistricts().then(res => {
      if (res.success && Array.isArray(res.data)) setStatesData(res.data)
    })

    // Fetch employee data
    fetchEmployeeById(employeeId).then(res => {
      if (res.success && res.data) {
        const emp = res.data
        const details = emp.details || {}

        // Split fullName into first and last if needed
        let firstName = details.personal?.firstName || ''
        let lastName = details.personal?.lastName || ''
        if (!firstName && emp.name) {
          const parts = emp.name.split(' ')
          firstName = parts[0] || ''
          lastName = parts.slice(1).join(' ') || ''
        }

        const initial = {
          personal: {
            role: emp.role || details.personal?.role || '',
            staffId: emp.username || details.personal?.staffId || '',
            username: emp.username || details.personal?.username || '',
            joiningDate: emp.joiningDate || details.personal?.joiningDate || '',
            designation: details.personal?.designation || emp.role || 'Staff',
            status: emp.status || details.personal?.status || 'Active',
            firstName,
            lastName,
            contact: emp.contact || details.personal?.contact || '',
            altContact: details.personal?.altContact || '',
            email: emp.email || details.personal?.email || '',
            gender: details.personal?.gender || 'Male',
            dob: details.personal?.dob || '',
            fatherName: details.personal?.fatherName || '',
            maritalStatus: details.personal?.maritalStatus || 'Single',
            religion: details.personal?.religion || 'Hindu',
            category: details.personal?.category || 'General',
            photo: emp.avatar || details.personal?.photo || '',
            ...(details.personal || {})
          },
          qualification: details.qualification || {},
          address: details.address || {},
          payroll: {
            applicableStartDate: details.payroll?.applicableStartDate || emp.applicableStartDate || '',
            basicSalary: details.payroll?.basicSalary || (emp.basicSalary ? String(emp.basicSalary) : ''),
            grossSalary: details.payroll?.grossSalary || (emp.grossSalary ? String(emp.grossSalary) : ''),
            leaveQuotaFrequency: details.payroll?.leaveQuotaFrequency || emp.leaveQuotaFrequency || 'Annually',
            customAllowances: details.payroll?.customAllowances || [],
            leaveEffectiveDate: details.payroll?.leaveEffectiveDate || emp.leaveEffectiveDate || details.payroll?.casualLeaveFrom || '',
            ...(details.payroll || {})
          },
          payment: details.payment || {}
        }

        setFormData(initial)
      } else {
        setBannerError(res.error || 'Failed to load employee details')
      }
      setLoading(false)
    }).catch(err => {
      setBannerError(err.message || 'Error loading employee')
      setLoading(false)
    })
  }, [isOpen, employeeId])

  if (!isOpen) return null

  const updateStepData = (stepKey: string, data: any) => {
    setFormData((prev: any) => ({ ...prev, [stepKey]: data }))
    setStepErrors({})
    setBannerError('')
  }

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 0) {
      const p = formData.personal || {}
      if (!p.role?.trim()) errs.role = 'Role is required'
      if (!p.staffId?.trim()) errs.staffId = 'Staff ID / Username is required'
      if (!p.joiningDate) errs.joiningDate = 'Joining date is required'
      if (!p.designation?.trim()) errs.designation = 'Designation is required'
      if (!p.firstName?.trim()) errs.firstName = 'First name is required'
      if (!p.contact?.trim()) errs.contact = 'Mobile number is required'
      else if (!/^\d{10}$/.test(p.contact.trim())) errs.contact = 'Mobile number must be 10 digits'
      if (!p.gender) errs.gender = 'Gender is required'
    }
    setStepErrors(errs)
    if (Object.keys(errs).length > 0) {
      setBannerError('Please complete all required fields highlighted in red before proceeding.')
      return false
    }
    setBannerError('')
    return true
  }

  const handleStepClick = (targetStep: number) => {
    if (targetStep > step) {
      for (let i = step; i < targetStep; i++) {
        if (!validateStep(i)) return
      }
    }
    setStep(targetStep)
    setStepErrors({})
    setBannerError('')
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
    if (!employeeId) return
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }

    setSubmitting(true)
    setBannerError('')

    try {
      const res = await updateEmployee(employeeId, formData)
      if (res.success) {
        toast.success('Employee updated successfully')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setBannerError(res.error || 'Failed to update employee')
      }
    } catch (err: any) {
      setBannerError(err.message || 'An error occurred while updating employee')
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
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Employee</h2>
            <p className="text-xs text-slate-500 font-medium">Update staff details, qualifications, salary structure, and leave quota</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Error */}
        {bannerError && (
          <div className="px-6 py-2.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{bannerError}</span>
          </div>
        )}

        {/* Stepper Tabs Bar */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-2 min-w-max">
            {STEPS.map((s, idx) => {
              const isActive = idx === step
              const isPast = idx < step
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : isPast
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : isPast ? 'bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span>{s}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs font-bold">Loading employee data...</p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <PersonalDetailsStep 
                  data={formData.personal || {}} 
                  setData={d => updateStepData('personal', d)} 
                  roles={roles} 
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
                />
              )}
              {step === 3 && (
                <PayrollLeaveStep 
                  data={formData.payroll || {}} 
                  setData={d => updateStepData('payroll', d)} 
                />
              )}
              {step === 4 && (
                <PaymentDetailsStep 
                  data={formData.payment || {}} 
                  setData={d => updateStepData('payment', d)} 
                />
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
              >
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Update Employee</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
