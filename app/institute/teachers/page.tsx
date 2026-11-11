'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Download, Plus, MoreVertical, Eye, Pencil, Trash2, 
  ShieldCheck, X, LayoutGrid, Phone, Mail, Calendar, 
  GraduationCap, Users, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { fetchTeachers, deleteTeacher } from './actions'
import AddTeacherModal from './components/AddTeacherModal'
import EditTeacherModal from './components/EditTeacherModal'

// ─── Assigned Classes Popup ───────────────────────────────────────────────────
function AssignedClassesPopup({ classes, onClose }: { classes: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-400 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Assigned Classes &amp; Sections</h3>
              <p className="text-[11px] text-slate-400 font-medium">All academic allotments for this faculty member</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
          {classes && classes.map((cls, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 text-xs font-bold rounded-xl shadow-2xs"
            >
              {cls}
            </span>
          ))}
          {(!classes || classes.length === 0) && (
            <div className="w-full py-8 text-center text-slate-400 font-medium text-xs bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              No classes currently assigned to this teacher.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Action Dropdown & Quick Buttons ──────────────────────────────────────────
function ActionMenu({ teacherId, onDelete, onEdit }: { teacherId: string; onDelete: (id: string) => void; onEdit: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Direct View Option */}
      <Link
        href={`/institute/teachers/${teacherId}`}
        title="View Teacher Profile"
        className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs"
      >
        <Eye className="w-4 h-4" />
      </Link>

      {/* Direct Edit Option in Modal */}
      <button
        type="button"
        onClick={() => onEdit(teacherId)}
        title="Edit Teacher"
        className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* More Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(p => !p)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
          title="More Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-9.5 z-40 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <Link 
                href={`/institute/teachers/${teacherId}`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#0f766e] transition-colors"
                onClick={() => setOpen(false)}
              >
                <Eye className="w-3.5 h-3.5 text-teal-600" />
                <span>View Full Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => { onEdit(teacherId); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-left"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-500" />
                <span>Edit Teacher Details</span>
              </button>
              <Link 
                href={`/institute/teachers/${teacherId}/assign-permission`}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-purple-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Assign Permissions</span>
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                onClick={() => { onDelete(teacherId); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Teacher</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllTeachersPage() {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [classesPopup, setClassesPopup] = useState<string[] | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)

  const loadTeachers = async () => {
    setLoading(true)
    const res = await fetchTeachers()
    if (res.success) {
      setTeachers(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = 
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.contact || '').includes(searchTerm) ||
        (t.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false
      if (statusFilter === 'Active') return t.status === 'Active'
      if (statusFilter === 'Inactive') return t.status !== 'Active'
      return true
    })
  }, [teachers, searchTerm, statusFilter])

  const activeCount = useMemo(() => {
    return teachers.filter(t => t.status === 'Active').length
  }, [teachers])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this teacher? This will remove all their classroom assignments.')) {
      const res = await deleteTeacher(id)
      if (res.success) {
        loadTeachers()
      } else {
        alert(res.error || 'Failed to delete teacher')
      }
    }
  }

  // Quick CSV Export
  const exportToCSV = () => {
    if (filtered.length === 0) return
    const headers = ['S.No', 'Username', 'Name', 'Contact', 'Email', 'Assigned Classes', 'Status', 'Joining Date']
    const rows = filtered.map((t, i) => [
      i + 1,
      `"${t.username || ''}"`,
      `"${t.name || ''}"`,
      `"${t.contact || ''}"`,
      `"${t.email || ''}"`,
      `"${(t.assignedClasses || []).join('; ')}"`,
      `"${t.status || 'Active'}"`,
      `"${t.joiningDate || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `teachers_directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-12 animate-in fade-in duration-200">

      {/* ── Top Header Banner ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-400 flex items-center justify-center font-black shadow-2xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Faculty &amp; Teachers Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Manage academic faculty, credentials, subject &amp; class allocations, and payroll settings
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          <button 
            onClick={exportToCSV}
            title="Export CSV" 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0f766e] hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Refresh List Button */}
          <button 
            onClick={loadTeachers}
            title="Reload Teachers List" 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0f766e] hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          {/* Add Teacher Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655e] text-white text-xs font-bold transition-all shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      {/* ── Tabs & Filter Pills ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link 
            href="/institute/teachers"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              pathname === '/institute/teachers' && statusFilter === 'All'
                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
            }`}
            onClick={() => setStatusFilter('All')}
          >
            <span>All Teachers</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              pathname === '/institute/teachers' && statusFilter === 'All'
                ? 'bg-white/20 text-white' 
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
            }`}>
              {String(teachers.length).padStart(2, '0')}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Faculty</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              statusFilter === 'Active'
                ? 'bg-white/20 text-white' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            }`}>
              {String(activeCount).padStart(2, '0')}
            </span>
          </button>

          <Link 
            href="/institute/teachers/deleted"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              pathname === '/institute/teachers/deleted' 
                ? 'bg-red-500 text-white border-red-500 shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500'
            }`}
          >
            <span>Deleted / Archived</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              00
            </span>
          </Link>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Showing <span className="text-slate-700 dark:text-slate-200 font-black">{filtered.length}</span> faculty members
        </div>
      </div>

      {/* ── Teachers Directory Table ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse" style={{ minWidth: '940px' }}>
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-wider">
                <th className="py-4 px-4 text-left w-14">#</th>
                <th className="py-4 px-4 text-left">Teacher &amp; Username</th>
                <th className="py-4 px-4 text-left">Contact Info</th>
                <th className="py-4 px-4 text-center">Assigned Classes</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Joining Date</th>
                <th className="py-4 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
              {filtered.map((teacher, index) => {
                const assigned = Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses : []
                return (
                  <tr 
                    key={teacher.id} 
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-4 px-4 text-left">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Teacher Info */}
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center gap-3">
                        <Link href={`/institute/teachers/${teacher.id}`} className="shrink-0">
                          <img 
                            src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(teacher.name || 'Teacher')}`} 
                            alt={teacher.name}
                            className="w-10 h-10 rounded-2xl border-2 border-slate-200 dark:border-slate-700 object-cover bg-slate-100 group-hover:border-teal-500 transition-colors shadow-2xs" 
                          />
                        </Link>
                        <div className="flex flex-col">
                          <Link 
                            href={`/institute/teachers/${teacher.id}`} 
                            className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-[#0f766e] transition-colors"
                          >
                            {teacher.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              @{teacher.username || 'teacher'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4 text-left">
                      <div className="flex flex-col gap-1">
                        {teacher.contact ? (
                          <a 
                            href={`tel:${teacher.contact}`} 
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{teacher.contact}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">—</span>
                        )}
                        {teacher.email && (
                          <a 
                            href={`mailto:${teacher.email}`} 
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-teal-600 transition-colors truncate max-w-[200px]"
                            title={teacher.email}
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Assigned Classes */}
                    <td className="py-4 px-4 text-center">
                      {assigned.length > 0 ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto">
                          {assigned.slice(0, 2).map((cls: string, ci: number) => (
                            <span 
                              key={ci} 
                              className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold rounded-lg truncate max-w-[130px]"
                              title={cls}
                            >
                              {cls}
                            </span>
                          ))}
                          {assigned.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setClassesPopup(assigned)}
                              className="px-2 py-1 bg-slate-100 hover:bg-teal-100 dark:bg-slate-700 dark:hover:bg-teal-900/40 text-slate-600 dark:text-slate-300 hover:text-teal-700 text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                              title="View all assigned classes"
                            >
                              +{assigned.length - 2} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          No classes assigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
                        teacher.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200/80 dark:border-red-800/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          teacher.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        {teacher.status || 'Active'}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{teacher.joiningDate || '—'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <ActionMenu 
                        teacherId={teacher.id} 
                        onDelete={handleDelete} 
                        onEdit={id => setEditingTeacherId(id)} 
                      />
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <Users className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-black text-slate-700 dark:text-slate-200">
                        No Teachers Found
                      </h4>
                      <p className="text-xs text-slate-400 font-medium max-w-xs">
                        {searchTerm ? 'No teachers match your search term. Try checking for typos or clear your search filter.' : 'No teachers have been added to your institute faculty list yet.'}
                      </p>
                      {searchTerm ? (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-[#0f766e] border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f766e] text-white hover:bg-[#0d655e] transition-colors cursor-pointer shadow-xs"
                        >
                          + Add First Teacher
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40">
          <span className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-800 dark:text-slate-200 font-black">{filtered.length}</span> of {teachers.length} Faculty Members
          </span>
          <div className="flex items-center gap-1">
            <button 
              className="px-3 py-1.5 flex items-center justify-center rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black bg-[#0f766e] text-white shadow-xs"
            >
              1
            </button>
            <button 
              className="px-3 py-1.5 flex items-center justify-center rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Classes Popup */}
      {classesPopup && (
        <AssignedClassesPopup classes={classesPopup} onClose={() => setClassesPopup(null)} />
      )}

      {/* Add Teacher Modal Popup */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadTeachers}
      />

      {/* Edit Teacher Modal Popup */}
      <EditTeacherModal
        isOpen={!!editingTeacherId}
        teacherId={editingTeacherId}
        onClose={() => setEditingTeacherId(null)}
        onSuccess={loadTeachers}
      />
    </div>
  )
}
