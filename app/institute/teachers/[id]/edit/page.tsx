'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Trash2, Upload, Calendar, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { fetchStatesDistricts } from '../../../actions'
import { useClasses, useDepartments, useSubjects } from '@/lib/mastersData'

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
const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-colors'
const selectCls = inputCls + ' appearance-none cursor-pointer'
const labelCls = 'block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide'
const reqStar = <span className="text-red-500 ml-0.5">*</span>

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && reqStar}</label>
      {children}
    </div>
  )
}

function SelectField({ label, required, value, onChange, options, placeholder }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string
}) {
  return (
    <Field label={label} required={required}>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
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
        <span className="text-sm text-slate-400 font-medium">{value || `Upload ${label}`}</span>
        <Upload className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
      </button>
      <input ref={ref} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0]?.name || '')} />
    </Field>
  )
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function PersonalDetailsStep({ data, setData, departments }: { data: any; setData: (d: any) => void; departments: any[] }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
  return (
    <div className="space-y-6">
      <SectionTitle>Basic Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="First Name" required>
          <input className={inputCls} placeholder="Enter First Name" value={data.firstName || ''} onChange={e => set('firstName', e.target.value)} />
        </Field>
        <Field label="Last Name" required>
          <input className={inputCls} placeholder="Enter Last Name" value={data.lastName || ''} onChange={e => set('lastName', e.target.value)} />
        </Field>
        <Field label="Username" required>
          <input className={inputCls} placeholder="Enter Username" value={data.username || ''} onChange={e => set('username', e.target.value)} />
        </Field>
        <Field label="Password" required>
          <input type="password" className={inputCls} placeholder="Enter Password" value={data.password || ''} onChange={e => set('password', e.target.value)} />
        </Field>
        <Field label="Contact No." required>
          <input className={inputCls} placeholder="Enter Mobile No." value={data.contact || ''} onChange={e => set('contact', e.target.value)} />
        </Field>
        <Field label="Alt. Contact No.">
          <input className={inputCls} placeholder="Enter Alt. Mobile No." value={data.altContact || ''} onChange={e => set('altContact', e.target.value)} />
        </Field>
        <Field label="Email ID" required>
          <input type="email" className={inputCls} placeholder="Enter Email" value={data.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <div className="relative">
            <input type="date" className={inputCls} value={data.dob || ''} onChange={e => set('dob', e.target.value)} />
          </div>
        </Field>
        <SelectField label="Gender" required value={data.gender || ''} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} />
        <SelectField label="Blood Group" value={data.bloodGroup || ''} onChange={v => set('bloodGroup', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
        <SelectField label="Department" required value={data.department || ''} onChange={v => set('department', v)} options={departments.map((d: any) => d.departmentName)} />
        <Field label="Designation" required>
          <input className={inputCls} placeholder="Enter Designation" value={data.designation || ''} onChange={e => set('designation', e.target.value)} />
        </Field>
        <Field label="Joining Date">
          <input type="date" className={inputCls} value={data.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)} />
        </Field>
        <Field label="Staff ID No.">
          <input className={inputCls} placeholder="Enter Staff ID" value={data.staffId || ''} onChange={e => set('staffId', e.target.value)} />
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
                    <button onClick={() => removeQual(i)} disabled={quals.length === 1}
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
                    <button className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap">
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button onClick={addQual}
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
                    <button onClick={() => removeAq(i)} disabled={aq.length === 1}
                      className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30">
                      <X className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-2.5 px-2"><input className={rowInput} placeholder="Course or Certificate Name" value={row.course} onChange={e => updateAq(i, 'course', e.target.value)} /></td>
                  <td className="py-2.5 px-2"><input className={rowInput} placeholder="Year" value={row.passYear} onChange={e => updateAq(i, 'passYear', e.target.value)} /></td>
                  <td className="py-2.5 px-2">
                    <button className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors whitespace-nowrap">
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button onClick={addAq}
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
                    <button onClick={() => removeExp(i)} disabled={exp.length === 1}
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
          <div className="flex justify-center py-3 border-t border-slate-100 dark:border-slate-700">
            <button onClick={addExp}
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
function AddressDetailsStep({ data, setData, statesData }: { data: any; setData: (d: any) => void; statesData: any[] }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
  
  const states = Array.from(new Set(statesData.map(s => s.state || s.state_name || s.name || (typeof s === 'string' ? s : '')).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b))
  const selectedStateObj = statesData.find(s => {
    const name = s.state || s.state_name || s.name || (typeof s === 'string' ? s : '')
    return name.toLowerCase().trim() === (data.state || '').toLowerCase().trim()
  })
  const districts: string[] = selectedStateObj && (selectedStateObj.districts || selectedStateObj.cities)
    ? (selectedStateObj.districts || selectedStateObj.cities).map((d: any) => typeof d === 'string' ? d : (d.name || d.district || '')).filter(Boolean)
    : []

  return (
    <div className="space-y-6">
      <SectionTitle>Address Details</SectionTitle>
      <div className="space-y-5">
        <Field label="Address" required>
          <input className={inputCls} placeholder="Enter Address" value={data.address || ''} onChange={e => set('address', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SelectField 
            label="State (Optional)" 
            value={data.state || ''} 
            onChange={v => setData({ ...data, state: v, district: '' })} 
            options={states} 
            placeholder={states.length > 0 ? "Select State" : "No states in Admin Settings"} 
          />
          <SelectField 
            label="District (Optional)" 
            value={data.district || ''} 
            onChange={v => setData({ ...data, district: v })} 
            options={districts} 
            placeholder={data.state ? (districts.length > 0 ? "Select District" : "No districts in Admin Settings") : "Select State First"} 
          />
          <Field label="Pincode">
            <input className={inputCls} placeholder="Enter Pincode" value={data.pincode || ''} onChange={e => set('pincode', e.target.value)} maxLength={6} />
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <SectionTitle>Aadhar &amp; Signature</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          <Field label="Aadhar No." required>
            <input className={inputCls} placeholder="Enter Aadhar No" value={data.aadhar || ''} onChange={e => set('aadhar', e.target.value)} maxLength={12} />
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

  const classOptions = classesData.map((c: any) => c.className)
  const subjectOptions = subjectsData.map((s: any) => s.subjectName)
  
  const getClassSections = (clsName: string) => {
    const cls = classesData.find((c: any) => c.className === clsName)
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
                  <button onClick={() => removeAssigned(i)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <button onClick={addAssigned} className="w-10 h-10 rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center justify-center transition-colors shadow">
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
function PayrollLeaveStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const [allocatedLeaves, setAllocatedLeaves] = useState<any[]>(() => {
    if (Array.isArray(data.allocatedLeaves) && data.allocatedLeaves.length > 0) {
      return data.allocatedLeaves
    }
    return []
  })

  // Load configured leave types from localStorage
  useEffect(() => {
    if (allocatedLeaves.length === 0) {
      try {
        const stored = localStorage.getItem('leave_types') || localStorage.getItem('school_leave_types')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const leaves = parsed.map((item: any) => ({
              id: item.id || Date.now() + Math.random(),
              leaveType: item.name || item.leaveType || item.title || 'Leave',
              leaveAbbr: item.abbr || item.code || (item.name ? item.name.slice(0, 2).toUpperCase() : 'LV'),
              allowedLeaves: item.days || item.quota || item.allowedLeaves || '12',
              applyFrom: ''
            }))
            setAllocatedLeaves(leaves)
            set('allocatedLeaves', leaves)
            return
          }
        }
      } catch (e) {
        console.error('Error loading leave types', e)
      }

      const defaultLeaves = [
        { id: 1, leaveType: 'Casual Leave', leaveAbbr: 'CL', allowedLeaves: data.casualLeaveNo || '12', applyFrom: data.casualLeaveFrom || '' },
        { id: 2, leaveType: 'Medical Leave', leaveAbbr: 'ML', allowedLeaves: data.medicalLeaveNo || '10', applyFrom: data.medicalLeaveFrom || '' },
        { id: 3, leaveType: 'Maternity/Paternity Leave', leaveAbbr: 'MPL', allowedLeaves: '90', applyFrom: '' },
        { id: 4, leaveType: 'Earned Leave', leaveAbbr: 'EL', allowedLeaves: '15', applyFrom: '' },
      ]
      setAllocatedLeaves(defaultLeaves)
      set('allocatedLeaves', defaultLeaves)
    }
  }, [])

  const set = (k: string, v: any) => {
    const updated = { ...data, [k]: v }
    if (['basicSalary', 'hra', 'conveyance', 'specialAllowance'].includes(k)) {
      const basic = parseFloat(k === 'basicSalary' ? v : (data.basicSalary || 0)) || 0
      const hra = parseFloat(k === 'hra' ? v : (data.hra || 0)) || 0
      const conv = parseFloat(k === 'conveyance' ? v : (data.conveyance || 0)) || 0
      const spec = parseFloat(k === 'specialAllowance' ? v : (data.specialAllowance || 0)) || 0
      updated.grossSalary = (basic + hra + conv + spec).toString()
    }
    setData(updated)
  }

  const updateLeaveRow = (index: number, field: string, val: string) => {
    const updated = [...allocatedLeaves]
    updated[index] = { ...updated[index], [field]: val }
    setAllocatedLeaves(updated)
    set('allocatedLeaves', updated)

    if (updated[index].leaveType?.toLowerCase().includes('casual')) {
      if (field === 'allowedLeaves') set('casualLeaveNo', val)
      if (field === 'applyFrom') set('casualLeaveFrom', val)
    } else if (updated[index].leaveType?.toLowerCase().includes('medical')) {
      if (field === 'allowedLeaves') set('medicalLeaveNo', val)
      if (field === 'applyFrom') set('medicalLeaveFrom', val)
    }
  }

  const addCustomLeave = () => {
    const newRow = {
      id: Date.now(),
      leaveType: 'Special Leave',
      leaveAbbr: 'SPL',
      allowedLeaves: '5',
      applyFrom: ''
    }
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
        <SectionTitle>Payroll</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Basic Salary" required>
            <input className={inputCls} placeholder="Enter Basic Salary" value={data.basicSalary || ''} onChange={e => set('basicSalary', e.target.value)} />
          </Field>
          <Field label="HRA">
            <input className={inputCls} placeholder="Enter HRA" value={data.hra || ''} onChange={e => set('hra', e.target.value)} />
          </Field>
          <Field label="Conveyance">
            <input className={inputCls} placeholder="Enter Conveyance" value={data.conveyance || ''} onChange={e => set('conveyance', e.target.value)} />
          </Field>
          <Field label="Special Allowance">
            <input className={inputCls} placeholder="Enter Special Allowance" value={data.specialAllowance || ''} onChange={e => set('specialAllowance', e.target.value)} />
          </Field>
          <Field label="Gross Monthly Salary">
            <div className="relative">
              <input readOnly className={`${inputCls} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-inner text-slate-700 dark:text-slate-300 font-bold`} value={data.grossSalary ? `₹ ${data.grossSalary}` : 'Total Amount'} />
            </div>
          </Field>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Paid Leave (Configured Institute Leave Types)</SectionTitle>
          <button 
            type="button" 
            onClick={addCustomLeave} 
            className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center gap-1 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Leave Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allocatedLeaves.map((leave, idx) => (
            <div key={leave.id || idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {leave.leaveAbbr || leave.leaveType?.slice(0, 2).toUpperCase() || 'LV'}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {leave.leaveType}
                  </span>
                </div>
                {allocatedLeaves.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeCustomLeave(idx)} 
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                    title="Remove leave type"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">No. of Leaves</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 12" 
                    value={leave.allowedLeaves || ''} 
                    onChange={e => updateLeaveRow(idx, 'allowedLeaves', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-teal-600 dark:text-teal-400 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Apply From</label>
                  <input 
                    type="date" 
                    value={leave.applyFrom || ''} 
                    onChange={e => updateLeaveRow(idx, 'applyFrom', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: Payment Details ──────────────────────────────────────────────────
function PaymentDetailsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Bank Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Account Holder Name" required>
            <input className={inputCls} placeholder="Enter Account Holder Name" value={data.accountName || ''} onChange={e => set('accountName', e.target.value)} />
          </Field>
          <Field label="Bank Account No." required>
            <input className={inputCls} placeholder="Enter Bank Account No." value={data.accountNo || ''} onChange={e => set('accountNo', e.target.value)} />
          </Field>
          <Field label="IFSC Code" required>
            <input className={inputCls} placeholder="Enter IFSC Code" value={data.ifsc || ''} onChange={e => set('ifsc', e.target.value)} />
          </Field>
          <Field label="Bank Name" required>
            <input className={inputCls} placeholder="Enter Bank Name" value={data.bankName || ''} onChange={e => set('bankName', e.target.value)} />
          </Field>
          <Field label="PAN No." required>
            <input className={inputCls} placeholder="Enter PAN No." value={data.panNo || ''} onChange={e => set('panNo', e.target.value)} />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle>Online Payment Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="UPI ID">
            <input className={inputCls} placeholder="Enter UPI ID" value={data.upiId || ''} onChange={e => set('upiId', e.target.value)} />
          </Field>
          <FileUploadField label="QR Code" value={data.qrCode || ''} onChange={v => set('qrCode', v)} />
        </div>
      </div>
      <div>
        <SectionTitle>Other Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          <Field label="Universal Account No.">
            <input className={inputCls} placeholder="Enter Universal Account No." value={data.uanNo || ''} onChange={e => set('uanNo', e.target.value)} />
          </Field>
          <Field label="PF Account No.">
             <input className={inputCls} placeholder="Enter PF Account No." value={data.pfNo || ''} onChange={e => set('pfNo', e.target.value)} />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditTeacherPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [statesData, setStatesData] = useState<any[]>([])

  const departments = useDepartments()
  const classesData = useClasses()
  const subjectsData = useSubjects()

  useEffect(() => {
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
            } else {
              setStatesData([])
            }
          }).catch(() => setStatesData([]))
        }
      })
      .catch(() => {
        fetchStatesDistricts().then(res2 => {
          if (res2.success && Array.isArray(res2.data)) {
            setStatesData(res2.data)
          } else {
            setStatesData([])
          }
        }).catch(() => setStatesData([]))
      })
  }, [])

  const updateStep = (key: string, d: any) => setFormData(prev => ({ ...prev, [key]: d }))

  const handleNext = () => { if (step < STEPS.length - 1) setStep(s => s + 1) }
  const handleBack = () => { if (step > 0) setStep(s => s - 1) }
  const handleSubmit = () => {
    alert('Teacher updated successfully!')
    router.push('/institute/teachers')
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Teacher</h1>
            <p className="text-xs text-slate-500 font-medium">Update teacher details, qualifications and payroll</p>
          </div>
          <Link href="/institute/teachers"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* Step Navigation Tabs - Clean Unified Stepper */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-5 py-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {STEPS.map((s, i) => {
              const isPast = i < step
              const isCurrent = i === step
              return (
                <React.Fragment key={i}>
                  <button
                    type="button"
                    onClick={() => i <= step && setStep(i)}
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

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {step === 0 && <PersonalDetailsStep data={formData.personal || {}} setData={d => updateStep('personal', d)} departments={departments} />}
          {step === 1 && <QualificationDetailsStep data={formData.qualification || {}} setData={d => updateStep('qualification', d)} />}
          {step === 2 && <AddressDetailsStep data={formData.address || {}} setData={d => updateStep('address', d)} statesData={statesData} />}
          {step === 3 && <AssignClassStep data={formData.classes || {}} setData={d => updateStep('classes', d)} classesData={classesData} subjectsData={subjectsData} />}
          {step === 4 && <PayrollLeaveStep data={formData.payroll || {}} setData={d => updateStep('payroll', d)} />}
          {step === 5 && <PaymentDetailsStep data={formData.payment || {}} setData={d => updateStep('payment', d)} />}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60">
          <button onClick={handleBack} disabled={step === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <Link href="/institute/teachers"
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancel
            </Link>
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 active:scale-95 text-white transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer">
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Teacher</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
