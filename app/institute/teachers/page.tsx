'use client'

import React, { useState } from 'react'
import { Search, Download, Upload, Plus, MoreVertical, Eye, Pencil, Trash2, ShieldCheck, X, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const TEACHERS = [
  { id: 1, username: 'Teach123', name: 'Sudhir Rawat', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', contact: '9990990099', email: 'sudhirawat123@gmail.com', assignedClasses: ['1-A', '1-B', '2-B', '2-C', '3-A', '3-C'], status: 'Active', joiningDate: '01/01/2026' },
  { id: 2, username: 'Teach124', name: 'Priya Sharma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', contact: '9990990088', email: 'priya.sharma@gmail.com', assignedClasses: ['4-A', '4-B', '5-A'], status: 'Inactive', joiningDate: '01/03/2026' },
  { id: 3, username: 'Teach125', name: 'Amit Verma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', contact: '9990990077', email: 'amit.verma@gmail.com', assignedClasses: ['6-A', '7-A', '7-B', '8-A'], status: 'Active', joiningDate: '15/03/2026' },
  { id: 4, username: 'Teach126', name: 'Neha Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha2', contact: '9990990066', email: 'neha.singh@gmail.com', assignedClasses: ['9-A', '9-B', '10-A', '10-B'], status: 'Active', joiningDate: '01/04/2026' },
]

const DELETED_TEACHERS = [
  { id: 5, username: 'Teach127', name: 'Raj Kumar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj', contact: '9990990055', email: 'raj.kumar@gmail.com', assignedClasses: ['Class I'], status: 'Deleted', joiningDate: '01/01/2025' },
]

// ─── Assigned Classes Popup ───────────────────────────────────────────────────
function AssignedClassesPopup({ classes, onClose }: { classes: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Assigned Class &amp; Section</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls, i) => (
            <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-lg">
              {cls}
            </span>
          ))}
          {classes.length === 0 && <p className="text-sm text-slate-400">No classes assigned.</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Action Dropdown ──────────────────────────────────────────────────────────
function ActionMenu({ teacherId, onDelete }: { teacherId: number; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-40 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 overflow-hidden">
            <Link href={`/institute/teachers/${teacherId}`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-600 transition-colors"
              onClick={() => setOpen(false)}>
              <Eye className="w-4 h-4 text-teal-500" /> View
            </Link>
            <Link href={`/institute/teachers/${teacherId}/edit`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
              onClick={() => setOpen(false)}>
              <Pencil className="w-4 h-4 text-blue-500" /> Edit
            </Link>
            <button
              onClick={() => { onDelete(teacherId); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <Link href={`/institute/teachers/${teacherId}/assign-permission`}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-purple-600 transition-colors"
              onClick={() => setOpen(false)}>
              <ShieldCheck className="w-4 h-4 text-purple-500" /> Assign Permission
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllTeachersPage() {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [teachers, setTeachers] = useState(TEACHERS)
  const [classesPopup, setClassesPopup] = useState<string[] | null>(null)

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contact.includes(searchTerm) ||
    t.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(prev => prev.filter(t => t.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">All Teachers</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Mobile no."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 w-60"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-teal-600 hover:border-teal-400 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-teal-600 hover:border-teal-400 transition-colors">
            <Upload className="w-4 h-4" />
          </button>
          <Link href="/institute/teachers/add"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <Link href="/institute/teachers"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${pathname === '/institute/teachers' ? 'bg-teal-600 text-white border-teal-600 shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600'}`}>
          Total Teacher
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${pathname === '/institute/teachers' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'}`}>
            {String(teachers.length).padStart(2, '0')}
          </span>
        </Link>
        <Link href="/institute/teachers/deleted"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${pathname === '/institute/teachers/deleted' ? 'bg-red-500 text-white border-red-500 shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500'}`}>
          Deleted Teacher
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${pathname === '/institute/teachers/deleted' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
            {String(DELETED_TEACHERS.length).padStart(2, '0')}
          </span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700">
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">S. No.</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">Username</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">Name</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Contact</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Email</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Assigned Class</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Status</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Joining Date</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher, index) => (
                <tr key={teacher.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 px-4 text-left">
                    <span className="text-xs font-bold text-slate-500">{index + 1}.</span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.username}</span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center gap-3">
                      <img src={teacher.avatar} alt={teacher.name}
                        className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover bg-slate-100 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{teacher.contact}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{teacher.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setClassesPopup(teacher.assignedClasses)}
                      title="View Assigned Classes"
                      className="mx-auto flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:border-teal-400 transition-colors group"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {teacher.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{teacher.joiningDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      <ActionMenu teacherId={teacher.id} onDelete={handleDelete} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-medium text-sm">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <span className="text-xs font-bold text-slate-500">Showing 1–{filtered.length} of {filtered.length} Entries</span>
          <div className="flex items-center gap-1">
            {['«', '‹', '1', '2', '›', '»'].map((label, i) => (
              <button key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${label === '1' ? 'bg-teal-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Classes Popup */}
      {classesPopup && (
        <AssignedClassesPopup classes={classesPopup} onClose={() => setClassesPopup(null)} />
      )}
    </div>
  )
}
