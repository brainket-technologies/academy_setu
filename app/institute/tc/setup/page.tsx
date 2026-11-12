'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  X, 
  Award, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Sliders, 
  ChevronRight, 
  ShieldCheck, 
  Star,
  Check,
  RefreshCw,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { 
  TCTemplate1, 
  TCTemplate2, 
  TCTemplate3, 
  TCTemplate4, 
  TCMiniPreview,
  TCCustomProps 
} from '@/components/tc/TCTemplates'
import { fetchTCTemplates, deleteTCTemplate, setDefaultTCTemplate, TCTemplateData } from '../actions'

const DEFAULT_SEED_TEMPLATES: TCTemplateData[] = [
  {
    id: 1,
    title: 'Indian CBSE Official Transfer Certificate',
    subtitle: 'Official 25-point CBSE compliance format with crest, declaration & rubber seal',
    prefix: 'TC/2026/',
    startNo: '1001',
    classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    designId: 1,
    themeColor: '#1E3A8A',
    schoolName: 'COSMOPOLITAN INTER COLLEGE',
    schoolAddress: 'Knowledge Park, Sector 62, New Delhi, India - 110001',
    schoolEmail: 'principal@cosmopolitan.edu.in',
    schoolPhone: '+91 11 2659 0000',
    schoolCode: '0012',
    affiliationBoard: 'Central Board of Secondary Education (CBSE)',
    affiliationNo: '2130048',
    udiseCode: '09123456789',
    principalName: 'Dr. S. K. Mukherjee',
    principalSignLabel: 'Signature of the Principal',
    teacherSignLabel: 'Class Teacher',
    preparedBySignLabel: 'Prepared By (LDC)',
    checkedBySignLabel: 'Checked By',
    isDefault: true
  },
  {
    id: 2,
    title: 'Modern Wave School Transfer Certificate',
    subtitle: 'Golden wave header, cursive script typography & spacious academic records',
    prefix: 'STC/2026/',
    startNo: '2001',
    classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    designId: 2,
    themeColor: '#005D5B',
    schoolName: 'COSMOPOLITAN INTER COLLEGE',
    schoolAddress: 'Knowledge Park, Sector 62, New Delhi, India - 110001',
    schoolEmail: 'office@cosmopolitan.edu.in',
    schoolPhone: '+91 11 2659 0000',
    schoolCode: '0012',
    affiliationBoard: 'Central Board of Secondary Education (CBSE)',
    affiliationNo: '2130048',
    udiseCode: '09123456789',
    principalName: 'Dr. S. K. Mukherjee',
    principalSignLabel: 'Head of School',
    teacherSignLabel: 'Class Teacher',
    checkedBySignLabel: 'Checked By',
    isDefault: false
  },
  {
    id: 3,
    title: 'State Board Traditional SLC (दाखिला खारिज)',
    subtitle: 'Official Ledger Register format with Sanskrit invocation, PEN, APAAR & DIOS seal',
    prefix: 'SLC/2026/',
    startNo: '5001',
    classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'],
    designId: 3,
    themeColor: '#660033',
    schoolName: 'COSMOPOLITAN INTER COLLEGE',
    schoolAddress: 'Knowledge Park, Sector 62, New Delhi, India - 110001',
    schoolEmail: 'principal@cosmopolitan.edu.in',
    schoolPhone: '+91 11 2659 0000',
    schoolCode: '0012',
    affiliationBoard: 'State Department of Secondary Education (UP Board)',
    affiliationNo: '2130048',
    udiseCode: '09123456789',
    principalName: 'Dr. S. K. Mukherjee',
    principalSignLabel: 'प्रधानाचार्य / Principal',
    teacherSignLabel: 'लिपिक / Clerk',
    checkedBySignLabel: 'DIOS Counter-Signature',
    isDefault: false
  },
  {
    id: 4,
    title: 'Modern Digital Smart TC (NEP 2020)',
    subtitle: 'Attested student photo frame, dynamic QR code verification & 1D barcode',
    prefix: 'DTC/2026/',
    startNo: '8001',
    classes: ['All Classes'],
    designId: 4,
    themeColor: '#0F766E',
    schoolName: 'COSMOPOLITAN INTER COLLEGE',
    schoolAddress: 'Knowledge Park, Sector 62, New Delhi, India - 110001',
    schoolEmail: 'admin@cosmopolitan.edu.in',
    schoolPhone: '+91 11 2659 0000',
    schoolCode: '0012',
    affiliationBoard: 'CBSE / NEP 2020 Unified Portal',
    affiliationNo: '2130048',
    udiseCode: '09123456789',
    principalName: 'Dr. S. K. Mukherjee',
    principalSignLabel: 'Principal',
    teacherSignLabel: 'Class Teacher',
    preparedBySignLabel: 'Prepared By',
    isDefault: false
  }
]

export default function TCSetupPage() {
  const [templates, setTemplates] = useState<TCTemplateData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TCTemplateData | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetchTCTemplates()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTemplates(res.data)
        try {
          localStorage.setItem('school_tc_templates', JSON.stringify(res.data))
        } catch (e) {}
      } else {
        // Fallback to localStorage or seed defaults
        const saved = localStorage.getItem('school_tc_templates')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTemplates(parsed)
            return
          }
        }
        setTemplates(DEFAULT_SEED_TEMPLATES)
        localStorage.setItem('school_tc_templates', JSON.stringify(DEFAULT_SEED_TEMPLATES))
      }
    } catch (e) {
      console.error(e)
      setTemplates(DEFAULT_SEED_TEMPLATES)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this Transfer Certificate template?')) return
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    try {
      localStorage.setItem('school_tc_templates', JSON.stringify(updated))
      await deleteTCTemplate(id)
    } catch (e) {}
    triggerToast('TC Template removed successfully!')
  }

  const handleSetDefault = async (id: any) => {
    const updated = templates.map(t => ({
      ...t,
      isDefault: t.id === id
    }))
    setTemplates(updated)
    try {
      localStorage.setItem('school_tc_templates', JSON.stringify(updated))
      await setDefaultTCTemplate(id)
    } catch (e) {}
    triggerToast('Default Transfer Certificate template updated!')
  }

  const filtered = templates.filter(item => {
    const q = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      item.prefix.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (Array.isArray(item.classes) && item.classes.some(c => c.toLowerCase().includes(q)))
    )
  })

  // Render the selected full-size template inside the preview modal
  const renderTemplateFull = (tpl: TCTemplateData) => {
    const props: TCCustomProps = {
      title: tpl.title,
      subtitle: tpl.subtitle,
      themeColor: tpl.themeColor || '#1E3A8A',
      schoolName: tpl.schoolName || 'COSMOPOLITAN INTER COLLEGE',
      schoolAddress: tpl.schoolAddress || 'Knowledge Park, Sector 62, New Delhi, India - 110001',
      schoolEmail: tpl.schoolEmail || 'principal@cosmopolitan.edu.in',
      schoolPhone: tpl.schoolPhone || '+91 11 2659 0000',
      schoolCode: tpl.schoolCode || '0012',
      affiliationBoard: tpl.affiliationBoard || 'Central Board of Secondary Education',
      affiliationNo: tpl.affiliationNo || '2130048',
      udiseCode: tpl.udiseCode || '09123456789',
      tcNo: `${tpl.prefix || 'TC/2026/'}${tpl.startNo || '1042'}`,
      serialNo: '408',
      admissionNo: 'ADM/2018/092',
      studentName: 'Aarav Sharma',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      principalName: tpl.principalName || 'Dr. S. K. Mukherjee',
      principalSignLabel: tpl.principalSignLabel || 'Principal (With School Seal)',
      teacherSignLabel: tpl.teacherSignLabel || 'Class Teacher',
      preparedBySignLabel: tpl.preparedBySignLabel || 'Prepared By',
      checkedBySignLabel: tpl.checkedBySignLabel || 'Checked By',
      showWatermark: tpl.showWatermark !== false,
      showQrCode: tpl.showQrCode !== false
    }

    switch (Number(tpl.designId)) {
      case 2:
        return <TCTemplate2 {...props} />
      case 3:
        return <TCTemplate3 {...props} />
      case 4:
        return <TCTemplate4 {...props} />
      case 1:
      default:
        return <TCTemplate1 {...props} />
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#007A78] flex items-center justify-center font-black shadow-2xs">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>TC Setup &amp; Templates</span>
              <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-[#007A78] px-2.5 py-0.5 rounded-full font-black border border-teal-200 dark:border-teal-800">
                {templates.length} Templates
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Configure Transfer Certificate templates, board affiliations, numbering prefixes, and multiple target classes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Prefix, Class..." 
              className="pl-8.5 pr-3 py-2 w-56 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-semibold"
            />
          </div>

          <Link 
            href="/institute/tc" 
            className="px-3.5 py-2 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
            title="View Issued Transfer Certificates"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Transfer Certificates</span>
          </Link>

          <Link 
            href="/institute/tc/settings" 
            className="px-3.5 py-2 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
            title="Configure TC Exit Statuses"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">TC Settings</span>
          </Link>

          <Link 
            href="/institute/tc/setup/create" 
            className="px-4 py-2 flex items-center gap-1.5 rounded-xl bg-[#007A78] hover:bg-teal-700 text-white text-xs font-black transition shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add TC Template</span>
          </Link>
        </div>
      </div>

      {/* 4 Template Archetypes Showcase Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>4 Official Transfer Certificate Template Designs</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Choose from 4 government-compliant, state &amp; CBSE board certified styles
            </p>
          </div>

          <Link 
            href="/institute/tc/setup/create"
            className="text-xs font-bold text-[#007A78] hover:underline flex items-center gap-1"
          >
            <span>Create Custom Template</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 1,
              title: 'Template 1: Indian CBSE Standard (Image 2)',
              desc: 'Official CBSE board format with crest, 25 points, declaration paragraph & rubber seal',
              color: '#1E3A8A'
            },
            {
              id: 2,
              title: 'Template 2: Modern Wave Certificate (Image 1)',
              desc: 'Golden wave ribbon header, elegant cursive calligraphy title, clean spaced records & notch',
              color: '#005D5B'
            },
            {
              id: 3,
              title: 'Template 3: State Board SLC (दाखिला खारिज)',
              desc: 'Traditional Indian Ledger Register table, Sanskrit invocation, PEN, APAAR & DIOS seal',
              color: '#660033'
            },
            {
              id: 4,
              title: 'Template 4: Modern Digital Smart TC (NEP 2020)',
              desc: 'Attested student photo, dynamic security verification QR code, 1D barcode & digital signature',
              color: '#0F766E'
            }
          ].map(tpl => (
            <div 
              key={tpl.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition group"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="w-full h-36 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-3 p-1 group-hover:scale-[1.02] transition">
                  <TCMiniPreview designId={tpl.id} themeColor={tpl.color} />
                </div>
                <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                  {tpl.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    const match = templates.find(t => t.designId === tpl.id) || {
                      id: tpl.id,
                      title: tpl.title,
                      designId: tpl.id,
                      themeColor: tpl.color,
                      prefix: 'TC/2026/',
                      startNo: '1001',
                      classes: ['All Classes']
                    }
                    setPreviewTemplate(match)
                  }}
                  className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preview</span>
                </button>

                <Link
                  href={`/institute/tc/setup/create?design=${tpl.id}&color=${encodeURIComponent(tpl.color)}`}
                  className="text-[#007A78] hover:text-teal-700 transition flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Use This</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configured Templates List Table (Like Certificate Type Page) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
              Active TC Templates ({filtered.length})
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Templates available for generating student transfer certificates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTemplates}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Refresh Templates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#007A78]' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3.5 text-left w-12">#</th>
                <th className="px-3.5 py-3.5 text-left min-w-[200px]">Template Title</th>
                <th className="px-3.5 py-3.5 text-left min-w-[130px]">Prefix &amp; Start No</th>
                <th className="px-3.5 py-3.5 text-left min-w-[180px]">Applicable Classes</th>
                <th className="px-3.5 py-3.5 text-left min-w-[140px]">Template Design</th>
                <th className="px-3.5 py-3.5 text-center w-24">Default</th>
                <th className="px-3.5 py-3.5 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No Transfer Certificate templates found matching &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const designLabel = 
                    item.designId === 1 ? 'Design 1 (CBSE Classic)' :
                    item.designId === 2 ? 'Design 2 (Executive Accent)' :
                    item.designId === 3 ? 'Design 3 (Heritage Ornamental)' :
                    'Design 4 (Compact Academic)'
                  const color = item.themeColor || '#1E3A8A'

                  return (
                    <tr key={item.id || idx} className="hover:bg-teal-50/20 transition-colors">
                      <td className="px-3.5 py-3.5 text-left text-slate-400 font-bold">
                        {idx + 1}.
                      </td>

                      {/* Template Title */}
                      <td className="px-3.5 py-3.5 text-left">
                        <div className="font-black text-slate-900 dark:text-slate-100 text-xs">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <p className="text-[10.5px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </td>

                      {/* Prefix & Start No */}
                      <td className="px-3.5 py-3.5 text-left whitespace-nowrap">
                        <span className="font-black text-[#007A78] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {item.prefix}{item.startNo}
                        </span>
                      </td>

                      {/* Applicable Classes */}
                      <td className="px-3.5 py-3.5 text-left">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {Array.isArray(item.classes) && item.classes.length > 0 ? (
                            item.classes.slice(0, 3).map((cls, cIdx) => (
                              <span key={cIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {cls}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10.5px]">All Classes</span>
                          )}
                          {Array.isArray(item.classes) && item.classes.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-[#007A78] text-[10px] font-bold">
                              +{item.classes.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Design & Color */}
                      <td className="px-3.5 py-3.5 text-left">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                            style={{ background: color }}
                          />
                          <span className="font-bold text-slate-700 text-[11px]">
                            {designLabel}
                          </span>
                        </div>
                      </td>

                      {/* Default Toggle */}
                      <td className="px-3.5 py-3.5 text-center">
                        {item.isDefault ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 shadow-2xs">
                            <Star className="w-3 h-3 fill-emerald-600" /> Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(item.id)}
                            className="text-[10px] text-slate-400 hover:text-[#007A78] font-bold hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Preview TC"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/institute/tc/setup/create?id=${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-[#007A78] hover:bg-teal-50 rounded-lg transition cursor-pointer"
                            title="Edit Template"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          HIGH-FIDELITY PRINT & LIVE PREVIEW MODAL
         ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-slate-100 rounded-3xl w-full max-w-[880px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-white px-5 py-3.5 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-[#007A78] flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {previewTemplate.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Design {previewTemplate.designId} &bull; Theme Color: {previewTemplate.themeColor || '#1E3A8A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#007A78] hover:bg-teal-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Preview Area */}
            <div className="overflow-auto p-6 flex-1 flex justify-center items-start bg-slate-200/60">
              {renderTemplateFull(previewTemplate)}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

