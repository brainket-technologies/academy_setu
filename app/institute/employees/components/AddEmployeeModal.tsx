'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, Upload, Calendar, ChevronDown, ChevronLeft, ChevronRight, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createEmployee } from '../actions'
import { fetchEmployeeRoles } from '../roles/actions'
import { fetchStatesDistricts } from '../../actions'

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
    <h3 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest pb-2 border-b border-teal-100 dark:border-teal-900/40 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-teal-500" />
      {children}
    </h3>
  )
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function PersonalDetailsStep({ data, setData, roles, errors }: { data: any; setData: (d: any) => void; roles: any[]; errors: Record<string, string> }) {
  const [showPassword, setShowPassword] = useState(false)
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
        <Field label="Staff ID" required error={errors.staffId}>
          <input className={inputCls(!!errors.staffId)} placeholder="e.g. EMP101" value={data.staffId || ''} onChange={e => set('staffId', e.target.value)} />
        </Field>
        <Field label="Joining Date" required error={errors.joiningDate}>
          <input type="date" className={inputCls(!!errors.joiningDate)} value={data.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)} />
        </Field>
        <Field label="Designation" required error={errors.designation}>
          <input className={inputCls(!!errors.designation)} placeholder="e.g. Accountant, Driver" value={data.designation || ''} onChange={e => set('designation', e.target.value)} />
        </Field>
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
      {/* Qualification Details */}
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

      {/* Additional Qualification */}
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
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="e.g. Computer Course / Driving License" value={row.course} onChange={e => updateAq(i, 'course', e.target.value)} /></td>
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

      {/* Experience */}
      <div>
        <SectionTitle>Previous Work Experience</SectionTitle>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="w-8 py-3 px-3" />
                  {['Organization / School', 'Designation', 'From Date', 'To Date'].map(h => (
                    <th key={h} className="py-3 px-3 text-xs font-black text-slate-600 dark:text-slate-300 text-left">{h}</th>
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
                    <td className="py-2.5 px-2"><input className={rowInput} placeholder="Organization Name" value={row.school} onChange={e => updateExp(i, 'school', e.target.value)} /></td>
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
function AddressDetailsStep({ data, setData, statesData, errors }: { data: any; setData: (d: any) => void; statesData: any[]; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  const stateNames = (statesData || []).map(s => s.state).filter(Boolean)
  const selectedStateObj = (statesData || []).find(s => s.state?.toLowerCase() === (data.state || '').toLowerCase())
  const districtOptions = selectedStateObj ? selectedStateObj.districts : []

  return (
    <div className="space-y-6">
      <SectionTitle>Identity Documents</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Aadhar Card No.">
          <input className={inputCls(false)} placeholder="Enter 12-digit Aadhar Card No." value={data.aadhar || ''} onChange={e => set('aadhar', e.target.value)} maxLength={12} />
        </Field>
        <FileUploadField label="Aadhar Card File" value={data.aadharFile || ''} onChange={v => set('aadharFile', v)} />
      </div>

      <SectionTitle>Address Information</SectionTitle>
      <div className="grid grid-cols-1 gap-5">
        <Field label="Full Address">
          <textarea 
            rows={3} 
            className={`${inputCls(false)} resize-none`} 
            placeholder="Enter Street Address, Locality, House No." 
            value={data.address || ''} 
            onChange={e => set('address', e.target.value)} 
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="State (Optional)">
          <div className="relative">
            <select
              value={data.state || ''}
              onChange={e => {
                const v = e.target.value
                setData({ ...data, state: v, district: '' })
              }}
              className={`${inputCls(false)} appearance-none cursor-pointer pr-10`}
            >
              <option value="">Select State</option>
              {stateNames.map((s, idx) => <option key={`${s}-${idx}`} value={s}>{s}</option>)}
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
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/leaves')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLeaveTypes(json.data.filter((l: any) => l.status === 'Active'))
        }
      })
      .catch(() => {})
  }, [])

  const set = (k: string, v: string) => {
    const updated = { ...data, [k]: v }
    if (['basicSalary', 'hra', 'conveyance', 'specialAllowance'].includes(k)) {
      const basic = parseFloat(k === 'basicSalary' ? v : updated.basicSalary || '0') || 0
      const hra = parseFloat(k === 'hra' ? v : updated.hra || '0') || 0
      const conv = parseFloat(k === 'conveyance' ? v : updated.conveyance || '0') || 0
      const spec = parseFloat(k === 'specialAllowance' ? v : updated.specialAllowance || '0') || 0
      updated.grossSalary = (basic + hra + conv + spec).toString()
    }
    setData(updated)
  }

  const defaultLeaves = [
    { key: 'casualLeave', label: 'Casual Leave (CL)', default: '12' },
    { key: 'medicalLeave', label: 'Medical Leave (ML)', default: '12' },
    { key: 'halfDayLeave', label: 'Half Day Leave', default: '6' },
    { key: 'maternityLeave', label: 'Maternity Leave', default: '0' },
    { key: 'bereavementLeave', label: 'Bereavement Leave', default: '0' },
    { key: 'compensatoryLeave', label: 'Compensatory Leave', default: '0' },
  ]

  return (
    <div className="space-y-6">
      <SectionTitle>Annual Leave Quota</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {leaveTypes.length > 0 ? (
          leaveTypes.map((lt: any) => {
            const key = `leave_${lt.id}`
            return (
              <Field key={lt.id} label={`${lt.name} (Days/Yr)`}>
                <input 
                  type="number" 
                  min="0" 
                  className={inputCls(false)} 
                  placeholder={String(lt.leavesCount || '0')} 
                  value={data[key] !== undefined ? data[key] : (lt.leavesCount || '')} 
                  onChange={e => set(key, e.target.value)} 
                />
              </Field>
            )
          })
        ) : (
          defaultLeaves.map(l => (
            <Field key={l.key} label={l.label}>
              <input 
                type="number" 
                min="0" 
                className={inputCls(false)} 
                placeholder={l.default} 
                value={data[l.key] || ''} 
                onChange={e => set(l.key, e.target.value)} 
              />
            </Field>
          ))
        )}
      </div>

      <SectionTitle>Salary Structure (Monthly)</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Basic Salary">
          <input type="number" className={inputCls(false)} placeholder="e.g. 15000" value={data.basicSalary || ''} onChange={e => set('basicSalary', e.target.value)} />
        </Field>
        <Field label="HRA (House Rent Allowance)">
          <input type="number" className={inputCls(false)} placeholder="e.g. 3000" value={data.hra || ''} onChange={e => set('hra', e.target.value)} />
        </Field>
        <Field label="Conveyance Allowance">
          <input type="number" className={inputCls(false)} placeholder="e.g. 1500" value={data.conveyance || ''} onChange={e => set('conveyance', e.target.value)} />
        </Field>
        <Field label="Special Allowance">
          <input type="number" className={inputCls(false)} placeholder="e.g. 2000" value={data.specialAllowance || ''} onChange={e => set('specialAllowance', e.target.value)} />
        </Field>
        <Field label="Gross Salary (Auto-Calculated)">
          <input className={`${inputCls(false)} bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold`} placeholder="Gross Total" value={data.grossSalary || ''} readOnly />
        </Field>
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

// ─── Main AddEmployeeModal Component ──────────────────────────────────────────
export default function AddEmployeeModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: () => void 
}) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<any>({
    personal: {},
    qualification: {},
    address: {},
    payroll: {},
    payment: {},
  })

  const [roles, setRoles] = useState<any[]>([])
  const [statesData, setStatesData] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [bannerError, setBannerError] = useState<string>('')

  // Load dropdown data when modal opens
  useEffect(() => {
    if (!isOpen) return

    fetchEmployeeRoles().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setRoles(res.data)
      }
    })

    fetchStatesDistricts().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setStatesData(res.data)
      }
    })
  }, [isOpen])

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
      if (!p.staffId?.trim()) errs.staffId = 'Staff ID is required'
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
      const res = await createEmployee(formData)
      if (res.success) {
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setBannerError(res.error || 'Failed to add employee')
      }
    } catch (err: any) {
      setBannerError(err.message || 'An error occurred while saving employee')
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
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Add Employee</h2>
            <p className="text-xs text-slate-500 font-medium">Create a new staff / employee profile</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-5 py-3 flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {STEPS.map((s, i) => {
              const isPast = i < step
              const isCurrent = i === step
              return (
                <React.Fragment key={i}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(i)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isCurrent
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25 ring-2 ring-teal-600/30'
                        : isPast
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100/80 dark:hover:bg-teal-900/60'
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-white text-teal-700'
                          : isPast
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                    </span>
                    <span>{s}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-3 shrink-0 rounded-full transition-colors ${
                        i < step ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
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
              errors={stepErrors}
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
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60 flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 active:scale-95 text-white transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
                <span>Save Employee</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
