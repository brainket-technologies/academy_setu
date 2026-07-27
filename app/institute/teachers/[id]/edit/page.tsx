'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Trash2, Upload, Calendar, ChevronDown, Check } from 'lucide-react'
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
  
  const states = statesData.map(s => s.state)
  const selectedStateObj = statesData.find(s => s.state === data.state)
  const districts = selectedStateObj ? selectedStateObj.districts : []

  return (
    <div className="space-y-6">
      <SectionTitle>Address Details</SectionTitle>
      <div className="space-y-5">
        <Field label="Address" required>
          <input className={inputCls} placeholder="Enter Address" value={data.address || ''} onChange={e => set('address', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SelectField label="State" required value={data.state || ''} onChange={v => { set('state', v); set('district', '') }} options={states} placeholder="Select State" />
          <SelectField label="District" required value={data.district || ''} onChange={v => set('district', v)} options={districts} placeholder="Select District" />
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
  const set = (k: string, v: string) => setData({ ...data, [k]: v })
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
              <input readOnly className={`${inputCls} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-inner text-slate-700 dark:text-slate-300`} value={data.grossSalary || 'Total Amount'} />
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
            <input className={inputCls} placeholder="Enter No. of leave" value={data.casualLeaveNo || ''} onChange={e => set('casualLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls} value={data.casualLeaveFrom || ''} onChange={e => set('casualLeaveFrom', e.target.value)} />
          </Field>
          <div className="hidden lg:block" />
          <Field label="Medical Leave">
            <input className={inputCls} placeholder="Enter No. of leave" value={data.medicalLeaveNo || ''} onChange={e => set('medicalLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls} value={data.medicalLeaveFrom || ''} onChange={e => set('medicalLeaveFrom', e.target.value)} />
          </Field>
          <div className="hidden lg:block" />
          <Field label="Half Day Leave">
            <input className={inputCls} placeholder="Enter No. of leave" value={data.halfDayLeaveNo || ''} onChange={e => set('halfDayLeaveNo', e.target.value)} />
          </Field>
          <Field label="Apply From">
             <input type="date" className={inputCls} value={data.halfDayLeaveFrom || ''} onChange={e => set('halfDayLeaveFrom', e.target.value)} />
          </Field>
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
    fetchStatesDistricts().then(res => {
      if (res.success) setStatesData((res.data as any[]) || [])
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Teacher</h1>
          <Link href="/institute/teachers"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Step Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="flex min-w-max">
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => i <= step && setStep(i)}
                className={`flex-1 min-w-[140px] px-4 py-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${step === i
                  ? 'border-teal-600 text-teal-600 bg-teal-50/50 dark:bg-teal-900/10'
                  : i < step ? 'border-transparent text-slate-500 hover:text-teal-600 cursor-pointer'
                    : 'border-transparent text-slate-400 cursor-not-allowed'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-50/50 dark:bg-slate-800/50">
          {STEPS.map((_, i) => (
            <div key={i} className={`transition-all duration-300 rounded-full flex items-center justify-center ${i < step
              ? 'w-6 h-6 bg-teal-600 text-white shadow'
              : i === step ? 'w-6 h-6 bg-teal-600 text-white ring-4 ring-teal-200 shadow'
                : 'w-4 h-4 bg-slate-200 dark:bg-slate-700'
            }`}>
              {i < step && <Check className="w-3 h-3" />}
              {i === step && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          ))}
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
        <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <button onClick={handleBack} disabled={step === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Back
          </button>
          <Link href="/institute/teachers"
            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </Link>
          {step < STEPS.length - 1 ? (
            <button onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow">
              Save &amp; Next
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow">
              Save Teacher
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
