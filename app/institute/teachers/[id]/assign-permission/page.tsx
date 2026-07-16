'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// ─── Mock Teacher ─────────────────────────────────────────────────────────────
const TEACHER = {
  name: 'Teacher Name',
  designation: 'Designation',
  department: 'Department',
  gender: 'Male',
  staffId: '42',
  joiningDate: '01/01/2026',
  mobile: '9999999999',
  email: 'abc@gmail.com',
  dob: '14-01-2018',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher42',
}

// ─── Permissions Tab ──────────────────────────────────────────────────────────
const PERMISSION_MODULES = [
  'Student Management', 'Teacher Management', 'Enquiry/Lead Management',
  'App Management', 'App Data', 'Admin Management', 'Fees Management',
  'Web Management', 'Human/Class Management', 'Library Management',
  'Homework Management', 'Extra-Curricular Management', 'Asset Management',
  'Classes Management', 'Session Management', 'Supplier Approval',
  'Leave Management', 'Wholesale Management', 'DVT Management',
  'Tour Management', 'Enrollment Management', 'Vendor Certificates Management',
  'Calibration Management', 'Supplier/Form Management', 'Copy Calculation Management',
  'Activity Management', 'House Management', 'Addition Management',
  'Type/Loan Management', 'Instructor/Contract Management', 'Offline Use Management',
  'Academic Calendar Management', 'Library Store Management', 'Complaints Management',
  'Transfer List Management', 'Setting Management',
]

// ─── Dashboard Permission Tab ─────────────────────────────────────────────────
const REPORT_CARD_OPTIONS = [
  'Total Teachers', 'Delete', 'Total Tests',
  'Total SMS', 'Monthly Collected Fees', 'Today Fees',
  'Total fees structure created', 'Total fees structure not created', 'Fees paid by',
  'Fees not paid by', 'Scheduled Leads', 'Upcoming Birthdays',
  'Fees Followups',
]
const GRAPH_OPTIONS = [
  'Overall Fees Report', 'Daily Attendance Graph', 'Monthly Attendance Graph',
  'Monthly Fees Graph', 'Session Fees Graph', 'Monthly Expense Graph',
  'Monthly SMS Graph',
]

// ─── Student Details Tab ─────────────────────────────────────────────────────
const STUDENT_SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: 'Admission Details',
    fields: [
      'Aadhar ID', 'STD No', 'Profile Photo',
      'Contact No', 'Parent Login', 'Phone No',
      'School Name', 'SMS Admission Status', 'Date Of Joining',
      'RTE', 'Admission No', 'Admission Date',
    ],
  },
  {
    title: 'Personal Details',
    fields: [
      'Name', 'Father', 'DOB',
      'Cast', 'Religion', 'Gender',
      'Blood Group', 'Nationality', 'Aadhar Number',
      'Country', 'Discount', 'Category', 'Mother Tongue',
    ],
  },
  {
    title: 'Parents Details',
    fields: [
      'Father Name', 'Father Occupation', 'Father Mobile',
      'Mother Name', 'Mother Occupation', 'Mother Mobile',
      'Father Qualification', 'Father Education', 'Father Aadhar',
      'Mother Qualification', 'Mother Education', 'Mother Aadhar',
      'Father Email', 'Mother Email', 'Guardian Name',
      'Guardian Mobile', 'Guardian Relation', 'Guardian Address',
    ],
  },
  {
    title: 'Certificate Details',
    fields: [
      'Admission No', 'TC No', 'Remaining',
      'Transfer Certificate', 'TC Applicable', 'TC Date',
      'Validity', 'TC Reason', 'Promote/Not Promote',
      'Certificate No', 'Certificate Date', 'Certificate Type',
    ],
  },
  {
    title: 'Other Details',
    fields: [
      'Institute Serial', 'Reason', 'House/Block',
      'Class/Section', 'School/Department', 'Year Leave',
      'Section', 'Offer Type', 'Old Address', 'Last Admission',
    ],
  },
  {
    title: 'Other Fields',
    fields: [
      'Discount Fields', 'Race/Caste', 'Parent/Guardian',
      'Transport Field', 'Social Case Fields', 'Subject',
      'Reference Name', 'Reference Mobile', 'Rollback Date',
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
      />
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
    </label>
  )
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children?: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-teal-500" />
          : <ChevronDown className="w-4 h-4 text-teal-500" />}
      </button>
      {open && children && (
        <div className="px-5 pb-5 pt-1 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Teacher Details Card ─────────────────────────────────────────────────────
function TeacherDetailsCard() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        Teacher Details
      </h3>
      <div className="flex items-start gap-5">
        <div className="relative flex-shrink-0">
          <img src={TEACHER.avatar} alt="Teacher" className="w-20 h-20 rounded-xl border-2 border-teal-200 object-cover bg-slate-100" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full" />
          </span>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-8">
          <div>
            <p className="text-base font-black text-slate-800 dark:text-slate-100">{TEACHER.name}</p>
            <p className="text-xs font-semibold text-slate-500">{TEACHER.designation}, {TEACHER.department}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{TEACHER.gender}</p>
          </div>
          <div className="flex flex-col gap-0.5 sm:text-right">
            <p className="text-xs font-semibold text-slate-500">Staff ID No. <span className="font-black text-slate-700 dark:text-slate-200">{TEACHER.staffId}</span></p>
            <p className="text-xs font-semibold text-slate-500">Joining Date <span className="font-black text-slate-700 dark:text-slate-200">{TEACHER.joiningDate}</span></p>
          </div>
          <div className="col-span-1 sm:col-span-2 grid grid-cols-3 gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mobile No.</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{TEACHER.mobile}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email ID</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{TEACHER.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date of Birth</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{TEACHER.dob}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Permissions ─────────────────────────────────────────────────────────
function PermissionsTab() {
  const [role, setRole] = useState<'subadmin' | 'teacher'>('teacher')
  const [modules, setModules] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSION_MODULES.map(m => [m, false]))
  )

  const toggleModule = (m: string) => setModules(p => ({ ...p, [m]: !p[m] }))

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
      {/* Admin Management header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">Admin Management</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={role === 'subadmin'} onChange={() => setRole('subadmin')}
              className="accent-teal-600 w-4 h-4" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sub Admin</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={role === 'teacher'} onChange={() => setRole('teacher')}
              className="accent-teal-600 w-4 h-4" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Teacher</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            Deselect All
          </button>
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Module list */}
      <div className="space-y-2">
        {PERMISSION_MODULES.map(mod => (
          <div key={mod} className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{mod}</span>
            <Toggle checked={modules[mod]} onChange={() => toggleModule(mod)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Dashboard Permission ────────────────────────────────────────────────
function CheckboxGroup({ options, checked, setChecked }: {
  options: string[]
  checked: Set<string>
  setChecked: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const allSelected = options.every(o => checked.has(o))
  const toggleAll = () => {
    setChecked(prev => {
      const next = new Set(prev)
      if (allSelected) options.forEach(o => next.delete(o))
      else options.forEach(o => next.add(o))
      return next
    })
  }
  const toggle = (o: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(o) ? next.delete(o) : next.add(o)
      return next
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={allSelected}
            ref={el => { if (el) el.indeterminate = !allSelected && options.some(o => checked.has(o)) }}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-teal-600" />
          <span className="text-xs font-bold text-slate-500">Select All</span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 mb-5">
        {options.map(opt => (
          <CheckItem key={opt} label={opt} checked={checked.has(opt)} onChange={() => toggle(opt)} />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button className="px-5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 hover:bg-slate-50 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors">
          Save
        </button>
      </div>
    </>
  )
}

function DashboardPermissionTab() {
  const defaultRC = new Set(['Total Teachers', 'Delete', 'Total SMS', 'Monthly Collected Fees',
    'Total fees structure created', 'Total fees structure not created', 'Fees not paid by',
    'Scheduled Leads', 'Fees Followups'])
  const defaultGR = new Set(['Overall Fees Report', 'Daily Attendance Graph', 'Monthly Attendance Graph',
    'Monthly Fees Graph', 'Session Fees Graph', 'Monthly Expense Graph', 'Monthly SMS Graph'])

  const [rcChecked, setRcChecked] = useState<Set<string>>(defaultRC)
  const [grChecked, setGrChecked] = useState<Set<string>>(defaultGR)

  return (
    <div className="space-y-4">
      <AccordionSection title="Report Cards" defaultOpen={true}>
        <CheckboxGroup options={REPORT_CARD_OPTIONS} checked={rcChecked} setChecked={setRcChecked} />
      </AccordionSection>
      <AccordionSection title="Graph" defaultOpen={true}>
        <CheckboxGroup options={GRAPH_OPTIONS} checked={grChecked} setChecked={setGrChecked} />
      </AccordionSection>
    </div>
  )
}

// ─── Tab: Other Permission ────────────────────────────────────────────────────
const OTHER_PERMISSIONS = ['Allow discount in Collect Fees', 'Allow discount in Fees Structure']

function OtherPermissionTab() {
  const [checked, setChecked] = useState<Set<string>>(new Set(['Allow discount in Collect Fees']))
  return (
    <div className="space-y-4">
      <AccordionSection title="Report Cards" defaultOpen={true}>
        <CheckboxGroup options={OTHER_PERMISSIONS} checked={checked} setChecked={setChecked} />
      </AccordionSection>
    </div>
  )
}

// ─── Tab: Student Details ────────────────────────────────────────────────────
function StudentDetailsTab() {
  const [sectionChecked, setSectionChecked] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(
      STUDENT_SECTIONS.map(s => [s.title, new Set<string>()])
    )
  )

  const toggle = (section: string, field: string) => {
    setSectionChecked(prev => {
      const next = { ...prev }
      const set = new Set(prev[section])
      set.has(field) ? set.delete(field) : set.add(field)
      next[section] = set
      return next
    })
  }

  const toggleAll = (section: string, fields: string[]) => {
    setSectionChecked(prev => {
      const next = { ...prev }
      const set = prev[section]
      const allSelected = fields.every(f => set.has(f))
      next[section] = allSelected ? new Set() : new Set(fields)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {STUDENT_SECTIONS.map(section => {
        const checked = sectionChecked[section.title]
        const allSelected = section.fields.every(f => checked.has(f))
        const someSelected = section.fields.some(f => checked.has(f))
        return (
          <AccordionSection key={section.title} title={section.title} defaultOpen={true}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-semibold">{checked.size}/{section.fields.length} selected</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={() => toggleAll(section.title, section.fields)}
                  className="w-4 h-4 rounded accent-teal-600"
                />
                <span className="text-xs font-bold text-slate-500">Select All</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-4">
              {section.fields.map(field => (
                <CheckItem
                  key={field}
                  label={field}
                  checked={checked.has(field)}
                  onChange={() => toggle(section.title, field)}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setSectionChecked(prev => ({ ...prev, [section.title]: new Set() }))}
                className="px-5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 hover:bg-slate-50 transition-colors">
                Reset to Defaults
              </button>
              <button className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                Save
              </button>
            </div>
          </AccordionSection>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabType = 'permissions' | 'dashboard' | 'other' | 'student'

export default function AssignPermissionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('permissions')

  const tabs: { key: TabType; label: string }[] = [
    { key: 'permissions', label: 'Permissions' },
    { key: 'dashboard', label: 'Dashboard Permission' },
    { key: 'other', label: 'Other Permission' },
    { key: 'student', label: 'Student Details' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Page Title */}
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Assign Permission</h1>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white border-teal-600 shadow'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Teacher Details — always visible */}
      <TeacherDetailsCard />

      {/* Tab Content */}
      {activeTab === 'permissions' && <PermissionsTab />}
      {activeTab === 'dashboard' && <DashboardPermissionTab />}
      {activeTab === 'other' && <OtherPermissionTab />}
      {activeTab === 'student' && <StudentDetailsTab />}
    </div>
  )
}
