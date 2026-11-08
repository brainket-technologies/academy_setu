'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, Upload, Calendar, ChevronDown, ChevronLeft, ChevronRight, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { fetchTeacherById, updateTeacher } from '../actions'
import { fetchStatesDistricts } from '../../actions'
import { useClasses, useDepartments, useSubjects } from '@/lib/mastersData'
import { toast } from 'sonner'

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
        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-teal-400 hover:bg-teal-50/30 transition-colors group cursor-pointer"
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
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              className={`${inputCls(!!errors.password)} pr-10`} 
              placeholder="Leave blank to keep current" 
              value={data.password || ''} 
              onChange={e => set('password', e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(p => !p)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <Field label="Contact No." required error={errors.contact}>
          <input className={inputCls(!!errors.contact)} placeholder="10-digit Mobile No." value={data.contact || ''} onChange={e => set('contact', e.target.value)} />
        </Field>
        <Field label="Alt. Contact No.">
          <input className={inputCls()} placeholder="Enter Alt. Mobile No." value={data.altContact || ''} onChange={e => set('altContact', e.target.value)} />
        </Field>
        <Field label="Email ID" required error={errors.email}>
          <input type="email" className={inputCls(!!errors.email)} placeholder="Enter Email" value={data.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <div className="relative">
            <input type="date" className={inputCls()} value={data.dob || ''} onChange={e => set('dob', e.target.value)} />
          </div>
        </Field>
        <SelectField label="Gender" required value={data.gender || ''} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} placeholder="Select Gender" error={errors.gender} />
        <SelectField 
          label="Department" 
          required 
          value={data.department || ''} 
          onChange={v => set('department', v)} 
          options={departments.map((d: any) => d.name || d.departmentName || d)} 
          placeholder="Select Department" 
          error={errors.department} 
        />
        <Field label="Designation" required error={errors.designation}>
          <input className={inputCls(!!errors.designation)} placeholder="e.g. Senior Teacher / TGT" value={data.designation || ''} onChange={e => set('designation', e.target.value)} />
        </Field>
        <SelectField label="Status" value={data.status || 'Active'} onChange={v => set('status', v)} options={['Active', 'Inactive']} placeholder="Select Status" />
      </div>

      <SectionTitle>Joining &amp; Profile Picture</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Joining Date">
          <div className="relative">
            <input type="date" className={inputCls()} value={data.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)} />
          </div>
        </Field>
        <FileUploadField label="Photo" value={data.photo || ''} onChange={v => set('photo', v)} />
      </div>
    </div>
  )
}

// ─── Step 2: Qualification Details ───────────────────────────────────────────
function QualificationDetailsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <SectionTitle>Highest Qualification</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Degree / Diploma">
          <input className={inputCls()} placeholder="e.g. B.Ed, M.Sc, B.Tech" value={data.degree || ''} onChange={e => set('degree', e.target.value)} />
        </Field>
        <Field label="Specialization / Major">
          <input className={inputCls()} placeholder="e.g. Mathematics, Physics" value={data.major || ''} onChange={e => set('major', e.target.value)} />
        </Field>
        <Field label="University / Institute">
          <input className={inputCls()} placeholder="Enter University / College" value={data.institute || ''} onChange={e => set('institute', e.target.value)} />
        </Field>
        <Field label="Year of Passing">
          <input className={inputCls()} placeholder="e.g. 2018" value={data.passingYear || ''} onChange={e => set('passingYear', e.target.value)} />
        </Field>
        <Field label="Percentage / CGPA">
          <input className={inputCls()} placeholder="e.g. 82% or 8.5" value={data.percentage || ''} onChange={e => set('percentage', e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Teaching Experience</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Total Experience (Years)">
          <input className={inputCls()} placeholder="e.g. 5 Years" value={data.experience || ''} onChange={e => set('experience', e.target.value)} />
        </Field>
        <Field label="Previous School / Institute">
          <input className={inputCls()} placeholder="Enter Previous School" value={data.previousSchool || ''} onChange={e => set('previousSchool', e.target.value)} />
        </Field>
        <FileUploadField label="Resume / CV" value={data.resume || ''} onChange={v => set('resume', v)} />
      </div>
    </div>
  )
}

// ─── Step 3: Address Details ──────────────────────────────────────────────────
function AddressDetailsStep({ data, setData, statesData, errors }: { data: any; setData: (d: any) => void; statesData: any[]; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  const stateObj = statesData.find((s: any) => (s.state_name || s.state || s.name) === data.state)
  const districts = stateObj ? (stateObj.districts || []) : []
  const districtOptions = districts.map((d: any) => typeof d === 'string' ? d : (d.city_name || d.name || d.district || ''))

  return (
    <div className="space-y-6">
      <SectionTitle>Current Residential Address</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Full Street Address" required error={errors.address}>
            <input className={inputCls(!!errors.address)} placeholder="House / Flat No., Street, Area" value={data.address || ''} onChange={e => set('address', e.target.value)} />
          </Field>
        </div>
        <Field label="City / Town">
          <input className={inputCls()} placeholder="Enter City" value={data.city || ''} onChange={e => set('city', e.target.value)} />
        </Field>
        <SelectField 
          label="State" 
          value={data.state || ''} 
          onChange={v => { set('state', v); set('district', '') }} 
          options={statesData.map((s: any) => s.state_name || s.state || s.name).filter(Boolean)} 
          placeholder="Select State" 
        />
        <SelectField 
          label="District" 
          value={data.district || ''} 
          onChange={v => set('district', v)} 
          options={districtOptions.filter(Boolean)} 
          placeholder="Select District" 
        />
        <Field label="Pin Code">
          <input className={inputCls()} placeholder="6-digit Pincode" value={data.pincode || ''} onChange={e => set('pincode', e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Permanent Address &amp; National IDs</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Permanent Address">
            <input className={inputCls()} placeholder="Same as current or enter permanent address" value={data.permanentAddress || ''} onChange={e => set('permanentAddress', e.target.value)} />
          </Field>
        </div>
        <Field label="Aadhar Card No." error={errors.aadhar}>
          <input className={inputCls(!!errors.aadhar)} placeholder="12-digit Aadhar Number" value={data.aadhar || ''} onChange={e => set('aadhar', e.target.value)} />
        </Field>
        <Field label="PAN Card No.">
          <input className={inputCls()} placeholder="10-digit PAN Number" value={data.pan || ''} onChange={e => set('pan', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 4: Assign Class & Section ───────────────────────────────────────────
function AssignClassStep({ data, setData, classesData, subjectsData }: { data: any; setData: (d: any) => void; classesData: any[]; subjectsData: any[] }) {
  const assigned = Array.isArray(data.assignedClasses) && data.assignedClasses.length > 0 
    ? data.assignedClasses 
    : [{ class: '', section: '', subject: '' }]
  const classTeacher = data.classTeacher || { class: '', section: '', subject: '' }

  const classOptions = classesData.map((c: any) => c.className || c.name || '')
  const subjectOptions = subjectsData.map((s: any) => s.subjectName || s.name || '')

  const updateAssigned = (index: number, field: string, val: string) => {
    const updated = [...assigned]
    updated[index] = { ...updated[index], [field]: val }
    if (field === 'class') {
      updated[index].section = ''
    }
    setData({ ...data, assignedClasses: updated })
  }

  const addAssigned = () => {
    setData({ ...data, assignedClasses: [...assigned, { class: '', section: '', subject: '' }] })
  }

  const removeAssigned = (index: number) => {
    const updated = assigned.filter((_: any, i: number) => i !== index)
    setData({ ...data, assignedClasses: updated.length > 0 ? updated : [{ class: '', section: '', subject: '' }] })
  }

  const updateClassTeacher = (field: string, val: string) => {
    const next = { ...classTeacher, [field]: val }
    if (field === 'class') next.section = ''
    setData({ ...data, classTeacher: next })
  }

  const getClassSections = (clsName: string) => {
    const cls = classesData.find((c: any) => (c.className || c.name) === clsName)
    if (!cls || !cls.sections) return []
    return cls.sections.map((s: any) => typeof s === 'string' ? s : (s?.sectionName || s?.name || 'A'))
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Assign Class &amp; Section</SectionTitle>
        <p className="text-xs text-slate-400 mb-4 font-medium">Assign classes and subjects this faculty member will teach.</p>
        <div className="space-y-4">
          {assigned.map((row: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row items-end gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex-1 w-full"><SelectField label="Class" value={row.class || ''} onChange={v => updateAssigned(i, 'class', v)} options={classOptions} placeholder="Select Class" /></div>
              <div className="flex-1 w-full"><SelectField label="Section" value={row.section || ''} onChange={v => updateAssigned(i, 'section', v)} options={getClassSections(row.class)} placeholder="Select Section" /></div>
              <div className="flex-1 w-full"><SelectField label="Subject" value={row.subject || ''} onChange={v => updateAssigned(i, 'subject', v)} options={subjectOptions} placeholder="Select Subject" /></div>
              <div className="pb-1 self-end">
                {assigned.length > 1 && (
                  <button type="button" onClick={() => removeAssigned(i)} className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <button type="button" onClick={addAssigned} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Another Class &amp; Subject</span>
            </button>
          </div>
        </div>
      </div>
      <div>
        <SectionTitle>Assign as a Class Teacher</SectionTitle>
        <p className="text-xs text-slate-400 mb-4 font-medium">Designate this teacher as the primary class teacher for a specific classroom.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <SelectField label="Class" value={classTeacher.class || ''} onChange={v => updateClassTeacher('class', v)} options={classOptions} placeholder="Select Class" />
          <SelectField label="Section" value={classTeacher.section || ''} onChange={v => updateClassTeacher('section', v)} options={getClassSections(classTeacher.class)} placeholder="Select Section" />
          <SelectField label="Subject" value={classTeacher.subject || ''} onChange={v => updateClassTeacher('subject', v)} options={subjectOptions} placeholder="Select Subject" />
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Payroll & Leave ──────────────────────────────────────────────────
function PayrollLeaveStep({ data, setData, leaveTypesList = [], errors }: { data: any; setData: (d: any) => void; leaveTypesList?: any[]; errors: Record<string, string> }) {
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
    if (Array.isArray(leaveTypesList) && leaveTypesList.length > 0) {
      return leaveTypesList.map((lt: any) => ({
        id: lt.id || Date.now(),
        leaveType: lt.leaveType || lt.name || 'Leave',
        leaveAbbr: lt.leaveAbbr || lt.abbr || 'LV',
        allowedLeaves: lt.allowedLeaves || '12',
        applyFrom: defaultDate
      }))
    }
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
            <input type="date" className={inputCls()} value={data.applicableStartDate || ''} onChange={e => set('applicableStartDate', e.target.value)} />
          </Field>
          <Field label="Salary Type">
            <input 
              type="text" 
              className={inputCls()} 
              placeholder="e.g. Monthly, Fixed, Contractual" 
              value={data.salaryType || ''} 
              onChange={e => set('salaryType', e.target.value)} 
              list="edit-salary-type-options" 
            />
            <datalist id="edit-salary-type-options">
              <option value="Monthly" />
              <option value="Fixed" />
              <option value="Contractual" />
              <option value="Daily" />
              <option value="Hourly" />
              <option value="Consolidated" />
              <option value="Other" />
            </datalist>
          </Field>
          <Field label="Basic Salary (₹)" error={errors.basicSalary}>
            <input type="number" className={inputCls(!!errors.basicSalary)} placeholder="e.g. 35000" value={data.basicSalary || ''} onChange={e => set('basicSalary', e.target.value)} />
          </Field>
          <Field label="HRA (₹)">
            <input type="number" className={inputCls()} placeholder="e.g. 5000" value={data.hra || ''} onChange={e => set('hra', e.target.value)} />
          </Field>
          <Field label="Conveyance Allowance (₹)">
            <input type="number" className={inputCls()} placeholder="e.g. 2000" value={data.conveyance || ''} onChange={e => set('conveyance', e.target.value)} />
          </Field>
          <Field label="Special Allowance (₹)">
            <input type="number" className={inputCls()} placeholder="e.g. 3000" value={data.specialAllowance || ''} onChange={e => set('specialAllowance', e.target.value)} />
          </Field>

          {/* Dynamic Additional Salary Titles */}
          {customAllowances.map((item, idx) => (
            <div key={item.id || idx} className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-center">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Salary Title / Component</label>
                <input 
                  className={inputCls()} 
                  placeholder="e.g. Other Allowance, Medical, Bonus" 
                  value={item.title || ''} 
                  onChange={e => updateCustomAllowance(idx, 'title', e.target.value)} 
                  list="edit-salary-titles"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  className={inputCls()} 
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
              className={`${inputCls()} bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-black cursor-not-allowed`} 
              placeholder="Auto-calculated" 
              value={data.grossSalary || ''} 
            />
          </Field>
        </div>

        <datalist id="edit-salary-titles">
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
          <SectionTitle>Allocated Leave Quota</SectionTitle>
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
            <button type="button" onClick={addCustomLeave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Leave Type</span>
            </button>
          </div>
        </div>
        <div className="space-y-3 mt-3">
          {allocatedLeaves.map((row, i) => (
            <div key={row.id || i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-center">
              <div className="sm:col-span-6">
                <input className={inputCls()} placeholder="Leave Name" value={row.leaveType || ''} onChange={e => updateLeaveRow(i, 'leaveType', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <input className={inputCls()} placeholder="Abbr" value={row.leaveAbbr || ''} onChange={e => updateLeaveRow(i, 'leaveAbbr', e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <input type="number" className={inputCls()} placeholder="Days" value={row.allowedLeaves || ''} onChange={e => updateLeaveRow(i, 'allowedLeaves', e.target.value)} />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <button type="button" onClick={() => removeCustomLeave(i)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
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

// ─── Step 6: Payment Details ──────────────────────────────────────────────────
function PaymentDetailsStep({ data, setData, errors }: { data: any; setData: (d: any) => void; errors: Record<string, string> }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })

  return (
    <div className="space-y-6">
      <SectionTitle>Bank Account &amp; Disbursement Info</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SelectField label="Payment Mode" value={data.paymentMode || 'Bank Transfer'} onChange={v => set('paymentMode', v)} options={['Bank Transfer', 'Cheque', 'Cash', 'UPI']} placeholder="Select Mode" />
        <Field label="Account Holder Name" error={errors.accountName}>
          <input className={inputCls(!!errors.accountName)} placeholder="Name as per Bank Record" value={data.accountName || ''} onChange={e => set('accountName', e.target.value)} />
        </Field>
        <Field label="Bank Name" error={errors.bankName}>
          <input className={inputCls(!!errors.bankName)} placeholder="e.g. State Bank of India" value={data.bankName || ''} onChange={e => set('bankName', e.target.value)} />
        </Field>
        <Field label="Account Number" error={errors.accountNo}>
          <input className={inputCls(!!errors.accountNo)} placeholder="Bank Account Number" value={data.accountNo || ''} onChange={e => set('accountNo', e.target.value)} />
        </Field>
        <Field label="IFSC Code" error={errors.ifsc}>
          <input className={inputCls(!!errors.ifsc)} placeholder="e.g. SBIN0001234" value={data.ifsc || ''} onChange={e => set('ifsc', e.target.value?.toUpperCase())} />
        </Field>
        <Field label="PAN Number" error={errors.panNo}>
          <input className={inputCls(!!errors.panNo)} placeholder="e.g. ABCDE1234F" value={data.panNo || ''} onChange={e => set('panNo', e.target.value?.toUpperCase())} />
        </Field>
        <Field label="UPI ID (Optional)">
          <input className={inputCls()} placeholder="e.g. teacher@upi" value={data.upiId || ''} onChange={e => set('upiId', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">{children}</h3>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

// Helper to parse "Class 1 - Sec A (Physics)" into { class, section, subject }
function parseAssignedClassString(str: string) {
  if (!str) return { class: '', section: '', subject: '' }
  let subj = ''
  let sec = 'A'
  let cls = str.trim()

  const subMatch = cls.match(/\(([^)]+)\)$/)
  if (subMatch) {
    subj = subMatch[1].trim()
    cls = cls.replace(/\s*\([^)]+\)$/, '').trim()
  }

  const secMatch = cls.match(/[-–]\s*(?:Sec(?:tion)?\s+)?([A-Za-z0-9]+)$/i)
  if (secMatch) {
    sec = secMatch[1].trim()
    cls = cls.replace(/[-–]\s*(?:Sec(?:tion)?\s+)?([A-Za-z0-9]+)$/i, '').trim()
  }

  return { class: cls, section: sec, subject: subj }
}

// ─── Main Modal Component ─────────────────────────────────────────────────────
interface EditTeacherModalProps {
  isOpen: boolean
  teacherId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export default function EditTeacherModal({ isOpen, teacherId, onClose, onSuccess }: EditTeacherModalProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})

  const [statesData, setStatesData] = useState<any[]>([])
  const [leaveTypesList, setLeaveTypesList] = useState<any[]>([])

  const departments = useDepartments()
  const classesData = useClasses()
  const subjectsData = useSubjects()

  // Reset & load teacher data on open
  useEffect(() => {
    if (!isOpen || !teacherId) return
    setStep(0)
    setBannerError('')
    setStepErrors({})
    setLoading(true)

    // Load Teacher
    fetchTeacherById(teacherId).then(res => {
      if (res.success && res.data) {
        const t = res.data
        const details = t.details || {}
        
        // Parse assigned classes if needed
        let assignedClassesList: any[] = []
        if (Array.isArray(details.classes?.assignedClasses) && details.classes.assignedClasses.length > 0) {
          assignedClassesList = details.classes.assignedClasses
        } else if (Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0) {
          assignedClassesList = t.assignedClasses.map((item: string) => parseAssignedClassString(item))
        }

        const nameParts = (t.name || '').trim().split(' ')
        const firstName = details.personal?.firstName || nameParts[0] || ''
        const lastName = details.personal?.lastName || nameParts.slice(1).join(' ') || ''

        const initial: Record<string, any> = {
          ...details,
          personal: {
            firstName,
            lastName,
            username: t.username || details.personal?.username || '',
            password: '', // blank by default in edit mode
            contact: t.contact || details.personal?.contact || '',
            altContact: details.personal?.altContact || '',
            email: t.email || details.personal?.email || '',
            dob: details.personal?.dob || '',
            gender: details.personal?.gender || 'Male',
            department: details.personal?.department || (departments[0]?.name || 'Faculty'),
            designation: details.personal?.designation || 'Teacher',
            status: t.status || details.personal?.status || 'Active',
            joiningDate: t.joiningDate || details.personal?.joiningDate || '',
            photo: t.avatar || details.personal?.photo || '',
            ...(details.personal || {})
          },
          qualification: details.qualification || {},
          address: details.address || {},
          classes: {
            assignedClasses: assignedClassesList.length > 0 ? assignedClassesList : [{ class: '', section: '', subject: '' }],
            classTeacher: details.classes?.classTeacher || { class: '', section: '', subject: '' },
            ...(details.classes || {})
          },
          payroll: {
            applicableStartDate: details.payroll?.applicableStartDate || '',
            salaryType: details.payroll?.salaryType || 'Monthly',
            customAllowances: details.payroll?.customAllowances || [],
            leaveEffectiveDate: details.payroll?.leaveEffectiveDate || details.payroll?.casualLeaveFrom || '',
            ...(details.payroll || {})
          },
          payment: details.payment || {}
        }

        setFormData(initial)
      } else {
        setBannerError(res.error || 'Failed to load teacher details')
      }
      setLoading(false)
    }).catch(err => {
      setBannerError(err.message || 'Error loading teacher')
      setLoading(false)
    })

    // Load Leave Types from masters / local
    let leaves: any[] = []
    try {
      const rawLeaves = localStorage.getItem('school_leave_types')
      if (rawLeaves) leaves = JSON.parse(rawLeaves)
    } catch {}
    if (!leaves || leaves.length === 0) {
      leaves = [
        { id: 1, leaveType: 'Casual Leave', leaveAbbr: 'CL', markAs: 'Leave' },
        { id: 2, leaveType: 'Medical Leave', leaveAbbr: 'ML', markAs: 'Leave' },
        { id: 3, leaveType: 'Half Day Leave', leaveAbbr: 'HDL', markAs: 'Half Day' },
        { id: 4, leaveType: 'Sick Leave', leaveAbbr: 'SL', markAs: 'Leave' },
        { id: 5, leaveType: 'Earned Leave', leaveAbbr: 'EL', markAs: 'Leave' }
      ]
    }
    setLeaveTypesList(leaves)

    // Load States & Districts
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((s: any) => ({
            id: s.id,
            state: s.state_name || s.state || s.name,
            districts: s.districts || []
          })).filter((s: any) => Boolean(s.state))
          setStatesData(mapped)
        } else {
          fetchStatesDistricts().then(res2 => {
            if (res2.success && Array.isArray(res2.data)) {
              setStatesData(res2.data)
            }
          }).catch(() => setStatesData([]))
        }
      })
      .catch(() => {
        fetchStatesDistricts().then(res2 => {
          if (res2.success && Array.isArray(res2.data)) {
            setStatesData(res2.data)
          }
        }).catch(() => setStatesData([]))
      })
  }, [isOpen, teacherId])

  if (!isOpen) return null

  const updateStepData = (key: string, d: any) => {
    setFormData(prev => ({ ...prev, [key]: d }))
    if (Object.keys(stepErrors).length > 0) {
      setStepErrors({})
      setBannerError('')
    }
  }

  // Validate step
  const validateStep = (stepIdx: number): boolean => {
    const errors: Record<string, string> = {}
    let message = ''

    if (stepIdx === 0) {
      const p = formData.personal || {}
      if (!p.firstName?.trim()) errors.firstName = 'First name is required'
      if (!p.lastName?.trim()) errors.lastName = 'Last name is required'
      if (!p.username?.trim()) errors.username = 'Username is required'
      // Password is intentionally optional in Edit mode!
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
    if (!teacherId) return
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }

    setSubmitting(true)
    setBannerError('')

    try {
      const res = await updateTeacher(teacherId, formData)
      if (res.success) {
        toast.success('Teacher updated successfully')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setBannerError(res.error || 'Failed to update teacher')
      }
    } catch (err: any) {
      setBannerError(err.message || 'An error occurred while updating teacher')
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
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Teacher</h2>
            <p className="text-xs text-slate-500 font-medium">Update teacher details, qualifications and assigned classes</p>
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
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm font-bold text-slate-500">Loading teacher information...</p>
            </div>
          ) : (
            <>
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
                  leaveTypesList={leaveTypesList}
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
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60 flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting || loading}
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
                disabled={submitting || loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 active:scale-95 text-white transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
                <span>Update Teacher</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

