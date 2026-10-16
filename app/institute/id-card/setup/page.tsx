'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Eye, X, CheckCircle2, Printer, Download, Sparkles, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { 
  StudentDesignVertical, 
  StudentDesignHorizontal, 
  TeacherDesignVertical, 
  TeacherDesignHorizontal, 
  EmployeeDesignVertical, 
  EmployeeDesignHorizontal,
  IdCardBackDesign 
} from '@/components/id-cards/IdCardTemplates'
import { fetchIdCardSetups, deleteIdCardSetup } from '../actions'

interface IdCardItem {
  id: number
  title: string
  session: string
  for: 'Student' | 'Teacher' | 'Employee'
  designId: 1 | 2
  designName: string
  orientation: 'Vertical' | 'Horizontal'
  date: string
  time: string
}

const INITIAL_ID_CARD_DATA: IdCardItem[] = [
  { 
    id: 1, 
    title: 'Student Smart ID Card', 
    session: '2025-26', 
    for: 'Student', 
    designId: 1,
    designName: 'Design 1 (Vertical)',
    orientation: 'Vertical',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 2, 
    title: 'Student Academic Campus Card', 
    session: '2025-26', 
    for: 'Student', 
    designId: 2,
    designName: 'Design 2 (Horizontal)',
    orientation: 'Horizontal',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 3, 
    title: 'Faculty Executive ID Pass', 
    session: '2025-26', 
    for: 'Teacher', 
    designId: 1,
    designName: 'Design 1 (Vertical)',
    orientation: 'Vertical',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 4, 
    title: 'Prestige Teacher Campus Badge', 
    session: '2025-26', 
    for: 'Teacher', 
    designId: 2,
    designName: 'Design 2 (Horizontal)',
    orientation: 'Horizontal',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 5, 
    title: 'Corporate Staff Identity Pass', 
    session: '2025-26', 
    for: 'Employee', 
    designId: 1,
    designName: 'Design 1 (Vertical)',
    orientation: 'Vertical',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 6, 
    title: 'Campus Employee Access Badge', 
    session: '2025-26', 
    for: 'Employee', 
    designId: 2,
    designName: 'Design 2 (Horizontal)',
    orientation: 'Horizontal',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
]

export default function IdCardSetupPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Student' | 'Teacher' | 'Employee'>('All')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<IdCardItem[]>(INITIAL_ID_CARD_DATA)
  const [previewItem, setPreviewItem] = useState<IdCardItem | null>(null)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load from PostgreSQL
  useEffect(() => {
    loadSetups()
  }, [])

  const loadSetups = async () => {
    try {
      const res = await fetchIdCardSetups()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Overlay saved content onto the 6 system templates
        const updated = INITIAL_ID_CARD_DATA.map(initItem => {
          const match = res.data.find(
            (item: any) => item.for === initItem.for && Number(item.designId) === initItem.designId
          )
          if (match) {
            return {
              ...initItem,
              title: match.title || initItem.title,
              session: match.session || initItem.session,
              date: match.date || initItem.date,
              time: match.time || initItem.time
            }
          }
          return initItem
        })
        setData(updated)
      } else {
        setData(INITIAL_ID_CARD_DATA)
      }
    } catch (err) {
      console.error(err)
      setData(INITIAL_ID_CARD_DATA)
    }
  }

  // Filter data based on active tab and search query
  const filteredData = data.filter(item => {
    const matchesTab = activeTab === 'All' || item.for === activeTab
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.for.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.session.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Role Counts
  const counts = {
    All: data.length,
    Student: data.filter(i => i.for === 'Student').length,
    Teacher: data.filter(i => i.for === 'Teacher').length,
    Employee: data.filter(i => i.for === 'Employee').length,
  }

  const handleDelete = async (id: any) => {
    setData(prev => prev.filter(item => item.id !== id))
    try {
      await deleteIdCardSetup(String(id))
    } catch (e) {}
    setToastMessage('ID Card design deleted from PostgreSQL database.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Render card preview instance for card frame
  const renderIdCardPreview = (item: IdCardItem) => {
    if (item.for === 'Student') {
      return item.designId === 1 ? <StudentDesignVertical /> : <StudentDesignHorizontal />
    }
    if (item.for === 'Teacher') {
      return item.designId === 1 ? <TeacherDesignVertical /> : <TeacherDesignHorizontal />
    }
    if (item.for === 'Employee') {
      return item.designId === 1 ? <EmployeeDesignVertical /> : <EmployeeDesignHorizontal />
    }
    return null
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            ID Card Setup
            <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-600 px-2.5 py-0.5 rounded-full font-bold">
              {data.length} Templates
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            2 specialized ID card designs each for Students, Teachers, and Employees • Customize content & branding
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Role, Session..." 
              className="pl-9 pr-4 py-2 w-72 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Tabs & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(['All', 'Student', 'Teacher', 'Employee'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/20' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Cards (First Visible) vs Table */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards' 
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card View</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* ─── CARD VIEW (FRAME PREVIEW FIRST VISIBLE) ─── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredData.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 font-medium">
              No ID card setups found matching criteria.
            </div>
          ) : (
            filteredData.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Card Top Info */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.for === 'Student' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : item.for === 'Teacher' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.for}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.orientation}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        Session {item.session}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {item.designName}
                    </p>
                  </div>

                  {/* Quick Preview Eye */}
                  <button
                    onClick={() => {
                      setPreviewItem(item)
                      setPreviewSide('front')
                    }}
                    title="Click to view full interactive preview"
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 hover:border-teal-500 transition-colors flex items-center justify-center shrink-0 shadow-xs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Frame Preview Area */}
                <div className="relative bg-slate-100/70 dark:bg-slate-900/80 p-4 h-[350px] flex items-center justify-center overflow-hidden">
                  <div 
                    className="transition-transform duration-300 group-hover:scale-[0.72] pointer-events-none select-none drop-shadow-md"
                    style={{
                      transform: item.orientation === 'Horizontal' ? 'scale(0.70)' : 'scale(0.66)',
                      transformOrigin: 'center'
                    }}
                  >
                    {renderIdCardPreview(item)}
                  </div>

                  {/* Hover Overlay Button to open Preview */}
                  <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto gap-2">
                    <button
                      onClick={() => {
                        setPreviewItem(item)
                        setPreviewSide('front')
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      Preview
                    </button>
                    <Link
                      href={`/institute/id-card/setup/generate?for=${item.for}&design=${item.designId}`}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-lg hover:bg-teal-700 transition-all flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Content
                    </Link>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">
                    🗓 {item.date} • 🕒 {item.time}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setPreviewItem(item)
                        setPreviewSide('front')
                      }}
                      title="Preview Template"
                      className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/institute/id-card/setup/generate?for=${item.for}&design=${item.designId}`}
                      title="Edit Content"
                      className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 font-bold text-xs transition-colors flex items-center gap-1 border border-teal-100"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Content</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TABLE VIEW ─── */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-center whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 text-left">S. No.</th>
                  <th className="px-4 py-4 text-left">Title</th>
                  <th className="px-4 py-4">Session</th>
                  <th className="px-4 py-4">ID Card For</th>
                  <th className="px-4 py-4">ID Card Design</th>
                  <th className="px-4 py-4">Created At</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                      No ID card setups found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, i) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4 text-left text-slate-500 font-medium">{i + 1}.</td>
                      <td className="px-4 py-4 text-left">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.designName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-semibold">{item.session}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          item.for === 'Student' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : item.for === 'Teacher' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.for}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => {
                              setPreviewItem(item)
                              setPreviewSide('front')
                            }}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:border-teal-500 hover:bg-teal-50/50 transition-all shadow-xs"
                            title="Click to view full design preview"
                          >
                            {/* Mini visual icon based on orientation */}
                            {item.orientation === 'Vertical' ? (
                              <div className="w-4 h-6 rounded-xs border border-slate-400 bg-white flex flex-col items-center overflow-hidden shrink-0 shadow-2xs">
                                <div className={`w-full h-1.5 ${
                                  item.for === 'Student' ? 'bg-sky-600' : item.for === 'Teacher' ? 'bg-purple-700' : 'bg-blue-700'
                                }`}></div>
                                <div className="w-2 h-2 rounded-full bg-slate-300 mt-0.5"></div>
                              </div>
                            ) : (
                              <div className="w-6 h-4 rounded-xs border border-slate-400 bg-white flex items-center overflow-hidden shrink-0 shadow-2xs">
                                <div className="w-1.5 h-full bg-emerald-600"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-300 ml-0.5"></div>
                              </div>
                            )}

                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 flex items-center gap-1">
                              <span>Design {item.designId} ({item.orientation})</span>
                              <Eye className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">🗓 {item.date}</span>
                          <span>🕒 {item.time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => {
                              setPreviewItem(item)
                              setPreviewSide('front')
                            }}
                            title="Preview ID Card"
                            className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link 
                            href={`/institute/id-card/setup/generate?for=${item.for}&design=${item.designId}`}
                            title="Edit Content"
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1 hover:bg-emerald-100 border border-emerald-100 transition-colors text-[11px] font-bold"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Content</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
            <span>Showing 1-{filteredData.length} of {data.length} Entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
              <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
              <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
              <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
              <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive ID Card Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                  <span>{previewItem.title}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    {previewItem.for} • {previewItem.orientation}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">{previewItem.designName}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Front / Back Toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setPreviewSide('front')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'front' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setPreviewSide('back')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'back' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Back
                  </button>
                </div>

                <button 
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Rendered Card */}
            <div className="p-8 flex items-center justify-center bg-slate-100/70 dark:bg-slate-900/60 min-h-[480px]">
              <div 
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ 
                  transform: previewItem.orientation === 'Horizontal' ? 'scale(0.95)' : 'scale(0.95)',
                  transformOrigin: 'center' 
                }}
              >
                {previewSide === 'back' ? (
                  <IdCardBackDesign 
                    orientation={previewItem.orientation === 'Horizontal' ? 'landscape' : 'portrait'}
                  />
                ) : (
                  <>
                    {/* Render corresponding card */}
                    {previewItem.for === 'Student' && previewItem.designId === 1 && <StudentDesignVertical />}
                    {previewItem.for === 'Student' && previewItem.designId === 2 && <StudentDesignHorizontal />}

                    {previewItem.for === 'Teacher' && previewItem.designId === 1 && <TeacherDesignVertical />}
                    {previewItem.for === 'Teacher' && previewItem.designId === 2 && <TeacherDesignHorizontal />}

                    {previewItem.for === 'Employee' && previewItem.designId === 1 && <EmployeeDesignVertical />}
                    {previewItem.for === 'Employee' && previewItem.designId === 2 && <EmployeeDesignHorizontal />}
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Standard CR80 ID Card Format • 300 DPI Ready
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/institute/id-card/setup/generate?for=${previewItem.for}&design=${previewItem.designId}`}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-teal-600" />
                  Customize Design
                </Link>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-6 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
    </div>
  )
}
