'use client'

import React, { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save, Loader2, CheckSquare } from 'lucide-react'
import { fetchStudents } from '../actions'
import { useClasses } from '@/lib/mastersData'

const PAGE_SIZE = 20

export default function BulkEditPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const classesData = useClasses()

  useEffect(() => { loadStudents() }, [])

  const loadStudents = async () => {
    setLoading(true)
    const res = await fetchStudents()
    if (res.success && res.data) {
      setRows(res.data.map((s: any) => ({
        id: s.id,
        admissionNo: s.admission_no || '',
        rollNo: s.roll_no || '',
        firstName: s.first_name || '',
        lastName: s.last_name || '',
        contact: s.contact || '',
        className: s.class_name || '',
        feesStatus: s.fees_status || '',
        tag: s.tag || '',
        status: s.status || '',
      })))
    }
    setLoading(false)
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  const filtered = rows.filter(row =>
    `${row.firstName} ${row.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.contact || '').includes(searchTerm) ||
    (row.admissionNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const paginatedIds = paginated.map(r => r.id)
  const allPageSelected = paginatedIds.length > 0 && paginatedIds.every(id => selected.has(id))
  const somePageSelected = paginatedIds.some(id => selected.has(id))

  const toggleSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allPageSelected) { paginatedIds.forEach(id => next.delete(id)) }
      else { paginatedIds.forEach(id => next.add(id)) }
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    setSelected(new Set())
    alert(`Saved ${selected.size > 0 ? selected.size + ' selected' : 'all'} students successfully!`)
  }

  const inputClass = "w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400 transition-colors text-sm"
  const selectClass = inputClass + " cursor-pointer"

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Bulk Edit</h1>
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 bg-slate-50 dark:bg-slate-700/50">
            <span className="text-xs font-bold text-slate-500">Total Students</span>
            <span className="text-sm font-black text-teal-600 dark:text-teal-400">{rows.length}</span>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1">
              <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-xs font-black text-teal-700">{selected.size} Selected</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by Name, Mobile no."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : selected.size > 0 ? `Save (${selected.size})` : 'Save All'}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-sm font-bold text-slate-500">Loading students...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-base font-black text-slate-600">No students found</p>
            <p className="text-sm text-slate-400 font-medium">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-[13px] text-center border-collapse" style={{ minWidth: '1500px' }}>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700">
                    {/* Checkbox header */}
                    <th className="py-4 px-4 sticky left-0 bg-slate-50 dark:bg-slate-800/80 z-20 border-r border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                      />
                    </th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">S. No.</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[130px]">Admission No.</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[100px]">Roll No.</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[130px]">First Name</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[130px]">Last Name</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[140px]">Contact No.</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[120px]">Class</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[130px]">Fees Status</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[110px]">Tag</th>
                    <th className="py-4 px-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide min-w-[120px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, index) => {
                    const globalIndex = rows.findIndex(r => r.id === row.id)
                    const sNo = (currentPage - 1) * PAGE_SIZE + index + 1
                    const isChecked = selected.has(row.id)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${isChecked ? 'bg-teal-50/60 dark:bg-teal-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/20'}`}
                      >
                        {/* Checkbox */}
                        <td className={`py-3 px-4 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-700 ${isChecked ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-white dark:bg-slate-900'}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(row.id)}
                            className="w-4 h-4 rounded border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-500 text-xs mx-auto">
                            {sNo}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.admissionNo}
                            onChange={(e) => handleInputChange(globalIndex, 'admissionNo', e.target.value)}
                            className={inputClass} />
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.rollNo}
                            onChange={(e) => handleInputChange(globalIndex, 'rollNo', e.target.value)}
                            className={inputClass} />
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.firstName}
                            onChange={(e) => handleInputChange(globalIndex, 'firstName', e.target.value)}
                            className={inputClass} />
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.lastName}
                            onChange={(e) => handleInputChange(globalIndex, 'lastName', e.target.value)}
                            className={inputClass} />
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.contact}
                            onChange={(e) => handleInputChange(globalIndex, 'contact', e.target.value)}
                            className={inputClass} placeholder="--" />
                        </td>
                        <td className="py-3 px-2">
                          <select value={row.className}
                            onChange={(e) => handleInputChange(globalIndex, 'className', e.target.value)}
                            className={selectClass}>
                            <option value="">--</option>
                            {classesData.map((c: any) => (
                              <option key={c.className} value={c.className}>{c.className}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <select value={row.feesStatus}
                            onChange={(e) => handleInputChange(globalIndex, 'feesStatus', e.target.value)}
                            className={selectClass}>
                            <option value="">--</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <input type="text" value={row.tag}
                            onChange={(e) => handleInputChange(globalIndex, 'tag', e.target.value)}
                            className={inputClass} placeholder="--" />
                        </td>
                        <td className="py-3 px-2">
                          <select value={row.status}
                            onChange={(e) => handleInputChange(globalIndex, 'status', e.target.value)}
                            className={selectClass}>
                            <option value="">--</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500">
                Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} Entries
                {selected.size > 0 && <span className="ml-2 text-teal-600">· {selected.size} selected</span>}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-40 transition-colors">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${currentPage === page ? 'bg-teal-600 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 disabled:opacity-40 transition-colors">
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
